import express from 'express';
import auth from '../middleware/auth.js';
import { getRandomProblem, getFallbackProblem, getDifficulty } from '../services/leetcode.js';

const router = express.Router();

// All problem routes require authentication
router.use(auth);

// ─── FETCH PROBLEM ────────────────────────────────────────
// GET /api/problems/fetch?difficulty=medium&company_type=startup
// Returns a random LeetCode problem matching the difficulty.
//
// Query params:
//   difficulty   - 'easy' | 'medium' | 'hard' (optional if company_type given)
//   company_type - 'mnc' | 'startup' | 'faang' (maps to difficulty automatically)
//   used_slugs   - comma-separated list of already-used slugs (optional)
//
// Returns: { title, difficulty, content, examples, topicTags, slug }
router.get('/fetch', async (req, res) => {
  try {
    const { difficulty, company_type, used_slugs } = req.query;

    // Resolve difficulty from company_type or direct param
    let resolvedDifficulty = difficulty;
    if (!resolvedDifficulty && company_type) {
      resolvedDifficulty = getDifficulty(company_type);
    }
    if (!resolvedDifficulty) {
      resolvedDifficulty = 'medium'; // default
    }

    // Parse used slugs
    const usedSlugs = used_slugs ? used_slugs.split(',').map(s => s.trim()) : [];

    // Map difficulty string to company_type for getRandomProblem
    const difficultyToCompany = { easy: 'mnc', medium: 'startup', hard: 'faang' };
    const companyType = company_type || difficultyToCompany[resolvedDifficulty] || 'startup';

    const problem = await getRandomProblem(companyType, usedSlugs);

    res.json({
      title: problem.title,
      difficulty: problem.difficulty,
      content: problem.content,
      examples: problem.examples,
      topicTags: problem.topicTags,
      slug: problem.slug,
<<<<<<< HEAD
      codeSnippets: problem.codeSnippets,
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
    });
  } catch (error) {
    console.error('Problem fetch error:', error.message);

    // Return a fallback problem so the interview isn't blocked
    const difficulty = req.query.difficulty || 'medium';
    const fallback = getFallbackProblem(difficulty);

    res.json({
      ...fallback,
      _fallback: true, // Flag so frontend knows this is a cached fallback
    });
  }
});

<<<<<<< HEAD
router.get('/:slug', async (req, res) => {
  try {
    const { fetchProblemBySlug } = await import('../services/leetcode.js');
    const problem = await fetchProblemBySlug(req.params.slug);
    res.json({
      title: problem.title,
      difficulty: problem.difficulty,
      content: problem.content,
      examples: problem.examples,
      topicTags: problem.topicTags,
      slug: problem.slug,
      codeSnippets: problem.codeSnippets,
    });
  } catch (error) {
    console.error('Problem fetch by slug error:', error.message);
    res.status(404).json({ error: 'Problem not found or LeetCode API unavailable' });
  }
});

=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
export default router;
