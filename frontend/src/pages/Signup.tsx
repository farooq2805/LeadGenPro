import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.signup({ name, email, password, company: company || undefined });
      login(res.token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="gradient-card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Create Your Account</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Get 50 free leads to try ProspectPro.</p>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors" />
            <p className="text-gray-600 text-xs mt-1">At least 8 characters</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Company (optional)</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors" />
          </div>
          <button type="submit" disabled={loading} className="w-full gradient-btn py-2.5 rounded-lg disabled:opacity-50">
            {loading ? 'Creating account...' : 'Get 50 Free Leads'}
          </button>
        </form>
        <p className="text-gray-500 text-sm text-center mt-6">
          Already have an account? <Link to="/login" className="text-primary-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
