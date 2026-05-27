<<<<<<< HEAD
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
=======
// ─── PROVIDER BADGE ────────────────────────────────────────
// Shows which AI provider answered each message.
// Colors per instructions:
//   Claude  → Orange/Amber
//   OpenAI  → Green/Teal
//   Groq    → Purple/Violet  (+ ⚡ icon to highlight speed)

const PROVIDER_CONFIG = {
  claude: {
    label: 'Claude',
    icon: '🟠',
    bg: 'rgba(217, 119, 6, 0.15)',
    border: 'rgba(217, 119, 6, 0.3)',
    color: '#fbbf24',
  },
  openai: {
    label: 'GPT-4o',
    icon: '🟢',
    bg: 'rgba(16, 163, 127, 0.15)',
    border: 'rgba(16, 163, 127, 0.3)',
    color: '#34d399',
  },
  groq: {
    label: 'Groq ⚡',
    icon: '🟣',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.3)',
    color: '#a78bfa',
  },
};

export default function ProviderBadge({ provider, model, size = 'sm' }) {
  const config = PROVIDER_CONFIG[provider?.toLowerCase()] || PROVIDER_CONFIG.claude;
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
      }}
      className={`inline-flex items-center gap-1 rounded-full font-semibold tracking-wide
        ${isSmall ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'}`}
      title={model || config.label}
    >
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </span>
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
  );
}
