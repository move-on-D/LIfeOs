import React, { useState, useEffect } from 'react';
import { Target, Flame, Plus, CheckCircle, X, Pencil, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function GoalsHabits() {
  const [habits, setHabits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Health', streak: 0 });

  useEffect(() => {
    apiFetch('/api/habits').then(r => r.json()).then(d => { if (Array.isArray(d)) setHabits(d); }).catch(() => {});
  }, []);

  const openAdd = () => { setEditingId(null); setFormData({ name: '', category: 'Health', streak: 0 }); setShowModal(true); };
  const openEdit = (h) => { setEditingId(h.id); setFormData({ name: h.name, category: h.category, streak: h.streak }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await apiFetch(`/api/habits/edit/${editingId}`, { method: 'PUT', body: JSON.stringify(formData) });
        const d = await res.json(); if (d.habits) setHabits(d.habits);
      } else {
        const res = await apiFetch('/api/habits/add', { method: 'POST', body: JSON.stringify(formData) });
        const d = await res.json(); if (d.habits) setHabits(d.habits);
      }
    } catch { }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this habit?')) return;
    try {
      const res = await apiFetch(`/api/habits/delete/${id}`, { method: 'DELETE' });
      const d = await res.json(); if (d.habits) setHabits(d.habits);
    } catch { setHabits(p => p.filter(h => h.id !== id)); }
  };

  const maxStreak = habits.length ? Math.max(...habits.map(h => h.streak)) : 0;
  const topHabit = habits.find(h => h.streak === maxStreak);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><Target className="w-6 h-6 text-rose-400" />Goals & Habits</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Daily goals, habit streak counters, focus mode, and personal milestones.</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Add Habit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-950 to-slate-950">
          <div className="text-xs font-mono text-rose-400">Current Highest Streak</div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1 flex items-center gap-2"><Flame className="w-7 h-7 text-rose-500 fill-rose-500 animate-bounce" /> {maxStreak} Days</div>
          <div className="text-xs text-slate-400 font-mono mt-1">{topHabit?.name || 'No habits yet'}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Active Daily Habits</div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">{habits.length}</div>
          <div className="text-xs text-slate-400 font-mono mt-1">100% Tracking Active</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Total Streak Days</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{habits.reduce((a, h) => a + h.streak, 0)}</div>
          <div className="text-xs text-slate-400 font-mono mt-1">Keep Going!</div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Daily Habit Tracker</h2>
        {habits.length === 0 && <p className="text-slate-400 text-sm font-mono text-center py-6">No habits yet. Add your first one!</p>}
        <div className="space-y-3">
          {habits.map(habit => (
            <div key={habit.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400"><CheckCircle className="w-5 h-5" /></div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{habit.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{habit.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-rose-400" /> {habit.streak} Days
                </span>
                <button onClick={() => openEdit(habit)} className="p-1.5 rounded-lg bg-sky-950/50 border border-sky-800/50 text-sky-400 hover:bg-sky-900/50 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(habit.id)} className="p-1.5 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400 hover:bg-rose-900/50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><Target className="w-5 h-5 text-rose-400" />{editingId ? 'Edit Habit' : 'Add New Habit'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div><label className="block text-slate-400 mb-1">Habit Name</label><input type="text" required placeholder="e.g. Morning Workout" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500" /></div>
              <div><label className="block text-slate-400 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500">
                  {['Health', 'Skills', 'Mindset', 'Discipline', 'Recovery', 'General'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="block text-slate-400 mb-1">Current Streak (days)</label><input type="number" min="0" value={formData.streak} onChange={e => setFormData({ ...formData, streak: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500" /></div>
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 text-white font-bold">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
