<<<<<<< HEAD
// ─── CHAT BUBBLE ───────────────────────────────────────────
// Renders a single message in the interview chat.
// role: 'user' | 'assistant'
// provider: 'claude' | 'openai' | 'groq' (only for assistant messages)

=======
>>>>>>> origin/v1.2
import ProviderBadge from './ProviderBadge';
import TokenStats from './TokenStats';

export default function ChatBubble({ role, content, provider, model, cacheStatus, tokenStats }) {
  const isUser = role === 'user';
<<<<<<< HEAD

  // Strip INTERVIEW_COMPLETE marker from displayed text
  const displayContent = content.replace(/INTERVIEW_COMPLETE[\s\S]*/i, '').trim();

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>

        {/* Label row */}
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {isUser ? (
            <span className="text-xs text-surface-400 font-medium">You</span>
          ) : (
            <>
              <span className="text-xs text-surface-400 font-medium">Interviewer</span>
=======
  const displayContent = content.replace(/INTERVIEW_COMPLETE[\s\S]*/i, '').trim();

  return (
    <div style={{ display: 'flex', width: '100%', marginBottom: 20, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 6, alignItems: isUser ? 'flex-end' : 'flex-start' }}>

        {/* Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isUser ? 'row-reverse' : 'row' }}>
          {isUser ? (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>You</span>
          ) : (
            <>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                🤖 PrepPilot AI
              </span>
>>>>>>> origin/v1.2
              {provider && <ProviderBadge provider={provider} model={model} size="sm" />}
            </>
          )}
        </div>

        {/* Bubble */}
<<<<<<< HEAD
        <div
          className={`px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${isUser
              ? 'bg-primary-600/80 text-white rounded-tr-sm'
              : 'glass text-surface-100 rounded-tl-sm'
            }`}
        >
          {displayContent}
        </div>

        {/* Token stats — only for assistant messages */}
        {!isUser && (cacheStatus || tokenStats) && (
          <div className="px-1">
=======
        <div style={{
          padding: '14px 18px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          fontSize: 14, lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          background: isUser ? 'var(--green)' : 'rgba(255,255,255,0.07)',
          color: '#fff',
          border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: isUser ? '0 4px 12px rgba(29,185,84,0.2)' : 'none',
        }}>
          {displayContent}
        </div>

        {/* Token stats */}
        {!isUser && (cacheStatus || tokenStats) && (
          <div style={{ paddingLeft: 2 }}>
>>>>>>> origin/v1.2
            <TokenStats cacheStatus={cacheStatus} tokenStats={tokenStats} />
          </div>
        )}
      </div>
    </div>
  );
}
