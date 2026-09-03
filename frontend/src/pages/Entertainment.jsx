import React, { useState, useEffect } from 'react';
import { Gamepad2, Heart, Plus, Star, X, Pencil, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function Entertainment() {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: 'Anime', rating: '9.0', status: 'Watching', image: '🎬' });

  useEffect(() => {
    apiFetch('/api/entertainment').then(r => r.json()).then(d => { if (Array.isArray(d)) setItems(d); }).catch(() => {});
  }, []);

  const openAdd = () => { setEditingId(null); setFormData({ title: '', category: 'Anime', rating: '9.0', status: 'Watching', image: '🎬' }); setShowModal(true); };
  const openEdit = (item) => { setEditingId(item.id); setFormData({ title: item.title, category: item.category, rating: item.rating, status: item.status, image: item.image }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await apiFetch(`/api/entertainment/edit/${editingId}`, { method: 'PUT', body: JSON.stringify(formData) });
        const d = await res.json(); if (d.entertainment) setItems(d.entertainment);
      } else {
        const res = await apiFetch('/api/entertainment/add', { method: 'POST', body: JSON.stringify(formData) });
        const d = await res.json(); if (d.entertainment) setItems(d.entertainment);
      }
    } catch { }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove from library?')) return;
    try {
      const res = await apiFetch(`/api/entertainment/delete/${id}`, { method: 'DELETE' });
      const d = await res.json(); if (d.entertainment) setItems(d.entertainment);
    } catch { setItems(p => p.filter(i => i.id !== id)); }
  };

  const filtered = activeFilter === 'All' ? items : items.filter(i => i.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><Gamepad2 className="w-6 h-6 text-purple-400" />Entertainment & Watch List</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Games, anime list, watch later & personal favorites.</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="flex items-center space-x-2 font-mono text-xs">
        {['All', 'Anime', 'Gaming', 'Movie'].map(cat => (
          <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-3.5 py-1.5 rounded-xl border transition-all ${activeFilter === cat ? 'bg-purple-950 border-purple-600 text-purple-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>{cat}</button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-slate-400 text-sm font-mono text-center py-10">Nothing here yet. Add something!</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(item => (
          <div key={item.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-purple-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="text-4xl mb-3 text-center p-4 rounded-xl bg-slate-900/80 border border-slate-800">{item.image}</div>
              <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{item.category} • {item.status}</div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-purple-400 font-bold flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-purple-400" /> {item.rating}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-sky-950/50 border border-sky-800/50 text-sky-400 hover:bg-sky-900/50 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400 hover:bg-rose-900/50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-purple-400" />{editingId ? 'Edit Item' : 'Add to Library'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div><label className="block text-slate-400 mb-1">Title</label><input type="text" required placeholder="e.g. Solo Leveling" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500" /></div>
              <div><label className="block text-slate-400 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500">
                  {['Anime', 'Gaming', 'Movie'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="block text-slate-400 mb-1">Emoji Icon</label><input type="text" placeholder="🔥" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500" /></div>
              <div><label className="block text-slate-400 mb-1">Rating</label><input type="text" placeholder="9.5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500" /></div>
              <div><label className="block text-slate-400 mb-1">Status</label><input type="text" placeholder="e.g. Watching / Completed" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500" /></div>
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
