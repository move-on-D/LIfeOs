import React, { useState } from 'react';
import { Target, Flame, Trophy, Plus, CheckCircle, FlameKindling } from 'lucide-react';

export default function GoalsHabits() {
  const [habits] = useState([
    { id: 1, name: 'Daily Coding Practice (2 Hours)', streak: 18, category: 'Skills', status: 'Active' },
    { id: 2, name: 'Morning Workout & Gym', streak: 12, category: 'Health', status: 'Active' },
    { id: 3, name: 'Read 20 Pages Daily', streak: 9, category: 'Mindset', status: 'Active' },
    { id: 4, name: 'NoFap & High Focus Mode', streak: 24, category: 'Discipline', status: 'Active' },
    { id: 5, name: 'Sleep Before 11:30 PM', streak: 5, category: 'Recovery', status: 'Active' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-rose-400" />
            Goals & Habits
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Daily goals, habit streak counters, focus mode, and personal milestones.
          </p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Add Habit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-950 to-slate-950">
          <div className="text-xs font-mono text-rose-400">Current Highest Streak</div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1 flex items-center gap-2">
            <Flame className="w-7 h-7 text-rose-500 fill-rose-500 animate-bounce" /> 24 Days
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">Focus & NoFap Protocol</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Active Daily Habits</div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">{habits.length}</div>
          <div className="text-xs text-slate-400 font-mono mt-1">100% Tracking Active</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Monthly Consistency</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">91.4%</div>
          <div className="text-xs text-slate-400 font-mono mt-1">Level: Unstoppable</div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Daily Habit Tracker</h2>
        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{habit.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{habit.category}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 font-mono">
                <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-rose-400" /> {habit.streak} Days Streak
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
