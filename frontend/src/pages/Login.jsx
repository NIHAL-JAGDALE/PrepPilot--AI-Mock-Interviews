<<<<<<< HEAD
=======
<<<<<<< HEAD
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.login(form);
      localStorage.setItem('preppilot_token', data.token);
      localStorage.setItem('preppilot_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold gradient-text inline-block mb-2">
            ✈️ PrepPilot
          </Link>
          <h1 className="text-2xl font-bold text-surface-100">Welcome back</h1>
          <p className="text-surface-200 text-sm mt-1">Log in to continue your interview prep</p>
        </div>

        <div className="glass p-8 glow">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-surface-200 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@university.edu"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-surface-200 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-center"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <p className="text-center text-surface-700 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../api/client';

// ─── PARTICLE CANVAS ─────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [], raf;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 90; i++) pts.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      a: Math.random() * 0.5 + 0.1,
    });
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(29,185,84,${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(29,185,84,${0.07 * (1 - d / 120)})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

// ─── FLOATING BADGE ───────────────────────────────────────
function FloatBadge({ children, style, animClass }) {
  return (
    <div className={animClass} style={{
      position: 'absolute',
      background: '#fff', borderRadius: 12,
      padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 13, fontWeight: 600, color: 'var(--dark)',
      zIndex: 3, ...style
    }}>
      {children}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab === 'register' ? 'register' : 'login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [regError, setRegError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [success, setSuccess] = useState(false);

  const calcStrength = (v) => {
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    setStrength(s);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError(''); setLoginLoading(true);
    try {
      const { data } = await authAPI.login(loginForm);
      localStorage.setItem('preppilot_token', data.token);
      localStorage.setItem('preppilot_user', JSON.stringify(data.user));
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoginLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setRegError(''); setRegLoading(true);
    try {
      const { data } = await authAPI.register(regForm);
      localStorage.setItem('preppilot_token', data.token);
      localStorage.setItem('preppilot_user', JSON.stringify(data.user));
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setRegError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setRegLoading(false); }
  };

  const strengthColors = ['#EF4444', '#F59E0B', '#3B82F6', '#1DB954'];
  const strengthColor = strength > 0 ? strengthColors[strength - 1] : '#E2E8F0';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
      <Particles />

      {/* ──────── LEFT PANEL ──────── */}
      <div className="auth-left" style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div className="animate-slide-down" style={{ position: 'relative', zIndex: 2 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff' }}>
            <div className="pp-logo-icon" style={{ width: 36, height: 36 }}>🎯</div>
            PrepPilot<sup style={{ fontSize: 10, background: 'var(--green)', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, verticalAlign: 'super', marginLeft: 2 }}>AI</sup>
          </Link>
        </div>

        {/* Floating score badges */}
        <FloatBadge style={{ top: '38%', right: 32 }} animClass="animate-float1">
          <span style={{ width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
          Score: <span style={{ color: 'var(--green)', fontWeight: 800 }}>9/10</span> — Strong Hire ✓
        </FloatBadge>
        <FloatBadge style={{ top: '58%', right: 50 }} animClass="animate-float2">
          🤖 Claude AI · Token savings <span style={{ color: 'var(--green)', fontWeight: 800 }}>70%</span>
        </FloatBadge>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2 }} className="animate-slide-up">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(29,185,84,0.12)', border: '1px solid rgba(29,185,84,0.2)',
            color: 'var(--green)', padding: '6px 14px', borderRadius: 50,
            fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
            textTransform: 'uppercase', marginBottom: 28
          }}>
            <span style={{ width: 7, height: 7, background: 'var(--green)', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
            India's #1 Placement Prep
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            Ace Every<br />
            <span style={{ color: 'var(--green)' }}>Interview</span><br />
            with AI.
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 400, marginBottom: 40 }}>
            Practice real FAANG, Startup & MNC rounds with an AI that scores every answer, runs your code, and never lets you walk in unprepared again.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 44 }}>
            {[['4,200+', 'Students placed'], ['87%', 'Offer rate'], ['10x', 'Faster prep']].map(([v, l]) => (
              <div key={l} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '16px 20px', flex: 1,
                transition: 'border-color .3s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(29,185,84,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                  <span style={{ color: 'var(--green)' }}>{v}</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '24px 28px', position: 'relative', zIndex: 2
        }} className="animate-slide-up">
          <div style={{ fontSize: 28, color: 'var(--green)', fontFamily: 'Georgia, serif', marginBottom: 10 }}>"</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16 }}>
            I cracked Google after 3 weeks of PrepPilot. The AI adapted to my skill level and gave brutally honest feedback — exactly what a real interviewer would.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/Images/avatars/testimonial-rohan.jpg" alt="Rohan"
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(29,185,84,0.4)' }}
              onError={e => { e.target.style.background = 'linear-gradient(135deg,#1DB954,#0F7A35)'; e.target.src = ''; }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Rohan Sharma</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>SWE at Google · 42 LPA 🎉</div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────── RIGHT PANEL ──────── */}
      <div className="auth-right" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-slide-up">

          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: '#F1F5F9', borderRadius: 12,
            padding: 4, marginBottom: 36, position: 'relative'
          }}>
            <div style={{
              position: 'absolute', top: 4, bottom: 4,
              width: 'calc(50% - 4px)',
              background: '#fff',
              borderRadius: 9, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform .35s cubic-bezier(.34,1.56,.64,1)',
              transform: activeTab === 'register' ? 'translateX(calc(100% + 0px))' : 'none',
            }} />
            {['login', 'register'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, textAlign: 'center', padding: 11,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                borderRadius: 9, border: 'none', background: 'transparent',
                position: 'relative', zIndex: 1,
                color: activeTab === tab ? 'var(--dark)' : '#94A3B8',
                transition: 'color .3s', userSelect: 'none',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>Welcome back 👋</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.6 }}>
                New to PrepPilot?{' '}
                <button type="button" onClick={() => setActiveTab('register')} style={{ color: 'var(--green)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
                  Create a free account
                </button>
              </p>

              <div className="auth-field">
                <input type="email" id="login-email" placeholder="Email address" autoComplete="email" required
                  value={loginForm.email} onChange={e => { setLoginForm({ ...loginForm, email: e.target.value }); setLoginError(''); }} />
                <label htmlFor="login-email">Email address</label>
              </div>

              <div className="auth-field" style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} id="login-pass" placeholder="Password" autoComplete="current-password" required
                  value={loginForm.password} onChange={e => { setLoginForm({ ...loginForm, password: e.target.value }); setLoginError(''); }} />
                <label htmlFor="login-pass">Password</label>
                <button type="button" onClick={() => setShowPassword(p => !p)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 18, padding: 4
                }}>{showPassword ? '🙈' : '👁'}</button>
              </div>

              <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -12 }}>
                <a href="#" style={{ fontSize: 13, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
              </div>

              {loginError && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: 13, marginBottom: 20 }}>
                  {loginError}
                </div>
              )}

              <button type="submit" disabled={loginLoading} className="btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif', justifyContent: 'center' }}>
                {loginLoading
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><span className="animate-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} /> Signing in...</span>
                  : 'Sign In to PrepPilot →'}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>Start for free 🚀</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.6 }}>
                Already have an account?{' '}
                <button type="button" onClick={() => setActiveTab('login')} style={{ color: 'var(--green)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
                  Sign in here
                </button>
              </p>

              <div className="auth-field">
                <input type="text" id="reg-name" placeholder="Full name" autoComplete="name" required
                  value={regForm.name} onChange={e => { setRegForm({ ...regForm, name: e.target.value }); setRegError(''); }} />
                <label htmlFor="reg-name">Full name</label>
              </div>

              <div className="auth-field">
                <input type="email" id="reg-email" placeholder="Email address" autoComplete="email" required
                  value={regForm.email} onChange={e => { setRegForm({ ...regForm, email: e.target.value }); setRegError(''); }} />
                <label htmlFor="reg-email">Email address</label>
              </div>

              <div className="auth-field" style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} id="reg-pass" placeholder="Create password" autoComplete="new-password" required minLength={6}
                  value={regForm.password} onChange={e => { setRegForm({ ...regForm, password: e.target.value }); setRegError(''); calcStrength(e.target.value); }} />
                <label htmlFor="reg-pass">Create password</label>
                <button type="button" onClick={() => setShowPassword(p => !p)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 18, padding: 4
                }}>{showPassword ? '🙈' : '👁'}</button>
              </div>

              {/* Strength bar */}
              {regForm.password && (
                <div style={{ display: 'flex', gap: 4, height: 3, marginTop: -14, marginBottom: 20 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1, borderRadius: 4, background: i <= strength ? strengthColor : '#E2E8F0', transition: 'background .4s' }} />
                  ))}
                </div>
              )}

              {regError && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: 13, marginBottom: 20 }}>
                  {regError}
                </div>
              )}

              <button type="submit" disabled={regLoading} className="btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif', marginTop: 8, justifyContent: 'center' }}>
                {regLoading
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><span className="animate-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} /> Creating...</span>
                  : 'Create My Account →'}
              </button>
            </form>
          )}

          {/* Brand strip */}
          <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: 12, color: '#CBD5E1' }}>
            Trusted by students at <strong style={{ color: 'var(--dark)' }}>&nbsp;IIT·NIT·VIT·BITS</strong>&nbsp; and 200+ colleges
          </div>
        </div>
      </div>

      {/* ── SUCCESS OVERLAY ── */}
      {success && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--dark)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, animation: 'fadeIn .5s ease'
        }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'rgba(29,185,84,0.15)', border: '2px solid var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 42, marginBottom: 24, animation: 'popIn .5s cubic-bezier(.34,1.56,.64,1) both'
          }}>✓</div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, color: '#fff', marginBottom: 10 }}>You're in!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Redirecting to your dashboard...</p>
        </div>
      )}
<<<<<<< HEAD
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
    </div>
  );
}
