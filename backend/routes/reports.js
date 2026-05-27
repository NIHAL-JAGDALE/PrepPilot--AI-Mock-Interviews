import express from 'express';
import auth from '../middleware/auth.js';
import pool from '../db/index.js';
import { getSessionCacheStats } from '../services/cachingService.js';

const router = express.Router();

// All report routes require authentication
router.use(auth);

// ─── GET REPORT ───────────────────────────────────────────
// GET /api/reports/:sessionId
// Returns the full interview report with scores, breakdown,
// strengths, improvements, hiring recommendation, study plan,
// DSA code attempts, and session cache stats.
//
// Used by the Report page (/report/:sessionId).
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // ── Verify session belongs to user ──
    const sessionResult = await pool.query(
      `SELECT id, user_id, company_type, role_type, status,
<<<<<<< HEAD
              current_provider, turn_count, total_score, created_at
=======
              turn_count, total_score, created_at
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
       FROM sessions
       WHERE id = $1 AND user_id = $2`,
      [sessionId, req.user.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const session = sessionResult.rows[0];

    // ── Fetch report ──
    const reportResult = await pool.query(
      `SELECT id, overall_score, percentile,
              intro_score, dsa_score, cs_score, project_score, hr_score,
              strengths, improvements, hiring_recommendation, study_plan,
              created_at
       FROM reports
       WHERE session_id = $1`,
      [sessionId]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Report not found. The interview may not be completed yet.',
      });
    }

    const report = reportResult.rows[0];

    // ── Fetch DSA code attempts ──
    const dsaResult = await pool.query(
      `SELECT turn_number, leetcode_slug, title, difficulty,
              user_code, language, judge0_result, passed, runtime_ms
       FROM dsa_problems
       WHERE session_id = $1
       ORDER BY turn_number ASC`,
      [sessionId]
    );

    // ── Fetch evaluations (per-question scores) ──
    const evalResult = await pool.query(
      `SELECT question_number, question, score, feedback,
              model_answer, weak_areas
       FROM evaluations
       WHERE session_id = $1
       ORDER BY question_number ASC`,
      [sessionId]
    );

    // ── Fetch cache stats for the session ──
    const messageStats = await pool.query(
      `SELECT tokens_used, cached_tokens, provider
       FROM messages
       WHERE session_id = $1 AND role = 'assistant'`,
      [sessionId]
    );

    const cacheStats = getSessionCacheStats(messageStats.rows);

<<<<<<< HEAD
    // Extract primary provider from messages
    const providerCounts = {};
    for (const msg of messageStats.rows) {
      if (msg.provider) {
        providerCounts[msg.provider] = (providerCounts[msg.provider] || 0) + 1;
      }
    }
    const primaryProvider = Object.keys(providerCounts).sort((a, b) => providerCounts[b] - providerCounts[a])[0]
      || session.current_provider || 'claude';

=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
    res.json({
      session: {
        id: session.id,
        company_type: session.company_type,
        role_type: session.role_type,
        status: session.status,
<<<<<<< HEAD
        current_provider: session.current_provider,
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        turn_count: session.turn_count,
        total_score: session.total_score,
        created_at: session.created_at,
      },
      report: {
        ...report,
        round_breakdown: {
          introduction: report.intro_score,
          dsa: report.dsa_score,
          cs_fundamentals: report.cs_score,
          project_deep_dive: report.project_score,
          hr_behavioral: report.hr_score,
        },
      },
      dsa_attempts: dsaResult.rows,
      evaluations: evalResult.rows,
<<<<<<< HEAD
      cache_stats: { ...cacheStats, provider: primaryProvider },
=======
      cache_stats: cacheStats,
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
    });
  } catch (error) {
    console.error('Get report error:', error.message);
    res.status(500).json({ error: 'Failed to fetch report.' });
  }
});

export default router;
