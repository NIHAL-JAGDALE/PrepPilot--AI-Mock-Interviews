import express from 'express';
import auth from '../middleware/auth.js';
import pool from '../db/index.js';
import { routeMessage, getFirstQuestion } from '../services/aiRouter.js';
import { getRandomProblem, getFallbackProblem, getDifficulty } from '../services/leetcode.js';
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
    const { content } = req.body;

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
    // If the AI is on a DSA question (or transitioning to one), we instruct it to use
    // the pre-fetched problem IF it decides to advance the question.
    // This keeps the AI generated text and the UI in perfect sync.
    const currentRound = session.current_round || 1;
    const upcomingTurn = session.turn_count + 1;

    // 1. Get the ACTIVE (existing) DSA problem if one exists
    let existingDsaProblem = null;
    if (currentRound === 1 && upcomingTurn >= 2) {
      const existingResult = await pool.query(
        `SELECT id, leetcode_slug AS slug, title, difficulty 
         FROM dsa_problems 
         WHERE session_id = $1 
         ORDER BY turn_number DESC LIMIT 1`,
        [id]
      );
      if (existingResult.rows.length > 0) {
        existingDsaProblem = existingResult.rows[0];
      }
    }

    // 2. Pre-fetch the UPCOMING problem (in case the AI advances)
    let upcomingDsaProblem = null;
    if (currentRound === 1) { // Only fetch in Round 1
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
        skip: '[SYSTEM: The candidate has used the "skip" command. You MUST output your evaluation in the EXACT strict format (SCORE: 0/10, FEEDBACK: "Question skipped", etc.). In the NEXT QUESTION field, say "Question skipped. Let\'s move on." followed by the next question.]',
        hint: '[SYSTEM: The candidate has requested a "hint". Provide a helpful hint WITHOUT revealing the full answer. Internally deduct 1 point from the max possible score for this question.]',
        next_round: '[SYSTEM: The candidate has requested to move to the "next round". If the minimum question count for the current round has been met, transition to the next round with a proper announcement. If not met, inform them how many more questions they need to answer.]',
        end_interview: '[SYSTEM: The candidate has requested to "end interview". Generate the INTERVIEW_COMPLETE report immediately based on all questions answered so far. Mark any unanswered rounds as "Not Evaluated".]',
        skip_resume: '[SYSTEM: The candidate has chosen to skip providing their resume. Proceed directly to Round 1 with general questions. Do not ask for the resume again.]',
      };
      aiContent += `\n\n${commandInstructions[command]}`;
    }

    // 3. Inject DSA instructions into the prompt
    if (currentRound === 1) {
      if (existingDsaProblem) {
        aiContent += `\n\n[SYSTEM: The current DSA problem is "${existingDsaProblem.title}" (${existingDsaProblem.difficulty}).`;
        if (!command) { // Only add scoring rules if not a command
           aiContent += ` If the candidate has provided a genuine attempt at solving this problem, evaluate it. If they have NOT attempted the problem, do NOT score them — instead prompt them to attempt it.`;
        }
        if (upcomingDsaProblem) {
            aiContent += `\nCRITICAL: If you evaluate the current problem (or it was skipped) and move to a new DSA question, your NEXT QUESTION MUST be the coding problem: "${upcomingDsaProblem.title}" (${upcomingDsaProblem.difficulty}). Do NOT invent a different problem. Reference this exact title. You CANNOT transition to Round 2 in this response; you MUST wait for the candidate to answer this new DSA question first.]`;
        } else {
            aiContent += `]`;
        }
      } else if (upcomingTurn === 2 && upcomingDsaProblem) {
        // First DSA problem (turn 2)
        aiContent += `\n\n[SYSTEM: This is the first DSA problem turn. Ask the candidate to solve this specific problem: "${upcomingDsaProblem.title}" (${upcomingDsaProblem.difficulty}). Do NOT invent a different problem. Reference this exact title.]`;
      }
    }

    // ── Route message through AI ──
    const aiResponse = await routeMessage(id, aiContent);

    // ── Determine which DSA problem is now active ──
    let dsaProblemToSave = null;
    let finalDsaProblem = null;

    if (currentRound === 1) {
      const isTransitioningOut = aiResponse.reply.includes('Round 2') && aiResponse.reply.includes('Technical');
      const aiScoredThisResponse = /SCORE:\s*\d+\s*\/\s*10/i.test(aiResponse.reply);
      const aiAskedNextQuestion = aiResponse.reply.includes('NEXT QUESTION:');
      
      if (!isTransitioningOut) {
        // We advance if AI scored and asked next question, OR if the command was skip
        if ((aiScoredThisResponse && aiAskedNextQuestion) || command === 'skip') {
           dsaProblemToSave = upcomingDsaProblem;
        } else if (!existingDsaProblem && upcomingTurn === 2) {
           // It's turn 2, presenting the first DSA problem. Lock it in even if AI dropped the NEXT QUESTION label by mistake.
           dsaProblemToSave = upcomingDsaProblem;
        } else {
           // AI did not advance the question (e.g. clarification, hint, invalid answer)
           finalDsaProblem = existingDsaProblem;
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
    let detectedRound = currentRound;
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
