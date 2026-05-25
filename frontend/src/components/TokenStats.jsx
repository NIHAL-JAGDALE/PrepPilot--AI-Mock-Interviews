// ─── TOKEN STATS BAR ───────────────────────────────────────
// Displays live token savings % from prompt caching.
// cache_status shape: { cached, savings_percent, total_input, total_cached }

export default function TokenStats({ cacheStatus, tokenStats }) {
  if (!cacheStatus && !tokenStats) return null;

  const savingsPct = cacheStatus?.savings_percent ?? 0;
  const totalInput = cacheStatus?.total_input ?? tokenStats?.input_tokens ?? 0;
  const totalCached = cacheStatus?.total_cached ?? tokenStats?.cache_read_tokens ?? 0;
  const outputTokens = tokenStats?.output_tokens ?? 0;

  return (
    <div className="flex items-center gap-4 text-xs text-surface-400">
      {savingsPct > 0 && (
        <span
          className="flex items-center gap-1 font-semibold"
          style={{ color: '#34d399' }}
          title="Prompt cache savings this turn"
        >
          💾 {savingsPct.toFixed(0)}% cached
        </span>
      )}
      {totalInput > 0 && (
        <span title="Total input tokens this turn">
          ↑ {totalInput.toLocaleString()} in
        </span>
      )}
      {outputTokens > 0 && (
        <span title="Output tokens this turn">
          ↓ {outputTokens.toLocaleString()} out
        </span>
      )}
      {totalCached > 0 && (
        <span className="text-surface-500" title="Tokens served from cache">
          ({totalCached.toLocaleString()} from cache)
        </span>
      )}
    </div>
  );
}
