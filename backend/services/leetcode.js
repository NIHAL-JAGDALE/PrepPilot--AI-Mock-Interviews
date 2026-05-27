import axios from 'axios';

// ─── LEETCODE PROBLEM FETCHER ─────────────────────────────
//
// Fetches real LeetCode problems via their public GraphQL API.
// Used during DSA rounds (turns 2, 3, 4) to provide coding problems.
//
// Difficulty mapping (from company_type):
//   mnc     → easy
//   startup → medium
//   faang   → hard
//
// ⚠️ PITFALL (from instructions):
//   LeetCode GraphQL has rate limiting. We add a small delay
//   between fetches and cache results to avoid hitting limits.
// ──────────────────────────────────────────────────────────

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

// ── Problem slug pools by difficulty ──
const PROBLEM_POOLS = {
  easy: [
    'two-sum',
    'reverse-string',
    'palindrome-number',
    'valid-parentheses',
    'fizz-buzz',
  ],
  medium: [
    'longest-substring-without-repeating-characters',
    'container-with-most-water',
    '3sum',
    'longest-palindromic-substring',
  ],
  hard: [
    'median-of-two-sorted-arrays',
    'trapping-rain-water',
    'n-queens',
    'merge-k-sorted-lists',
  ],
};

// ── Company type to difficulty mapping ──
const COMPANY_DIFFICULTY_MAP = {
  mnc: 'easy',
  startup: 'medium',
  faang: 'hard',
};

// ── In-memory cache for fetched problems ──
// Avoids re-fetching the same problem from LeetCode
const problemCache = new Map();

// ── GraphQL query ──
const QUESTION_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      title
      difficulty
      content
      exampleTestcases
      topicTags {
        name
      }
      codeSnippets {
        lang
        langSlug
        code
      }
    }
  }
`;

/**
 * Fetch a LeetCode problem by its slug.
 *
 * @param {string} slug - The problem's URL slug (e.g., 'two-sum')
 * @returns {object} { title, difficulty, content, examples, topicTags, slug }
 */
export async function fetchProblemBySlug(slug) {
  // Check cache first
  if (problemCache.has(slug)) {
    console.log(`📋 LeetCode problem "${slug}" served from cache`);
    return problemCache.get(slug);
  }

  console.log(`🔍 Fetching LeetCode problem: ${slug}...`);

  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query: QUESTION_QUERY,
        variables: { titleSlug: slug },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PrepPilot/1.0',
          'Referer': 'https://leetcode.com',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const question = response.data?.data?.question;

    if (!question) {
      throw new Error(`Problem "${slug}" not found on LeetCode`);
    }

    const problem = {
      slug,
      title: question.title,
      difficulty: question.difficulty,
      content: question.content, // HTML content with problem description
      examples: question.exampleTestcases || '',
      topicTags: question.topicTags?.map(tag => tag.name) || [],
      codeSnippets: question.codeSnippets || [],
    };

    // Cache the result
    problemCache.set(slug, problem);

    console.log(`✅ Fetched: "${problem.title}" (${problem.difficulty})`);

    return problem;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('⚠️ LeetCode rate limit hit. Waiting 2 seconds...');
      await delay(2000);
      // Retry once after delay
      return fetchProblemBySlug(slug);
    }

    console.error(`❌ Failed to fetch LeetCode problem "${slug}":`, error.message);
    throw error;
  }
}

/**
 * Get a random problem for a DSA round based on company type.
 * Avoids picking problems already used in the current session.
 *
 * @param {string} companyType - 'startup' | 'mnc' | 'faang'
 * @param {Array<string>} usedSlugs - Slugs already used in this session
 * @returns {object} { title, difficulty, content, examples, topicTags, slug }
 */
export async function getRandomProblem(companyType, usedSlugs = []) {
  const difficulty = COMPANY_DIFFICULTY_MAP[companyType] || 'medium';
  const pool = PROBLEM_POOLS[difficulty] || PROBLEM_POOLS.medium;

  // Filter out already-used problems
  const available = pool.filter(slug => !usedSlugs.includes(slug));

  // If all problems have been used, allow repeats
  const candidates = available.length > 0 ? available : pool;

  // Pick a random slug
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const selectedSlug = candidates[randomIndex];

  // Add a small delay to avoid rate limiting
  await delay(500);

  // Fetch the problem details
  const problem = await fetchProblemBySlug(selectedSlug);

  return problem;
}

/**
 * Get the difficulty for a company type.
 *
 * @param {string} companyType - 'startup' | 'mnc' | 'faang'
 * @returns {string} 'easy' | 'medium' | 'hard'
 */
export function getDifficulty(companyType) {
  return COMPANY_DIFFICULTY_MAP[companyType] || 'medium';
}

/**
 * Small delay helper to avoid rate limiting.
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get a fallback problem if LeetCode API is unavailable.
 * Returns a hardcoded problem so the interview isn't blocked.
 */
export function getFallbackProblem(difficulty) {
  const fallbacks = {
    easy: {
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'Easy',
      content: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
<p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
<p>You can return the answer in any order.</p>
<p><strong>Example 1:</strong></p>
<pre>Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</pre>
<p><strong>Example 2:</strong></p>
<pre>Input: nums = [3,2,4], target = 6
Output: [1,2]</pre>
<p><strong>Constraints:</strong></p>
<ul><li>2 &lt;= nums.length &lt;= 10<sup>4</sup></li>
<li>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></li>
<li>Only one valid answer exists.</li></ul>`,
      examples: '[2,7,11,15]\n9\n[3,2,4]\n6',
      topicTags: ['Array', 'Hash Table'],
    },
    medium: {
      slug: 'longest-substring-without-repeating-characters',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      content: `<p>Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.</p>
<p><strong>Example 1:</strong></p>
<pre>Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.</pre>
<p><strong>Example 2:</strong></p>
<pre>Input: s = "bbbbb"
Output: 1</pre>
<p><strong>Constraints:</strong></p>
<ul><li>0 &lt;= s.length &lt;= 5 * 10<sup>4</sup></li>
<li>s consists of English letters, digits, symbols and spaces.</li></ul>`,
      examples: '"abcabcbb"\n"bbbbb"\n"pwwkew"',
      topicTags: ['Hash Table', 'String', 'Sliding Window'],
    },
    hard: {
      slug: 'trapping-rain-water',
      title: 'Trapping Rain Water',
      difficulty: 'Hard',
      content: `<p>Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is <code>1</code>, compute how much water it can trap after raining.</p>
<p><strong>Example 1:</strong></p>
<pre>Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.</pre>
<p><strong>Constraints:</strong></p>
<ul><li>n == height.length</li>
<li>1 &lt;= n &lt;= 2 * 10<sup>4</sup></li>
<li>0 &lt;= height[i] &lt;= 10<sup>5</sup></li></ul>`,
      examples: '[0,1,0,2,1,0,1,3,2,1,2,1]\n[4,2,0,3,2,5]',
      topicTags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    },
  };

  return fallbacks[difficulty] || fallbacks.medium;
}

export default { fetchProblemBySlug, getRandomProblem, getDifficulty, getFallbackProblem };
