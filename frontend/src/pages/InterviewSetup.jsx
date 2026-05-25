import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../api/client';

const COMPANY_OPTIONS = [
  {
    value: 'startup',
    icon: '🚀',
    title: 'Startup',
    desc: 'Fast-paced, practical questions, ownership mindset, full-stack thinking.',
    tags: ['Medium DSA', 'System Thinking', 'Practical'],
  },
  {
    value: 'mnc',
    icon: '🏢',
    title: 'MNC',
    desc: 'CS fundamentals, DBMS, OS, CN, SQL — TCS/Infosys/Wipro patterns.',
    tags: ['CS Fundamentals', 'DBMS', 'SDLC'],
  },
  {
    value: 'faang',
    icon: '⭐',
    title: 'FAANG',
    desc: 'Deep DSA, system design at scale, Big-O, distributed systems.',
    tags: ['Hard DSA', 'System Design', 'Big-O'],
  },
];

const ROLE_OPTIONS = [
  { value: 'frontend', icon: '🖥️', title: 'Frontend Developer', desc: 'React, DOM, JavaScript, browser APIs, CSS' },
  { value: 'backend', icon: '⚙️', title: 'Backend Developer', desc: 'APIs, databases, Node.js, cloud, microservices' },
  { value: 'fullstack', icon: '🔗', title: 'Full-Stack Developer', desc: 'End-to-end development, architecture decisions' },
  { value: 'dsa_focus', icon: '🧩', title: 'DSA Heavy', desc: 'Algorithmic problem solving, competitive programming style' },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ company_type: 'startup', role_type: 'frontend' });

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await sessionAPI.start(form);
      navigate(`/interview/${data.session_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--gray2)', padding: '16px 48px',
        display: 'flex', alignItems: 'center', gap: 24
      }}>
        <Link to="/dashboard" style={{
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text)'
        }}>
          PrepPilot<sup style={{ fontSize: 10, background: 'var(--green)', color: '#fff', padding: '2px 5px', borderRadius: 4, fontWeight: 700, verticalAlign: 'super', marginLeft: 2 }}>AI</sup>
        </Link>
        <span style={{ color: 'var(--gray2)', fontSize: 20 }}>›</span>
        <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>Configure Interview</span>
      </header>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '60px 24px' }}>
        <div style={{ width: '100%', maxWidth: 740, animation: 'fadeIn .5s ease' }}>

          {/* Back */}
          <Link to="/dashboard" style={{
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--muted)', fontSize: 14, fontWeight: 500, marginBottom: 32,
            transition: 'color .2s'
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            ← Back to Dashboard
          </Link>

          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(29,185,84,0.1)', color: 'var(--green-dark)',
              padding: '6px 16px', borderRadius: 50, fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16
            }}>
              <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              Configure Your Session
            </div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
              Set Up Your Interview
            </h1>
            <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.6 }}>
              Tailor the AI interviewer to your target company and role. The interview adapts to your selections in real time.
            </p>
          </div>

          <form onSubmit={handleStart}>
            {/* Company Type */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>1</span>
                <span style={{ width: 24, height: 2, background: 'var(--green)', display: 'inline-block', borderRadius: 2 }} />
                Target Company Type
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {COMPANY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, company_type: opt.value })}
                    style={{
                      background: form.company_type === opt.value ? '#fff' : '#fff',
                      border: form.company_type === opt.value ? '2px solid var(--green)' : '2px solid var(--gray2)',
                      borderRadius: 16, padding: '22px 20px', textAlign: 'left', cursor: 'pointer',
                      transition: 'all .2s', boxShadow: form.company_type === opt.value ? 'var(--shadow)' : 'none',
                      transform: form.company_type === opt.value ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{opt.icon}</div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{opt.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12 }}>{opt.desc}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {opt.tags.map(t => (
                        <span key={t} style={{
                          padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                          background: form.company_type === opt.value ? 'rgba(29,185,84,0.1)' : 'var(--gray)',
                          color: form.company_type === opt.value ? 'var(--green-dark)' : 'var(--muted)'
                        }}>{t}</span>
                      ))}
                    </div>
                    {form.company_type === opt.value && (
                      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                        <span>✓</span> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Type */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>2</span>
                <span style={{ width: 24, height: 2, background: 'var(--green)', display: 'inline-block', borderRadius: 2 }} />
                Role Focus
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, role_type: opt.value })}
                    style={{
                      background: '#fff',
                      border: form.role_type === opt.value ? '2px solid var(--green)' : '2px solid var(--gray2)',
                      borderRadius: 16, padding: '20px 20px', textAlign: 'left', cursor: 'pointer',
                      transition: 'all .2s', display: 'flex', gap: 16, alignItems: 'flex-start',
                      boxShadow: form.role_type === opt.value ? 'var(--shadow)' : 'none',
                      transform: form.role_type === opt.value ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{opt.icon}</div>
                    <div>
                      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{opt.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{opt.desc}</div>
                      {form.role_type === opt.value && (
                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✓ Selected</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div style={{ background: 'rgba(29,185,84,0.06)', border: '1px solid rgba(29,185,84,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>ℹ️</span>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
                <strong>Your interview will include:</strong> 5 rounds (10 questions total), with live DSA rounds (turns 2–4) that feature a Monaco editor + Judge0 compiler. Estimated time: 45 minutes.
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: 14, marginBottom: 24 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: 16, fontWeight: 700, borderRadius: 14, fontFamily: 'Sora, sans-serif' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <span style={{ display: 'inline-block', width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  Preparing AI Interviewer...
                </span>
              ) : '🎯 Start Interview Now →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
