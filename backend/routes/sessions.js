import express from 'express';
import auth from '../middleware/auth.js';
import pool from '../db/index.js';
import { routeMessage, getFirstQuestion } from '../services/aiRouter.js';
import { getRandomProblem, getFallbackProblem, getDifficulty } from '../services/leetcode.js';
import { parseAndSaveReport } from '../services/reportParser.js';

const router = express.Router();

// All session routes require authentication
router.use(auth);

// ─── START SESSION ────────────────────────────────────────
// POST /api/sessions/start
// Body: { company_type, role_type }
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
    const { company_type, role_type } = req.body;

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

    // ── Create session ──
    const result = await pool.query(
      `INSERT INTO sessions (user_id, company_type, role_type, status, current_provider, turn_count)
       VALUES ($1, $2, $3, 'active', 'claude', 0)
       RETURNING id, company_type, role_type, status, current_provider, turn_count, created_at`,
      [req.user.userId, company_type, role_type]
    );

    const session = result.rows[0];

    console.log(`🎯 New session started: ${session.id} (${company_type}/${role_type}) by user ${req.user.userId}`);

    // ── Get the first AI question (welcome + Q1) ──
    let firstQuestion = null;
    try {
      firstQuestion = await getFirstQuestion(session.id);
    } catch (aiError) {
      console.error('Failed to get first question:', aiError.message);
      // Session is created, but AI failed — frontend can retry via /message
    }

    res.status(201).json({
      session_id: session.id,
      company_type: session.company_type,
      role_type: session.role_type,
      status: session.status,
      current_provider: session.current_provider,
      turn_count: session.turn_count,
      created_at: session.created_at,
      first_question: firstQuestion?.reply || null,
      provider: firstQuestion?.provider || null,
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
              current_provider, turn_count, total_score, created_at
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
              user_code, language, judge0_result, passed, runtime_ms, created_at
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
      session,
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
      `SELECT id, user_id, company_type, role_type, status, turn_count
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

    // ── Route message through AI ──
    const aiResponse = await routeMessage(id, content.trim());

    // ── DSA Detection (turns 2, 3, 4 are DSA rounds) ──
    // turn_count is incremented inside routeMessage, so the NEW turn
    // is aiResponse.turnCount. DSA turns are 2, 3, 4.
    let dsaProblem = null;
    const currentTurn = aiResponse.turnCount;

    if ([2, 3, 4].includes(currentTurn)) {
      try {
        // Get already-used slugs to avoid repeats
        const usedResult = await pool.query(
          'SELECT leetcode_slug FROM dsa_problems WHERE session_id = $1',
          [id]
        );
        const usedSlugs = usedResult.rows.map(r => r.leetcode_slug);

        // Fetch a problem
        dsaProblem = await getRandomProblem(session.company_type, usedSlugs);

        // Save to dsa_problems table
        await pool.query(
          `INSERT INTO dsa_problems (session_id, turn_number, leetcode_slug, title, difficulty)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, currentTurn, dsaProblem.slug, dsaProblem.title, dsaProblem.difficulty]
        );

        console.log(`🧩 DSA problem fetched for turn ${currentTurn}: ${dsaProblem.title}`);
      } catch (dsaError) {
        console.error('DSA problem fetch failed (non-fatal):', dsaError.message);
        // Use fallback problem
        const difficulty = getDifficulty(session.company_type);
        dsaProblem = getFallbackProblem(difficulty);
      }
    }

    // ── Check for INTERVIEW_COMPLETE ──
    const isComplete = aiResponse.reply.includes('INTERVIEW_COMPLETE');
    let report = null;

    if (isComplete) {
      // Parse and save the structured report
      report = await parseAndSaveReport(id, aiResponse.reply);

      // Mark session as completed (parseAndSaveReport also does this,
      // but we do it here as a safety net in case parsing fails)
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
      turn_count: currentTurn,
      dsa_problem: dsaProblem,
      is_complete: isComplete,
      report: report,
    });
  } catch (error) {
    console.error('Message error:', error.message);

    const status = error.status || 500;
    res.status(status).json({
      error: error.message || 'Failed to process message. Please try again.',
    });
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
