import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { sessionAPI } from '../api/client';

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
const HIRING_META = {
  'Strong Hire': { color: '#1DB954', bg: 'rgba(29,185,84,0.1)' },
  'Hire': { color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
  'Borderline': { color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  'No Hire': { color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
};

<<<<<<< HEAD
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
<<<<<<< HEAD
=======
<<<<<<< HEAD
  
  const user = JSON.parse(localStorage.getItem('preppilot_user') || '{}');

  useEffect(() => {
    fetchSessions();
  }, []);
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1

  const user = JSON.parse(localStorage.getItem('preppilot_user') || '{}');

  useEffect(() => { fetchSessions(); }, []);
<<<<<<< HEAD
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1

  const fetchSessions = async () => {
    try {
      const { data } = await sessionAPI.list();
      setSessions(data.sessions || []);
    } catch (err) {
      setError('Failed to load past sessions.');
      console.error(err);
<<<<<<< HEAD
    } finally { setLoading(false); }
=======
<<<<<<< HEAD
    } finally {
      setLoading(false);
    }
=======
    } finally { setLoading(false); }
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
  };

  const handleLogout = () => {
    localStorage.removeItem('preppilot_token');
    localStorage.removeItem('preppilot_user');
    navigate('/login');
  };

<<<<<<< HEAD
=======
<<<<<<< HEAD
  // Prepare data for Recharts
  // sessions are returned descending (newest first).
  // For the chart, we want chronological order (oldest first).
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
  const chartData = sessions
    .filter(s => s.status === 'completed' && s.overall_score != null)
    .reverse()
    .map((s, idx) => ({
      name: `Int ${idx + 1}`,
      score: Number(s.overall_score),
<<<<<<< HEAD
=======
<<<<<<< HEAD
      date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-sm p-3 border border-primary-500/20">
          <p className="text-surface-100 font-medium mb-1">{payload[0].payload.date}</p>
          <p className="text-primary-400 font-bold">Score: {payload[0].value}/100</p>
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
      date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

  const avgScore = chartData.length > 0
    ? Math.round(chartData.reduce((a, c) => a + c.score, 0) / chartData.length)
    : null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid var(--gray2)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{payload[0].payload.date}</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)', fontFamily: 'Sora, sans-serif' }}>{payload[0].value}<span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>/100</span></p>
<<<<<<< HEAD
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        </div>
      );
    }
    return null;
  };

<<<<<<< HEAD
=======
<<<<<<< HEAD
  return (
    <div className="min-h-screen pb-20">
      {/* ─── Navbar ─── */}
      <nav className="glass-sm px-6 py-4 sticky top-0 z-50 mb-8 border-b border-surface-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold gradient-text">
            ✈️ PrepPilot
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-surface-200 text-sm hidden md:inline-block">
              Welcome back, <span className="font-semibold text-surface-100">{user.name}</span>
            </span>
            <button onClick={handleLogout} className="text-surface-400 hover:text-danger-400 transition-colors text-sm font-medium">
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 animate-fade-in">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-surface-100 mb-2">Dashboard</h1>
            <p className="text-surface-300">Track your progress and start new mock interviews.</p>
          </div>
          <Link to="/interview/new" className="btn-primary py-3 px-6 shadow-lg shadow-primary-500/20 animate-pulse-glow flex items-center gap-2">
            <span>+</span> New Interview
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
  const companyIcon = { startup: '🚀', mnc: '🏢', faang: '⭐' };
  const roleLabel = { frontend: 'Frontend', backend: 'Backend', fullstack: 'Full-Stack', dsa_focus: 'DSA Heavy' };

  return (
    <div className="dash-page" style={{ minHeight: '100vh' }}>
      {/* ─── HEADER ─────────────────────────────────────── */}
      <header className="dash-header">
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>
            PrepPilot<sup style={{ fontSize: 10, background: 'var(--green)', color: '#fff', padding: '2px 5px', borderRadius: 4, fontWeight: 700, verticalAlign: 'super', marginLeft: 2 }}>AI</sup>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>
              Welcome back, <strong style={{ color: 'var(--text)' }}>{user.name}</strong>
            </span>
            <button onClick={handleLogout} style={{
              background: 'none', border: '1.5px solid var(--gray2)', borderRadius: 50,
              padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif', transition: 'all .2s'
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--error)'; e.target.style.color = 'var(--error)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--gray2)'; e.target.style.color = 'var(--muted)'; }}
            >Log Out</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* ─── TOP SECTION ─────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>My Dashboard</h1>
            <p style={{ fontSize: 15, color: 'var(--muted)' }}>Track your progress and start new mock interviews.</p>
          </div>
          <Link to="/interview/new" className="btn-primary animate-pulse-glow" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px' }}>
            + New Interview
<<<<<<< HEAD
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
          </Link>
        </div>

        {error && (
<<<<<<< HEAD
          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: 14, marginBottom: 32 }}>
=======
<<<<<<< HEAD
          <div className="p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 mb-8">
=======
          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: 14, marginBottom: 32 }}>
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
            {error}
          </div>
        )}

