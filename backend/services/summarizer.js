import pool from '../db/index.js';
import * as claude from './claude.js';
import * as openai from './openai.js';
import * as groq from './groq.js';
import { formatForProvider } from './messageFormatter.js';

// ─── SUMMARIZER ───────────────────────────────────────────
//
// Triggered when turn_count > 5 to keep context windows small.
//
// How it works:
//   1. Fetch all non-superseded messages for the session
//   2. Separate: messages to summarize (all except last 3 turns)
//   3. Ask the current AI provider to compress them into ~100 tokens
//   4. Insert the summary as a new message with role: 'summary'
//   5. Mark the old messages as superseded
//
// After summarization, context sent to AI =
//   [summary] + [last 3 turns] + [new user message]
//
// This dramatically reduces token usage on long interviews
// while preserving important context (questions, scores, weak areas).
// ──────────────────────────────────────────────────────────

const SUMMARIZATION_PROMPT = `You are a concise summarizer. Summarize the following interview conversation in EXACTLY 100 tokens or fewer. 

Include:
- Candidate name, key skills, and projects from their resume
- Questions that were asked (by number)
- Scores given for each answer
- Key weak areas identified
- Current round/question number

Be extremely concise. Use shorthand. This summary will be used as context for continuing the interview.

Conversation to summarize:`;

/**
 * Summarize old messages if turn_count > 5.
 * Called by aiRouter.js before every AI call.
 *
 * @param {string} sessionId - The session UUID
 * @param {string} currentProvider - 'claude' | 'openai' | 'groq'
 * @param {string} systemPrompt - The system prompt (needed for the summarization call)
 * @returns {boolean} Whether summarization was performed
 */
export async function summarizeIfNeeded(sessionId, currentProvider, systemPrompt) {
  try {
    // ── Check turn count ──
    const sessionResult = await pool.query(
      'SELECT turn_count FROM sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionResult.rows.length === 0) return false;

    const { turn_count } = sessionResult.rows[0];

    // Only summarize after 5 turns
    if (turn_count <= 5) return false;

    // ── Check if we already have a recent summary ──
    // Don't re-summarize if we just did it
    const existingSummary = await pool.query(
      `SELECT id FROM messages 
       WHERE session_id = $1 AND role = 'summary' AND superseded = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [sessionId]
    );

    // Count non-superseded messages since last summary
    const unsummarizedCount = await pool.query(
      `SELECT COUNT(*) as count FROM messages
       WHERE session_id = $1 AND superseded = FALSE AND role != 'summary'`,
      [sessionId]
    );

    // Only summarize if there are more than 6 unsummarized messages
    // (3 turns = 6 messages: 3 user + 3 assistant)
    if (parseInt(unsummarizedCount.rows[0].count) <= 6) return false;

    console.log(`📝 Summarizing session ${sessionId} (turn ${turn_count})...`);

    // ── Fetch all non-superseded messages ──
    const messagesResult = await pool.query(
      `SELECT id, role, content, created_at FROM messages
       WHERE session_id = $1 AND superseded = FALSE
       ORDER BY created_at ASC`,
      [sessionId]
    );

    const allMessages = messagesResult.rows;

    // ── Separate: keep last 3 turns (6 messages), summarize the rest ──
    // A "turn" = 1 user message + 1 assistant response
    const keepCount = 6; // last 3 turns
    const toSummarize = allMessages.slice(0, -keepCount);

    if (toSummarize.length === 0) return false;

    // ── Build the text to summarize ──
    const conversationText = toSummarize
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    // ── Ask the current provider to summarize ──
    const summaryMessages = [
      {
        role: 'user',
        content: `${SUMMARIZATION_PROMPT}\n\n${conversationText}`,
      },
    ];

    const formattedMessages = formatForProvider(summaryMessages, currentProvider);
    let summaryResponse;

    const providerMap = { claude, openai, groq };
    const provider = providerMap[currentProvider];

    if (!provider) {
      console.error(`Unknown provider for summarization: ${currentProvider}`);
      return false;
    }

    summaryResponse = await provider.sendMessage(
      systemPrompt,
      formattedMessages,
      { maxTokens: 150, temperature: 0.3 } // Low temp for factual summary
    );

    const summaryContent = summaryResponse.content;

    // ── Insert summary message ──
    await pool.query(
      `INSERT INTO messages (session_id, role, content, tokens_used, cached_tokens, provider)
       VALUES ($1, 'summary', $2, $3, $4, $5)`,
      [
        sessionId,
        summaryContent,
        summaryResponse.usage.inputTokens + summaryResponse.usage.outputTokens,
        summaryResponse.usage.cacheReadTokens,
        currentProvider,
      ]
    );

    // ── Mark old messages as superseded ──
    // Mark the summarized messages (not the ones we're keeping)
    const idsToSupersede = toSummarize.map(m => m.id);

    // Also mark any previous summary messages as superseded
    await pool.query(
      `UPDATE messages SET superseded = TRUE
       WHERE session_id = $1 AND (
         id = ANY($2::int[])
         OR (role = 'summary' AND id != currval('messages_id_seq'))
       )`,
      [sessionId, idsToSupersede]
    );

    console.log(`✅ Summarized ${toSummarize.length} messages into ~100 tokens`);
    console.log(`   Kept last ${keepCount} messages (3 turns) unsummarized`);

    return true;
  } catch (error) {
    // Summarization failure should NOT block the interview
    // Log it and continue — the AI will just use full history
    console.error('⚠️ Summarization failed (non-fatal):', error.message);
    return false;
  }
}

/**
 * Get the optimized context for an AI call.
 * Returns: [summary (if exists)] + [last 3 turns] + [new message]
 *
 * @param {string} sessionId - The session UUID
 * @returns {Array<{role: string, content: string}>} Optimized message history
 */
export async function getOptimizedContext(sessionId) {
  // Fetch the latest summary (if any)
  const summaryResult = await pool.query(
    `SELECT role, content FROM messages
     WHERE session_id = $1 AND role = 'summary' AND superseded = FALSE
     ORDER BY created_at DESC LIMIT 1`,
    [sessionId]
  );

  // Fetch last 3 turns (non-superseded, non-summary)
  const recentResult = await pool.query(
    `SELECT role, content FROM messages
     WHERE session_id = $1 AND superseded = FALSE AND role != 'summary'
     ORDER BY created_at DESC LIMIT 6`,
    [sessionId]
  );

  // Build context: summary first, then recent messages in chronological order
  const context = [];

  if (summaryResult.rows.length > 0) {
    context.push(summaryResult.rows[0]);
  }

  // Reverse to get chronological order (we fetched DESC)
  const recentMessages = recentResult.rows.reverse();
  context.push(...recentMessages);

  return context;
}

export default { summarizeIfNeeded, getOptimizedContext };
