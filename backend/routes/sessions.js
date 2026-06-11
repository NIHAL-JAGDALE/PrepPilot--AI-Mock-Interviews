import express from 'express';
import auth from '../middleware/auth.js';
import pool from '../db/index.js';
import { routeMessage, getFirstQuestion } from '../services/aiRouter.js';
import { getRandomProblem, getFallbackProblem, getDifficulty, fetchProblemBySlug } from '../services/leetcode.js';
import { parseAndSaveReport } from '../services/reportParser.js';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// ─── CONTROL COMMANDS ─────────────────────────────────────
// Candidate can type these at any time during the interview.
const CONTROL_COMMANDS = ['skip', 'hint', 'next round', 'end interview'];

/**
 * Detect if the user's message is a control command.
 * Returns the command name if detected, or null.
 */
function detectControlCommand(content) {
  const trimmed = content.trim().toLowerCase();
  if (trimmed === 'skip') return 'skip';
  if (trimmed === 'hint') return 'hint';
  if (trimmed === 'next round') return 'next_round';
  if (trimmed === 'end interview' || trimmed === 'end') return 'end_interview';
  if (trimmed === 'skip resume') return 'skip_resume';
  return null;
}

// All session routes require authentication
router.use(auth);

// ─── EXTRACT RESUME TEXT ──────────────────────────────────
// POST /api/sessions/extract-resume
// Parses an uploaded resume file (PDF, DOCX, TXT) and returns the text
router.post('/extract-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file provided.' });
    }

    const { originalname, buffer, mimetype } = req.file;
    let text = '';
    const lowerName = originalname.toLowerCase();

    if (mimetype === 'application/pdf' || lowerName.endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.doc')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (mimetype === 'text/plain' || lowerName.endsWith('.txt')) {
      text = buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' });
    }

    const cleanedText = text.replace(/\s+/g, ' ').trim();
    if (!cleanedText) {
      return res.status(400).json({ error: 'Could not extract text from the file.' });
    }

    res.json({ text: cleanedText });
  } catch (error) {
    console.error('Resume extraction error:', error.message);
    res.status(500).json({ error: 'Failed to process resume file.' });
  }
});

// ─── START SESSION ────────────────────────────────────────
// POST /api/sessions/start
// Body: { company_type, role_type, resume_text }
// Returns: { session_id, company_type, role_type, status }
//
// Creates a new interview session in the DB. The AI first question
// will be generated when the message route is built (Step 16).
//
// ⚠️ PITFALL (from instructions):
//   current_provider must always start as 'claude' on new sessions.
//   The schema DEFAULT handles this, but we explicitly set it here
//   as a safety net.
router.post('/start', async (req, res) => {
  try {
    const { company_type, role_type, resume_text } = req.body;

    // ── Validate input ──
    const validCompanyTypes = ['startup', 'mnc', 'faang'];
    const validRoleTypes = ['frontend', 'backend', 'fullstack', 'dsa_focus'];

    if (!company_type || !validCompanyTypes.includes(company_type)) {
      return res.status(400).json({
        error: `Invalid company_type. Must be one of: ${validCompanyTypes.join(', ')}`,
      });
    }

    if (!role_type || !validRoleTypes.includes(role_type)) {
      return res.status(400).json({
        error: `Invalid role_type. Must be one of: ${validRoleTypes.join(', ')}`,
      });
    }

    if (!resume_text || resume_text.trim().length === 0) {
      return res.status(400).json({
        error: 'Resume is required to start the interview.',
      });
    }

    // ── Create session (with resume) ──
    const result = await pool.query(
      `INSERT INTO sessions (user_id, company_type, role_type, status, current_provider, turn_count, current_round, resume_text)
       VALUES ($1, $2, $3, 'active', 'claude', 0, 0, $4)
       RETURNING id, company_type, role_type, status, current_provider, turn_count, current_round, created_at`,
      [req.user.userId, company_type, role_type, resume_text || null]
    );

    const session = result.rows[0];

    console.log(`🎯 New session started: ${session.id} (${company_type}/${role_type}) by user ${req.user.userId}`);
    if (resume_text) console.log(`📄 Resume provided (${resume_text.length} chars)`);

    // ── Get the first AI message ──
    // If resume is provided, AI will acknowledge it and start Round 1.
    // If no resume, AI will ask for the resume first.
    let firstQuestion = null;
    let detectedRound = 0;
    try {
      const startMsg = resume_text
        ? `[RESUME PROVIDED]\n${resume_text}\n[END RESUME]\n\nI am ready for the interview. Please begin.`
        : 'I am ready for the interview. Please begin.';
      firstQuestion = await routeMessage(session.id, startMsg);
      
      // Detect round from AI's first response
      if (firstQuestion?.reply) {
        const roundMatch = firstQuestion.reply.match(/ROUND:\s*(\d+)/i);
        if (roundMatch) {
          detectedRound = parseInt(roundMatch[1]);
        } else if (firstQuestion.reply.includes('Round 1')) {
          detectedRound = 1;
        }
        // Update session round in DB
        if (detectedRound > 0) {
          await pool.query(`UPDATE sessions SET current_round = $1 WHERE id = $2`, [detectedRound, session.id]);
        }
      }
    } catch (aiError) {
      console.error('Failed to get first question:', aiError.message);
    }

    res.status(201).json({
      session_id: session.id,
      company_type: session.company_type,
      role_type: session.role_type,
      status: session.status,
      current_provider: session.current_provider,
      turn_count: session.turn_count,
      current_round: detectedRound || (session.current_round || 0),
      created_at: session.created_at,
      first_question: firstQuestion?.reply || null,
      provider: firstQuestion?.provider || null,
      resume_provided: !!resume_text,
    });
  } catch (error) {
    console.error('Start session error:', error.message);
    res.status(500).json({ error: 'Failed to start session. Please try again.' });
  }
});

