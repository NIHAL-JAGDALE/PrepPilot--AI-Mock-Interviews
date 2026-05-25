import axios from 'axios';

// ─── JUDGE0 COMPILER SERVICE ──────────────────────────────
//
// Submits code to Judge0 CE (via RapidAPI) and polls for results.
//
// Flow:
//   1. POST /submissions (async, returns a token)
//   2. Poll GET /submissions/{token} until status.id > 2
//   3. Return { stdout, stderr, time, memory, status }
//
// ⚠️ PITFALL (from instructions):
//   Judge0 returns 'In Queue' (status.id=1) and 'Processing'
//   (status.id=2) initially. You MUST poll until status.id > 2.
//   Don't treat the first response as the final result!
//
// Language IDs:
//   C++        = 54
//   Java       = 62
//   Python 3   = 71
//   JavaScript = 63
// ──────────────────────────────────────────────────────────

const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';

// Supported languages and their Judge0 IDs
export const LANGUAGE_IDS = {
  'cpp': 54,
  'c++': 54,
  'java': 62,
  'python': 71,
  'python3': 71,
  'javascript': 63,
  'js': 63,
};

// Judge0 status codes
const STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
};

// Human-readable status labels
const STATUS_LABELS = {
  [STATUS.ACCEPTED]: 'Accepted',
  [STATUS.WRONG_ANSWER]: 'Wrong Answer',
  [STATUS.TIME_LIMIT]: 'Time Limit Exceeded',
  [STATUS.COMPILATION_ERROR]: 'Compilation Error',
  [STATUS.RUNTIME_ERROR_SIGSEGV]: 'Runtime Error (SIGSEGV)',
  [STATUS.RUNTIME_ERROR_SIGXFSZ]: 'Runtime Error (SIGXFSZ)',
  [STATUS.RUNTIME_ERROR_SIGFPE]: 'Runtime Error (SIGFPE)',
  [STATUS.RUNTIME_ERROR_SIGABRT]: 'Runtime Error (SIGABRT)',
  [STATUS.RUNTIME_ERROR_NZEC]: 'Runtime Error (NZEC)',
  [STATUS.RUNTIME_ERROR_OTHER]: 'Runtime Error',
  [STATUS.INTERNAL_ERROR]: 'Internal Error',
  [STATUS.EXEC_FORMAT_ERROR]: 'Exec Format Error',
};

/**
 * Get the RapidAPI headers for Judge0 requests.
 */
function getHeaders() {
  if (!process.env.JUDGE0_API_KEY) {
    throw new Error('JUDGE0_API_KEY is not set in environment variables');
  }

  return {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
    'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com',
  };
}

/**
 * Submit code to Judge0 and poll for results.
 *
 * @param {string} sourceCode - The code to execute
 * @param {number} languageId - Judge0 language ID (54, 62, 63, 71)
 * @param {string} stdin - Optional input for the program
 * @param {number} timeLimit - Timeout in seconds (default: 5)
 * @returns {object} { stdout, stderr, time, memory, status, statusId, compileOutput }
 */
export async function submitAndRun(sourceCode, languageId, stdin = '', timeLimit = 5) {
  const headers = getHeaders();

  console.log(`\n⚙️ Judge0: Submitting code (language_id=${languageId})...`);

  // ── Step 1: Submit the code ──
  const submitResponse = await axios.post(
    `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`,
    {
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin || '',
      cpu_time_limit: timeLimit,
      memory_limit: 128000, // 128MB
    },
    { headers, timeout: 10000 }
  );

  const token = submitResponse.data?.token;

  if (!token) {
    throw new Error('Judge0 did not return a submission token');
  }

  console.log(`   Token: ${token}`);

  // ── Step 2: Poll for results ──
  // Judge0 initially returns status 1 (In Queue) or 2 (Processing).
  // We must poll until status.id > 2 (final result).
  const maxPolls = 20;
  const pollInterval = 1500; // 1.5 seconds

  for (let attempt = 0; attempt < maxPolls; attempt++) {
    await delay(pollInterval);

    const pollResponse = await axios.get(
      `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`,
      { headers, timeout: 10000 }
    );

    const result = pollResponse.data;
    const statusId = result.status?.id;

    console.log(`   Poll ${attempt + 1}: status=${statusId} (${result.status?.description})`);

    // Still processing — keep polling
    if (statusId === STATUS.IN_QUEUE || statusId === STATUS.PROCESSING) {
      continue;
    }

    // Final result!
    const statusLabel = STATUS_LABELS[statusId] || result.status?.description || 'Unknown';

    const output = {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compileOutput: result.compile_output || '',
      time: result.time ? parseFloat(result.time) : null,
      memory: result.memory || null,
      status: statusLabel,
      statusId,
      passed: statusId === STATUS.ACCEPTED,
    };

    console.log(`   Result: ${statusLabel} (${output.time}s, ${output.memory}KB)`);

    return output;
  }

  // Timed out polling
  throw new Error('Judge0 submission timed out after maximum poll attempts');
}

/**
 * Resolve a language name to its Judge0 language ID.
 *
 * @param {string} language - Language name (e.g., 'python', 'javascript', 'cpp', 'java')
 * @returns {number} Judge0 language ID
 */
export function resolveLanguageId(language) {
  const normalized = language.toLowerCase().trim();
  const id = LANGUAGE_IDS[normalized];

  if (!id) {
    throw new Error(
      `Unsupported language: "${language}". Supported: ${Object.keys(LANGUAGE_IDS).join(', ')}`
    );
  }

  return id;
}

/**
 * Small delay helper for polling.
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default { submitAndRun, resolveLanguageId, LANGUAGE_IDS };
