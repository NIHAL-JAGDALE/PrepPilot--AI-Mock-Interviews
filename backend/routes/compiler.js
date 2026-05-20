import express from 'express';
import auth from '../middleware/auth.js';
import { submitAndRun, resolveLanguageId, LANGUAGE_IDS } from '../services/judge0.js';

const router = express.Router();

// All compiler routes require authentication
router.use(auth);

// ─── RUN CODE ─────────────────────────────────────────────
// POST /api/compiler/run
// Body: { code, language_id, stdin? }
//   OR: { code, language, stdin? }  (language name instead of ID)
//
// Returns: { stdout, stderr, time, memory, status, passed, compileOutput }
//
// language_id values: C++=54, Java=62, Python=71, JavaScript=63
// Alternatively, pass language as string: 'python', 'javascript', 'cpp', 'java'
router.post('/run', async (req, res) => {
  try {
    const { code, language_id, language, stdin } = req.body;

    // ── Validate input ──
    if (!code || code.trim().length === 0) {
      return res.status(400).json({ error: 'Code is required.' });
    }

    // Resolve language ID
    let langId = language_id;
    if (!langId && language) {
      try {
        langId = resolveLanguageId(language);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    if (!langId) {
      return res.status(400).json({
        error: 'language_id or language is required. Supported: C++(54), Java(62), Python(71), JavaScript(63)',
      });
    }

    // Validate language_id is supported
    const validIds = Object.values(LANGUAGE_IDS);
    if (!validIds.includes(Number(langId))) {
      return res.status(400).json({
        error: `Invalid language_id: ${langId}. Supported: ${JSON.stringify(LANGUAGE_IDS)}`,
      });
    }

    console.log(`🖥️ Compiling code for user ${req.user.userId} (lang=${langId})`);

    // ── Submit and run ──
    const result = await submitAndRun(code, Number(langId), stdin || '');

    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      time: result.time,
      memory: result.memory,
      status: result.status,
      statusId: result.statusId,
      passed: result.passed,
    });
  } catch (error) {
    console.error('Compiler error:', error.message);

    if (error.message.includes('JUDGE0_API_KEY')) {
      return res.status(503).json({
        error: 'Compiler service is not configured. Please set JUDGE0_API_KEY.',
      });
    }

    if (error.message.includes('timed out')) {
      return res.status(408).json({
        error: 'Code execution timed out. Please optimize your solution.',
      });
    }

    res.status(500).json({ error: 'Code execution failed. Please try again.' });
  }
});

// ─── GET SUPPORTED LANGUAGES ──────────────────────────────
// GET /api/compiler/languages
// Returns the list of supported languages and their IDs.
router.get('/languages', (_req, res) => {
  res.json({
    languages: [
      { id: 54, name: 'C++', aliases: ['cpp', 'c++'] },
      { id: 62, name: 'Java', aliases: ['java'] },
      { id: 71, name: 'Python 3', aliases: ['python', 'python3'] },
      { id: 63, name: 'JavaScript', aliases: ['javascript', 'js'] },
    ],
  });
});

export default router;
