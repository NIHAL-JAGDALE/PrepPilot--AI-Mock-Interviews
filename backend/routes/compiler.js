import express from 'express';
import auth from '../middleware/auth.js';
import { executeCode, resolveLanguage, LANGUAGE_MAP } from '../services/jdoodle.js';

const router = express.Router();

// All compiler routes require authentication
router.use(auth);

// ─── RUN CODE ─────────────────────────────────────────────
// POST /api/compiler/run
// Body: { code, language, stdin? }
//   language: 'python' | 'javascript' | 'cpp' | 'java'
//
// Returns: { stdout, stderr, compileOutput, time, memory, status, passed }
router.post('/run', async (req, res) => {
  try {
    const { code, language, stdin } = req.body;

    // ── Validate input ──
    if (!code || code.trim().length === 0) {
      return res.status(400).json({ error: 'Code is required.' });
    }

    if (!language) {
      return res.status(400).json({
        error: `language is required. Supported: ${Object.keys(LANGUAGE_MAP).join(', ')}`,
      });
    }

    // Validate language is supported
    let resolved;
    try {
      resolved = resolveLanguage(language);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    console.log(`🖥️  Executing code for user ${req.user.userId} (lang=${resolved.language} ${resolved.version})`);

    // ── Execute via JDoodle ──
    const result = await executeCode(code, language, stdin || '');

    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      time: result.time,
      memory: result.memory,
      status: result.status,
      passed: result.passed,
    });
  } catch (error) {
    console.error('Compiler error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Compiler service (JDoodle) is unreachable. Please try again.',
      });
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({
        error: 'Code execution timed out. Please optimize your solution.',
      });
    }

    const errorMsg = error.message || 'Code execution failed. Please try again.';
    res.status(500).json({ error: errorMsg });
  }
});

// ─── GET SUPPORTED LANGUAGES ──────────────────────────────
// GET /api/compiler/languages
// Returns the list of supported languages and their JDoodle identifiers.
router.get('/languages', (_req, res) => {
  res.json({
    languages: [
      { key: 'python',     name: 'Python 3',       version: '3.10.0'  },
      { key: 'javascript', name: 'JavaScript',      version: '18.15.0' },
      { key: 'cpp',        name: 'C++',             version: '10.2.0'  },
      { key: 'java',       name: 'Java',            version: '15.0.2'  },
    ],
  });
});

export default router;
