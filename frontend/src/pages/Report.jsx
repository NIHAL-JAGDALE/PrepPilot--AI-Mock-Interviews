import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reportAPI } from '../api/client';

export default function Report() {
  const params = useParams();
  const id = params.sessionId || params.id;
=======
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
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
<<<<<<< HEAD
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const response = await reportAPI.get(id);
      setData(response.data);
    } catch (err) {
      setError('Failed to load report or report is not ready yet.');
=======
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
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
<<<<<<< HEAD
      <div style={{ minHeight: '100vh', background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(29,185,84,0.2)', borderTopColor: '#1DB954', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7A99', fontSize: 14 }}>Analyzing interview performance...</p>
=======
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-300 text-sm">Loading your report...</p>
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <p style={{ color: '#EF4444', marginBottom: 20, fontSize: 15 }}>{error}</p>
          <Link to="/dashboard" style={{ padding: '12px 24px', background: '#1DB954', color: '#fff', borderRadius: 50, textDecoration: 'none', fontWeight: 600 }}>← Dashboard</Link>
=======
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 text-center max-w-sm w-full">
          <p className="text-danger-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard" className="btn-secondary py-2 px-4">← Dashboard</Link>
            <button onClick={fetchReport} className="btn-primary py-2 px-4">Retry</button>
          </div>
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  const session = data.session || {};
  const report = data.report || {};
  const dsa_attempts = data.dsa_attempts || [];
  const cache_stats = data.cache_stats || {};

  const dateStr = session.created_at ? new Date(session.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date';
  
  const rawRole = session.role_type || 'role';
  const roleTypeFormatted = typeof rawRole === 'string' ? rawRole.replace('_', ' ') : 'role';
  const rawComp = session.company_type || 'company';
  
  const capitalize = (s) => (typeof s === 'string' && s.length > 0) ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const title = `${capitalize(rawComp)} · ${capitalize(roleTypeFormatted)}`;

  const scoreColor = (s) => {
    if (s >= 80) return "#16a34a";
    if (s >= 60) return "#2563eb";
    if (s >= 40) return "#ea580c";
    return "#dc2626";
  };
  const scoreBg = (s) => {
    if (s >= 80) return "#f0fdf4";
    if (s >= 60) return "#eff6ff";
    if (s >= 40) return "#fff7ed";
    return "#fef2f2";
  };

  const hiringStyles = {
    "STRONG HIRE": { bg: "#dcfce7", border: "#86efac", dot: "#15803d", text: "#15803d" },
    "HIRE":        { bg: "#dbeafe", border: "#93c5fd", dot: "#1d4ed8", text: "#1d4ed8" },
    "BORDERLINE":  { bg: "#fef9c3", border: "#fde047", dot: "#a16207", text: "#a16207" },
    "NO HIRE":     { bg: "#fee2e2", border: "#fca5a5", dot: "#b91c1c", text: "#b91c1c" },
  };

  const hRec = report.hiring_recommendation || "HIRE";
  const hs = hiringStyles[hRec] || hiringStyles["HIRE"];
  
  const oScore = report.overall_score || 0;
  const col = scoreColor(oScore);
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (oScore / 100) * circumference;

  const bDown = report.round_breakdown || {};
  
  let rounds = [];
  // Detect if this is a V2 (3-round) report where only intro, cs (technical), and hr are populated
  if (bDown.dsa === null && bDown.project_deep_dive === null && (bDown.introduction !== null || bDown.cs_fundamentals !== null || bDown.hr_behavioral !== null)) {
    rounds = [
      { label: "Intro + DSA (Round 1)", score: bDown.introduction || 0 },
      { label: "Technical (Round 2)", score: bDown.cs_fundamentals || 0 },
      { label: "HR & Behavioral (Round 3)", score: bDown.hr_behavioral || 0 },
    ];
  } else {
    // V1 (5-round) report format
    rounds = [
      { label: "Intro", score: bDown.introduction || 0 },
      { label: "DSA", score: bDown.dsa || 0 },
      { label: "CS", score: bDown.cs_fundamentals || 0 },
      { label: "Project", score: bDown.project_deep_dive || 0 },
      { label: "HR", score: bDown.hr_behavioral || 0 },
    ];
  }

  const diffStyle = (d) => {
    if (d === "Hard")   return { bg: "#fee2e2", text: "#dc2626" };
    if (d === "Medium") return { bg: "#fff7ed", text: "#ea580c" };
    return { bg: "#f0fdf4", text: "#16a34a" };
  };

  const providerIcon = (p) => {
    if (p === "Groq") return "⚡";
    if (p === "OpenAI") return "🤖";
    return "✦";
  };

  // ── Safely parse array fields ──
  // Backend stores as TEXT. Could be: JSON string, plain text, or already an array.
  const safeParseArray = (val) => {
    if (Array.isArray(val)) return val;
    if (!val || typeof val !== 'string') return [];
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) { /* not JSON */ }
    // Fallback: split plain text by newlines / numbered list items
    const lines = val.split(/\n/).map(l => l.replace(/^\s*(?:\d+[\.\)\-]|[-•*])\s*/, '').trim()).filter(l => l.length > 0);
    return lines;
  };

  const safeParseStudyPlan = (val) => {
    if (Array.isArray(val)) return val;
    if (!val || typeof val !== 'string') return [];
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) { /* not JSON */ }
    // Fallback: parse "Week N: task" pattern from plain text
    const weeks = [];
    const weekRegex = /Week\s*(\d+)\s*:\s*(.+?)(?=Week\s*\d+\s*:|$)/gis;
    let match;
    while ((match = weekRegex.exec(val)) !== null) {
      weeks.push({ week: `Week ${match[1]}`, task: match[2].trim().replace(/\n+/g, ' ') });
    }
    if (weeks.length > 0) return weeks;
    // Last resort: split by newlines
    const lines = val.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
    return lines.map((l, i) => ({ week: `Week ${i + 1}`, task: l.replace(/^\s*(?:\d+[\.\)\-]|[-•*])\s*/, '').trim() }));
  };

  const strengths = safeParseArray(report.strengths);
  const improvements = safeParseArray(report.improvements);
  const studyPlan = safeParseStudyPlan(report.study_plan);

  // Cache stats - backend returns: { totalCalls, totalTokensUsed, totalCachedTokens, cacheHits, cacheHitRate, overallSavings }
  const savingsPercent = cache_stats?.overallSavings ?? cache_stats?.savings_percent ?? 0;
  const totalTokens = cache_stats?.totalTokensUsed ?? cache_stats?.total_tokens ?? 0;
  const primaryProvider = cache_stats?.provider || session?.current_provider || "Claude";

  // Use studyPlan explicitly or fallback for colors
  const fallbackColors = [
    { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { color: "#9333ea", bg: "#faf5ff", border: "#e9d5ff" },
    { color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: 'radial-gradient(circle at top, rgba(37, 99, 235, 0.04), transparent 32%), #f8fafc', color: '#0f172a', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Dynamic CSS required for smooth animations and hover effects */}
      <style>{`
        .report-wrapper { width: min(1240px, calc(100vw - 24px)); margin: 0 auto; padding: 32px 24px; }
        .report-nav { background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 14px 32px; position: sticky; top: 0; z-index: 10; }
        .report-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; padding: clamp(18px, 2vw, 30px); margin-bottom: 16px; box-shadow: 0 1px 2px rgba(15,23,42,0.03); }
        .report-hero { display: grid; grid-template-columns: minmax(220px, 270px) 1px minmax(170px, 230px) 1px minmax(320px, 1fr); gap: clamp(18px, 2vw, 28px); align-items: center; }
        .hero-divider { width: 1px; height: 115px; background: #e2e8f0; justify-self: center; }
        
        .bar-fill { height: 100%; border-radius: 99px; width: 0%; transition: width 1s cubic-bezier(0.4,0,0.2,1) 0.3s; }
        .score-ring { transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s; stroke-dashoffset: 376.99; }
        
        @media (max-width: 1100px) {
          .report-hero { grid-template-columns: minmax(200px, 1fr); justify-items: stretch; }
          .hero-divider { display: none; }
          .score-wrap-mx { width: 100%; }
        }
        @media (max-width: 720px) {
          .report-wrapper { padding: 20px 14px; width: min(100vw - 12px, 1240px); }
          .report-nav { padding: 12px 16px; }
          .grid-two { grid-template-columns: 1fr !important; }
          .bar-row-grid { grid-template-columns: 54px 1fr 44px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="report-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20, color: '#16a34a' }}>✈</span>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px' }}>PrepPilot</span>
          <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 2 }}>✦✦✦</span>
        </div>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px' }}>
          ← Dashboard
        </Link>
      </nav>

      <div className="report-wrapper">
        
        {/* PAGE HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{dateStr}</p>
          <h1 style={{ fontSize: 'clamp(22px, 2.2vw, 30px)', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 5 }}>{title}</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>{session.turn_count} questions answered</p>
        </div>

        {/* HERO CARD */}
        <div className="report-card report-hero">
          
          {/* Circular Score */}
          <div className="score-wrap-mx" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 'clamp(140px, 15vw, 172px)', height: 'clamp(140px, 15vw, 172px)' }}>
              <svg width="100%" height="100%" viewBox="0 0 148 148" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="74" cy="74" r="60" fill="none" stroke="#f1f5f9" strokeWidth="10"/>
                <circle 
                  className="score-ring"
                  cx="74" cy="74" r="60" fill="none"
                  stroke={col} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="376.99"
                  style={{ strokeDashoffset: offset }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 700, lineHeight: 1, letterSpacing: '-1px', color: col }}>{report.overall_score}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>/100</span>
              </div>
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Overall Score</p>
            <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, textAlign: 'center' }}>Top {100 - report.percentile}% of candidates</p>
          </div>

          <div className="hero-divider" />

          {/* Hiring + Percentile */}
          <div className="score-wrap-mx" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Hiring Recommendation</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '8px 18px', borderWidth: 1.5, borderStyle: 'solid', background: hs.bg, borderColor: hs.border }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: hs.dot }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: hs.text }}>{report.hiring_recommendation}</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Percentile</p>
              <p style={{ fontSize: 'clamp(22px, 2.2vw, 28px)', fontWeight: 700 }}>{report.percentile}<span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>th</span></p>
            </div>
          </div>

          <div className="hero-divider" />

          {/* Session Stats */}
          <div className="score-wrap-mx" style={{ minWidth: 0 }}>
            <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Session Stats</p>
            <div className="grid-two" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              <div style={{ minWidth: 0, borderRadius: 12, padding: '11px 14px', background: '#f0fdf4' }}>
                <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: 700, color: '#16a34a' }}>{savingsPercent}%</p>
                <p style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Token savings</p>
              </div>
              <div style={{ minWidth: 0, borderRadius: 12, padding: '11px 14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: 700, color: '#0f172a' }}>{totalTokens.toLocaleString()}</p>
                <p style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Total tokens</p>
              </div>
              <div style={{ minWidth: 0, borderRadius: 12, padding: '11px 14px', background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#ea580c' }}>{providerIcon(primaryProvider)} {primaryProvider}</p>
                <p style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>AI provider</p>
              </div>
            </div>
          </div>
        </div>

        {/* ROUND BREAKDOWN */}
        <div className="report-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, background: '#eff6ff' }}>📊</div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>Round Breakdown</h2>
          </div>
          <div>
            {rounds.map((round, i) => {
              const safeScore = isNaN(round.score) || round.score === null ? 0 : round.score;
              const pct = safeScore * 10;
              const cColor = scoreColor(pct);
              const cBg = scoreBg(pct);
              // setTimeout animation trigger trick in React: apply inline styles dynamically
              // Since React sets inline styling directly, we map pct straight to width width Transition enabled 
              return (
                <div key={i} className="bar-row-grid" style={{ display: 'grid', gridTemplateColumns: '72px 1fr 44px', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500, textAlign: 'right' }}>{round.label}</span>
                  <div style={{ width: '100%', height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: cColor, transition: 'width 1s cubic-bezier(0.4,0,0.2,1) 0.3s' }} />
                  </div>
                  <div style={{ minWidth: 44, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: cBg, color: cColor }}>{safeScore}/10</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STRENGTHS & IMPROVEMENTS */}
        <div className="grid-two" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginBottom: 16 }}>
          <div className="report-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, background: '#f0fdf4' }}>⭐</div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>Top Strengths</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {strengths.length > 0 ? strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <div style={{ width: 19, height: 19, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: 9, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓</div>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.65 }}>{s}</p>
                </div>
              )) : (
                <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>No notable strengths collected.</p>
              )}
            </div>
          </div>
          <div className="report-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, background: '#fff7ed' }}>🎯</div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#c2410c' }}>Areas to Improve</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {improvements.length > 0 ? improvements.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <div style={{ width: 19, height: 19, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: 9, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>→</div>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.65 }}>{s}</p>
                </div>
              )) : (
                <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>No specific areas mapped yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* 30-DAY STUDY PLAN */}
        <div className="report-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, background: '#eff6ff' }}>📅</div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>30-Day Study Plan</h2>
          </div>
          <div className="grid-two" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {studyPlan.length > 0 ? studyPlan.map((p, i) => {
              const tColor = p.color || fallbackColors[i % fallbackColors.length].color;
              const tBg = p.bg || fallbackColors[i % fallbackColors.length].bg;
              const tBorder = p.border || fallbackColors[i % fallbackColors.length].border;
              return (
                <div key={i} style={{ borderRadius: 12, padding: '13px 15px', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 3, background: tBg, borderColor: tBorder, borderLeftColor: tColor }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, color: tColor }}>{p.week || `Week ${i+1}`}</p>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.65 }}>{p.task}</p>
                </div>
              );
            }) : (
               <p style={{ fontSize: 12, color: '#64748b', gridColumn: '1 / -1' }}>Study plan preparing...</p>
=======
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
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
            )}
          </div>
        </div>

<<<<<<< HEAD
        {/* DSA ATTEMPTS */}
        {dsa_attempts && dsa_attempts.length > 0 && (
          <div className="report-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, background: '#faf5ff' }}>💻</div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed' }}>DSA Code Attempts</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dsa_attempts.map((d, i) => {
                const ds = diffStyle(d.difficulty);
                const iconBg  = d.passed ? "#dcfce7" : "#fee2e2";
                const iconTxt = d.passed ? "#16a34a" : "#dc2626";
                const tagBg   = d.passed ? "#dcfce7" : "#fee2e2";
                const tagTxt  = d.passed ? "#15803d" : "#b91c1c";
                const tagLabel = d.passed ? "✓ Accepted" : "✗ Not Accepted";
                const mark    = d.passed ? "✓" : "✗";
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: iconBg, color: iconTxt }}>{mark}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{d.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: ds.bg, color: ds.text }}>{d.difficulty}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: tagBg, color: tagTxt }}>{tagLabel}</span>
                      <span style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: 99 }}>{d.language}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Each interview makes you sharper. Keep going until you land that offer.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 600 }}>Start New Interview 🚀</Link>
            <Link to="/dashboard" style={{ textDecoration: 'none', background: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 500 }}>View All Sessions</Link>
=======
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
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
          </div>
        </div>

      </div>
    </div>
  );
}
