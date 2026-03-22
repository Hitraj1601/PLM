import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, GitPullRequest } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email) => {
    setEmail(email);
    setPassword('password123');
    setLoading(true);
    try {
      await login(email, 'password123');
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sienna-500 to-xanadu-400 flex items-center justify-center mx-auto mb-4">
            <GitPullRequest size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">PLM System</h1>
          <p className="text-gainsboro-400 mt-2">Engineering Change Control</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -trangainsboro-y-1/2 text-gainsboro-500" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy-700 border border-navy-500 text-gainsboro-100 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-sienna-500 focus:border-transparent outline-none"
                  placeholder="you@plm.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -trangainsboro-y-1/2 text-gainsboro-500" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy-700 border border-navy-500 text-gainsboro-100 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-sienna-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -trangainsboro-y-1/2 text-gainsboro-500 hover:text-gainsboro-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-6 pt-6 border-t border-navy-600">
            <p className="text-xs text-gainsboro-500 text-center mb-3">Quick demo login</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Engineer', email: 'alice@plm.com', color: 'sienna' },
                { label: 'Approver', email: 'bob@plm.com', color: 'amber' },
                { label: 'Operations', email: 'carol@plm.com', color: 'xanadu' },
                { label: 'Admin', email: 'dave@plm.com', color: 'purple' },
              ].map((item) => (
                <button
                  key={item.email} onClick={() => quickLogin(item.email)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-navy-700 text-gainsboro-400 hover:text-gainsboro-200 hover:bg-navy-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gainsboro-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-sienna-400 hover:text-sienna-300 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
