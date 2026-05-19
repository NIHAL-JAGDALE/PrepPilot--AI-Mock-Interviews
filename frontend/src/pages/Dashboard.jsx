import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { sessionAPI } from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const user = JSON.parse(localStorage.getItem('preppilot_user') || '{}');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await sessionAPI.list();
      setSessions(data.sessions || []);
    } catch (err) {
      setError('Failed to load past sessions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('preppilot_token');
    localStorage.removeItem('preppilot_user');
    navigate('/login');
  };

  // Prepare data for Recharts
  // sessions are returned descending (newest first).
  // For the chart, we want chronological order (oldest first).
  const chartData = sessions
    .filter(s => s.status === 'completed' && s.overall_score != null)
    .reverse()
    .map((s, idx) => ({
      name: `Int ${idx + 1}`,
      score: Number(s.overall_score),
      date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-sm p-3 border border-primary-500/20">
          <p className="text-surface-100 font-medium mb-1">{payload[0].payload.date}</p>
          <p className="text-primary-400 font-bold">Score: {payload[0].value}/100</p>
        </div>
      );
    }
    return null;
  };

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
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 mb-8">
            {error}
          </div>
        )}

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
                </div>
              )}
            </div>

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
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
