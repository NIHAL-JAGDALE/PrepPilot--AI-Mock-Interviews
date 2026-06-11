export default function EvalCard({ score, feedback, weakAreas, modelAnswer }) {
  const pct = Math.min(100, Math.max(0, score ?? 0));
  
  const scoreColor =
    pct >= 80 ? '#16A34A' :   // green
    pct >= 60 ? '#D97706' :   // orange
    pct >= 40 ? '#F59E0B' :   // amber
                '#EF4444';    // red

  const deg = (pct / 100) * 360;

  return (
    <div style={{ marginTop: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `conic-gradient(${scoreColor} ${deg}deg, #E2E8F0 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 13, color: scoreColor }}>
            {pct / 10}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 800, color: '#1A3A1D' }}>Score: {pct / 10}/10</div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
            {pct >= 80 ? 'Strong Answer ✓' : pct >= 60 ? 'Good — room to grow' : 'Needs improvement'}
          </div>
        </div>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '10px 0' }} />
      {feedback && (
        <>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, marginBottom: 3, color: '#16A34A' }}>Feedback</div>
          <div style={{ fontSize: 12, color: '#6B8A6E', lineHeight: 1.6, marginBottom: 8 }}>{feedback}</div>
        </>
      )}
      {weakAreas && (
        <>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, marginBottom: 3, color: '#D97706' }}>Weak Areas</div>
          <div style={{ fontSize: 12, color: '#6B8A6E', lineHeight: 1.6 }}>{weakAreas}</div>
        </>
      )}
      {modelAnswer && (
        <details style={{ marginTop: 8, cursor: 'pointer' }}>
          <summary style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', userSelect: 'none' }}>Show Model Answer ▾</summary>
          <div style={{ fontSize: 12, color: '#6B8A6E', lineHeight: 1.6, marginTop: 6, paddingLeft: 8, borderLeft: '2px solid rgba(59,130,246,0.3)' }}>
            {modelAnswer}
          </div>
        </details>
      )}
    </div>
  );
}
