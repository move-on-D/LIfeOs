import React, { useState, useEffect } from 'react';
import { Shield, Bell, Search, Cpu, Sparkles, User, Menu, X } from 'lucide-react';

export default function Navbar({ activeModule, setActiveModule, isMobileMenuOpen, setIsMobileMenuOpen, setIsAuthenticated, setUser, user }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 md:px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Motto */}
      <div className="flex items-center space-x-3 md:space-x-4">
        <button 
          className="md:hidden p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        
        <div 
          onClick={() => { setActiveModule('dashboard'); setIsMobileMenuOpen(false); }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-rose-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
              Life<span className="text-rose-500">OS</span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-mono tracking-wider uppercase hidden sm:block">
              Digital Command Center
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 mr-2 animate-pulse" />
          <span>"Control your digital life, or it will control you."</span>
        </div>
      </div>

      {/* Center Live Clock */}
      <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-1.5 rounded-xl border border-slate-800">
        <div className="font-mono text-cyan-400 font-bold text-lg tracking-widest neon-text-blue">
          {formattedTime}
        </div>
        <div className="text-xs text-slate-400 border-l border-slate-700 pl-3 hidden sm:block">
          {formattedDate}
        </div>
      </div>

      {/* User Profile & Actions */}
      <div className="flex items-center space-x-4">
        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search LifeOS..."
            className="bg-slate-900/80 border border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-44 focus:w-60 transition-all font-mono"
          />
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-xl text-xs text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="hidden sm:inline">ONLINE</span>
        </div>

        {/* User Card */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xs font-bold text-slate-200 uppercase">
                {user?.username ? user.username.substring(0,2) : 'MO'}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-slate-950"></span>
          </div>
          <div className="hidden xl:block">
            <div className="text-xs font-bold text-slate-200 leading-tight truncate max-w-[100px]">
              {user?.username || 'MOVE ON.'}
            </div>
            <button onClick={handleLogout} className="text-[10px] text-rose-400 hover:text-rose-300 font-mono">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
