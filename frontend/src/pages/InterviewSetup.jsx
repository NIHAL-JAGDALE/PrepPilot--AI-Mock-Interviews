import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../api/client';

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
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

<<<<<<< HEAD
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
export default function InterviewSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
<<<<<<< HEAD
  const [form, setForm] = useState({ company_type: 'startup', role_type: 'frontend', resume_text: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const { data } = await sessionAPI.extractResume(formData);
      setForm({ ...form, resume_text: data.text });
      setFileName(file.name);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload and parse resume.');
      setForm({ ...form, resume_text: '' });
      setFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
=======
<<<<<<< HEAD
  
  const [form, setForm] = useState({
    company_type: 'startup',
    role_type: 'frontend',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
  };

  const handleStart = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    setLoading(true); setError('');
=======
    setLoading(true);
    setError('');

=======
  const [form, setForm] = useState({ company_type: 'startup', role_type: 'frontend' });

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
    try {
      const { data } = await sessionAPI.start(form);
      navigate(`/interview/${data.session_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview. Please try again.');
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
=======
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/dashboard" className="inline-block text-surface-400 hover:text-surface-200 transition-colors mb-6 text-sm font-medium">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-surface-100 mb-2">Configure Interview</h1>
          <p className="text-surface-300 text-sm">
            Tailor the AI interviewer to your target role and company type.
          </p>
        </div>

        <div className="glass p-8 glow">
          <form onSubmit={handleStart} className="space-y-6">
            
            <div>
              <label htmlFor="company_type" className="block text-sm font-medium text-surface-200 mb-2">
                Target Company Type
              </label>
              <select
                id="company_type"
                name="company_type"
                value={form.company_type}
                onChange={handleChange}
                className="input-field cursor-pointer appearance-none bg-surface-900"
              >
                <option value="startup">Startup (Fast-paced, practical questions)</option>
                <option value="mnc">MNC (Standardized, domain knowledge)</option>
                <option value="faang">FAANG (Deep DSA, system design)</option>
              </select>
            </div>

            <div>
              <label htmlFor="role_type" className="block text-sm font-medium text-surface-200 mb-2">
                Role Focus
              </label>
              <select
                id="role_type"
                name="role_type"
                value={form.role_type}
                onChange={handleChange}
                className="input-field cursor-pointer appearance-none bg-surface-900"
              >
                <option value="frontend">Frontend Developer (React, DOM, JS)</option>
                <option value="backend">Backend Developer (APIs, DBs, Node.js)</option>
                <option value="fullstack">Full-Stack Developer (End-to-End)</option>
                <option value="dsa_focus">DSA Heavy (Algorithmic problem solving)</option>
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
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

<<<<<<< HEAD
            {/* Resume Input - File Upload */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>3</span>
                <span style={{ width: 24, height: 2, background: 'var(--green)', display: 'inline-block', borderRadius: 2 }} />
                Your Resume (Required)
              </div>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{
                  width: '100%',
                  border: `2px dashed ${dragActive ? 'var(--green)' : 'var(--gray2)'}`,
                  borderRadius: 16,
                  padding: '40px 24px',
                  textAlign: 'center',
                  background: dragActive ? 'rgba(29,185,84,0.05)' : '#fff',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt" 
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
                
                {isUploading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 30, height: 30, border: '3px solid rgba(29,185,84,0.2)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                    <p style={{ margin: 0, color: 'var(--text)', fontWeight: 600 }}>Extracting Resume Data...</p>
                  </div>
                ) : fileName ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 32 }}>📄</div>
                    <p style={{ margin: 0, color: 'var(--text)', fontWeight: 700 }}>{fileName}</p>
                    <p style={{ margin: 0, color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>✓ Uploaded successfully. Click or drag to replace.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 40 }}>📄</div>
                    <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 18, fontFamily: 'Sora, sans-serif' }}>Drag & Drop your Resume</h3>
                    <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>or click to browse from your computer</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, background: 'var(--gray)', padding: '2px 8px', borderRadius: 4, fontWeight: 600, color: 'var(--muted)' }}>PDF</span>
                      <span style={{ fontSize: 11, background: 'var(--gray)', padding: '2px 8px', borderRadius: 4, fontWeight: 600, color: 'var(--muted)' }}>DOC</span>
                      <span style={{ fontSize: 11, background: 'var(--gray)', padding: '2px 8px', borderRadius: 4, fontWeight: 600, color: 'var(--muted)' }}>DOCX</span>
                      <span style={{ fontSize: 11, background: 'var(--gray)', padding: '2px 8px', borderRadius: 4, fontWeight: 600, color: 'var(--muted)' }}>TXT</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
            {/* Info box */}
            <div style={{ background: 'rgba(29,185,84,0.06)', border: '1px solid rgba(29,185,84,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>ℹ️</span>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
<<<<<<< HEAD
                <strong>Your interview will include:</strong> 3 rounds with variable question counts (minimum 16 total), with real-time adaptive difficulty and live DSA coding.
=======
                <strong>Your interview will include:</strong> 5 rounds (10 questions total), with live DSA rounds (turns 2–4) that feature a Monaco editor + Judge0 compiler. Estimated time: 45 minutes.
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: 14, marginBottom: 24 }}>
<<<<<<< HEAD
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
                {error}
              </div>
            )}

            <button
              type="submit"
<<<<<<< HEAD
              disabled={loading || isUploading || !form.resume_text}
=======
              disabled={loading}
<<<<<<< HEAD
              className="btn-primary w-full py-3.5 text-lg shadow-lg shadow-primary-500/20 mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Preparing AI...
                </span>
              ) : (
                'Start Interview 🚀'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-800 text-center">
            <p className="text-xs text-surface-400">
              The interview consists of 5 rounds (10 questions). Ensure you have ~45 minutes of uninterrupted time.
            </p>
          </div>
        </div>
      </div>
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
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
<<<<<<< HEAD
=======
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
    </div>
  );
}
