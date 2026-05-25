import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { reportAPI } from '../api/client';

// ─── HIRING BADGE CONFIG ─────────────────────────────────
const HIRING_CONFIG = {
  'STRONG HIRE': { label: 'Strong Hire 🏆', bg: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', emoji: '🏆' },
  'HIRE':        { label: 'Hire ✅',         bg: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: 'white', emoji: '✅' },
  'BORDERLINE':  { label: 'Borderline ⚖️',  bg: 'linear-gradient(135deg, #d97706, #fbbf24)', color: '#1e293b', emoji: '⚖️' },
  'NO HIRE':     { label: 'No Hire ❌',      bg: 'linear-gradient(135deg, #dc2626, #f87171)', color: 'white', emoji: '❌' },
};

// ─── CIRCULAR PROGRESS ───────────────────────────────────
function CircularProgress({ score, size = 180 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, score ?? 0));
  const offset = circumference - (pct / 100) * circumference;

  const color =
    pct >= 80 ? '#34d399' :
    pct >= 60 ? '#818cf8' :
    pct >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      {/* Score label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-surface-100">{pct}</span>
        <span className="text-xs text-surface-400 font-medium mt-0.5">/100</span>
      </div>
    </div>
  );
}

// ─── ROUND BAR CHART ─────────────────────────────────────
function RoundBarChart({ breakdown }) {
  const data = [
    { name: 'Intro', score: breakdown?.introduction ?? 0 },
    { name: 'DSA',   score: breakdown?.dsa ?? 0 },
    { name: 'CS',    score: breakdown?.cs_fundamentals ?? 0 },
    { name: 'Project', score: breakdown?.project_deep_dive ?? 0 },
    { name: 'HR',    score: breakdown?.hr_behavioral ?? 0 },
  ];

  const BAR_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#60a5fa', '#f472b6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-sm px-3 py-2 border border-primary-500/20 text-xs">
          <p className="text-surface-100 font-semibold">{label}</p>
          <p style={{ color: payload[0].fill }}>{payload[0].value}/10</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={36}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── STRENGTH / IMPROVEMENT CARDS ────────────────────────
function TextCard({ title, content, color }) {
  if (!content) return null;
  const lines = content
    .split('\n')
    .map(l => l.replace(/^[-•*\d.]+\s*/, '').trim())
    .filter(Boolean);

  return (
    <div
      className="glass rounded-xl p-5 border"
      style={{ borderColor: `${color}25` }}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color }}>
        {title}
      </h3>
      <ul className="space-y-2">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-surface-200">
            <span style={{ color }} className="mt-0.5 flex-shrink-0">▸</span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── STUDY PLAN ──────────────────────────────────────────
