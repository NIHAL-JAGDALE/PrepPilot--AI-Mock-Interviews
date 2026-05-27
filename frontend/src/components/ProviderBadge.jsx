const PROVIDER_CONFIG = {
  claude: { label: 'Claude', icon: '✦', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  openai: { label: 'OpenAI', icon: '◉', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  groq:   { label: 'Groq',   icon: '⚡', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
};

export default function ProviderBadge({ provider, model }) {
  const config = PROVIDER_CONFIG[provider?.toLowerCase()] || PROVIDER_CONFIG.claude;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      borderRadius: 50, padding: '5px 12px', fontSize: 12, 
      fontWeight: 700, fontFamily: 'Sora, sans-serif',
      color: config.color, background: config.bg,
      border: `1.5px solid ${config.border}`
    }}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}
