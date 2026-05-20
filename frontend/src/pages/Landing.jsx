import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Interviews',
    desc: 'Realistic 10-question sessions powered by Claude, GPT-4o, and Groq with automatic failover.',
  },
  {
    icon: '💻',
    title: 'Live Code Compiler',
    desc: 'Solve real LeetCode problems with Monaco Editor and Judge0 — just like a real coding interview.',
  },
  {
    icon: '📊',
    title: 'Detailed Reports',
    desc: 'Get scored per-round, receive hiring recommendations, and follow a personalized 30-day study plan.',
  },
  {
    icon: '🔄',
    title: 'Smart Failover',
    desc: 'Three AI providers with silent auto-switching. Your interview never stops, even if one goes down.',
  },
  {
    icon: '🎯',
    title: 'Campus-Ready',
    desc: 'Tailored for Indian campus placements — prep for startups, MNCs, and FAANG-level interviews.',
  },
  {
    icon: '⚡',
    title: 'Token Caching',
    desc: 'Prompt caching across all providers cuts costs by ~70% — affordable practice, unlimited growth.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold gradient-text">
            ✈️ PrepPilot
          </Link>
          <div className="flex gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">
              Log In
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-6">
            🚀 AI-Powered Mock Interviews for Campus Placements
          </div>

          <h1 className="flex flex-col gap-2 text-5xl md:text-7xl font-extrabold mb-8">
            <span>Ace Your Next</span>
            <span className="gradient-text">Campus Interview</span>
          </h1>

          <p className="text-lg md:text-xl text-surface-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice with an AI interviewer that adapts to your level, scores every answer in real-time,
            and gives you a detailed roadmap to improve — all in under 45 minutes.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-6 justify-center">
            <Link to="/register" className="btn-primary text-lg py-4 px-8 animate-pulse-glow">
              Start Free Interview →
            </Link>
            <a href="#features" className="btn-secondary text-lg py-4 px-8">
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pb-8">
            {[
              ['10', 'Questions per session'],
              ['5', 'Interview rounds'],
              ['3', 'AI providers'],
              ['Real-time', 'Scoring & feedback'],
            ].map(([stat, label]) => (
              <div key={label} className="text-center flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">{stat}</div>
                <div className="text-sm text-surface-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-6 relative z-20 bg-surface-950 border-t border-surface-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need to <span className="gradient-text">Land the Offer</span>
          </h2>
          <p className="text-surface-200 text-center mb-16 max-w-2xl mx-auto">
            PrepPilot simulates real campus placement interviews with AI that's been trained
            on thousands of interview patterns.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass p-6 hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-surface-100 mb-2">{f.title}</h3>
                <p className="text-surface-200 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Interview Flow ─── */}
      <section className="py-20 px-6 border-t border-surface-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            How <span className="gradient-text">PrepPilot</span> Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose Your Track', desc: 'Select company type (Startup/MNC/FAANG) and role' },
              { step: '02', title: 'Face the AI', desc: '10 questions across 5 rounds with real-time scoring' },
              { step: '03', title: 'Code Live', desc: 'Solve LeetCode problems in a real editor with compiler' },
              { step: '04', title: 'Get Your Report', desc: 'Detailed breakdown, hiring recommendation, and study plan' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-bold text-primary-600/30 mb-2">{item.step}</div>
                <h3 className="font-semibold text-surface-100 mb-1">{item.title}</h3>
                <p className="text-surface-200 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto glass p-12 text-center glow">
          <h2 className="text-3xl font-bold mb-4">Ready to Practice?</h2>
          <p className="text-surface-200 mb-8">
            Create your free account and start your first mock interview in under 2 minutes.
          </p>
          <Link to="/register" className="btn-primary text-lg py-4 px-10">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-surface-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-surface-700">
            © 2026 PrepPilot. Built for campus placement success.
          </div>
          <div className="flex gap-6 text-sm text-surface-700">
            <Link to="/register" className="hover:text-primary-400 transition-colors">Register</Link>
            <Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