// ─── LIST SESSIONS ────────────────────────────────────────
// GET /api/sessions
// Returns: Array of sessions for the logged-in user (most recent first)
//
// Used by the Dashboard page to show past interviews and scores.
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         s.id, s.company_type, s.role_type, s.status,
         s.current_provider, s.turn_count, s.total_score, s.created_at,
         r.overall_score, r.percentile, r.hiring_recommendation
       FROM sessions s
       LEFT JOIN reports r ON r.session_id = s.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.userId]
    );

    res.json({ sessions: result.rows });
  } catch (error) {
    console.error('List sessions error:', error.message);
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
});

// ─── GET SESSION BY ID ────────────────────────────────────
// GET /api/sessions/:id
// Returns: Session details + full message history
//
// Used by the Interview page to load an existing session and
// reconstruct the chat. Also used by the Report page.
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // ── Fetch session ──
    const sessionResult = await pool.query(
      `SELECT id, user_id, company_type, role_type, status,
              current_provider, turn_count, current_round, total_score,
              resume_text, created_at
       FROM sessions
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const session = sessionResult.rows[0];

    // ── Fetch message history (excluding superseded messages) ──
    const messagesResult = await pool.query(
      `SELECT id, role, content, tokens_used, cached_tokens, provider, created_at
       FROM messages
       WHERE session_id = $1 AND superseded = FALSE
       ORDER BY created_at ASC`,
      [id]
    );

    // ── Fetch DSA problems for this session ──
    const dsaResult = await pool.query(
      `SELECT id, turn_number, leetcode_slug, title, difficulty,
              user_code, language, jdoodle_result, passed, runtime_ms, created_at
       FROM dsa_problems
       WHERE session_id = $1
       ORDER BY turn_number ASC`,
      [id]
    );

    // ── Fetch evaluations for this session ──
    const evalResult = await pool.query(
      `SELECT id, question_number, question, user_answer, score,
              feedback, model_answer, weak_areas, created_at
       FROM evaluations
       WHERE session_id = $1
       ORDER BY question_number ASC`,
      [id]
    );

    res.json({
      session: {
        ...session,
        resume_provided: !!(session.resume_text && session.resume_text.trim().length > 0),
      },
      messages: messagesResult.rows,
      dsa_problems: dsaResult.rows,
      evaluations: evalResult.rows,
    });
  } catch (error) {
    console.error('Get session error:', error.message);
    res.status(500).json({ error: 'Failed to fetch session.' });
  }
});

// ─── SEND MESSAGE ─────────────────────────────────────────
// POST /api/sessions/:id/message
// Body: { content }
// Returns: { reply, provider, token_stats, dsa_problem?, turnCount }
//
// This is the MAIN endpoint — ties everything together:
//   1. Validates session ownership + active status
//   2. Routes message through AI (with fallback)
//   3. Detects DSA rounds (turns 2, 3, 4) → fetches LeetCode problem
//   4. Detects INTERVIEW_COMPLETE → triggers report generation (Step 17)
//   5. Returns full response with provider info and cache stats
router.post('/:id/message', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, code_submission } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // ── Verify session belongs to user and is active ──
    const sessionResult = await pool.query(
      `SELECT id, user_id, company_type, role_type, status, turn_count, current_round
       FROM sessions
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const session = sessionResult.rows[0];

    if (session.status === 'completed') {
      return res.status(400).json({ error: 'This session has already been completed.' });
    }

    // ── Detect control commands ──
    const command = detectControlCommand(content);
    let controlMeta = null;

    if (command) {
      controlMeta = { command };
      console.log(`🎮 Control command detected: ${command}`);
    }

    // ── DSA Problem Management ──
    // Strategy: We pre-fetch the next potential DSA problem BEFORE calling the AI.
    // We inject STRICT instructions with the exact problem title AND slug.
    // After the AI responds, we CROSS-VERIFY that the AI actually mentioned the
    // injected problem. If the AI went rogue, we detect which problem it actually
    // asked about and sync the panel to that problem instead.
    const currentRound = session.current_round || 1;
    const upcomingTurn = session.turn_count + 1;

    // Detect if we have hit the DSA limit based on role (min/max).
    const dsaLimitsConfig = {
      frontend:  { min: 3, max: 4 },
      backend:   { min: 3, max: 5 },
      fullstack: { min: 4, max: 5 },
      dsa_focus: { min: 5, max: 7 },
    };
    const dsaLimits = dsaLimitsConfig[session.role_type] || { min: 3, max: 4 };
    const dsaMinLimit = dsaLimits.min;
    const dsaMaxLimit = dsaLimits.max;
    let dsaQuestionsAsked = 0;
    
    // 1. Get the ACTIVE (existing) DSA problem if one exists
    let existingDsaProblem = null;
    if (currentRound === 1) {
      const usedResult = await pool.query(
        'SELECT id, leetcode_slug AS slug, title, difficulty FROM dsa_problems WHERE session_id = $1 ORDER BY turn_number DESC',
        [id]
      );
      dsaQuestionsAsked = usedResult.rows.length;
      if (upcomingTurn >= 2 && usedResult.rows.length > 0) {
        existingDsaProblem = usedResult.rows[0];
        
        if (code_submission) {
          try {
            await pool.query(
              `UPDATE dsa_problems 
               SET user_code = $1, language = $2, jdoodle_result = $3, passed = $4, runtime_ms = $5 
               WHERE id = $6`,
              [
                code_submission.code, 
                code_submission.language, 
                code_submission.result?.status || 'Unknown', 
                code_submission.result?.passed || false, 
                (code_submission.result?.time || 0) * 1000, 
                existingDsaProblem.id
              ]
            );
          } catch (err) {
            console.error('Failed to update existing DSA problem with code submission:', err.message);
          }
        }
      }
    }
    
    const round1Complete = dsaQuestionsAsked >= dsaMaxLimit;
    const dsaMinReached = dsaQuestionsAsked >= dsaMinLimit;

    // 2. Pre-fetch the UPCOMING problem (in case the AI advances)
    let upcomingDsaProblem = null;
    if (currentRound === 1 && !round1Complete) { // Only fetch in Round 1 if not complete
      try {
        const usedResult = await pool.query(
          'SELECT leetcode_slug FROM dsa_problems WHERE session_id = $1',
          [id]
        );
        const usedSlugs = usedResult.rows.map(r => r.leetcode_slug);
        upcomingDsaProblem = await getRandomProblem(session.company_type, usedSlugs);
      } catch (dsaError) {
        console.error('DSA problem fetch failed:', dsaError.message);
        upcomingDsaProblem = getFallbackProblem(getDifficulty(session.company_type));
      }
    }

    // ── Build the content to send to AI ──
    let aiContent = content.trim();

    // Inject control command context
    if (command) {
      const commandInstructions = {
        skip: `[SYSTEM: The candidate has used the "skip" command to skip the current DSA question. You MUST: 1) Output SCORE: 0/10 in the evaluation. 2) FEEDBACK: "Question skipped by candidate." 3) In the NEXT QUESTION field, move to the next DSA problem. The candidate gets 0 points for this question but it still counts toward the DSA question count (${dsaQuestionsAsked + 1} asked so far, min: ${dsaMinLimit}, max: ${dsaMaxLimit}).]`,
        hint: '[SYSTEM: The candidate has requested a "hint". Provide a helpful hint WITHOUT revealing the full answer. Internally deduct 1 point from the max possible score for this question.]',
        next_round: `[SYSTEM: The candidate has requested to move to the "next round". The minimum DSA question count for Round 1 is ${dsaMinLimit}. Questions asked so far: ${dsaQuestionsAsked}. If ${dsaQuestionsAsked} >= ${dsaMinLimit}, transition to Round 2 with a proper announcement. If not, inform them they need ${dsaMinLimit - dsaQuestionsAsked} more DSA questions before moving on.]`,
        end_interview: '[SYSTEM: The candidate has requested to "end interview". Generate the INTERVIEW_COMPLETE report immediately based on all questions answered so far. Mark any unanswered rounds as "Not Evaluated".]',
        skip_resume: '[SYSTEM: The candidate has chosen to skip providing their resume. Proceed directly to Round 1 with general questions. Do not ask for the resume again.]',
      };
      aiContent += `\n\n${commandInstructions[command]}`;
    }

    // 3. Inject DSA instructions into the prompt with explicit slug tracking
    if (currentRound === 1) {
      if (existingDsaProblem) {
        aiContent += `\n\n[SYSTEM DSA CONTEXT — DO NOT IGNORE]`;
        aiContent += `\nCURRENT_DSA_PROBLEM: "${existingDsaProblem.title}" (${existingDsaProblem.difficulty})`;
        aiContent += `\nCURRENT_DSA_SLUG: ${existingDsaProblem.slug}`;
        if (!command) {
           aiContent += `\nIf the candidate has provided a genuine attempt at solving "${existingDsaProblem.title}", evaluate it with SCORE. If they have NOT attempted the problem, do NOT score them — instead prompt them to attempt it.`;
        }
        if (upcomingDsaProblem) {
            aiContent += `\n\nDSA_PROGRESS: ${dsaQuestionsAsked} asked so far (min: ${dsaMinLimit}, max: ${dsaMaxLimit})`;
            aiContent += `\n\n⚠️ MANDATORY NEXT PROBLEM (if you advance):`;
            aiContent += `\nNEXT_DSA_PROBLEM: "${upcomingDsaProblem.title}"`;
            aiContent += `\nNEXT_DSA_SLUG: ${upcomingDsaProblem.slug}`;
            aiContent += `\nNEXT_DSA_DIFFICULTY: ${upcomingDsaProblem.difficulty}`;
            aiContent += `\nIf you evaluate the current problem and move to a new DSA question, your NEXT QUESTION text MUST contain the EXACT title "${upcomingDsaProblem.title}". Do NOT invent a different problem. Do NOT substitute with any other problem. The coding panel will show "${upcomingDsaProblem.title}" — your question MUST match it exactly.`;
            if (dsaMinReached) {
              aiContent += `\nNOTE: Minimum DSA count (${dsaMinLimit}) has been reached. You MAY transition to Round 2 after evaluating if the candidate's performance warrants it, OR continue with more DSA up to the max of ${dsaMaxLimit}.`;
            } else {
              aiContent += `\nYou CANNOT transition to Round 2 yet — minimum ${dsaMinLimit} DSA questions required, only ${dsaQuestionsAsked} asked so far.`;
            }
            aiContent += `\nYou MUST wait for the candidate to answer "${upcomingDsaProblem.title}" before any round transition.`;
            aiContent += `\n[END DSA CONTEXT]`;
        } else if (round1Complete) {
            aiContent += `\n\n⚠️ DSA MAX LIMIT REACHED: ${dsaMaxLimit}/${dsaMaxLimit} DSA questions asked for role "${session.role_type}".`;
            aiContent += `\nAfter evaluating the current problem, YOU MUST announce Round 1 complete and transition to Round 2 immediately. DO NOT ASK ANY MORE DSA QUESTIONS.`;
            aiContent += `\n[END DSA CONTEXT]`;
        } else {
            aiContent += `\n[END DSA CONTEXT]`;
        }
      } else if (upcomingTurn === 2 && upcomingDsaProblem) {
        // First DSA problem (turn 2)
        aiContent += `\n\n[SYSTEM DSA CONTEXT — DO NOT IGNORE]`;
        aiContent += `\nFIRST_DSA_PROBLEM: "${upcomingDsaProblem.title}"`;
        aiContent += `\nFIRST_DSA_SLUG: ${upcomingDsaProblem.slug}`;
        aiContent += `\nFIRST_DSA_DIFFICULTY: ${upcomingDsaProblem.difficulty}`;
        aiContent += `\nThis is the first DSA problem turn. You MUST ask the candidate to solve this EXACT problem: "${upcomingDsaProblem.title}" (${upcomingDsaProblem.difficulty}).`;
        aiContent += `\nState the problem title "${upcomingDsaProblem.title}" explicitly in your question. Do NOT invent a different problem. The coding panel will display "${upcomingDsaProblem.title}" — your question text MUST match.`;
        aiContent += `\n[END DSA CONTEXT]`;
      }
    }

    // ── Route message through AI ──
    const aiResponse = await routeMessage(id, aiContent);

    // ── Cross-verify the AI response with the pre-fetched problem ──
    // Helper: Check if AI response mentions a specific problem title (case-insensitive)
    const aiMentionsProblem = (title) => {
      if (!title) return false;
      const normalizedReply = aiResponse.reply.toLowerCase();
      const normalizedTitle = title.toLowerCase();
      return normalizedReply.includes(normalizedTitle);
    };

    // All known problem slugs across all difficulty pools for fallback detection
    const ALL_KNOWN_PROBLEMS = {
      // Easy
      'two-sum': 'Two Sum',
      'reverse-string': 'Reverse String',
      'palindrome-number': 'Palindrome Number',
      'valid-parentheses': 'Valid Parentheses',
      'fizz-buzz': 'Fizz Buzz',
      'merge-two-sorted-lists': 'Merge Two Sorted Lists',
      'best-time-to-buy-and-sell-stock': 'Best Time to Buy and Sell Stock',
      'valid-anagram': 'Valid Anagram',
      'maximum-subarray': 'Maximum Subarray',
      'climbing-stairs': 'Climbing Stairs',
      // Medium
      'longest-substring-without-repeating-characters': 'Longest Substring Without Repeating Characters',
      'container-with-most-water': 'Container With Most Water',
      '3sum': '3Sum',
      'longest-palindromic-substring': 'Longest Palindromic Substring',
      'group-anagrams': 'Group Anagrams',
      'product-of-array-except-self': 'Product of Array Except Self',
      'rotate-image': 'Rotate Image',
      'search-in-rotated-sorted-array': 'Search in Rotated Sorted Array',
      'coin-change': 'Coin Change',
      'letter-combinations-of-a-phone-number': 'Letter Combinations of a Phone Number',
      // Hard
      'median-of-two-sorted-arrays': 'Median of Two Sorted Arrays',
      'trapping-rain-water': 'Trapping Rain Water',
      'n-queens': 'N-Queens',
      'merge-k-sorted-lists': 'Merge k Sorted Lists',
      'word-ladder': 'Word Ladder',
      'minimum-window-substring': 'Minimum Window Substring',
      'largest-rectangle-in-histogram': 'Largest Rectangle in Histogram',
      'serialize-and-deserialize-binary-tree': 'Serialize and Deserialize Binary Tree',
      'sliding-window-maximum': 'Sliding Window Maximum',
      'edit-distance': 'Edit Distance',
    };

    // Try to find which problem the AI is actually talking about in the NEXT QUESTION section
    // Excludes the current problem to avoid false matches
    const findMentionedProblem = (excludeSlug) => {
      // First, try to find problem mentioned specifically in the NEXT QUESTION section
      const nextQuestionMatch = aiResponse.reply.match(/NEXT QUESTION:[\s\S]*/i);
      const searchText = nextQuestionMatch ? nextQuestionMatch[0] : aiResponse.reply;
      
      for (const [slug, title] of Object.entries(ALL_KNOWN_PROBLEMS)) {
        if (slug === excludeSlug) continue; // Skip the current problem
        if (searchText.toLowerCase().includes(title.toLowerCase())) {
          return { slug, title };
        }
      }
      return null;
    };

    // ── Determine which DSA problem is now active ──
    let dsaProblemToSave = null;
    let finalDsaProblem = null;
    let detectedRound = currentRound;

    if (currentRound === 1) {
      const isTransitioningOut = aiResponse.reply.includes('Round 2') && aiResponse.reply.includes('Technical');
      const aiScoredThisResponse = /SCORE:\s*\d+\s*\/\s*10/i.test(aiResponse.reply);
      const aiAskedNextQuestion = aiResponse.reply.includes('NEXT QUESTION:');
      
      if (!isTransitioningOut) {
        if (round1Complete && aiScoredThisResponse && aiAskedNextQuestion) {
           // DSA limit reached & AI still asked another Q — force round transition
           detectedRound = 2;
           finalDsaProblem = null;
        } else if ((aiScoredThisResponse && aiAskedNextQuestion) || command === 'skip') {
           // AI scored the current problem and asked the next one.
           // CROSS-VERIFY: Does the AI response actually mention the pre-fetched problem?
           if (upcomingDsaProblem && aiMentionsProblem(upcomingDsaProblem.title)) {
             // ✅ AI obediently used the pre-fetched problem
             dsaProblemToSave = upcomingDsaProblem;
             console.log(`✅ AI correctly mentioned pre-fetched problem: "${upcomingDsaProblem.title}"`);
           } else if (upcomingDsaProblem) {
             // ⚠️ AI went rogue — mentioned a different problem
             const mentionedProblem = findMentionedProblem(existingDsaProblem?.slug);
             if (mentionedProblem) {
               // AI mentioned a known problem that's different from the current one
               // Fetch/use that problem instead to keep panel in sync with AI
               console.warn(`⚠️ AI ignored pre-fetched "${upcomingDsaProblem.title}" and asked about "${mentionedProblem.title}" instead. Syncing panel to AI's choice.`);
               try {
                 const actualProblem = await fetchProblemBySlug(mentionedProblem.slug);
                 dsaProblemToSave = {
                   slug: mentionedProblem.slug,
                   title: mentionedProblem.title,
                   difficulty: actualProblem.difficulty || upcomingDsaProblem.difficulty,
                 };
               } catch (fetchErr) {
                 // Fallback: use the basic info we already have
                 dsaProblemToSave = {
                   slug: mentionedProblem.slug,
                   title: mentionedProblem.title,
                   difficulty: upcomingDsaProblem.difficulty,
                 };
               }
             } else {
               // Can't identify what the AI asked — still save the pre-fetched to avoid null panel
               console.warn(`⚠️ Could not identify AI's chosen problem. Using pre-fetched "${upcomingDsaProblem.title}" as fallback.`);
               dsaProblemToSave = upcomingDsaProblem;
             }
           }
        } else if (!existingDsaProblem && upcomingTurn === 2) {
           // Turn 2: presenting the first DSA problem.
           // Cross-verify even for the first problem
           if (upcomingDsaProblem && aiMentionsProblem(upcomingDsaProblem.title)) {
             dsaProblemToSave = upcomingDsaProblem;
             console.log(`✅ AI correctly presented first DSA problem: "${upcomingDsaProblem.title}"`);
           } else if (upcomingDsaProblem) {
             // AI might have mentioned a different problem
             const mentionedProblem = findMentionedProblem(null);
             if (mentionedProblem) {
               console.warn(`⚠️ AI chose "${mentionedProblem.title}" instead of pre-fetched "${upcomingDsaProblem.title}" for first DSA. Syncing.`);
               dsaProblemToSave = {
                 slug: mentionedProblem.slug,
                 title: mentionedProblem.title,
                 difficulty: upcomingDsaProblem.difficulty,
               };
             } else {
               // Fallback to pre-fetched
               dsaProblemToSave = upcomingDsaProblem;
             }
           }
        } else {
           // AI did not advance the question (e.g. clarification, hint, invalid answer)
           // But also check: did the AI mention a NEW problem without using SCORE/NEXT QUESTION format?
           // This handles cases where some AI providers format differently
           if (upcomingDsaProblem && aiMentionsProblem(upcomingDsaProblem.title) && !aiMentionsProblem(existingDsaProblem?.title || '')) {
             // AI mentioned the upcoming problem but NOT the existing one — it advanced without proper format
             console.warn(`⚠️ AI mentioned upcoming problem "${upcomingDsaProblem.title}" without proper SCORE/NEXT QUESTION format. Saving anyway.`);
             dsaProblemToSave = upcomingDsaProblem;
           } else {
             finalDsaProblem = existingDsaProblem;
           }
        }
      }
    }

    // 4. Save the new problem to DB if appropriate
    if (dsaProblemToSave) {
      try {
        await pool.query(
          `INSERT INTO dsa_problems (session_id, turn_number, leetcode_slug, title, difficulty)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, upcomingTurn, dsaProblemToSave.slug, dsaProblemToSave.title, dsaProblemToSave.difficulty]
        );
        console.log(`🧩 New DSA problem locked in (turn ${upcomingTurn}): ${dsaProblemToSave.title}`);
        finalDsaProblem = dsaProblemToSave;
      } catch (err) {
        console.error('Failed to insert new DSA problem:', err.message);
      }
    } else if (finalDsaProblem) {
      console.log(`📌 Keeping current DSA problem: ${finalDsaProblem.title}`);
    }

    // ── Detect round transitions from AI response ──
    const roundMatch = aiResponse.reply.match(/ROUND:\s*(\d+)/i);
    if (roundMatch) {
      detectedRound = parseInt(roundMatch[1]);
    }
    // Also detect from transition announcements
    if (aiResponse.reply.includes('Round 2') && aiResponse.reply.includes('Technical') && currentRound < 2) {
      detectedRound = 2;
    } else if (aiResponse.reply.includes('Round 3') && aiResponse.reply.includes('HR') && currentRound < 3) {
      detectedRound = 3;
    }
    // Update current_round if changed
    if (detectedRound !== currentRound) {
      await pool.query(
        `UPDATE sessions SET current_round = $1 WHERE id = $2`,
        [detectedRound, id]
      );
      console.log(`🔄 Round transition: ${currentRound} → ${detectedRound}`);
    }

    // ── Check for INTERVIEW_COMPLETE ──
    const isComplete = aiResponse.reply.includes('INTERVIEW_COMPLETE');
    let report = null;

    if (isComplete) {
      report = await parseAndSaveReport(id, aiResponse.reply);
      await pool.query(
        `UPDATE sessions SET status = 'completed' WHERE id = $1`,
        [id]
      );
      console.log(`🏁 Interview complete for session ${id}`);
    }

    // ── Return response ──
    res.json({
      reply: aiResponse.reply,
      provider: aiResponse.provider,
      model: aiResponse.model,
      token_stats: aiResponse.tokenStats,
      cache_status: aiResponse.cacheStatus,
      turn_count: aiResponse.turnCount,
      current_round: detectedRound,
      dsa_problem: finalDsaProblem,
      is_complete: isComplete,
      report: report,
      control_command: command,
    });
  } catch (error) {
    console.error('Message error:', error.message);

    const status = error.status || 500;
    res.status(status).json({
      error: error.message || 'Failed to process message. Please try again.',
    });
  }
});

// ─── UPDATE RESUME ────────────────────────────────────────
// POST /api/sessions/:id/resume
// Body: { resume_text }
// Allows updating the resume after session creation.
router.post('/:id/resume', async (req, res) => {
  try {
    const { id } = req.params;
    const { resume_text } = req.body;

    if (!resume_text || resume_text.trim().length === 0) {
      return res.status(400).json({ error: 'Resume text is required.' });
    }

    const sessionResult = await pool.query(
      `SELECT id, status FROM sessions WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (sessionResult.rows[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot update resume on a completed session.' });
    }

    await pool.query(
      `UPDATE sessions SET resume_text = $1 WHERE id = $2`,
      [resume_text.trim(), id]
    );

    console.log(`📄 Resume updated for session ${id} (${resume_text.length} chars)`);

    res.json({ message: 'Resume updated successfully.', session_id: id });
  } catch (error) {
    console.error('Update resume error:', error.message);
    res.status(500).json({ error: 'Failed to update resume.' });
  }
});

// ─── END SESSION ──────────────────────────────────────────
// POST /api/sessions/:id/end
// Forces a session to end and marks it as completed.
// Report generation will be wired in Step 17 (reportParser.js).
router.post('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;

    // ── Verify session belongs to user and is active ──
    const sessionResult = await pool.query(
      `SELECT id, status FROM sessions
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const session = sessionResult.rows[0];

    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Session is already completed.' });
    }

    // ── Mark session as completed ──
    await pool.query(
      `UPDATE sessions SET status = 'completed' WHERE id = $1`,
      [id]
    );

    console.log(`🏁 Session ended: ${id}`);

    res.json({
      message: 'Session ended successfully.',
      session_id: id,
      status: 'completed',
    });
  } catch (error) {
    console.error('End session error:', error.message);
    res.status(500).json({ error: 'Failed to end session.' });
  }
});

export default router;
