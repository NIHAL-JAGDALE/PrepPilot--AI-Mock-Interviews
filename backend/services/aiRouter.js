import pool from '../db/index.js';
import * as claude from './claude.js';
import * as openai from './openai.js';
import * as groq from './groq.js';
import { formatForProvider } from './messageFormatter.js';
import { getCacheStatus } from './cachingService.js';
import { summarizeIfNeeded, getOptimizedContext } from './summarizer.js';
import { generateSystemPrompt } from '../prompts/systemPrompt.js';

// ─── AI ROUTER (ORCHESTRATOR) ─────────────────────────────
//
// This is the brain of PrepPilot's AI layer.
//
// Provider chain: Claude → OpenAI → Groq
// On every message:
//   1. Fetch session + history from DB
//   2. Summarize if turn_count > 5
//   3. Build optimized context
//   4. Try current provider → fallback on failure
//   5. Save response to DB
//   6. Return normalized result
//
// Fallback triggers:
//   - HTTP 429 (rate limited)
//   - HTTP 529 (overloaded)
//   - HTTP 503 (service unavailable)
//   - Network errors (ECONNREFUSED, ETIMEDOUT)
//   - API key errors (401/403)
//   - Any other provider error
//
// ⚠️ PITFALL (from instructions):
//   Always reset current_provider to 'claude' on new sessions.
//   This is handled in routes/sessions.js (Step 4).
// ──────────────────────────────────────────────────────────

const PROVIDERS = ['claude', 'openai', 'groq'];

const providerModules = {
  claude,
  openai,
  groq,
};

/**
 * Determine if an error should trigger a provider fallback.
 * Returns true for rate limits, overload, and network errors.
 */
function shouldFallback(error) {
  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.statusCode || error.code;

  // HTTP status codes that indicate provider issues
  if ([429, 503, 529, 500, 502].includes(status)) return true;

  // Auth errors — bad API key, should try next provider
  if ([401, 403].includes(status)) return true;

  // Network-level errors
  if (['ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'].includes(error.code)) return true;

  // Common error message patterns
  const fallbackPatterns = [
    'rate limit',
    'rate_limit',
    'quota',
    'overloaded',
    'capacity',
    'too many requests',
    'service unavailable',
    'internal server error',
    'api key',
    'authentication',
    'unauthorized',
  ];

  return fallbackPatterns.some(pattern => message.includes(pattern));
}

/**
 * Get the next provider in the chain.
 * Wraps around: groq → claude (circular).
 */
function getNextProvider(current) {
  const index = PROVIDERS.indexOf(current);
  return PROVIDERS[(index + 1) % PROVIDERS.length];
}

/**
 * Route a message through the AI provider chain.
 * This is the main function called by the message route (Step 16).
 *
 * @param {string} sessionId - Session UUID
 * @param {string} userMessage - The user's message content
 * @returns {object} { reply, provider, tokenStats, cacheStatus }
 * @throws {Error} Only if ALL providers fail (503)
 */
export async function routeMessage(sessionId, userMessage) {
  // ── 1. Fetch session from DB ──
  const sessionResult = await pool.query(
    `SELECT id, user_id, company_type, role_type, current_provider, turn_count
     FROM sessions WHERE id = $1`,
    [sessionId]
  );

  if (sessionResult.rows.length === 0) {
    throw Object.assign(new Error('Session not found'), { status: 404 });
  }

  const session = sessionResult.rows[0];
  const systemPrompt = generateSystemPrompt(session.company_type, session.role_type);

  // ── 2. Save user message to DB ──
  await pool.query(
    `INSERT INTO messages (session_id, role, content)
     VALUES ($1, 'user', $2)`,
    [sessionId, userMessage]
  );

  // ── 3. Summarize if needed (turn_count > 5) ──
  await summarizeIfNeeded(sessionId, session.current_provider, systemPrompt);

  // ── 4. Build optimized context ──
  const context = await getOptimizedContext(sessionId);

  // ── 5. Try providers with fallback ──
  let currentProvider = session.current_provider;
  let attempts = 0;
  let lastError = null;

  while (attempts < PROVIDERS.length) {
    try {
      console.log(`\n🔄 Attempting provider: ${currentProvider} (attempt ${attempts + 1}/${PROVIDERS.length})`);

      // Format messages for this provider
      const formattedMessages = formatForProvider(context, currentProvider);

      // Call the provider
      const providerModule = providerModules[currentProvider];
      const response = await providerModule.sendMessage(
        systemPrompt,
        formattedMessages
      );

      // ── 6. Success! Save response to DB ──
      await pool.query(
        `INSERT INTO messages (session_id, role, content, tokens_used, cached_tokens, provider)
         VALUES ($1, 'assistant', $2, $3, $4, $5)`,
        [
          sessionId,
          response.content,
          response.usage.inputTokens + response.usage.outputTokens,
          response.usage.cacheReadTokens,
          currentProvider,
        ]
      );

      // ── 7. Increment turn_count ──
      await pool.query(
        `UPDATE sessions SET turn_count = turn_count + 1, current_provider = $1
         WHERE id = $2`,
        [currentProvider, sessionId]
      );

      // ── 8. Build cache status ──
      const cacheStatus = getCacheStatus(response.usage, currentProvider);

      console.log(`✅ Response from ${currentProvider} (turn ${session.turn_count + 1})`);

      return {
        reply: response.content,
        provider: currentProvider,
        model: response.model,
        tokenStats: {
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
          cacheReadTokens: response.usage.cacheReadTokens,
          cacheWriteTokens: response.usage.cacheWriteTokens,
        },
        cacheStatus,
        turnCount: session.turn_count + 1,
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Provider ${currentProvider} failed:`, error.message);

      if (shouldFallback(error)) {
        const nextProvider = getNextProvider(currentProvider);
        console.log(`🔀 Switching from ${currentProvider} → ${nextProvider}`);

        // Update provider in DB
        await pool.query(
          `UPDATE sessions SET current_provider = $1 WHERE id = $2`,
          [nextProvider, sessionId]
        );

        currentProvider = nextProvider;
        attempts++;
      } else {
        // Non-fallback error (e.g., invalid request) — don't retry
        console.error(`💥 Non-recoverable error from ${currentProvider}:`, error.message);
        throw error;
      }
    }
  }

  // ── All providers failed ──
  console.error('🚫 All providers failed. Last error:', lastError?.message);
  throw Object.assign(
    new Error('All AI providers are currently unavailable. Please try again later.'),
    { status: 503 }
  );
}

/**
 * Get the first AI response for a new session (the welcome message + Q1).
 * Called when a session is created to immediately start the interview.
 *
 * @param {string} sessionId - Session UUID
 * @returns {object} Same shape as routeMessage
 */
export async function getFirstQuestion(sessionId) {
  // Send a minimal "start" message to trigger the AI's welcome + Q1
  return routeMessage(sessionId, 'I am ready for the interview. Please begin.');
}

export default { routeMessage, getFirstQuestion };
