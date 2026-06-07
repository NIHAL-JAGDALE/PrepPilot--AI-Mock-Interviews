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
    // Strip N/A and "None" evaluation lines (welcome message safety net)
    .replace(/^.*\bSCORE:\s*(N\/A|n\/a|none|-).*$/gim, '')
    .replace(/^.*\bFEEDBACK:\s*(N\/A|n\/a|none|-).*$/gim, '')
    .replace(/^.*WHAT A STRONG ANSWER.*:\s*(N\/A|n\/a|none|-).*$/gim, '')
    .replace(/^.*WEAK AREAS.*:\s*(N\/A|n\/a|none|-).*$/gim, '')
    .replace(/^.*Areas to Improve:\s*None.*$/gim, '')
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
            <TokenStats cacheStatus={cacheStatus} tokenStats={tokenStats} />
          </div>
        )}
      </div>
    </div>
  );
}
