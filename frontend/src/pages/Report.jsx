import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reportAPI } from '../api/client';

export default function Report() {
  const params = useParams();
  const id = params.sessionId || params.id;
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const response = await reportAPI.get(id);
      setData(response.data);
    } catch (err) {
      setError('Failed to load report or report is not ready yet.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(29,185,84,0.2)', borderTopColor: '#1DB954', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6B8A6E', fontSize: 14 }}>Analyzing interview performance...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <p style={{ color: '#EF4444', marginBottom: 20, fontSize: 15 }}>{error}</p>
          <Link to="/dashboard" style={{ padding: '12px 24px', background: '#1DB954', color: '#fff', borderRadius: 50, textDecoration: 'none', fontWeight: 600 }}>← Dashboard</Link>
        </div>
      </div>
    );
  }

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
    "HIRE": { bg: "#dbeafe", border: "#93c5fd", dot: "#1d4ed8", text: "#1d4ed8" },
    "BORDERLINE": { bg: "#fef9c3", border: "#fde047", dot: "#a16207", text: "#a16207" },
    "NO HIRE": { bg: "#fee2e2", border: "#fca5a5", dot: "#b91c1c", text: "#b91c1c" },
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
    if (d === "Hard") return { bg: "#fee2e2", text: "#dc2626" };
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
          <img src="/Images/photos/light_theme_logo.png" alt="PrepPilot Logo" style={{ height: 32 }} />
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
                <circle cx="74" cy="74" r="60" fill="none" stroke="#f1f5f9" strokeWidth="10" />
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
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, color: tColor }}>{p.week || `Week ${i + 1}`}</p>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.65 }}>{p.task}</p>
                </div>
              );
            }) : (
              <p style={{ fontSize: 12, color: '#64748b', gridColumn: '1 / -1' }}>Study plan preparing...</p>
            )}
          </div>
        </div>

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
                const iconBg = d.passed ? "#dcfce7" : "#fee2e2";
                const iconTxt = d.passed ? "#16a34a" : "#dc2626";
                const tagBg = d.passed ? "#dcfce7" : "#fee2e2";
                const tagTxt = d.passed ? "#15803d" : "#b91c1c";
                const tagLabel = d.passed ? "✓ Accepted" : "✗ Not Accepted";
                const mark = d.passed ? "✓" : "✗";
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
          </div>
        </div>

      </div>
    </div>
  );
}