function StudyPlan({ plan }) {
  if (!plan) return null;
  const weeks = plan.split(/week\s*\d+/i).filter(Boolean);
  const hasWeeks = weeks.length > 1;

  return (
    <div className="glass rounded-xl p-6 border border-surface-800">
      <h3 className="text-lg font-semibold text-surface-100 mb-4">📅 30-Day Study Plan</h3>
      {hasWeeks ? (
        <div className="grid md:grid-cols-2 gap-4">
          {weeks.map((week, i) => (
            <div key={i} className="bg-surface-900/60 rounded-lg p-4">
              <div className="text-xs font-bold text-primary-400 uppercase tracking-wide mb-2">
                Week {i + 1}
              </div>
              <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-wrap">
                {week.trim()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-wrap">{plan}</p>
      )}
    </div>
  );
}

// ─── DSA CODE ATTEMPTS ───────────────────────────────────
function DsaAttempts({ attempts }) {
  if (!attempts?.length) return null;

  return (
    <div className="glass rounded-xl p-6 border border-surface-800">
      <h3 className="text-lg font-semibold text-surface-100 mb-4">💻 DSA Code Attempts</h3>
      <div className="space-y-4">
        {attempts.map((attempt, i) => {
          const passed = attempt.passed;
          const statusColor = passed ? '#34d399' : '#f87171';
          const diffColor =
            attempt.difficulty === 'Easy' ? '#34d399' :
            attempt.difficulty === 'Hard' ? '#f87171' : '#fbbf24';

          return (
            <div key={i} className="bg-surface-900/60 rounded-lg p-4 border border-surface-800">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="font-semibold text-surface-100">{attempt.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: diffColor, background: `${diffColor}20` }}>
                  {attempt.difficulty}
                </span>
                <span className="text-xs font-bold" style={{ color: statusColor }}>
                  {passed ? '✅ Accepted' : '❌ ' + (attempt.judge0_result || 'Not Accepted')}
                </span>
                {attempt.runtime_ms && (
                  <span className="text-xs text-surface-500">{attempt.runtime_ms}ms</span>
                )}
                {attempt.language && (
                  <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
                    {attempt.language}
                  </span>
                )}
              </div>
              {attempt.user_code && (
                <details>
                  <summary className="text-xs text-primary-400 hover:text-primary-300 cursor-pointer select-none">
                    View Code ▾
                  </summary>
                  <pre className="mt-2 text-xs text-surface-300 bg-surface-950 rounded p-3 overflow-x-auto font-mono leading-relaxed whitespace-pre">
                    {attempt.user_code}
                  </pre>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN REPORT PAGE
// ═══════════════════════════════════════════════════════════
export default function Report() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const fetchReport = async () => {
    try {
      const { data: resp } = await reportAPI.get(sessionId);
      setData(resp);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Report not found. The interview may not be completed yet.');
      } else {
        setError(err.response?.data?.error || 'Failed to load report.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-300 text-sm">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 text-center max-w-sm w-full">
          <p className="text-danger-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard" className="btn-secondary py-2 px-4">← Dashboard</Link>
            <button onClick={fetchReport} className="btn-primary py-2 px-4">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const { session, report, dsa_attempts, cache_stats } = data;
  const hiringKey = report.hiring_recommendation?.toUpperCase();
  const hiringCfg = HIRING_CONFIG[hiringKey] || HIRING_CONFIG['BORDERLINE'];

  const savingsPct = cache_stats
    ? ((cache_stats.total_cached / Math.max(cache_stats.total_input, 1)) * 100).toFixed(0)
    : 0;

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* ─── Navbar ─── */}
      <nav className="glass-sm border-b border-surface-800 px-6 py-4 sticky top-0 z-50 mb-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold gradient-text">✈️ PrepPilot</Link>
          <Link to="/dashboard" className="btn-secondary text-sm py-2 px-4">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 space-y-8">

        {/* ─── Header ─── */}
        <div className="text-center mb-2">
          <p className="text-sm text-surface-400 mb-1">
            {new Date(session.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-bold text-surface-100 mb-1">
            <span className="capitalize">{session.company_type}</span>
            <span className="text-surface-500 mx-2">/</span>
            <span className="capitalize">{session.role_type?.replace('_', ' ')}</span>
          </h1>
          <p className="text-surface-400 text-sm">{session.turn_count} questions answered</p>
        </div>

        {/* ─── Top Row: Score + Hiring Badge ─── */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Circular Score */}
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center border border-surface-800">
            <CircularProgress score={report.overall_score} size={180} />
            <p className="text-surface-400 text-sm mt-3 font-medium">Overall Score</p>
            {report.percentile && (
              <p className="text-primary-400 text-xs mt-1">Top {100 - report.percentile}% of candidates</p>
            )}
          </div>

          {/* Hiring Recommendation */}
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center border border-surface-800">
            <div
              className="text-2xl font-black px-6 py-3 rounded-2xl mb-4 text-center"
              style={{ background: hiringCfg.bg, color: hiringCfg.color }}
            >
              {hiringCfg.label}
            </div>
            <p className="text-surface-400 text-sm">Hiring Recommendation</p>
            {report.percentile && (
              <p className="text-surface-300 text-sm mt-2 font-medium">{report.percentile}th percentile</p>
            )}
          </div>

          {/* Cache Stats */}
          <div className="glass rounded-2xl p-6 flex flex-col justify-center border border-surface-800 space-y-4">
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wide">Session Stats</h3>
            <div>
              <p className="text-3xl font-black text-accent-400">{savingsPct}%</p>
              <p className="text-xs text-surface-400">Token cache savings</p>
            </div>
            {cache_stats && (
              <>
                <div>
                  <p className="text-lg font-bold text-surface-100">{(cache_stats.total_input || 0).toLocaleString()}</p>
                  <p className="text-xs text-surface-400">Total tokens used</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-surface-100 capitalize">{cache_stats.primary_provider || '—'}</p>
                  <p className="text-xs text-surface-400">Primary AI provider</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Round Breakdown Bar Chart ─── */}
        <div className="glass rounded-2xl p-6 border border-surface-800">
          <h2 className="text-lg font-semibold text-surface-100 mb-6">Round-by-Round Breakdown</h2>
          <RoundBarChart breakdown={report.round_breakdown} />
          {/* Score labels */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {[
              { label: 'Introduction', score: report.round_breakdown?.introduction },
              { label: 'DSA',          score: report.round_breakdown?.dsa },
              { label: 'CS Fundamentals', score: report.round_breakdown?.cs_fundamentals },
              { label: 'Project',      score: report.round_breakdown?.project_deep_dive },
              { label: 'HR & Behavioral', score: report.round_breakdown?.hr_behavioral },
            ].map(({ label, score }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-bold text-surface-100">{score ?? '—'}<span className="text-xs text-surface-500">/10</span></p>
                <p className="text-xs text-surface-400 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Strengths & Improvements ─── */}
        <div className="grid md:grid-cols-2 gap-6">
          <TextCard title="✨ Top Strengths" content={report.strengths} color="#34d399" />
          <TextCard title="🎯 Areas to Improve" content={report.improvements} color="#fbbf24" />
        </div>

        {/* ─── Study Plan ─── */}
        <StudyPlan plan={report.study_plan} />

        {/* ─── DSA Code Attempts ─── */}
        <DsaAttempts attempts={dsa_attempts} />

        {/* ─── CTA ─── */}
        <div className="glass rounded-2xl p-8 text-center border border-surface-800 glow">
          <h2 className="text-xl font-bold text-surface-100 mb-2">Ready for another round?</h2>
          <p className="text-surface-300 text-sm mb-6">
            Each interview makes you sharper. Keep going until you land that offer.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/interview/new" className="btn-primary py-3 px-6 shadow-lg shadow-primary-500/20 animate-pulse-glow">
              Start New Interview 🚀
            </Link>
            <Link to="/dashboard" className="btn-secondary py-3 px-6">
              View All Sessions
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
