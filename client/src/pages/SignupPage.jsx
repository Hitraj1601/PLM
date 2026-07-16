import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, GitPullRequest, User, UserCog } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('engineering');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password, role);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-navy-700 border border-navy-500 text-gainsboro-100 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-sienna-500 focus:border-transparent outline-none";

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sienna-500 to-xanadu-400 flex items-center justify-center mx-auto mb-4">
            <GitPullRequest size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">PLM System</h1>
          <p className="text-gainsboro-400 mt-2">Create your account</p>
        </div>

        {/* Signup Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gainsboro-500" />
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gainsboro-500" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@plm.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Role</label>
              <div className="relative">
                <UserCog size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gainsboro-500" />
                <select
                  value={role} onChange={(e) => setRole(e.target.value)}
                  className={inputClass}
                >
                  <option value="engineering">Engineering</option>
                  <option value="quality">Quality</option>
                  <option value="operations">Operations</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gainsboro-500" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gainsboro-500 hover:text-gainsboro-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gainsboro-400">
              Already have an account?{' '}
              <Link to="/login" className="text-sienna-400 hover:text-sienna-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
