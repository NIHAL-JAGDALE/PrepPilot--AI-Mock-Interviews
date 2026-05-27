<<<<<<< HEAD
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
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 800, color: '#1A2B4A' }}>Score: {pct / 10}/10</div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
            {pct >= 80 ? 'Strong Answer ✓' : pct >= 60 ? 'Good — room to grow' : 'Needs improvement'}
          </div>
        </div>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '10px 0' }} />
      {feedback && (
        <>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, marginBottom: 3, color: '#16A34A' }}>Feedback</div>
          <div style={{ fontSize: 12, color: '#6B7A99', lineHeight: 1.6, marginBottom: 8 }}>{feedback}</div>
        </>
      )}
      {weakAreas && (
        <>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, marginBottom: 3, color: '#D97706' }}>Weak Areas</div>
          <div style={{ fontSize: 12, color: '#6B7A99', lineHeight: 1.6 }}>{weakAreas}</div>
        </>
      )}
      {modelAnswer && (
        <details style={{ marginTop: 8, cursor: 'pointer' }}>
          <summary style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', userSelect: 'none' }}>Show Model Answer ▾</summary>
          <div style={{ fontSize: 12, color: '#6B7A99', lineHeight: 1.6, marginTop: 6, paddingLeft: 8, borderLeft: '2px solid rgba(59,130,246,0.3)' }}>
            {modelAnswer}
          </div>
=======
// ─── EVAL CARD ─────────────────────────────────────────────
// Displays per-question AI evaluation inline in the chat.
// Shown after each non-DSA answer — score + feedback + model answer.

export default function EvalCard({ score, feedback, modelAnswer, weakAreas }) {
  const pct = Math.min(100, Math.max(0, score ?? 0));

  // Score color thresholds
  const scoreColor =
    pct >= 80 ? '#34d399' :   // green
    pct >= 60 ? '#818cf8' :   // indigo
    pct >= 40 ? '#fbbf24' :   // amber
                '#f87171';    // red

  return (
    <div
      className="glass-sm rounded-xl p-4 my-3 border"
      style={{ borderColor: `${scoreColor}30` }}
    >
      {/* Score row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-surface-300 uppercase tracking-wide">
          AI Evaluation
        </span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: scoreColor }}
            />
          </div>
          <span className="text-sm font-bold" style={{ color: scoreColor }}>
            {pct}/10
          </span>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <p className="text-sm text-surface-200 leading-relaxed mb-3">
          {feedback}
        </p>
      )}

      {/* Weak areas */}
      {weakAreas && (
        <div className="mb-3">
          <span className="text-xs font-semibold text-warning-400 uppercase tracking-wide">
            Weak Areas:
          </span>
          <p className="text-xs text-surface-300 mt-0.5">{weakAreas}</p>
        </div>
      )}

      {/* Model answer */}
      {modelAnswer && (
        <details className="cursor-pointer">
          <summary className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors select-none">
            Show Model Answer ▾
          </summary>
          <p className="text-xs text-surface-300 leading-relaxed mt-2 pl-2 border-l border-primary-500/30">
            {modelAnswer}
          </p>
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        </details>
      )}
    </div>
  );
}