<<<<<<< HEAD
=======
<<<<<<< HEAD
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* ─── Left Column: Past Sessions List ─── */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold text-surface-100 border-b border-surface-800 pb-2">
                Recent Sessions
              </h2>
              
              {sessions.length === 0 ? (
                <div className="glass p-10 text-center rounded-2xl border border-surface-800">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-lg font-medium text-surface-100 mb-2">No interviews yet</h3>
                  <p className="text-surface-300 mb-6 max-w-sm mx-auto">
                    Start your first AI mock interview to see your personalized feedback and score.
                  </p>
                  <Link to="/interview/new" className="btn-secondary py-2 px-6">
                    Start Now
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="glass p-5 rounded-xl border border-surface-800 hover:border-primary-500/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="capitalize font-bold text-lg text-surface-100">
                            {session.company_type}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-surface-800 text-xs font-medium text-surface-300 uppercase tracking-wide">
                            {session.role_type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-surface-400 flex items-center gap-2">
                          <span>{new Date(session.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span className="capitalize">{session.status}</span>
                        </div>
                      </div>

                      {/* Score / Action */}
                      <div className="flex items-center gap-6">
                        {session.status === 'completed' ? (
                          <div className="text-right">
                            <div className="text-2xl font-black text-primary-400">{session.overall_score}<span className="text-sm text-surface-500 font-medium">/100</span></div>
                            <div className={`text-xs font-bold mt-1 uppercase ${
                              session.hiring_recommendation === 'Strong Hire' ? 'text-accent-400' :
                              session.hiring_recommendation === 'Hire' ? 'text-primary-300' :
                              session.hiring_recommendation === 'Borderline' ? 'text-warning-400' :
                              'text-danger-400'
                            }`}>
                              {session.hiring_recommendation}
                            </div>
                          </div>
                        ) : (
                          <div className="text-surface-400 text-sm font-medium italic">
                            In Progress ({session.turn_count} turns)
                          </div>
                        )}
                        
                        {session.status === 'completed' ? (
                          <Link to={`/report/${session.id}`} className="btn-secondary py-2 px-4 whitespace-nowrap">
                            View Report
                          </Link>
                        ) : (
                          <Link to={`/interview/${session.id}`} className="btn-primary py-2 px-4 whitespace-nowrap">
                            Continue
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        {/* ─── SUMMARY STATS ────────────────────────────── */}
        {chartData.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
            {[
              { icon: '🎯', label: 'Total Interviews', value: sessions.length },
              { icon: '✅', label: 'Completed', value: sessions.filter(s => s.status === 'completed').length },
              { icon: '📊', label: 'Average Score', value: avgScore ? `${avgScore}/100` : '—' },
              { icon: '🏆', label: 'Best Score', value: chartData.length ? `${Math.max(...chartData.map(c => c.score))}/100` : '—' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid var(--gray2)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, border: '4px solid var(--gray2)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your sessions...</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

            {/* ─── Sessions List ─── */}
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--gray2)' }}>
                Recent Sessions
              </h2>

              {sessions.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 16, padding: 60, textAlign: 'center', border: '1px solid var(--gray2)', boxShadow: 'var(--shadow)' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No interviews yet</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
                    Start your first AI mock interview to get personalized feedback and your score.
                  </p>
                  <Link to="/interview/new" className="btn-primary" style={{ display: 'inline-flex' }}>
                    Start Now →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sessions.map(session => {
                    const meta = HIRING_META[session.hiring_recommendation] || {};
                    return (
                      <div key={session.id} className="session-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: 'var(--gray)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 24, flexShrink: 0
                          }}>
                            {companyIcon[session.company_type] || '💼'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)', textTransform: 'capitalize' }}>
                                {session.company_type}
                              </span>
                              <span style={{ padding: '2px 10px', borderRadius: 50, background: 'var(--gray)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {roleLabel[session.role_type] || session.role_type}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {new Date(session.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              {' · '}
                              <span style={{ textTransform: 'capitalize' }}>{session.status}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                          {session.status === 'completed' ? (
                            <>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 900, color: 'var(--green)' }}>
                                  {session.overall_score}<span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>/100</span>
                                </div>
                                {session.hiring_recommendation && (
                                  <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {session.hiring_recommendation}
                                  </div>
                                )}
                              </div>
                              <Link to={`/report/${session.id}`} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 13, borderRadius: 50 }}>
                                View Report
                              </Link>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                                In Progress ({session.turn_count} turns)
                              </div>
                              <Link to={`/interview/${session.id}`} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13, borderRadius: 50 }}>
                                Continue →
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
<<<<<<< HEAD
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
                </div>
              )}
            </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
            {/* ─── Right Column: Score Trend Chart ─── */}
            <div>
              <div className="glass p-6 rounded-2xl border border-surface-800 sticky top-24">
                <h2 className="text-xl font-semibold text-surface-100 mb-6">Performance Trend</h2>
                
                {chartData.length < 2 ? (
                  <div className="text-center py-10 bg-surface-900/50 rounded-xl border border-surface-800">
                    <p className="text-surface-400 text-sm px-4">
                      Complete at least 2 interviews to see your score trend over time.
                    </p>
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#64748b" 
                          fontSize={12} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={12} 
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#818cf8" 
                          strokeWidth={3}
                          dot={{ fill: '#818cf8', strokeWidth: 2, r: 4, stroke: '#1e293b' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Quick Stats Summary */}
                {chartData.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-surface-800 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-surface-400 mb-1">Avg Score</div>
                      <div className="text-2xl font-bold text-surface-100">
                        {Math.round(chartData.reduce((acc, curr) => acc + curr.score, 0) / chartData.length)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-surface-400 mb-1">Total Interviews</div>
                      <div className="text-2xl font-bold text-surface-100">
                        {chartData.length}
                      </div>
                    </div>
                  </div>
                )}
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
            {/* ─── Trend Chart ─── */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid var(--gray2)', boxShadow: 'var(--shadow)', position: 'sticky', top: 100 }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Performance Trend</h2>

              {chartData.length < 2 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', background: 'var(--gray)', borderRadius: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📈</div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', padding: '0 16px', lineHeight: 1.6 }}>
                    Complete at least 2 interviews to see your score trend over time.
                  </p>
                </div>
              ) : (
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF2" vertical={false} />
                      <XAxis dataKey="name" stroke="#6B7A99" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6B7A99" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone" dataKey="score" stroke="#1DB954" strokeWidth={3}
                        dot={{ fill: '#1DB954', strokeWidth: 2, r: 5, stroke: '#fff' }}
                        activeDot={{ r: 7, strokeWidth: 0, fill: '#0F7A35' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {chartData.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Average Score', value: `${avgScore}/100` },
                    { label: 'Total Interviews', value: chartData.length },
                    { label: 'Best Session', value: `${Math.max(...chartData.map(c => c.score))}/100` },
                    { label: 'Completed', value: sessions.filter(s => s.status === 'completed').length },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <Link to="/interview/new" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: 12, fontSize: 14 }}>
                  + Start New Interview
                </Link>
<<<<<<< HEAD
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
