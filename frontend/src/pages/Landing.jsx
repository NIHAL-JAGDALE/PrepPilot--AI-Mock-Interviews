<<<<<<< HEAD
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Interviews',
    desc: 'Realistic 10-question sessions powered by Claude, GPT-4o, and Groq with automatic failover.',
  },
  {
    icon: '💻',
    title: 'Live Code Compiler',
    desc: 'Solve real LeetCode problems with Monaco Editor and Judge0 — just like a real coding interview.',
  },
  {
    icon: '📊',
    title: 'Detailed Reports',
    desc: 'Get scored per-round, receive hiring recommendations, and follow a personalized 30-day study plan.',
  },
  {
    icon: '🔄',
    title: 'Smart Failover',
    desc: 'Three AI providers with silent auto-switching. Your interview never stops, even if one goes down.',
  },
  {
    icon: '🎯',
    title: 'Campus-Ready',
    desc: 'Tailored for Indian campus placements — prep for startups, MNCs, and FAANG-level interviews.',
  },
  {
    icon: '⚡',
    title: 'Token Caching',
    desc: 'Prompt caching across all providers cuts costs by ~70% — affordable practice, unlimited growth.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold gradient-text">
            ✈️ PrepPilot
          </Link>
          <div className="flex gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">
              Log In
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-6">
            🚀 AI-Powered Mock Interviews for Campus Placements
          </div>

          <h1 className="flex flex-col gap-2 text-5xl md:text-7xl font-extrabold mb-8">
            <span>Ace Your Next</span>
            <span className="gradient-text">Campus Interview</span>
          </h1>

          <p className="text-lg md:text-xl text-surface-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice with an AI interviewer that adapts to your level, scores every answer in real-time,
            and gives you a detailed roadmap to improve — all in under 45 minutes.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-6 justify-center">
            <Link to="/register" className="btn-primary text-lg py-4 px-8 animate-pulse-glow">
              Start Free Interview →
            </Link>
            <a href="#features" className="btn-secondary text-lg py-4 px-8">
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pb-8">
            {[
              ['10', 'Questions per session'],
              ['5', 'Interview rounds'],
              ['3', 'AI providers'],
              ['Real-time', 'Scoring & feedback'],
            ].map(([stat, label]) => (
              <div key={label} className="text-center flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">{stat}</div>
                <div className="text-sm text-surface-400">{label}</div>
=======
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ─── FAQ DATA ────────────────────────────────────────────
const faqs = [
  {
    q: 'How is PrepPilot different from a normal mock interview?',
    a: 'Unlike static mock tests, PrepPilot uses AI to simulate real interviewer behavior — asking follow-ups, adapting difficulty based on your answers, and giving structured feedback with scores after every question, exactly like a real placement round.',
  },
  {
    q: 'Does it support DSA coding rounds?',
    a: 'Yes — turns 2, 3, and 4 are DSA rounds with real LeetCode problems. You write and run code directly in a Monaco editor, and Judge0 executes it and returns test results live during the interview.',
  },
  {
    q: 'What happens if the AI goes down mid-interview?',
    a: 'PrepPilot automatically switches between Claude, OpenAI GPT-4o, and Groq when any provider hits a rate limit. The switch is completely invisible — your interview continues without interruption and all context is preserved from PostgreSQL.',
  },
  {
    q: 'Which companies does it prepare me for?',
    a: 'PrepPilot supports three company modes: FAANG (hard DSA, system design, Big O required), Startup (medium DSA, ownership mindset, full-stack thinking), and MNC like TCS/Infosys (OS, DBMS, CN fundamentals, SQL, SDLC).',
  },
  {
    q: 'How accurate is the feedback?',
    a: 'Each answer is scored 1–10 with specific feedback on what was right, what was missing, and a model answer showing what a top candidate would say. The final report includes a hiring recommendation (Strong Hire/Hire/Borderline/No Hire).',
  },
  {
    q: 'Can I see my past interview sessions?',
    a: 'Yes — your dashboard shows all past sessions with scores, company type, and hiring recommendations. You can view the full report for any session, including the code you submitted during DSA rounds.',
  },
];

// ─── PARTICLES CANVAS ────────────────────────────────────
function ParticlesBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [], raf;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        a: Math.random() * 0.4 + 0.1,
      };
    }
    for (let i = 0; i < 80; i++) pts.push(Particle());

    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(29,185,84,${p.a})`;
        ctx.fill();
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
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.4 }} />;
}

// ─── FAQ ITEM ─────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`faq-item${open ? ' open' : ''}`}
      onClick={() => setOpen(o => !o)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{q}</span>
        <span className="faq-toggle">{open ? '×' : '+'}</span>
      </div>
      {open && (
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginTop: 14, display: open ? 'block' : 'none' }}>
          {a}
        </p>
      )}
    </div>
  );
}

// ─── MAIN LANDING PAGE ────────────────────────────────────
export default function Landing() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Avatar image URLs from local avatars folder
  const heroAvatars = [
    '/Images/avatars/hero-1.jpg',
    '/Images/avatars/hero-2.jpg',
    '/Images/avatars/hero-3.jpg',
    '/Images/avatars/hero-4.jpg',
    '/Images/avatars/hero-5.jpg',
  ];
  const stripPhotos = [
    '/Images/avatars/strip-1.jpg',
    '/Images/avatars/strip-2.jpg',
    '/Images/avatars/strip-3.jpg',
    '/Images/avatars/strip-4.jpg',
    '/Images/avatars/strip-5.jpg',
    '/Images/avatars/strip-6.jpg',
    '/Images/avatars/strip-7.jpg',
    '/Images/avatars/strip-8.jpg',
    '/Images/avatars/strip-9.jpg',
  ];

  return (
    <div style={{ background: '#fff', minHeight: '100vh', color: 'var(--text)' }}>
      <ParticlesBg />

      {/* ─── NAV ─────────────────────────────────────────── */}
      <nav className="pp-nav" style={{ boxShadow: navScrolled ? '0 4px 24px rgba(0,0,0,0.08)' : 'none' }}>
        <a href="/" className="pp-logo text-decoration-none" style={{ textDecoration: 'none' }}>
          PrepPilot<sup>AI</sup>
        </a>
        <div style={{ display: 'flex', gap: 36 }}>
          <a href="#how" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: 15, fontWeight: 500, transition: 'color .2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--green)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}
          >How It Works</a>
          <a href="#features" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: 15, fontWeight: 500, transition: 'color .2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--green)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}
          >Features</a>
          <a href="#faq" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: 15, fontWeight: 500, transition: 'color .2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--green)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}
          >FAQ</a>
        </div>
        <Link to="/register" className="btn-primary" style={{ padding: '11px 24px', borderRadius: 50, fontSize: 14 }}>
          Get Started →
        </Link>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section style={{ padding: 0 }}>
        <div style={{
          padding: '140px 60px 80px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 60, maxWidth: 1280, margin: '0 auto',
          position: 'relative',
        }}>
          {/* Green radial glow */}
          <div style={{
            position: 'absolute', top: -100, right: -200,
            width: 700, height: 700,
            background: 'radial-gradient(circle, rgba(29,185,84,0.08) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none'
          }} />

          {/* ─ LEFT ─ */}
          <div style={{ flex: 1, maxWidth: 580, position: 'relative', zIndex: 1 }}>
            <div className="animate-fade-up">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(29,185,84,0.1)', color: 'var(--green-dark)',
                padding: '7px 16px', borderRadius: 50, fontSize: 13, fontWeight: 600,
                marginBottom: 24
              }}>
                <span style={{ width: 7, height: 7, background: 'var(--green)', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
                India's #1 AI Placement Prep Platform
              </div>
            </div>

            <h1 className="animate-fade-up-2" style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: 'clamp(38px, 5vw, 56px)',
              lineHeight: 1.1, fontWeight: 800,
              color: 'var(--text)', marginBottom: 20
            }}>
              Crack Your{' '}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--green)', color: '#fff',
                padding: '4px 16px', borderRadius: 50, fontSize: '0.85em'
              }}>→</span>{' '}
              Dream Job with <span style={{ color: 'var(--green)' }}>AI-Powered</span> Mock Interviews
            </h1>

            <p className="animate-fade-up-3" style={{
              fontSize: 17, color: 'var(--muted)', lineHeight: 1.7,
              marginBottom: 36, maxWidth: 480
            }}>
              Practice real placement interviews with AI, get instant scores on every answer,
              and boost your chances of landing that 20+ LPA offer.
            </p>

            <div className="animate-fade-up-4" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary animate-pulse-glow" style={{ fontSize: 15, padding: '16px 32px' }}>
                🎯 Start Mock Interview
              </Link>
              <a href="#how" className="btn-secondary" style={{ padding: '14px 28px' }}>
                ▶ How It Works
              </a>
            </div>

            <div className="animate-fade-up-4" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex' }}>
                {heroAvatars.map((src, i) => (
                  <img key={i} src={src} alt="Student"
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      border: '2.5px solid #fff', objectFit: 'cover',
                      marginLeft: i === 0 ? 0 : -10,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
                    }}
                    onError={e => { e.target.style.background = 'linear-gradient(135deg,#1DB954,#0F7A35)'; e.target.src = ''; }}
                  />
                ))}
              </div>
              <div>
                <div style={{ color: '#F5A623', fontSize: 14, letterSpacing: 1 }}>★★★★★</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  <strong style={{ color: 'var(--text)' }}>4,200+ students</strong> placed this season
                </div>
              </div>
            </div>
          </div>

          {/* ─ RIGHT — Interview card ─ */}
          <div className="animate-fade-up-3" style={{ flex: '0 0 480px', position: 'relative' }}>
            {/* Floating tags */}
            <div className="float-tag animate-float1" style={{ top: 20, right: 0, zIndex: 10 }}>
              <span style={{ fontSize: 18 }}>🤖</span> Claude AI Active
            </div>
            <div className="float-tag animate-float2" style={{ bottom: 30, left: -20, zIndex: 10 }}>
              <span style={{ fontSize: 18 }}>✅</span> Score: 8.5/10 — Strong Hire
            </div>

            {/* Main card */}
            <div style={{
              background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow-lg)',
              padding: 28, border: '1px solid rgba(0,0,0,0.06)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: 'linear-gradient(90deg, var(--green), var(--green-light))'
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>Live Mock Interview</span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                  padding: '5px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600
                }}>
                  <span style={{ width: 6, height: 6, background: '#EF4444', borderRadius: '50%', animation: 'blink 1s infinite', display: 'inline-block' }} />
                  REC 00:12:47
                </span>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20,
                background: 'var(--gray)', borderRadius: 10, padding: 16
              }}>
                <img
                  src="/Images/avatars/interviewer.jpg"
                  alt="AI Interviewer"
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  onError={e => { e.target.style.background = 'linear-gradient(135deg,#1DB954,#0F7A35)'; e.target.src = ''; }}
                />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, fontFamily: 'Sora, sans-serif' }}>PrepPilot AI Interviewer</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>FAANG Round · DSA + System Design</div>
                </div>
                <span style={{
                  marginLeft: 'auto', padding: '4px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700,
                  background: 'rgba(29,185,84,0.12)', color: 'var(--green-dark)'
                }}>Claude</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <div className="bubble-ai">What is the time complexity of your solution for finding the longest substring without repeating characters?</div>
                <div className="bubble-user">O(n) using sliding window — two pointers, HashSet to track characters. Space is O(min(m,n)).</div>
                <div className="bubble-ai">✅ Score: 9/10 — Excellent! You correctly identified the sliding window approach. Next: explain how you'd scale this...</div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div className="score-pill"><div className="val">87</div><div className="lbl">Overall Score</div></div>
                <div className="score-pill"><div className="val">9/10</div><div className="lbl">Last Answer</div></div>
                <div className="score-pill"><div className="val">70%</div><div className="lbl">Token Saved</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BRAND STRIP ──────────────────────────────────── */}
      <div style={{
        background: 'var(--gray)', padding: '24px 60px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Trusted by students placed at</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
          {['Google', 'Microsoft', 'Razorpay', 'CRED', 'Zepto', 'Infosys'].map(co => (
            <span key={co} style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--muted)', opacity: 0.5 }}>{co}</span>
          ))}
        </div>
      </div>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" className="section" style={{ background: '#fff' }}>
        <div className="section-inner">
          <div className="section-tag">HOW IT WORKS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
            <h2 className="section-title">Simple Setup.<br />Powerful Results.</h2>
            <p className="section-sub" style={{ maxWidth: 340, textAlign: 'right' }}>
              Get placement-ready in 4 easy steps — from choosing your company target to mastering real interview scenarios.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 1fr', gap: 32, marginTop: 60, alignItems: 'start' }}>
            {/* Photo column */}
            <div style={{ position: 'sticky', top: 100 }}>
              <img
                src="/Images/photos/students-studying.jpg"
                alt="Students preparing"
                style={{ width: '100%', borderRadius: 20, objectFit: 'cover', height: 500, boxShadow: 'var(--shadow-lg)', display: 'block' }}
              />
              <div style={{
                marginTop: 14, background: 'var(--green)', borderRadius: 12,
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10
              }}>
                <img
                  src="/Images/avatars/testimonial-nandini.jpg" alt="Student"
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>4,200+ students placed<br />this placement season</span>
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { n: '01', title: 'Choose Company & Role', badge: 'Step 1', desc: 'Select your target company type (FAANG, Startup, MNC) and role (Frontend, Backend, Fullstack, DSA). PrepPilot tailors every question to your exact goal.' },
                { n: '02', title: 'Start Your AI Interview', badge: 'Step 2', desc: 'Our AI interviewer asks 10 structured questions — DSA with a live Monaco compiler, CS fundamentals, project deep-dives, and HR rounds. Exactly like a real placement round.' },
                { n: '03', title: 'Get Scored Instantly', badge: 'Step 3', desc: 'Every answer scored out of 10 with specific feedback, the model answer, and weak areas to work on — immediately after you submit.' },
                { n: '04', title: 'Get Your Placement Report', badge: 'Step 4', desc: 'Receive a detailed report: overall score, round-wise breakdown, hiring recommendation, and a personalized 30-day study plan.' },
              ].map(s => (
                <div key={s.n} className="step-card">
                  <div className="step-circle">{s.n}</div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, background: 'rgba(29,185,84,0.1)', padding: '3px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 6 }}>{s.badge}</div>
                    <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{s.title}</h4>
                    <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Code preview */}
            <div style={{ background: 'linear-gradient(135deg, var(--dark) 0%, var(--dark3) 100%)', borderRadius: 24, padding: 36, color: '#fff' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>DSA Round · Turn 3 of 10</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, fontFamily: 'monospace', fontSize: 13, color: '#4ADE80', lineHeight: 1.8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>// Sliding Window Solution</span><br />
                  <span style={{ color: '#60A5FA' }}>function </span>
                  <span style={{ color: '#F59E0B' }}>lengthOfLongestSubstring</span>(s) {'{'}<br />
                  &nbsp;&nbsp;<span style={{ color: '#60A5FA' }}>let</span> set = <span style={{ color: '#60A5FA' }}>new</span> Set();<br />
                  &nbsp;&nbsp;<span style={{ color: '#60A5FA' }}>let</span> l = <span style={{ color: '#F59E0B' }}>0</span>, max = <span style={{ color: '#F59E0B' }}>0</span>;<br />
                  &nbsp;&nbsp;<span style={{ color: '#60A5FA' }}>for</span> (<span style={{ color: '#60A5FA' }}>let</span> r = <span style={{ color: '#F59E0B' }}>0</span>; r &lt; s.length; r++) {'{'}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#60A5FA' }}>while</span> (set.has(s[r])) set.delete(s[l++]);<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;set.add(s[r]); max = Math.max(max, r-l+<span style={{ color: '#F59E0B' }}>1</span>);<br />
                  &nbsp;&nbsp;{'}'}<br />
                  &nbsp;&nbsp;<span style={{ color: '#60A5FA' }}>return</span> max;<br />
                  {'}'}
                </div>
              </div>
              <div style={{ background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.3)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, marginBottom: 8 }}>✅ Accepted · 52ms · 42MB</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>3/3 test cases passed · O(n) time · O(min(m,n)) space</div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                {[['9/10', 'DSA Score', '#4ADE80'], ['O(n)', 'Complexity', '#60A5FA'], ['3/3', 'Test Cases', '#F59E0B']].map(([v, l, c]) => (
                  <div key={l} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: c, fontFamily: 'Sora, sans-serif' }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────── */}
      <section id="features" style={{ background: 'var(--dark)', padding: '100px 60px' }}>
        <div className="section-inner">
          <div className="section-tag" style={{ color: 'var(--green)' }}>KEY FEATURES</div>
          <h2 className="section-title" style={{ color: '#fff' }}>Smart Tools for<br />AI-Powered Placement Prep</h2>
          <p className="section-sub" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Practice smarter, not harder — our AI tools simulate real placement scenarios, give instant feedback, and help you improve every session.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 60 }}>
            {/* Card 1 */}
            <div className="feat-card">
              <div style={{ width: '100%', borderRadius: 10, height: 160, overflow: 'hidden', marginBottom: 20 }}>
                <img src="/Images/photos/interview-room.jpg" alt="Interview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="feat-icon" style={{ background: 'rgba(29,185,84,0.15)' }}>🏢</div>
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Company-Specific Rounds</h4>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Tailored interviews for FAANG, Startups, and MNCs. Each round adapts difficulty based on your performance in real time.</p>
            </div>

            {/* Card 2 */}
            <div className="feat-card">
              <div style={{ width: '100%', borderRadius: 10, height: 160, overflow: 'hidden', marginBottom: 20 }}>
                <img src="/Images/photos/coding.jpg" alt="Coding" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="feat-icon" style={{ background: 'rgba(96,165,250,0.15)' }}>⚡</div>
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Live DSA Compiler</h4>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Real LeetCode problems with Monaco editor and Judge0 execution. Write, run, and get evaluated — all inside the interview.</p>
            </div>

            {/* Card 3 */}
            <div className="feat-card">
              <div style={{ width: '100%', borderRadius: 10, height: 160, overflow: 'hidden', marginBottom: 20 }}>
                <img src="/Images/photos/team.jpg" alt="Team" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="feat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>🔁</div>
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Auto AI Failover</h4>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Claude → OpenAI → Groq — when one hits its limit, the next takes over silently. Your interview never stops.</p>
            </div>

            {/* Wide card */}
            <div className="feat-card" style={{ gridColumn: 'span 2', display: 'flex', gap: 28, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div className="feat-icon" style={{ background: 'rgba(167,139,250,0.15)', marginBottom: 16 }}>📊</div>
                <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Detailed Performance Reports</h4>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                  After every session: round-by-round scores, top strengths, weak areas, hiring recommendation (Strong Hire / Hire / Borderline / No Hire), and a personalized 30-day study plan built for your specific gaps.
                </p>
              </div>
              <div style={{ flex: '0 0 220px', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Your Report</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif' }}>87</span>
                  </div>
                </div>
                {[['DSA', '24/30', 'var(--green)', 80], ['CS Fundamentals', '17/20', '#60A5FA', 85], ['Projects', '16/20', '#F59E0B', 80]].map(([l, v, c, w]) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                      <span>{l}</span><span style={{ color: c }}>{v}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <div style={{ width: `${w}%`, height: '100%', background: c, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 14, background: 'rgba(29,185,84,0.15)', borderRadius: 8, padding: '8px', textAlign: 'center', fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>STRONG HIRE ✓</div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="feat-card">
              <div className="feat-icon" style={{ background: 'rgba(29,185,84,0.15)' }}>💰</div>
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>70% Token Cost Savings</h4>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Prompt caching across Claude, OpenAI, and Groq. Your interviews cost 70% less per session without any quality loss.</p>
            </div>

            <div className="feat-card">
              <div className="feat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>📈</div>
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Progress Tracker</h4>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Track improvement across sessions. See your score trend, identify consistent weak areas, and watch yourself grow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI PROVIDERS ─────────────────────────────────── */}
      <section style={{ background: 'var(--gray)', padding: '100px 60px' }}>
        <div className="section-inner">
          <div className="section-tag">MULTI-PROVIDER AI</div>
          <h2 className="section-title">Three AIs. Zero Downtime.</h2>
          <p className="section-sub">When one provider hits its limit, the next takes over instantly — with full interview context. Your session never stops.</p>

          <div style={{ display: 'flex', gap: 20, marginTop: 48 }}>
            <div className="provider-card primary">
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Claude Sonnet</h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>Primary interviewer. Explicit prompt caching reduces token cost by 60%. Strict, detailed, and structured evaluation.</p>
              <span style={{ display: 'inline-block', marginTop: 12, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'rgba(29,185,84,0.1)', color: 'var(--green-dark)' }}>Primary · Cache: Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', fontSize: 24, padding: '20px 0' }}>→</div>
            <div className="provider-card">
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>OpenAI GPT-4o</h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>First fallback. Auto-caches prompts over 1024 tokens. Seamlessly continues with full context from PostgreSQL.</p>
              <span className="badge-muted" style={{ display: 'inline-block', marginTop: 12 }}>Fallback 1 · Auto-cached</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', fontSize: 24, padding: '20px 0' }}>→</div>
            <div className="provider-card">
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
              <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Groq llama-3.3</h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>Last fallback. Ultra-fast inference. Full history rebuilt from DB. Zero visible disruption to your interview.</p>
              <span className="badge-muted" style={{ display: 'inline-block', marginTop: 12 }}>Fallback 2 · Ultra-fast</span>
            </div>
          </div>

          {/* Context flow */}
          <div style={{ marginTop: 40, background: '#fff', borderRadius: 16, padding: 32, border: '1px solid var(--gray2)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>How Context Is Preserved on Provider Switch</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { title: 'PostgreSQL', desc: 'All messages saved in neutral format' },
                { title: 'messageFormatter.js', desc: 'Converts to provider format on the fly' },
                { title: 'New Provider', desc: 'Receives full context — no gap' },
                { title: 'User sees nothing', desc: 'Interview continues seamlessly', highlight: true },
              ].reduce((acc, item, i, arr) => {
                acc.push(
                  <div key={item.title} style={{ background: item.highlight ? 'rgba(29,185,84,0.08)' : 'var(--gray)', border: item.highlight ? '1px solid rgba(29,185,84,0.2)' : 'none', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
                    <div style={{ fontWeight: 700, color: item.highlight ? 'var(--green-dark)' : 'var(--text)', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{item.desc}</div>
                  </div>
                );
                if (i < arr.length - 1) acc.push(<div key={`arrow-${i}`} style={{ color: 'var(--green)', fontSize: 20 }}>→</div>);
                return acc;
              }, [])}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '100px 60px' }}>
        <div className="section-inner">
          <div className="section-tag">TESTIMONIALS</div>
          <h2 className="section-title">What Students Say</h2>
          <p className="section-sub">Real stories from students who used PrepPilot and landed their dream placements.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 56 }}>
            {[
              { q: 'PrepPilot\'s DSA compiler round was exactly like the actual Razorpay interview. The detailed feedback after each answer helped me identify exactly where I was losing marks.', name: 'Nandini Kulkarni', role: 'SDE at Razorpay · 22 LPA', avatar: '/Images/avatars/testimonial-nandini.jpg' },
              { q: 'I loved that it adapted to my performance — when I scored well on DSA it went harder, which is exactly what FAANG interviews do. Cracked Google after 3 weeks of PrepPilot.', name: 'Rohan Sharma', role: 'SWE at Google · 42 LPA', avatar: '/Images/avatars/testimonial-rohan.jpg' },
              { q: 'The hiring recommendation was brutally accurate. Got "Borderline" on my first session, practiced the weak areas it identified, and got "Strong Hire" a week later. Then landed CRED.', name: 'Priya Joshi', role: 'Product Engineer at CRED · 28 LPA', avatar: '/Images/avatars/testimonial-priya.jpg' },
            ].map(t => (
              <div key={t.name} className="testi-card">
                <div style={{ fontSize: 32, color: 'var(--green)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 12 }}>"</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)', marginBottom: 20, fontStyle: 'italic' }}>{t.q}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={t.avatar} alt={t.name}
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { e.target.style.background = 'linear-gradient(135deg,#1DB954,#0F7A35)'; e.target.src = ''; }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.role}</div>
                  </div>
                </div>
>>>>>>> origin/v1.2
              </div>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-6 relative z-20 bg-surface-950 border-t border-surface-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need to <span className="gradient-text">Land the Offer</span>
          </h2>
          <p className="text-surface-200 text-center mb-16 max-w-2xl mx-auto">
            PrepPilot simulates real campus placement interviews with AI that's been trained
            on thousands of interview patterns.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass p-6 hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-surface-100 mb-2">{f.title}</h3>
                <p className="text-surface-200 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Interview Flow ─── */}
      <section className="py-20 px-6 border-t border-surface-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            How <span className="gradient-text">PrepPilot</span> Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose Your Track', desc: 'Select company type (Startup/MNC/FAANG) and role' },
              { step: '02', title: 'Face the AI', desc: '10 questions across 5 rounds with real-time scoring' },
              { step: '03', title: 'Code Live', desc: 'Solve LeetCode problems in a real editor with compiler' },
              { step: '04', title: 'Get Your Report', desc: 'Detailed breakdown, hiring recommendation, and study plan' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-bold text-primary-600/30 mb-2">{item.step}</div>
                <h3 className="font-semibold text-surface-100 mb-1">{item.title}</h3>
                <p className="text-surface-200 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto glass p-12 text-center glow">
          <h2 className="text-3xl font-bold mb-4">Ready to Practice?</h2>
          <p className="text-surface-200 mb-8">
            Create your free account and start your first mock interview in under 2 minutes.
          </p>
          <Link to="/register" className="btn-primary text-lg py-4 px-10">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-surface-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-surface-700">
            © 2026 PrepPilot. Built for campus placement success.
          </div>
          <div className="flex gap-6 text-sm text-surface-700">
            <Link to="/register" className="hover:text-primary-400 transition-colors">Register</Link>
            <Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link>
          </div>
        </div>
=======
      {/* ─── STUDENT STRIP ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '40px 60px', background: 'var(--gray)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500, marginRight: 8 }}>Join students from</span>
        {stripPhotos.map((src, i) => (
          <img key={i} src={src} alt="student"
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', transition: 'transform .2s', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.12)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onError={e => { e.target.style.background = 'linear-gradient(135deg,#1DB954,#0F7A35)'; e.target.src = ''; }}
          />
        ))}
        <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 8 }}>
          <strong style={{ color: 'var(--text)' }}>IITs, NITs, VITs</strong> and 200+ colleges across India
        </span>
      </div>

      {/* ─── CTA BANNER ───────────────────────────────────── */}
      <div style={{ margin: '0 60px 80px' }}>
        <div className="cta-banner">
          <h2 style={{ fontSize: 42, color: '#fff', fontWeight: 800, marginBottom: 16, position: 'relative' }}>
            Crack Your Dream Role —<br />One Session Away
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginBottom: 36, position: 'relative' }}>
            Join PrepPilot and step into your next placement interview with complete confidence.
          </p>
          <Link to="/register" className="btn-primary animate-pulse-glow" style={{ fontSize: 16, padding: '18px 40px', position: 'relative' }}>
            🚀 Start Free Interview
          </Link>
        </div>
      </div>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section id="faq" style={{ background: '#fff', padding: '100px 60px' }}>
        <div className="section-inner">
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div className="section-tag" style={{ textAlign: 'center' }}>FAQ</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Everything You Need to Know</h2>
            <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
              Learn how PrepPilot helps you prepare smarter for campus placements.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 56 }}>
            {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer style={{ background: 'var(--dark)', color: 'rgba(255,255,255,0.6)', padding: '60px 60px 40px' }}>
        <div style={{ display: 'flex', gap: 60, marginBottom: 48 }}>
          <div style={{ flex: '0 0 260px' }}>
            <a href="/" className="pp-logo pp-logo-dark" style={{ textDecoration: 'none', display: 'flex', marginBottom: 16 }}>
              PrepPilot<sup>AI</sup>
            </a>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.4)' }}>
              The AI-powered mock interview platform built specifically for Indian engineering students targeting campus placements.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 60, flex: 1 }}>
            {[
              { title: 'Platform', links: ['Mock Interview', 'DSA Compiler', 'Progress Dashboard', 'Interview Reports'] },
              { title: 'Quick Links', links: ['Home', 'How It Works', 'Features', 'FAQ'] },
              { title: 'Account', links: ['Sign In', 'Create Account', 'Dashboard'] },
            ].map(col => (
              <div key={col.title}>
                <h5 style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>{col.title}</h5>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ display: 'block', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 14, marginBottom: 12, transition: 'color .2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--green)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
                  >{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13 }}>© 2026 PrepPilot AI. All rights reserved.</p>
          <a href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color .2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--green)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
          >Back to the top ↑</a>
        </div>
>>>>>>> origin/v1.2
      </footer>
    </div>
  );
}
