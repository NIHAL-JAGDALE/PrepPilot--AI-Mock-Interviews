// ─── CHAT BUBBLE ───────────────────────────────────────────
// Renders a single message in the interview chat.
// role: 'user' | 'assistant'
// provider: 'claude' | 'openai' | 'groq' (only for assistant messages)

import ProviderBadge from './ProviderBadge';
import TokenStats from './TokenStats';

export default function ChatBubble({ role, content, provider, model, cacheStatus, tokenStats }) {
  const isUser = role === 'user';

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
              {provider && <ProviderBadge provider={provider} model={model} size="sm" />}
            </>
          )}
        </div>

        {/* Bubble */}
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
            <TokenStats cacheStatus={cacheStatus} tokenStats={tokenStats} />
          </div>
        )}
      </div>
    </div>
  );
}
