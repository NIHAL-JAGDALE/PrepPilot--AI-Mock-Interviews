// ─── MESSAGE FORMATTER ────────────────────────────────────
//
// All messages are stored in Postgres in NEUTRAL format:
//   { role: 'user' | 'assistant' | 'summary', content: string }
//
// This module converts them to each provider's expected format.
//
// With Groq replacing Gemini, all 3 providers now use:
//   { role: 'user' | 'assistant', content: string }
//
// But this module is still critical because:
//   1. 'summary' role doesn't exist in any provider — must be converted
//   2. Messages need validation (empty content, consecutive same-role, etc.)
//   3. Provider-specific quirks may arise in the future
//   4. It keeps provider logic OUT of the main message route
//
// ⚠️ PITFALL (from instructions):
//   Storing messages in provider-specific format breaks fallback.
//   ALWAYS store neutral, convert on the fly here.
// ──────────────────────────────────────────────────────────

/**
 * Format messages from neutral DB format to a specific provider's format.
 *
 * @param {Array<{role: string, content: string}>} messages - Messages from DB (neutral format)
 * @param {string} provider - 'claude' | 'openai' | 'groq'
 * @returns {Array} Messages formatted for the target provider
 */
export function formatForProvider(messages, provider) {
  // Step 1: Convert summary messages and validate
  const cleaned = convertSummaryMessages(messages);

  // Step 2: Filter out empty/invalid messages
  const filtered = cleaned.filter(msg =>
    msg.content && msg.content.trim().length > 0
  );

  // Step 3: Ensure alternating user/assistant pattern
  // (some providers reject consecutive same-role messages)
  const alternated = enforceAlternation(filtered);

  // Step 4: Apply provider-specific formatting
  switch (provider) {
    case 'claude':
      return formatForClaude(alternated);
    case 'openai':
      return formatForOpenAI(alternated);
    case 'groq':
      return formatForGroq(alternated);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Convert 'summary' role messages to 'user' role with a context prefix.
 * Providers don't understand 'summary' — it's our internal concept.
 */
function convertSummaryMessages(messages) {
  return messages.map(msg => {
    if (msg.role === 'summary') {
      return {
        role: 'user',
        content: `[INTERVIEW CONTEXT SUMMARY]\n${msg.content}\n[END SUMMARY — Continue the interview from where we left off.]`,
      };
    }
    return { role: msg.role, content: msg.content };
  });
}

/**
 * Ensure messages alternate between user and assistant.
 * Some providers (especially Claude) reject consecutive same-role messages.
 * If we find consecutive user messages, merge them.
 * If we find consecutive assistant messages, merge them.
 */
function enforceAlternation(messages) {
  if (messages.length === 0) return [];

  const result = [messages[0]];

  for (let i = 1; i < messages.length; i++) {
    const prev = result[result.length - 1];
    const curr = messages[i];

    if (curr.role === prev.role) {
      // Merge consecutive same-role messages
      prev.content = `${prev.content}\n\n${curr.content}`;
    } else {
      result.push({ role: curr.role, content: curr.content });
    }
  }

  // Claude requires the first message to be 'user' role
  // If it starts with 'assistant', prepend a minimal user message
  if (result.length > 0 && result[0].role === 'assistant') {
    result.unshift({
      role: 'user',
      content: 'Please begin the interview.',
    });
  }

  return result;
}

/**
 * Format for Claude API.
 * Claude uses: { role: 'user' | 'assistant', content: string }
 * System prompt is handled separately in claude.js (not in messages array).
 */
function formatForClaude(messages) {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Format for OpenAI API.
 * OpenAI uses: { role: 'user' | 'assistant', content: string }
 * System prompt is prepended in openai.js (not here).
 */
function formatForOpenAI(messages) {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Format for Groq API.
 * Groq uses OpenAI-compatible format: { role: 'user' | 'assistant', content: string }
 * System prompt is prepended in groq.js (not here).
 */
function formatForGroq(messages) {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Convert a provider's response back to neutral format for DB storage.
 * All providers return content as a string, so this is straightforward.
 *
 * @param {string} content - Response text from any provider
 * @param {string} provider - Which provider generated it
 * @returns {object} { role: 'assistant', content }
 */
export function toNeutralFormat(content, provider) {
  return {
    role: 'assistant',
    content: typeof content === 'string' ? content : String(content),
  };
}

export default { formatForProvider, toNeutralFormat };
