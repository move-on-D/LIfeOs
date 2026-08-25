import React from 'react';
import { Map, CheckCircle2, Circle, Sparkles, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export default function RoadmapView() {
  const phases = [
    {
      version: 'V1',
      title: 'Basic Phase',
      tag: 'Current Active',
      status: 'In Progress (73%)',
      color: 'border-indigo-500/50 bg-indigo-950/20 text-indigo-400',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      features: [
        { name: 'Core LifeOS Dashboard', done: true },
        { name: 'Accounts Hub Directory', done: true },
        { name: 'Today Checklist & System Status Meters', done: true },
        { name: 'Notes & Local Storage Support', done: true },
        { name: 'Offline Desktop & PWA Support', done: true }
      ]
    },
    {
      version: 'V2',
      title: 'Sync Phase',
      tag: 'Next Up',
      status: 'Planned',
      color: 'border-slate-800 bg-slate-950/60 text-slate-400',
      badgeColor: 'bg-slate-900 text-slate-400 border-slate-800',
      features: [
        { name: 'Cloud Database Synchronization (MongoDB)', done: false },
        { name: 'Push Notifications & Reminders', done: false },
        { name: 'Documents Vault File Uploader', done: false },
        { name: 'Multi-Device Cross Sync', done: false }
      ]
    },
    {
      version: 'V3',
      title: 'Smart Phase',
      tag: 'Future Upgrade',
      status: 'Planned',
      color: 'border-slate-800 bg-slate-950/60 text-slate-400',
      badgeColor: 'bg-slate-900 text-slate-400 border-slate-800',
      features: [
        { name: 'AI Assistant Integration (Gemini / GPT)', done: false },
        { name: 'Automated Local & Cloud Backups', done: false },
        { name: 'Predictive Habit Analytics Engine', done: false },
        { name: 'Smart Global Search Command Menu', done: false }
      ]
    },
    {
      version: 'V4',
      title: 'Ultimate Phase',
      tag: 'Final Vision',
      status: 'Planned',
      color: 'border-slate-800 bg-slate-950/60 text-slate-400',
      badgeColor: 'bg-slate-900 text-slate-400 border-slate-800',
      features: [
        { name: 'Full Zero-Knowledge End-to-End Encryption', done: false },
        { name: 'Decentralized Blockchain ID / Security', done: false },
        { name: 'Complete Life Automation Suite', done: false },
        { name: 'Life OS Master Release (Web + Android + Windows)', done: false }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Map className="w-6 h-6 text-amber-400" />
            Roadmap (Future Plan)
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Official version trajectory from V1 Basic to V4 Ultimate.
          </p>
        </div>
        
        <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 font-mono text-xs">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Overall Progress: <strong>73% Complete</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {phases.map((p, idx) => (
          <div key={idx} className={`glass-panel p-5 rounded-2xl border ${p.color} flex flex-col justify-between space-y-4`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-black font-mono tracking-wider">{p.version}</span>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${p.badgeColor}`}>
                  {p.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{p.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{p.status}</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
              {p.features.map((feat, fidx) => (
                <div key={fidx} className="flex items-start space-x-2 text-xs">
                  {feat.done ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feat.done ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    {feat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quote Banner from bottom of blueprint */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-slate-950 via-rose-950/20 to-slate-950 text-center relative overflow-hidden">
        <p className="text-lg font-bold text-white italic">
          "One day, when I look back, I'll be proud that I never gave up and built something that represents me."
        </p>
        <p className="text-xs text-rose-400 font-mono mt-2 uppercase font-bold tracking-widest">
          Remember why you started. ・ 夢は逃げない。逃げるのはいつも自分だ。
        </p>
      </div>
    </div>
  );
}
