import Anthropic from '@anthropic-ai/sdk';

// ─── CLAUDE SDK WRAPPER ───────────────────────────────────
//
// Uses Claude's EXPLICIT prompt caching via cache_control.
// The system prompt is marked with { type: 'ephemeral' } which
// tells Claude to cache it for 5 minutes across calls.
//
// Cache mechanics:
//   - First call: full price (cache miss → cache write)
//   - Subsequent calls within 5 min: ~90% cheaper (cache hit)
//   - Read cache stats from response.usage.cache_read_input_tokens
//
// Model: claude-sonnet-4-20250514 (or latest Sonnet)
// ──────────────────────────────────────────────────────────

let client = null;

/**
 * Lazily initialize the Anthropic client.
 * We don't create it at import time because env vars
 * might not be loaded yet (dotenv runs in server.js).
 */
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

/**
 * Send a message to Claude with prompt caching enabled.
 *
 * @param {string} systemPrompt - The full system prompt text
 * @param {Array<{role: string, content: string}>} messages - Conversation history in neutral format
 *   (already formatted for Claude: role is 'user' or 'assistant', content is a string)
 * @param {object} options - Optional overrides
 * @param {string} options.model - Model to use (default: claude-sonnet-4-20250514)
 * @param {number} options.maxTokens - Max tokens in response (default: 4096)
 * @param {number} options.temperature - Temperature (default: 0.7)
 *
 * @returns {object} { content, usage: { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens } }
 * @throws {Error} On API failure — caller (aiRouter.js) handles fallback
 */
export async function sendMessage(systemPrompt, messages, options = {}) {
  const anthropic = getClient();

  const {
    model = 'claude-sonnet-4-20250514',
    maxTokens = 4096,
    temperature = 0.7,
  } = options;

  // ── Build the request with explicit cache_control ──
  // The system prompt gets cache_control: { type: 'ephemeral' }
  // which enables Claude's prompt caching (5-min TTL).
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  });

  // ── Extract usage stats ──
  const usage = {
    inputTokens: response.usage?.input_tokens || 0,
    outputTokens: response.usage?.output_tokens || 0,
    cacheReadTokens: response.usage?.cache_read_input_tokens || 0,
    cacheWriteTokens: response.usage?.cache_creation_input_tokens || 0,
  };

  // ── Log token usage during development ──
  if (process.env.NODE_ENV !== 'production') {
    const cacheHit = usage.cacheReadTokens > 0;
    const savings = cacheHit
      ? Math.round((usage.cacheReadTokens / (usage.inputTokens + usage.cacheReadTokens)) * 100)
      : 0;

    console.log(`\n🟣 Claude API Call:`);
    console.log(`   Model: ${model}`);
    console.log(`   Input tokens: ${usage.inputTokens}`);
    console.log(`   Output tokens: ${usage.outputTokens}`);
    console.log(`   Cache read: ${usage.cacheReadTokens} tokens`);
    console.log(`   Cache write: ${usage.cacheWriteTokens} tokens`);
    console.log(`   Cache status: ${cacheHit ? `HIT ✅ (~${savings}% savings)` : 'MISS (will be cached for next call)'}`);
  }

  // ── Extract text content from response ──
  const content = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');

  return {
    content,
    usage,
    provider: 'claude',
    model,
  };
}

export default { sendMessage };
