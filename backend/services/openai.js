import OpenAI from 'openai';

// ─── OPENAI SDK WRAPPER ──────────────────────────────────
//
// Uses OpenAI's AUTOMATIC prompt caching for GPT-4o.
// No special cache_control flags needed — OpenAI auto-caches
// any system prompt exceeding 1024 tokens.
//
// Cache mechanics:
//   - System prompt must be IDENTICAL across calls (even whitespace matters)
//   - System prompt must exceed 1024 tokens (ours is ~2500+)
//   - Caching happens silently — no opt-in required
//   - Read cache stats from response.usage.prompt_tokens_details.cached_tokens
//
// ⚠️ PITFALL (from instructions):
//   If the system prompt drops below 1024 tokens, auto-caching
//   dies SILENTLY — no error, just full-price tokens every call.
//
// Model: gpt-4o
// ──────────────────────────────────────────────────────────

let client = null;

/**
 * Lazily initialize the OpenAI client.
 * We don't create it at import time because env vars
 * might not be loaded yet (dotenv runs in server.js).
 */
function getClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

/**
 * Send a message to OpenAI GPT-4o with auto-caching.
 *
 * @param {string} systemPrompt - The full system prompt text (must be >1024 tokens)
 * @param {Array<{role: string, content: string}>} messages - Conversation history in neutral format
 *   (already formatted for OpenAI: role is 'user' or 'assistant', content is a string)
 * @param {object} options - Optional overrides
 * @param {string} options.model - Model to use (default: gpt-4o)
 * @param {number} options.maxTokens - Max tokens in response (default: 4096)
 * @param {number} options.temperature - Temperature (default: 0.7)
 *
 * @returns {object} { content, usage: { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens } }
 * @throws {Error} On API failure — caller (aiRouter.js) handles fallback
 */
export async function sendMessage(systemPrompt, messages, options = {}) {
  const openai = getClient();

  const {
    model = 'gpt-4o',
    maxTokens = 4096,
    temperature = 0.7,
  } = options;

  // ── Build messages array with system prompt first ──
  // The system prompt MUST be the first message and remain
  // identical across calls for auto-caching to work.
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: fullMessages,
  });

  // ── Extract usage stats ──
  // OpenAI puts cached token info in prompt_tokens_details
  const promptDetails = response.usage?.prompt_tokens_details || {};
  const cachedTokens = promptDetails.cached_tokens || 0;

  const usage = {
    inputTokens: response.usage?.prompt_tokens || 0,
    outputTokens: response.usage?.completion_tokens || 0,
    cacheReadTokens: cachedTokens,
    cacheWriteTokens: 0, // OpenAI doesn't report write tokens separately
  };

  // ── Log token usage during development ──
  if (process.env.NODE_ENV !== 'production') {
    const cacheHit = usage.cacheReadTokens > 0;
    const savings = cacheHit
      ? Math.round((usage.cacheReadTokens / usage.inputTokens) * 100)
      : 0;

    console.log(`\n🟢 OpenAI API Call:`);
    console.log(`   Model: ${model}`);
    console.log(`   Input tokens: ${usage.inputTokens}`);
    console.log(`   Output tokens: ${usage.outputTokens}`);
    console.log(`   Cached tokens: ${usage.cacheReadTokens}`);
    console.log(`   Cache status: ${cacheHit ? `HIT ✅ (~${savings}% savings)` : 'MISS (auto-cache will kick in on next call)'}`);
  }

  // ── Extract text content from response ──
  const content = response.choices?.[0]?.message?.content || '';

  return {
    content,
    usage,
    provider: 'openai',
    model,
  };
}

export default { sendMessage };
