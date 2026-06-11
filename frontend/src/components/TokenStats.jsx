export default function TokenStats({ cacheStatus, tokenStats }) {
  if (!cacheStatus && !tokenStats) return null;

  const savingsPct = cacheStatus?.savings_percent ?? 0;
  const totalInput = cacheStatus?.total_input ?? tokenStats?.input_tokens ?? 0;
  const outputTokens = tokenStats?.output_tokens ?? 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 50, padding: '4px 10px', fontSize: 11, color: '#6B8A6E' }}>
      {savingsPct > 0 ? (
        <>
          <strong style={{ color: '#16A34A' }}>↓{savingsPct.toFixed(0)}%</strong> saved
        </>
      ) : (
        <>
          <span style={{ color: '#16A34A' }}>↑{totalInput.toLocaleString()}</span> in
          {outputTokens > 0 && <span style={{ marginLeft: 4 }}>↓{outputTokens.toLocaleString()}</span>}
        </>
      )}
    </div>
  );
}
