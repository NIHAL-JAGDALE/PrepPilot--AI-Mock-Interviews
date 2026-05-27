<<<<<<< HEAD
=======
// ─── TOKEN STATS BAR ───────────────────────────────────────
// Displays live token savings % from prompt caching.
// cache_status shape: { cached, savings_percent, total_input, total_cached }

>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
export default function TokenStats({ cacheStatus, tokenStats }) {
  if (!cacheStatus && !tokenStats) return null;

  const savingsPct = cacheStatus?.savings_percent ?? 0;
  const totalInput = cacheStatus?.total_input ?? tokenStats?.input_tokens ?? 0;
<<<<<<< HEAD
  const outputTokens = tokenStats?.output_tokens ?? 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 50, padding: '4px 10px', fontSize: 11, color: '#6B7A99' }}>
      {savingsPct > 0 ? (
        <>
          <strong style={{ color: '#16A34A' }}>↓{savingsPct.toFixed(0)}%</strong> saved
        </>
      ) : (
        <>
          <span style={{ color: '#16A34A' }}>↑{totalInput.toLocaleString()}</span> in
          {outputTokens > 0 && <span style={{ marginLeft: 4 }}>↓{outputTokens.toLocaleString()}</span>}
        </>
=======
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
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
      )}
    </div>
  );
}
