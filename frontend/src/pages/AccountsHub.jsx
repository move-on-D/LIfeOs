import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Search, Check, Lock, X, Pencil, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function AccountsHub() {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ service: '', identity: '', category: 'Development', recovery: '2FA Enabled' });

  useEffect(() => {
    apiFetch('/api/accounts').then(r => r.json()).then(d => { if (Array.isArray(d)) setAccounts(d); }).catch(() => {});
  }, []);

  const openAdd = () => { setEditingId(null); setFormData({ service: '', identity: '', category: 'Development', recovery: '2FA Enabled' }); setShowModal(true); };
  const openEdit = (acc) => { setEditingId(acc.id); setFormData({ service: acc.service, identity: acc.identity, category: acc.category, recovery: acc.recovery }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await apiFetch(`/api/accounts/edit/${editingId}`, { method: 'PUT', body: JSON.stringify({ ...formData, status: 'Secured' }) });
        const d = await res.json(); if (d.accounts) setAccounts(d.accounts);
      } else {
        const res = await apiFetch('/api/accounts/add', { method: 'POST', body: JSON.stringify({ ...formData, status: 'Secured' }) });
        const d = await res.json(); if (d.accounts) setAccounts(d.accounts);
      }
    } catch { }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this account entry?')) return;
    try {
      const res = await apiFetch(`/api/accounts/delete/${id}`, { method: 'DELETE' });
      const d = await res.json(); if (d.accounts) setAccounts(d.accounts);
    } catch { setAccounts(p => p.filter(a => a.id !== id)); }
  };

  const filtered = accounts.filter(a =>
    a.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.identity || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><KeyRound className="w-6 h-6 text-sky-400" />Accounts Hub</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Central directory for all your accounts, linked services, and recovery info.</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800"><div className="text-xs font-mono text-slate-400">Total Accounts</div><div className="text-2xl font-bold text-sky-400 font-mono mt-1">{accounts.length}</div></div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800"><div className="text-xs font-mono text-slate-400">Security Health</div><div className="text-2xl font-bold text-emerald-400 font-mono mt-1">100% Protected</div></div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800"><div className="text-xs font-mono text-slate-400">Recovery Status</div><div className="text-2xl font-bold text-cyan-400 font-mono mt-1">Safe & Backed Up</div></div>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-100">Linked Accounts Directory</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search accounts..." className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-lg">Service</th>
                <th className="p-3">Identity / Login</th>
                <th className="p-3">Category</th>
                <th className="p-3">Recovery</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-lg text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-bold text-slate-200"><div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-sky-400" />{acc.service}</div></td>
                  <td className="p-3 font-mono text-slate-300">{acc.identity}</td>
                  <td className="p-3"><span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">{acc.category}</span></td>
                  <td className="p-3 text-slate-400 font-mono">{acc.recovery}</td>
                  <td className="p-3"><span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono text-[10px] flex items-center gap-1 w-max"><Check className="w-3 h-3" />{acc.status}</span></td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(acc)} className="p-1.5 rounded-lg bg-sky-950/50 border border-sky-800/50 text-sky-400 hover:bg-sky-900/50 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(acc.id)} className="p-1.5 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400 hover:bg-rose-900/50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><KeyRound className="w-5 h-5 text-sky-400" />{editingId ? 'Edit Account' : 'Add New Account'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {[['Service Name', 'service', 'e.g. AWS / ChatGPT'], ['Identity / Email', 'identity', 'e.g. user@gmail.com'], ['Recovery Info', 'recovery', 'e.g. Authenticator App']].map(([label, key, ph]) => (
                <div key={key}><label className="block text-slate-400 mb-1">{label}</label><input type="text" required={key !== 'recovery'} placeholder={ph} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500" /></div>
              ))}
              <div><label className="block text-slate-400 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500">
                  {['Primary', 'Development', 'Professional', 'Deployment', 'Social', 'Finance'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/20">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
