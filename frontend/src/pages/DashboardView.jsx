import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Zap, Flame, Smile, Brain, ExternalLink, 
  Clock, Quote, Compass, ArrowRight, Shield, KeyRound, Laptop, 
  FolderLock, GraduationCap, Code2, Wallet, Target, Gamepad2, 
  Sparkles, Plus, Trash2, RefreshCw
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DashboardView({ setActiveModule }) {
  const [checklist, setChecklist] = useState([]);
  const [metrics, setMetrics] = useState({ focus: 0, energy: 0, discipline: 0, happiness: 0 });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReply, setAiReply] = useState('Hello! How can I assist your LifeOS command center today?');
  const [aiLoading, setAiLoading] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTag, setNewTag] = useState('General');
  const [showAddTask, setShowAddTask] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/dashboard`)
      .then(r => r.json())
      .then(d => {
        if (d.checklist) setChecklist(d.checklist);
        if (d.metrics) setMetrics(d.metrics);
      }).catch(() => {});
  }, []);

  const handleAiChat = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API}/api/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: aiPrompt }) });
      const data = await res.json();
      if (data.reply) setAiReply(data.reply);
    } catch { setAiReply(`Command received: "${aiPrompt}". System operational. Keep going!`); }
    finally { setAiLoading(false); setAiPrompt(''); }
  };

  const toggleChecklist = async (id) => {
    setChecklist(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
    try {
      const res = await fetch(`${API}/api/checklist/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const d = await res.json(); if (d.checklist) setChecklist(d.checklist);
    } catch { }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await fetch(`${API}/api/checklist/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: newTask, tag: newTag }) });
      const d = await res.json(); if (d.checklist) setChecklist(d.checklist);
    } catch { setChecklist(p => [...p, { id: Date.now(), label: newTask, tag: newTag, completed: false }]); }
    setNewTask(''); setShowAddTask(false);
  };

  const deleteTask = async (id) => {
    setChecklist(p => p.filter(i => i.id !== id));
    try { await fetch(`${API}/api/checklist/delete/${id}`, { method: 'DELETE' }); } catch { }
  };

  const handleReset = async () => {
    if (!resetConfirm) { setResetConfirm(true); return; }
    try {
      await fetch(`${API}/api/reset`, { method: 'POST' });
      setChecklist([]); setMetrics({ focus: 0, energy: 0, discipline: 0, happiness: 0 });
      setResetConfirm(false);
      alert('✅ All data reset to empty! You can now add your own content.');
    } catch { alert('Reset failed — check your backend.'); }
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const checklistPercent = checklist.length ? Math.round((completedCount / checklist.length) * 100) : 0;

  // Quick Access Apps — user can customize later
  const quickApps = [
    { name: 'GitHub', icon: '💻', url: 'https://github.com', color: 'hover:border-purple-500' },
    { name: 'YouTube', icon: '▶️', url: 'https://youtube.com', color: 'hover:border-red-500' },
    { name: 'Gmail', icon: '✉️', url: 'https://mail.google.com', color: 'hover:border-blue-500' },
    { name: 'VS Code', icon: '⚡', url: '#', color: 'hover:border-cyan-500' },
    { name: 'ChatGPT', icon: '🤖', url: 'https://chatgpt.com', color: 'hover:border-emerald-500' },
    { name: 'Vercel', icon: '▲', url: 'https://vercel.com', color: 'hover:border-slate-300' }
  ];

  // Core Modules Cards
  const coreModules = [
    { id: 'accounts', name: 'Accounts Hub', desc: 'All accounts, linked apps & recovery', icon: KeyRound, badge: 'Secured', color: 'from-sky-500/20 to-blue-600/10 text-sky-400' },
    { id: 'security', name: 'Security Center', desc: '2FA Status & Password Manager', icon: Shield, badge: 'Protected', color: 'from-rose-500/20 to-red-600/10 text-rose-400' },
    { id: 'devices', name: 'Devices Manager', desc: 'My Devices & Health Checks', icon: Laptop, badge: 'Online', color: 'from-indigo-500/20 to-purple-600/10 text-indigo-400' },
    { id: 'vault', name: 'Documents Vault', desc: 'ID Proofs, Certificates & Files', icon: FolderLock, badge: 'Encrypted', color: 'from-amber-500/20 to-orange-600/10 text-amber-400' },
    { id: 'study', name: 'College & Study', desc: 'Subjects, Timetable & Notes', icon: GraduationCap, badge: 'Active', color: 'from-emerald-500/20 to-teal-600/10 text-emerald-400' },
    { id: 'projects', name: 'Projects Hub', desc: 'GitHub Links & Progress Tracker', icon: Code2, badge: 'Building', color: 'from-cyan-500/20 to-blue-600/10 text-cyan-400' },
    { id: 'finance', name: 'Finance Tracker', desc: 'Expenses, UPI Linked & Plans', icon: Wallet, badge: 'Budgeted', color: 'from-emerald-500/20 to-green-600/10 text-emerald-400' },
    { id: 'habits', name: 'Goals & Habits', desc: 'Daily Goals, Streaks & Focus Mode', icon: Target, badge: 'Streaks', color: 'from-rose-500/20 to-pink-600/10 text-rose-400' },
    { id: 'entertainment', name: 'Entertainment', desc: 'Games, Anime List & Favorites', icon: Gamepad2, badge: 'Library', color: 'from-purple-500/20 to-fuchsia-600/10 text-purple-400' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> SYSTEM OPERATIONAL
              </span>
              <span className="text-xs font-mono text-slate-400">V1 Basic (73% Loaded)</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="bg-gradient-to-r from-rose-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">MOVE ON.</span>
            </h1>
            
            <p className="text-sm text-slate-300 font-mono italic">
              "Control your digital life, or it will control you."
            </p>
          </div>

          {/* Clock & Calendar Widget */}
          <div className="glass-panel p-4 rounded-xl border border-indigo-500/30 bg-slate-950/80 flex items-center space-x-5 shadow-lg min-w-[280px]">
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-mono text-cyan-400 neon-text-blue tracking-widest">
                {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section (Matches Center LifeOS Dashboard Widget in Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today Checklist */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-rose-400" />
                <h2 className="text-lg font-bold text-slate-100">Today Checklist</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-900 text-rose-400 border border-rose-500/30">
                  {completedCount}/{checklist.length} ({checklistPercent}%)
                </span>
                <button onClick={() => setShowAddTask(!showAddTask)} className="p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-800/50 text-cyan-400 hover:bg-cyan-900/50 transition-colors" title="Add task"><Plus className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Add Task Form */}
            {showAddTask && (
              <form onSubmit={addTask} className="mb-3 flex gap-2">
                <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="New task..." autoFocus className="flex-1 px-3 py-1.5 bg-slate-900 border border-cyan-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono" />
                <select value={newTag} onChange={e => setNewTag(e.target.value)} className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none">
                  {['Study','Dev','Health','Mind','Focus','Rest','Work','General'].map(t => <option key={t}>{t}</option>)}
                </select>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold">Add</button>
              </form>
            )}

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 mb-4 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-rose-500 to-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${checklistPercent}%` }}></div>
            </div>

            {/* Empty State */}
            {checklist.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No tasks yet. Click <span className="text-cyan-400">+</span> to add your daily goals!
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2">
              {checklist.map((item) => (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${item.completed ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-800/40 border-slate-700/60 text-slate-100 hover:border-cyan-500/50'}`}>
                  <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => toggleChecklist(item.id)}>
                    {item.completed ? <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                    <span className={`text-sm font-medium ${item.completed ? 'line-through' : ''}`}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">{item.tag}</span>
                    <button onClick={() => deleteTask(item.id)} className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <button onClick={() => setActiveModule('habits')} className="text-xs text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center space-x-1">
              <span>Manage Habits</span><ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleReset} className={`text-xs font-mono inline-flex items-center gap-1 transition-colors ${resetConfirm ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-600 hover:text-rose-400'}`}>
              <RefreshCw className="w-3 h-3" />{resetConfirm ? 'Tap again to confirm!' : 'Reset All Data'}
            </button>
          </div>
        </div>

        {/* Center Column: System Status Metrics & Quote */}
        <div className="space-y-6">
          {/* System Status Gauges */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                System Status
              </h2>
              <span className="text-xs font-mono text-cyan-400">Real-time Metrics</span>
            </div>

            <div className="space-y-3.5">
              {/* Focus */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-cyan-400"/> Focus</span>
                  <span className="text-cyan-400 font-bold">{metrics.focus}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800">
                  <div className="bg-cyan-400 h-2 rounded-full transition-all duration-500" style={{ width: `${metrics.focus}%` }}></div>
                </div>
              </div>

              {/* Energy */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400"/> Energy</span>
                  <span className="text-amber-400 font-bold">{metrics.energy}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800">
                  <div className="bg-amber-400 h-2 rounded-full transition-all duration-500" style={{ width: `${metrics.energy}%` }}></div>
                </div>
              </div>

              {/* Discipline */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-rose-400"/> Discipline</span>
                  <span className="text-rose-400 font-bold">{metrics.discipline}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800">
                  <div className="bg-rose-500 h-2 rounded-full transition-all duration-500" style={{ width: `${metrics.discipline}%` }}></div>
                </div>
              </div>

              {/* Happiness */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span className="flex items-center gap-1.5"><Smile className="w-3.5 h-3.5 text-emerald-400"/> Happiness</span>
                  <span className="text-emerald-400 font-bold">{metrics.happiness}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800">
                  <div className="bg-emerald-400 h-2 rounded-full transition-all duration-500" style={{ width: `${metrics.happiness}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quote of the Day & AI Smart Assistant Widget */}
          <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 relative overflow-hidden space-y-4">
            <Quote className="w-12 h-12 text-indigo-500/10 absolute -bottom-2 -right-2 pointer-events-none" />
            
            <div>
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">Quote of the Day</div>
              <p className="text-base font-bold text-slate-100 italic">
                "Discipline today, Freedom tomorrow."
              </p>
              <div className="text-xs text-slate-400 font-mono mt-1">
                ・継続は力なり。 (Continuity is strength)
              </div>
            </div>

            {/* AI Smart Assistant (V3 Feature) */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> LifeOS Smart AI Assistant
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  V3 Preview
                </span>
              </div>
              
              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 text-xs font-mono text-slate-300 min-h-[50px] mb-2 shadow-inner">
                {aiReply}
              </div>

              <form onSubmit={handleAiChat} className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask AI: quote, tasks, focus score..."
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {aiLoading ? 'Thinking...' : 'Ask'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Access Apps & Roadmap Preview */}
        <div className="space-y-6">
          {/* Quick Access Apps */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                Quick Access
              </h2>
              <span className="text-xs font-mono text-slate-400">Launch Apps</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {quickApps.map((app, idx) => (
                <a
                  key={idx}
                  href={app.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 ${app.color} flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 hover:shadow-lg group`}
                >
                  <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{app.icon}</span>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate">{app.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Core Modules Grid */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" />
            Core Modules
          </h2>
          <span className="text-xs font-mono text-slate-400">Click to explore any module</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 bg-gradient-to-br ${mod.color} cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
                      {mod.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-xs text-cyan-400 font-mono">
                  <span>Open Module</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
