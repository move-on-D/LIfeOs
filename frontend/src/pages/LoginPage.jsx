import React, { useState, useEffect } from 'react';
import { Cpu, Lock, User, KeyRound, Sparkles, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LoginPage({ setIsAuthenticated, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleClientSet, setGoogleClientSet] = useState(false);

  // Timer State
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  // Load Google GSI Script if Client ID exists
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId) {
      setGoogleClientSet(true);
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
          });
          const btnDiv = document.getElementById('googleBtn');
          if (btnDiv) {
            window.google.accounts.id.renderButton(btnDiv, {
              theme: 'filled_dark',
              size: 'large',
              width: '100%',
              shape: 'pill'
            });
          }
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('lifeos_token', data.token);
        localStorage.setItem('lifeos_user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Google Login failed');
      }
    } catch {
      setError('Connection error with Google Login server');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('lifeos_token', data.token);
        localStorage.setItem('lifeos_user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Cannot connect to server. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualGoogleClick = () => {
    alert("To activate Google Login:\n1. Go to console.cloud.google.com -> Create OAuth 2.0 Client ID\n2. Add VITE_GOOGLE_CLIENT_ID to Vercel Environment Variables\n3. Save and redeploy!");
  };

  return (
    <div className="min-h-screen bg-[#0a0c16] flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-white relative">
      <div className="absolute top-6 right-6 hidden md:flex flex-col items-end">
        <div className="font-mono text-cyan-400 font-bold text-xl tracking-widest neon-text-blue">
          {formattedTime}
        </div>
        <div className="text-xs text-slate-500 font-mono tracking-widest uppercase mt-0.5">
          {formattedDate}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-8 mt-10 md:mt-0">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-rose-600 p-0.5 shadow-2xl shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Cpu className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
              Life<span className="text-rose-500">OS</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono tracking-widest uppercase mt-3 italic text-cyan-200/70">
              "Control your digital life, or it will control you."
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-xl">
                {isLogin ? <Lock className="w-6 h-6 text-cyan-400" /> : <Sparkles className="w-6 h-6 text-rose-400" />}
                {isLogin ? 'Operator Login' : 'Initialize Vault'}
              </div>
              <div className="md:hidden font-mono text-cyan-400 font-bold text-sm">
                {formattedTime}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-900 text-rose-400 text-xs font-mono">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Enter operator ID..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Master Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Enter secure key..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (isLogin ? 'Access Command Center' : 'Create Vault')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-mono text-slate-500 uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Google OAuth Button Container */}
            {googleClientSet ? (
              <div id="googleBtn" className="w-full flex justify-center"></div>
            ) : (
              <button
                type="button"
                onClick={handleManualGoogleClick}
                className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            )}
          </form>
        </div>

        <div className="text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors"
          >
            {isLogin ? "Don't have a vault? Initialize one." : "Already an operator? Login here."}
          </button>
        </div>
      </div>
    </div>
  );
}
