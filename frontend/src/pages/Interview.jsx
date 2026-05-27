import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../api/client';
import ChatBubble from '../components/ChatBubble';
import EvalCard from '../components/EvalCard';
import ProviderBadge from '../components/ProviderBadge';
import TokenStats from '../components/TokenStats';
import DSAPanel from '../components/DSAPanel';

<<<<<<< HEAD
const ROUND_NAMES = {
  0: "Preparing...",
  1: "Round 1 — Introduction & DSA",
  2: "Round 2 — Technical Round",
  3: "Round 3 — HR & Behavioral",
};

// ─── TYPING INDICATOR ────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start', animation: 'fadeIn .35s ease' }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, marginTop: 2 }}>🎯</div>
      <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: '4px 18px 18px 18px', padding: '14px 18px', display: 'flex', gap: 4, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {[0, 180, 360].map(delay => (
           <div key={delay} style={{ width: 7, height: 7, borderRadius: '50%', background: '#CBD5E1', animation: `float1 1.2s ${delay}ms ease-in-out infinite` }} />
        ))}
=======
// DSA turn numbers per backend logic
const DSA_TURNS = [2, 3, 4];

// DSAProblemStub removed — real DSAPanel used below

// ─── TYPING INDICATOR ────────────────────────────────────
function TypingIndicator({ provider }) {
  return (
<<<<<<< HEAD
    <div className="flex items-start gap-3 mb-6">
      <div className="glass px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        {provider && (
          <span className="ml-1">
=======
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
>>>>>>> origin/v1.2
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
<<<<<<< HEAD
    <div className="flex items-center gap-2">
      <span className="text-xs text-surface-400 font-medium whitespace-nowrap">
        Turn {turn}/{max}
      </span>
      <div className="w-20 h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
=======
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        Turn {turn}/{max}
      </span>
      <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 4, transition: 'width .5s' }} />
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
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

