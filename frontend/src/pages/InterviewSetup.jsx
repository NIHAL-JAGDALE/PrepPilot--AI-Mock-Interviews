import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../api/client';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    company_type: 'startup',
    role_type: 'frontend',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await sessionAPI.start(form);
      navigate(`/interview/${data.session_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/dashboard" className="inline-block text-surface-400 hover:text-surface-200 transition-colors mb-6 text-sm font-medium">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-surface-100 mb-2">Configure Interview</h1>
          <p className="text-surface-300 text-sm">
            Tailor the AI interviewer to your target role and company type.
          </p>
        </div>

        <div className="glass p-8 glow">
          <form onSubmit={handleStart} className="space-y-6">
            
            <div>
              <label htmlFor="company_type" className="block text-sm font-medium text-surface-200 mb-2">
                Target Company Type
              </label>
              <select
                id="company_type"
                name="company_type"
                value={form.company_type}
                onChange={handleChange}
                className="input-field cursor-pointer appearance-none bg-surface-900"
              >
                <option value="startup">Startup (Fast-paced, practical questions)</option>
                <option value="mnc">MNC (Standardized, domain knowledge)</option>
                <option value="faang">FAANG (Deep DSA, system design)</option>
              </select>
            </div>

            <div>
              <label htmlFor="role_type" className="block text-sm font-medium text-surface-200 mb-2">
                Role Focus
              </label>
              <select
                id="role_type"
                name="role_type"
                value={form.role_type}
                onChange={handleChange}
                className="input-field cursor-pointer appearance-none bg-surface-900"
              >
                <option value="frontend">Frontend Developer (React, DOM, JS)</option>
                <option value="backend">Backend Developer (APIs, DBs, Node.js)</option>
                <option value="fullstack">Full-Stack Developer (End-to-End)</option>
                <option value="dsa_focus">DSA Heavy (Algorithmic problem solving)</option>
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-lg shadow-lg shadow-primary-500/20 mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Preparing AI...
                </span>
              ) : (
                'Start Interview 🚀'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-800 text-center">
            <p className="text-xs text-surface-400">
              The interview consists of 5 rounds (10 questions). Ensure you have ~45 minutes of uninterrupted time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
