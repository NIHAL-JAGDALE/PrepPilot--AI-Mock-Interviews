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
        </details>
      )}
    </div>
  );
}
