import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="text-xl font-bold gradient-text">ProspectPro</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">Home</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm">Pricing</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Dashboard</Link>
                <Link to="/generate" className="text-gray-300 hover:text-white transition-colors text-sm">Generate</Link>
                <span className="text-gray-500 text-sm">Hi, {user?.name}</span>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm">Sign In</Link>
                <Link to="/signup" className="gradient-btn px-4 py-2 rounded-lg text-sm">Get Started Free</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-300" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block text-gray-300 py-2" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/pricing" className="block text-gray-300 py-2" onClick={() => setMenuOpen(false)}>Pricing</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block text-gray-300 py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/generate" className="block text-gray-300 py-2" onClick={() => setMenuOpen(false)}>Generate</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-gray-400 py-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-300 py-2" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/signup" className="block text-primary-400 py-2" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
