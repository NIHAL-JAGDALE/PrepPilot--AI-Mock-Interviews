import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../api/client';
import ChatBubble from '../components/ChatBubble';
import EvalCard from '../components/EvalCard';
import ProviderBadge from '../components/ProviderBadge';
import TokenStats from '../components/TokenStats';
import DSAPanel from '../components/DSAPanel';

// DSA turn numbers per backend logic
const DSA_TURNS = [2, 3, 4];

// DSAProblemStub removed — real DSAPanel used below

// ─── TYPING INDICATOR ────────────────────────────────────
function TypingIndicator({ provider }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
      <div style={{
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '18px 18px 18px 4px', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        {[0, 150, 300].map(delay => (
          <span key={delay} style={{
            width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
            display: 'inline-block', animation: `bounce .9s ${delay}ms ease-in-out infinite`
          }} />
        ))}
        {provider && (
          <span style={{ marginLeft: 4 }}>
            <ProviderBadge provider={provider} size="sm" />
          </span>
        )}
      </div>
    </div>
  );
}

// ─── TURN COUNTER ────────────────────────────────────────
function TurnCounter({ turn, max = 10 }) {
  const pct = Math.min(100, (turn / max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        Turn {turn}/{max}
      </span>
      <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 4, transition: 'width .5s' }} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN INTERVIEW PAGE
// ════════════════════════════════════════════════════════════
export default function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── Session state ──
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Chat state ──
  // Each entry: { role, content, provider, model, cacheStatus, tokenStats, evalCard?, dsaProblem? }
  const [messages, setMessages] = useState([]);

  // ── Input state ──
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  // ── Last compiler run result (auto-appended to next message) ──
  const [lastRunResult, setLastRunResult] = useState(null);

  // ── Live stats (updated per response) ──
  const [currentProvider, setCurrentProvider] = useState('claude');
  const [currentModel, setCurrentModel] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [latestCacheStatus, setLatestCacheStatus] = useState(null);
  const [activeDsaProblem, setActiveDsaProblem] = useState(null);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Load session on mount ──
  useEffect(() => {
    loadSession();
  }, [id]);

  // ── Auto-scroll to bottom on new messages ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadSession = async () => {
    try {
      const { data } = await sessionAPI.getById(id);
      setSession(data.session);
      setTurnCount(data.session.turn_count);
      setCurrentProvider(data.session.current_provider || 'claude');

      // If session already completed, redirect to report
      if (data.session.status === 'completed') {
        navigate(`/report/${id}`, { replace: true });
        return;
      }

      // Reconstruct chat from message history
      if (data.messages?.length > 0) {
        const reconstructed = data.messages.map(m => ({
          role: m.role,
          content: m.content,
          provider: m.provider || null,
          cacheStatus: null,
          tokenStats: null,
        }));
        setMessages(reconstructed);
      }

      // Restore last active DSA problem
      if (data.dsa_problems?.length > 0) {
        const lastDsa = data.dsa_problems[data.dsa_problems.length - 1];
        setActiveDsaProblem(lastDsa);
      }
    } catch (err) {
      setError('Failed to load session. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Compiler result callback from DSAPanel ──
  const handleCodeRun = useCallback((runData) => {
    setLastRunResult(runData);
  }, []);

  // ── Send user message ──
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    // Append compiler result to message if available
    let finalContent = trimmed;
    if (lastRunResult) {
      finalContent += `\n\n[Code Submission — ${lastRunResult.language}]\n\`\`\`\n${lastRunResult.code}\n\`\`\`\nResult: ${lastRunResult.result.status}${lastRunResult.result.stdout ? `\nOutput: ${lastRunResult.result.stdout}` : ''}`;
      setLastRunResult(null);
    }

    setInput('');
    setSending(true);

    // Optimistically add user message to chat
    const userMsg = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);

    try {
      const { data } = await sessionAPI.sendMessage(id, finalContent);

      // Update live stats
      setCurrentProvider(data.provider || 'claude');
      setCurrentModel(data.model || '');
      setTurnCount(data.turn_count);
      setLatestCacheStatus(data.cache_status);

      // Track DSA problem for this turn
      if (data.dsa_problem) {
        setActiveDsaProblem(data.dsa_problem);
      }

      // Add assistant reply to chat
      const assistantMsg = {
        role: 'assistant',
        content: data.reply,
        provider: data.provider,
        model: data.model,
        cacheStatus: data.cache_status,
        tokenStats: data.token_stats,
        dsaProblem: data.dsa_problem || null,
        isComplete: data.is_complete,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Auto-redirect on completion
      if (data.is_complete) {
        setTimeout(() => navigate(`/report/${id}`), 2500);
      }
    } catch (err) {
      const errText = err.response?.data?.error || 'Failed to send message. Please try again.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errText}`,
        provider: currentProvider,
      }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(29,185,84,0.2)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <p style={{ color: '#f87171', marginBottom: 20, fontSize: 15 }}>{error}</p>
          <Link to="/dashboard" className="btn-secondary" style={{ display: 'inline-flex' }}>← Dashboard</Link>
        </div>
      </div>
    );
  }

  const isDSATurn = DSA_TURNS.includes(turnCount);
  const isCompleted = session?.status === 'completed';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* ─── TOP BAR ─────────────────────────────────────────── */}
      <header style={{
        background: 'rgba(10,22,40,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 24px', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Left: logo + session info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 20, flexShrink: 0, transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--green)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
            >
              🎯
            </Link>
            <a href="/" style={{ textDecoration: 'none', fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>
              PrepPilot<sup style={{ fontSize: 9, background: 'var(--green)', color: '#fff', padding: '1px 4px', borderRadius: 3, fontWeight: 700, verticalAlign: 'super', marginLeft: 2 }}>AI</sup>
            </a>
            {session && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{session.company_type}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <span style={{ textTransform: 'capitalize' }}>{session.role_type?.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          {/* Center: provider + turns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ProviderBadge provider={currentProvider} model={currentModel} size="sm" />
            <TurnCounter turn={turnCount} max={10} />
          </div>

          {/* Right: token stats */}
          <div>
            <TokenStats cacheStatus={latestCacheStatus} />
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 1000, width: '100%', margin: '0 auto', padding: '0 16px 16px' }}>

        {/* DSA Panel */}
        {isDSATurn && activeDsaProblem && (
          <div style={{ paddingTop: 16, height: 480 }}>
            <DSAPanel problem={activeDsaProblem} sessionId={id} onSubmitCode={handleCodeRun} />
          </div>
        )}

        {/* ─── CHAT AREA ─────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', minHeight: 240 }}>
          {messages.length === 0 && !sending && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>The interviewer is preparing your first question...</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx}>
              <ChatBubble
                role={msg.role} content={msg.content}
                provider={msg.provider} model={msg.model}
                cacheStatus={msg.cacheStatus} tokenStats={msg.tokenStats}
              />

              {msg.role === 'assistant' && msg.isComplete && (
                <div style={{
                  background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.3)',
                  borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 24,
                  animation: 'fadeIn .5s ease'
                }}>
                  <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>🎉 Interview Complete!</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Redirecting to your detailed report...</p>
                </div>
              )}
            </div>
          ))}

          {sending && <TypingIndicator provider={currentProvider} />}
          <div ref={chatEndRef} />
        </div>

        {/* ─── INPUT AREA ────────────────────────────────────── */}
        {!isCompleted && (
          <div style={{ paddingTop: 8, paddingBottom: 8 }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: 4, transition: 'border-color .2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: 8 }}>
                <textarea
                  ref={inputRef}
                  id="interview-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  placeholder={isDSATurn ? 'Describe your approach or explain your solution...' : 'Type your answer... (Enter to send, Shift+Enter for new line)'}
                  rows={3}
                  style={{
                    flex: 1, background: 'transparent', resize: 'none', outline: 'none',
                    color: '#fff', fontSize: 14, lineHeight: 1.7,
                    padding: '4px 8px', minHeight: 60, maxHeight: 160,
                    fontFamily: 'DM Sans, sans-serif',
                    border: 'none',
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="btn-primary"
                  style={{
                    padding: '10px 20px', flexShrink: 0, alignSelf: 'flex-end',
                    fontSize: 14, borderRadius: 12,
                    opacity: (sending || !input.trim()) ? 0.4 : 1,
                    cursor: (sending || !input.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {sending ? (
                    <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  ) : 'Send →'}
                </button>
              </div>
              <div style={{ padding: '0 12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                  {isDSATurn ? '🧩 DSA Round — solve in the editor above or describe your approach' : 'Enter to send · Shift+Enter for new line'}
                </p>
                {input.length > 0 && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{input.length} chars</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
