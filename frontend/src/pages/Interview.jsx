import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../api/client';
import ChatBubble from '../components/ChatBubble';
import EvalCard from '../components/EvalCard';
import ProviderBadge from '../components/ProviderBadge';
import TokenStats from '../components/TokenStats';
import DSAPanel from '../components/DSAPanel';

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
    if (inputRef.current) {
        inputRef.current.style.height = 'auto'; // reset height
    }
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

      // Sync session round from backend
      if (data.current_round !== undefined) {
        setSession(prev => ({ ...prev, current_round: data.current_round }));
        // Clear DSA problem when leaving Round 1
        if (data.current_round !== 1) {
          setActiveDsaProblem(null);
        }
      }

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(29,185,84,0.2)', borderTopColor: '#1DB954', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7A99', fontSize: 14 }}>Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
            <DSAPanel problem={activeDsaProblem} sessionId={id} onSubmitCode={handleCodeRun} />
          </div>
        )}

      </div>
    </div>
  );
}