<<<<<<< HEAD
  const [chatWidth, setChatWidth] = useState(50);

  const startMainResize = useCallback((e) => {
    e.preventDefault();
    const onMouseMove = (moveEvent) => {
      let newWidth = (moveEvent.clientX / window.innerWidth) * 100;
      if (newWidth < 20) newWidth = 20;
      if (newWidth > 80) newWidth = 80;
      setChatWidth(newWidth);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
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
<<<<<<< HEAD
    if (inputRef.current) {
        inputRef.current.style.height = 'auto'; // reset height
    }
=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
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

<<<<<<< HEAD
      // Sync session round from backend
      if (data.current_round !== undefined) {
        setSession(prev => ({ ...prev, current_round: data.current_round }));
        // Clear DSA problem when leaving Round 1
        if (data.current_round !== 1) {
          setActiveDsaProblem(null);
        }
      }

=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
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

<<<<<<< HEAD
  const sendCommand = (cmd) => {
    if (sending) return;
    setInput(cmd);
    setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        // We simulate the click by directly passing the command instead of relying on state
        handleSendCommand(cmd);
    }, 10);
  };

  const handleSendCommand = async (cmd) => {
    if (sending) return;
    setInput('');
    setSending(true);

    const userMsg = { role: 'user', content: cmd };
    setMessages(prev => [...prev, userMsg]);

    try {
      const { data } = await sessionAPI.sendMessage(id, cmd);
      setCurrentProvider(data.provider || 'claude');
      setCurrentModel(data.model || '');
      setTurnCount(data.turn_count);
      setLatestCacheStatus(data.cache_status);
      if (data.session) setSession(data.session);

      // Sync session round from backend
      if (data.current_round !== undefined) {
        setSession(prev => ({ ...prev, current_round: data.current_round }));
        // Clear DSA problem when leaving Round 1
        if (data.current_round !== 1) {
          setActiveDsaProblem(null);
        }
      }

      if (data.dsa_problem) setActiveDsaProblem(data.dsa_problem);

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

      if (data.is_complete) {
        setTimeout(() => navigate(`/report/${id}`), 2500);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${err.response?.data?.error || 'Failed.'}`,
        provider: currentProvider,
      }]);
    } finally {
      setSending(false);
    }
  }

=======
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
<<<<<<< HEAD
      <div style={{ minHeight: '100vh', background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(29,185,84,0.2)', borderTopColor: '#1DB954', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7A99', fontSize: 14 }}>Loading session...</p>
=======
<<<<<<< HEAD
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-300 text-sm">Loading session...</p>
=======
      <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(29,185,84,0.2)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Loading session...</p>
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        </div>
      </div>
    );
  }

  if (error) {
    return (
<<<<<<< HEAD
      <div style={{ minHeight: '100vh', background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <p style={{ color: '#EF4444', marginBottom: 20, fontSize: 15 }}>{error}</p>
          <Link to="/dashboard" style={{ padding: '12px 24px', background: '#1DB954', color: '#fff', borderRadius: 50, textDecoration: 'none', fontWeight: 600 }}>← Dashboard</Link>
=======
<<<<<<< HEAD
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 text-center max-w-sm w-full">
          <p className="text-danger-400 mb-4">{error}</p>
          <Link to="/dashboard" className="btn-secondary py-2 px-4">← Dashboard</Link>
=======
      <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <p style={{ color: '#f87171', marginBottom: 20, fontSize: 15 }}>{error}</p>
          <Link to="/dashboard" className="btn-secondary" style={{ display: 'inline-flex' }}>← Dashboard</Link>
>>>>>>> origin/v1.2
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  const isCompleted = session?.status === 'completed';
  const isDSATurn = session?.current_round === 1 && activeDsaProblem && !isCompleted;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F5F7FA', fontFamily: 'DM Sans, sans-serif' }}>
      
      {/* NAV */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', background: '#fff', borderBottom: '1px solid #E8ECF2', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 15, color: '#1A2B4A' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, color: 'inherit' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎯</div>
            PrepPilot<sup style={{ fontSize: 8, background: '#1DB954', color: '#fff', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>AI</sup>
          </Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProviderBadge provider={currentProvider} model={currentModel} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 11, color: '#6B7A99' }}>Turn {turnCount}</div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ width: 18, height: 3, borderRadius: 3, display: 'inline-block', background: i < (session?.current_round || 1) - 1 ? '#1DB954' : (i === (session?.current_round || 1) - 1 ? '#86EFAC' : '#E2E8F0') }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TokenStats cacheStatus={latestCacheStatus} />
          <button onClick={() => navigate(`/report/${id}`)} style={{ padding: '7px 14px', borderRadius: 50, border: '1.5px solid #FCA5A5', background: '#FFF5F5', color: '#EF4444', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all .2s' }}>End Interview</button>
        </div>
      </div>

      {/* SUB BAR */}
      {session && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 28px', background: '#fff', borderBottom: '1px solid #E8ECF2', flexShrink: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 50, fontFamily: 'Sora, sans-serif' }}>
            <span style={{ width: 6, height: 6, background: '#1DB954', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }}></span>
            <span>{ROUND_NAMES[session.current_round || 1] || "Interview"}</span>
          </div>
          <div style={{ fontSize: 11, color: '#6B7A99' }}>
            Session: <strong style={{ color: '#1A2B4A', textTransform: 'capitalize' }}>{session.company_type} · {session.role_type?.replace('_', ' ')}</strong> · <span style={{ color: '#16A34A', fontWeight: 600 }}>Active</span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT SPLIT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT COLUMN: Chat Area + Input */}
        <div style={{ width: (isDSATurn && activeDsaProblem) ? `${chatWidth}%` : '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div id="chat-area" style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 12px' }}>
            {messages.length === 0 && !sending && (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
                <p style={{ color: '#6B7A99', fontSize: 15 }}>The interviewer is preparing your first question...</p>
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
                   <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16, padding: 20, textAlign: 'center', margin: '0 auto 24px', maxWidth: '80%', animation: 'fadeIn .5s ease' }}>
                    <p style={{ color: '#16A34A', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>🎉 Interview Complete!</p>
                    <p style={{ color: '#6B7A99', fontSize: 14 }}>Redirecting to your detailed report...</p>
                  </div>
                )}
              </div>
            ))}
            {sending && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          {!isCompleted && (
            <div style={{ flexShrink: 0, padding: '12px 28px 16px', background: '#fff', borderTop: '1px solid #E8ECF2' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ flex: 1, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'flex-end', gap: 8, transition: 'border-color .25s' }}
                     onFocus={e => e.currentTarget.style.borderColor = '#1DB954'}
                     onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    placeholder={isDSATurn ? 'Describe your approach or solve in the editor right...' : 'Type your answer here… (Enter to send, Shift+Enter for new line)'}
                    rows={1}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#1A2B4A', fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, lineHeight: 1.6, resize: 'none', minHeight: 20, maxHeight: 90, overflowY: 'auto' }}
                  />
                </div>
                <button
                   onClick={handleSend}
                   disabled={sending || !input.trim()}
                   style={{ width: 42, height: 42, borderRadius: 12, border: 'none', background: '#1DB954', color: '#fff', fontSize: 16, fontWeight: 700, cursor: (sending || !input.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s', opacity: (sending || !input.trim()) ? 0.4 : 1, boxShadow: (sending || !input.trim()) ? 'none' : '0 3px 10px rgba(29,185,84,0.25)' }}
                >
                  {sending ? '...' : '↑'}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, maxWidth: 1200, margin: '10px auto 0' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => sendCommand('hint')} disabled={sending} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: sending ? 'not-allowed' : 'pointer' }}>💡 Hint</button>
                  <button onClick={() => sendCommand('skip')} disabled={sending} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: sending ? 'not-allowed' : 'pointer' }}>⏭️ Skip</button>
                  <button onClick={() => sendCommand('next round')} disabled={sending} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: sending ? 'not-allowed' : 'pointer' }}>⏩ Next Round</button>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#9CA3AF' }}>
                  <span>Enter to send · Shift+Enter for new line</span>
                  {isDSATurn && <span>🧩 DSA Round</span>}
                  {input.length > 0 && <span>{input.length} chars</span>}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* SPLITTER */}
        {isDSATurn && activeDsaProblem && (
          <div 
            onMouseDown={startMainResize}
            style={{ width: 6, background: '#E2E8F0', cursor: 'col-resize', transition: 'background .2s', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1DB954'}
            onMouseLeave={e => e.currentTarget.style.background = '#E2E8F0'}
          >
             <div style={{ width: 2, height: 24, background: '#CBD5E1', borderRadius: 4 }} />
          </div>
        )}

        {/* RIGHT COLUMN: DSA Panel (conditionally rendered) */}
        {isDSATurn && activeDsaProblem && (
          <div style={{ width: `${100 - chatWidth}%`, background: '#fff', display: 'flex', flexDirection: 'column' }}>
=======
  const isDSATurn = DSA_TURNS.includes(turnCount);
  const isCompleted = session?.status === 'completed';

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col">
      {/* ─── TOP BAR ───────────────────────────────────────── */}
      <header className="glass-sm border-b border-surface-800 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">

          {/* Left: logo + session info */}
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/dashboard" className="text-surface-400 hover:text-surface-200 transition-colors flex-shrink-0">
              ✈️
            </Link>
            {session && (
              <div className="text-xs text-surface-400 truncate">
                <span className="capitalize font-medium text-surface-200">{session.company_type}</span>
                <span className="mx-1 text-surface-600">/</span>
                <span className="capitalize">{session.role_type?.replace('_', ' ')}</span>
=======
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
>>>>>>> origin/v1.2
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* Center: provider badge + turn counter */}
          <div className="flex items-center gap-4">
=======
          {/* Center: provider + turns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
>>>>>>> origin/v1.2
            <ProviderBadge provider={currentProvider} model={currentModel} size="sm" />
            <TurnCounter turn={turnCount} max={10} />
          </div>

<<<<<<< HEAD
          {/* Right: cache savings */}
          <div className="hidden md:block">
=======
          {/* Right: token stats */}
          <div>
>>>>>>> origin/v1.2
            <TokenStats cacheStatus={latestCacheStatus} />
          </div>
        </div>
      </header>

<<<<<<< HEAD
      {/* ─── MAIN CONTENT ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 pb-4">

        {/* DSA Panel — full Monaco split-screen for DSA turns */}
        {isDSATurn && activeDsaProblem && (
          <div className="pt-4" style={{ height: '480px' }}>
            <DSAPanel
              problem={activeDsaProblem}
              sessionId={id}
              onSubmitCode={handleCodeRun}
            />
          </div>
        )}

        {/* ─── CHAT AREA ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto py-6 space-y-0">
          {messages.length === 0 && !sending && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🤖</div>
              <p className="text-surface-300">The interviewer is preparing your first question...</p>
=======
      {/* ─── MAIN CONTENT ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 1000, width: '100%', margin: '0 auto', padding: '0 16px 16px' }}>

        {/* DSA Panel */}
        {isDSATurn && activeDsaProblem && (
          <div style={{ paddingTop: 16, height: 480 }}>
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
            <DSAPanel problem={activeDsaProblem} sessionId={id} onSubmitCode={handleCodeRun} />
          </div>
        )}

<<<<<<< HEAD
=======
        {/* ─── CHAT AREA ─────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', minHeight: 240 }}>
          {messages.length === 0 && !sending && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>The interviewer is preparing your first question...</p>
>>>>>>> origin/v1.2
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx}>
              <ChatBubble
<<<<<<< HEAD
                role={msg.role}
                content={msg.content}
                provider={msg.provider}
                model={msg.model}
                cacheStatus={msg.cacheStatus}
                tokenStats={msg.tokenStats}
              />

              {/* DSA panel shown via activeDsaProblem state — no inline stub needed */}

              {/* Completion banner */}
              {msg.role === 'assistant' && msg.isComplete && (
                <div className="glass p-4 rounded-xl border border-accent-500/30 text-center mb-6 animate-fade-in">
                  <p className="text-accent-400 font-semibold mb-1">🎉 Interview Complete!</p>
                  <p className="text-surface-300 text-sm">Redirecting to your report...</p>
=======
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
>>>>>>> origin/v1.2
                </div>
              )}
            </div>
          ))}

<<<<<<< HEAD
          {/* Typing indicator */}
          {sending && <TypingIndicator provider={currentProvider} />}

          <div ref={chatEndRef} />
        </div>

        {/* ─── INPUT AREA ────────────────────────────────── */}
        {!isCompleted && (
          <div className="pt-2 pb-2">
            <div className="glass rounded-2xl p-1 border border-surface-700 focus-within:border-primary-500/50 transition-colors">
              <div className="flex items-end gap-2 p-2">
=======
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
>>>>>>> origin/v1.2
                <textarea
                  ref={inputRef}
                  id="interview-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
<<<<<<< HEAD
                  placeholder={
                    isDSATurn
                      ? 'Describe your approach or paste code (Monaco editor coming in Step 24)...'
                      : 'Type your answer... (Enter to send, Shift+Enter for new line)'
                  }
                  rows={3}
                  className="flex-1 bg-transparent resize-none outline-none text-surface-100 text-sm placeholder:text-surface-600 leading-relaxed p-1 min-h-[60px] max-h-[160px]"
=======
                  placeholder={isDSATurn ? 'Describe your approach or explain your solution...' : 'Type your answer... (Enter to send, Shift+Enter for new line)'}
                  rows={3}
                  style={{
                    flex: 1, background: 'transparent', resize: 'none', outline: 'none',
                    color: '#fff', fontSize: 14, lineHeight: 1.7,
                    padding: '4px 8px', minHeight: 60, maxHeight: 160,
                    fontFamily: 'DM Sans, sans-serif',
                    border: 'none',
                  }}
>>>>>>> origin/v1.2
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
<<<<<<< HEAD
                  className="btn-primary py-2.5 px-5 flex-shrink-0 self-end text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                  ) : 'Send →'}
                </button>
              </div>
              <div className="px-3 pb-2 flex items-center justify-between">
                <p className="text-xs text-surface-600">
                  {isDSATurn ? '🧩 DSA Round — solve in the editor or describe your approach' : 'Press Enter to send'}
                </p>
                {input.length > 0 && (
                  <span className="text-xs text-surface-600">{input.length} chars</span>
=======
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
>>>>>>> origin/v1.2
                )}
              </div>
            </div>
          </div>
        )}
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
      </div>
    </div>
  );
}
