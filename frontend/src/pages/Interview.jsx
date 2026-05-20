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
    <div className="flex items-start gap-3 mb-6">
      <div className="glass px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        {provider && (
          <span className="ml-1">
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
    <div className="flex items-center gap-2">
      <span className="text-xs text-surface-400 font-medium whitespace-nowrap">
        Turn {turn}/{max}
      </span>
      <div className="w-20 h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-300 text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 text-center max-w-sm w-full">
          <p className="text-danger-400 mb-4">{error}</p>
          <Link to="/dashboard" className="btn-secondary py-2 px-4">← Dashboard</Link>
        </div>
      </div>
    );
  }

  const isDSATurn = DSA_TURNS.includes(turnCount);
  const isCompleted = session?.status === 'completed';

  return (
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
              </div>
            )}
          </div>

          {/* Center: provider badge + turn counter */}
          <div className="flex items-center gap-4">
            <ProviderBadge provider={currentProvider} model={currentModel} size="sm" />
            <TurnCounter turn={turnCount} max={10} />
          </div>

          {/* Right: cache savings */}
          <div className="hidden md:block">
            <TokenStats cacheStatus={latestCacheStatus} />
          </div>
        </div>
      </header>

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
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx}>
              <ChatBubble
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
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {sending && <TypingIndicator provider={currentProvider} />}

          <div ref={chatEndRef} />
        </div>

        {/* ─── INPUT AREA ────────────────────────────────── */}
        {!isCompleted && (
          <div className="pt-2 pb-2">
            <div className="glass rounded-2xl p-1 border border-surface-700 focus-within:border-primary-500/50 transition-colors">
              <div className="flex items-end gap-2 p-2">
                <textarea
                  ref={inputRef}
                  id="interview-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  placeholder={
                    isDSATurn
                      ? 'Describe your approach or paste code (Monaco editor coming in Step 24)...'
                      : 'Type your answer... (Enter to send, Shift+Enter for new line)'
                  }
                  rows={3}
                  className="flex-1 bg-transparent resize-none outline-none text-surface-100 text-sm placeholder:text-surface-600 leading-relaxed p-1 min-h-[60px] max-h-[160px]"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
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
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
