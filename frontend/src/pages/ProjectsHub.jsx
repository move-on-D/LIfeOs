import React, { useState, useEffect } from 'react';
import { Code2, ExternalLink, GitBranch, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function ProjectsHub() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', desc: '', status: 'Active Build', github: 'https://github.com', deploy: 'Vercel', progress: 50 });

  useEffect(() => {
    apiFetch('/api/projects').then(r => r.json()).then(d => { if (Array.isArray(d)) setProjects(d); }).catch(() => {});
  }, []);

  const openAdd = () => { setEditingId(null); setFormData({ name: '', desc: '', status: 'Active Build', github: 'https://github.com', deploy: 'Vercel', progress: 50 }); setShowModal(true); };
  const openEdit = (p) => { setEditingId(p.id); setFormData({ name: p.name, desc: p.desc, status: p.status, github: p.github, deploy: p.deploy, progress: p.progress }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await apiFetch(`/api/projects/edit/${editingId}`, { method: 'PUT', body: JSON.stringify(formData) });
        const d = await res.json(); if (d.projects) setProjects(d.projects);
      } else {
        const res = await apiFetch('/api/projects/add', { method: 'POST', body: JSON.stringify(formData) });
        const d = await res.json(); if (d.projects) setProjects(d.projects);
      }
    } catch { }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project entry?')) return;
    try {
      const res = await apiFetch(`/api/projects/delete/${id}`, { method: 'DELETE' });
      const d = await res.json(); if (d.projects) setProjects(d.projects);
    } catch { setProjects(p => p.filter(proj => proj.id !== id)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><Code2 className="w-6 h-6 text-cyan-400" />Projects Hub</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">GitHub links, Vercel deployments, active builds & progress tracker.</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {projects.length === 0 && <p className="text-slate-400 text-sm font-mono text-center py-10">No active projects added yet. Add your first project!</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold">{proj.status}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(proj)} className="p-1.5 rounded-lg bg-sky-950/50 border border-sky-800/50 text-sky-400 hover:bg-sky-900/50 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(proj.id)} className="p-1.5 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400 hover:bg-rose-900/50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mt-2">{proj.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{proj.desc}</p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1"><span>Completion Progress</span><span className="text-cyan-400 font-bold">{proj.progress}%</span></div>
                <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800"><div className="bg-cyan-400 h-2 rounded-full transition-all" style={{ width: `${proj.progress}%` }}></div></div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono">
                {proj.github && proj.github !== '#' ? <a href={proj.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400 flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" /> Repository</a> : <span className="text-slate-600">Local Repo</span>}
                {proj.deploy && <span className="text-slate-400 flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> {proj.deploy}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><Code2 className="w-5 h-5 text-cyan-400" />{editingId ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div><label className="block text-slate-400 mb-1">Project Name</label><input type="text" required placeholder="e.g. LifeOS" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500" /></div>
              <div><label className="block text-slate-400 mb-1">Description</label><textarea placeholder="e.g. Personal Command Center" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500" /></div>
              <div><label className="block text-slate-400 mb-1">GitHub Repo Link</label><input type="text" placeholder="https://github.com/..." value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500" /></div>
              <div><label className="block text-slate-400 mb-1">Deployment Platform</label><input type="text" placeholder="e.g. Vercel / Render / Local" value={formData.deploy} onChange={e => setFormData({ ...formData, deploy: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500" /></div>
              <div><label className="block text-slate-400 mb-1">Progress (%)</label><input type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500" /></div>
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
