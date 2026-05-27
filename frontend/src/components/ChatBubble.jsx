<<<<<<< HEAD
import ProviderBadge from './ProviderBadge';
import TokenStats from './TokenStats';
import EvalCard from './EvalCard';

function cleanFeedbackText(text) {
  return text
    // Strip ROUND and QUESTION metadata lines
    .replace(/^-*\s*ROUND:\s*\d+\s*[—–-]\s*.+$/gm, '')
    .replace(/^QUESTION:\s*\d+\s*(of|\/)\s*\d+\s*$/gm, '')
    // Strip standalone --- separators
    .replace(/^-{3,}\s*$/gm, '')
    .replace(/--- SCORE:/g, '📊 Score:')
    .replace(/SCORE:/g, '📊 Score:')
    .replace(/FEEDBACK:/g, '📝 Feedback:')
    .replace(/WHAT A STRONG ANSWER LOOKS LIKE:/g, '💡 Strong Answer:')
    .replace(/WEAK AREAS TO WORK ON:/g, '🎯 Areas to Improve:');
}

function parseAIContent(content) {
  const displayContent = content.replace(/INTERVIEW_COMPLETE[\s\S]*/i, '').trim();
  
  const nextQIndex = displayContent.indexOf('NEXT QUESTION:');
  if (nextQIndex !== -1) {
    let feedbackPart = displayContent.substring(0, nextQIndex).trim();
    feedbackPart = cleanFeedbackText(feedbackPart);
    
    let nextQPart = displayContent.substring(nextQIndex).replace('NEXT QUESTION:', '').trim();
    
    return {
      isSplit: true,
      feedbackParas: feedbackPart.split(/\n+/).filter(Boolean),
      nextParas: nextQPart.split(/\n+/).filter(Boolean)
    };
  }

  const cleaned = cleanFeedbackText(displayContent);
  const paras = cleaned.split(/\n+/).filter(Boolean);
  return { isSplit: false, paras };
}

export default function ChatBubble({ role, content, provider, model, cacheStatus, tokenStats }) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 auto 16px', maxWidth: 1000, animation: 'fadeIn .35s ease' }}>
        <div style={{
          background: '#D9FDD3', color: '#1A2B4A', padding: '12px 16px',
          borderRadius: '18px 18px 4px 18px', maxWidth: '68%',
          fontSize: 13.5, lineHeight: 1.65, fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          whiteSpace: 'pre-wrap'
        }}>
          {content}
        </div>
      </div>
    );
  }

  const { isSplit, paras, feedbackParas, nextParas } = parseAIContent(content);

  return (
    <div style={{ display: 'flex', gap: 10, margin: '0 auto 16px', maxWidth: 1000, alignItems: 'flex-start', animation: 'fadeIn .35s ease' }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, marginTop: 2 }}>🎯</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: '85%' }}>
        
        {isSplit ? (
          <>
            {/* Feedback Bubble */}
            <div style={{
              background: '#f8fafc', border: '1px solid #E8ECF2',
              borderRadius: '4px 18px 18px 18px', padding: '14px 18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              {feedbackParas.map((p, i) => {
                // Determine if it's a heading based on the icons added by cleanFeedbackText
                const isHeading = p.startsWith('📊') || p.startsWith('📝') || p.startsWith('💡') || p.startsWith('🎯');
                return (
                  <p key={i} style={{ 
                    fontSize: 13.5, 
                    lineHeight: 1.75, 
                    color: isHeading ? '#1A2B4A' : '#475569', 
                    marginTop: i > 0 ? (isHeading ? 14 : 6) : 0,
                    fontWeight: isHeading ? 700 : 400
                  }}>
                    {p}
                  </p>
                );
              })}
            </div>

            {/* Next Question Bubble */}
            <div style={{
              background: '#fff', border: '1px solid #1DB954',
              borderRadius: '4px 18px 18px 18px', padding: '14px 18px',
              boxShadow: '0 4px 14px rgba(29,185,84,0.08)'
            }}>
              {nextParas.map((p, i) => (
                <p key={i} style={{ fontSize: 14, lineHeight: 1.75, color: '#1A2B4A', marginTop: i > 0 ? 10 : 0, fontWeight: 500 }}>
                  {p}
                </p>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            background: '#fff', border: '1px solid #E8ECF2',
            borderRadius: '4px 18px 18px 18px', padding: '14px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            {paras.map((p, i) => (
              <p key={i} style={{ fontSize: 13.5, lineHeight: 1.75, color: '#374151', marginTop: i > 0 ? 10 : 0 }}>
                {p}
              </p>
            ))}
          </div>
        )}

        {(cacheStatus || tokenStats) && (
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: -5, paddingLeft: 2 }}>
=======
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
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
            <TokenStats cacheStatus={cacheStatus} tokenStats={tokenStats} />
          </div>
        )}
      </div>
    </div>
  );
}
