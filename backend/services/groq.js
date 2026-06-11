import Groq from 'groq-sdk';

// ─── GROQ SDK WRAPPER ────────────────────────────────────
//
// Groq is Fallback 2 in the provider chain: Claude → OpenAI → Groq.
//
// Groq's API is OpenAI-compatible, so:
//   - Message format: { role: 'user'|'assistant'|'system', content: string }
//   - Same as OpenAI — no special conversion needed in messageFormatter.js
//   - System prompt goes as the first message with role: 'system'
//
// Groq does NOT have explicit prompt caching like Claude or Gemini.
// Its advantage is inference speed (tokens/sec), not caching.
// We still track token usage for cost monitoring.
//
// Model: llama-3.3-70b-versatile (best quality/speed balance on Groq)
// ──────────────────────────────────────────────────────────

let clients = {};

/**
 * Lazily initialize the Groq client.
 * We don't create it at import time because env vars
 * might not be loaded yet (dotenv runs in server.js).
 */
function getClient(envVar = 'GROQ_API_KEY') {
  if (!clients[envVar]) {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} is not set in environment variables`);
    }
    clients[envVar] = new Groq({
      apiKey: process.env[envVar],
    });
  }
  return clients[envVar];
}

/**
 * Send a message to Groq with the system prompt.
 *
 * @param {string} systemPrompt - The full system prompt text
 * @param {Array<{role: string, content: string}>} messages - Conversation history in neutral format
 *   (already formatted for Groq: role is 'user' or 'assistant', content is a string)
 * @param {object} options - Optional overrides
 * @param {string} options.model - Model to use (default: llama-3.3-70b-versatile)
 * @param {number} options.maxTokens - Max tokens in response (default: 4096)
 * @param {number} options.temperature - Temperature (default: 0.7)
 *
 * @returns {object} { content, usage: { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens } }
 * @throws {Error} On API failure — caller (aiRouter.js) handles fallback
 */
export async function sendMessage(systemPrompt, messages, options = {}) {
  const {
    model = 'llama-3.3-70b-versatile',
    maxTokens = 1024,
    temperature = 0.7,
    providerName = 'groq',
  } = options;

  let envVar = 'GROQ_API_KEY';
  if (providerName.startsWith('groq') && providerName.length > 4) {
    const num = providerName.substring(4);
    envVar = `GROQ_API_KEY_${num}`;
  }

  const groq = getClient(envVar);

  // ── Build messages array with system prompt first ──
  // Groq uses OpenAI-compatible format — system prompt is
  // the first message with role: 'system'.
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await groq.chat.completions.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: fullMessages,
  });

  // ── Extract usage stats ──
  // Groq doesn't have prompt caching, so cacheReadTokens
  // and cacheWriteTokens are always 0.
  const usage = {
    inputTokens: response.usage?.prompt_tokens || 0,
    outputTokens: response.usage?.completion_tokens || 0,
    cacheReadTokens: 0,  // Groq has no caching mechanism
    cacheWriteTokens: 0,
  };

  // ── Log token usage during development ──
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n🔵 Groq API Call:`);
    console.log(`   Model: ${model}`);
    console.log(`   Input tokens: ${usage.inputTokens}`);
    console.log(`   Output tokens: ${usage.outputTokens}`);
    console.log(`   Cache: N/A (Groq doesn't support prompt caching)`);
    console.log(`   Speed: Groq optimizes for inference speed, not caching`);
  }

  // ── Extract text content from response ──
  const content = response.choices?.[0]?.message?.content || '';

  return {
    content,
    usage,
    provider: providerName,
    model,
  };
}

export default { sendMessage };
