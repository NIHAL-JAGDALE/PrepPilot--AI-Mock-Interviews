import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.login(form);
      localStorage.setItem('preppilot_token', data.token);
      localStorage.setItem('preppilot_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold gradient-text inline-block mb-2">
            ✈️ PrepPilot
          </Link>
          <h1 className="text-2xl font-bold text-surface-100">Welcome back</h1>
          <p className="text-surface-200 text-sm mt-1">Log in to continue your interview prep</p>
        </div>

        <div className="glass p-8 glow">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-surface-200 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@university.edu"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-surface-200 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-center"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <p className="text-center text-surface-700 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
