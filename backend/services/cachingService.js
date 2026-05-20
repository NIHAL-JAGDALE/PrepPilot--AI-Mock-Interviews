// ─── CACHING SERVICE ──────────────────────────────────────
//
// Provides a unified interface to read cache metrics from
// any AI provider's response. Each provider reports cache
// stats differently — this normalizes them into one shape.
//
// Provider cache mechanisms:
//   Claude  → explicit cache_control, reads cache_read_input_tokens
//   OpenAI  → automatic (>1024 token prompts), reads prompt_tokens_details.cached_tokens
//   Groq    → no caching (inference speed is the advantage instead)
//
// The frontend displays live token-savings % using this data.
// ──────────────────────────────────────────────────────────

/**
 * Extract normalized cache status from a provider response.
 *
 * @param {object} usage - The usage object from any provider wrapper
 *   { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens }
 * @param {string} provider - 'claude' | 'openai' | 'groq'
 * @returns {object} Normalized cache status
 */
export function getCacheStatus(usage, provider) {
  const inputTokens = usage?.inputTokens || 0;
  const outputTokens = usage?.outputTokens || 0;
  const cacheReadTokens = usage?.cacheReadTokens || 0;
  const cacheWriteTokens = usage?.cacheWriteTokens || 0;

  // Total tokens that could have been charged at full price
  const totalInputTokens = inputTokens + cacheReadTokens;

  // Savings percentage: what fraction of input tokens were cached
  const savingsPercent = totalInputTokens > 0
    ? Math.round((cacheReadTokens / totalInputTokens) * 100)
    : 0;

  // Whether caching is active for this provider
  const cachingSupported = provider !== 'groq';
  const cacheHit = cacheReadTokens > 0;

  return {
    provider,
    cachingSupported,
    cacheHit,
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheWriteTokens,
    totalInputTokens,
    savingsPercent,
    status: getCacheStatusLabel(provider, cacheHit, cacheWriteTokens),
  };
}

/**
 * Get a human-readable cache status label.
 */
function getCacheStatusLabel(provider, cacheHit, cacheWriteTokens) {
  if (provider === 'groq') {
    return 'N/A (Groq uses speed optimization instead of caching)';
  }

  if (cacheHit) {
    return 'Cache HIT — tokens served from cache';
  }

  if (cacheWriteTokens > 0) {
    return 'Cache WRITE — prompt cached for future calls';
  }

  return 'Cache MISS — first call, prompt will be cached';
}

/**
 * Compute cumulative cache savings across an entire session.
 * Used for the dashboard and session summary stats.
 *
 * @param {Array<object>} messageStats - Array of { tokens_used, cached_tokens, provider } from messages table
 * @returns {object} Cumulative cache statistics
 */
export function getSessionCacheStats(messageStats) {
  let totalTokensUsed = 0;
  let totalCachedTokens = 0;
  let totalCalls = messageStats.length;
  let cacheHits = 0;

  for (const msg of messageStats) {
    totalTokensUsed += msg.tokens_used || 0;
    totalCachedTokens += msg.cached_tokens || 0;
    if (msg.cached_tokens > 0) cacheHits++;
  }

  const cacheHitRate = totalCalls > 0
    ? Math.round((cacheHits / totalCalls) * 100)
    : 0;

  const overallSavings = (totalTokensUsed + totalCachedTokens) > 0
    ? Math.round((totalCachedTokens / (totalTokensUsed + totalCachedTokens)) * 100)
    : 0;

  return {
    totalCalls,
    totalTokensUsed,
    totalCachedTokens,
    cacheHits,
    cacheHitRate,
    overallSavings,
  };
}

export default { getCacheStatus, getSessionCacheStats };
