import ProviderBadge from './ProviderBadge';
import TokenStats from './TokenStats';

export default function ChatBubble({ role, content, provider, model, cacheStatus, tokenStats }) {
  const isUser = role === 'user';
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
              {provider && <ProviderBadge provider={provider} model={model} size="sm" />}
            </>
          )}
        </div>

        {/* Bubble */}
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
            <TokenStats cacheStatus={cacheStatus} tokenStats={tokenStats} />
          </div>
        )}
      </div>
    </div>
  );
}
