import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, FileText, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function CollegeStudy() {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', progress: 50, teacher: '' });

  useEffect(() => {
    apiFetch('/api/college').then(r => r.json()).then(d => { if (Array.isArray(d)) setSubjects(d); }).catch(() => {});
  }, []);

  const openAdd = () => { setEditingId(null); setFormData({ name: '', code: '', progress: 50, teacher: '' }); setShowModal(true); };
  const openEdit = (s) => { setEditingId(s.id); setFormData({ name: s.name, code: s.code, progress: s.progress, teacher: s.teacher }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await apiFetch(`/api/college/edit/${editingId}`, { method: 'PUT', body: JSON.stringify(formData) });
        const d = await res.json(); if (d.subjects) setSubjects(d.subjects);
      } else {
        const res = await apiFetch('/api/college/add', { method: 'POST', body: JSON.stringify(formData) });
        const d = await res.json(); if (d.subjects) setSubjects(d.subjects);
      }
    } catch { }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return;
    try {
      const res = await apiFetch(`/api/college/delete/${id}`, { method: 'DELETE' });
      const d = await res.json(); if (d.subjects) setSubjects(d.subjects);
    } catch { setSubjects(p => p.filter(s => s.id !== id)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><GraduationCap className="w-6 h-6 text-emerald-400" />College & Study Hub</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Subjects, lecture notes, exam timetables & academic roadmap.</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {subjects.length === 0 && <p className="text-slate-400 text-sm font-mono text-center py-10">No college subjects added yet. Add your first subject!</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map(sub => (
          <div key={sub.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-xs font-bold">{sub.code}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg bg-sky-950/50 border border-sky-800/50 text-sky-400 hover:bg-sky-900/50 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400 hover:bg-rose-900/50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mt-2">{sub.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">Instructor: {sub.teacher}</p>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1"><span>Syllabus Progress</span><span className="text-emerald-400 font-bold">{sub.progress}%</span></div>
              <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800"><div className="bg-emerald-400 h-2 rounded-full transition-all" style={{ width: `${sub.progress}%` }}></div></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-emerald-400" />{editingId ? 'Edit Subject' : 'Add Subject'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div><label className="block text-slate-400 mb-1">Subject Name</label><input type="text" required placeholder="e.g. Data Structures" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500" /></div>
              <div><label className="block text-slate-400 mb-1">Subject Code</label><input type="text" required placeholder="e.g. CS-301" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500" /></div>
              <div><label className="block text-slate-400 mb-1">Instructor / Professor</label><input type="text" placeholder="e.g. Prof. Smith" value={formData.teacher} onChange={e => setFormData({ ...formData, teacher: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500" /></div>
              <div><label className="block text-slate-400 mb-1">Syllabus Progress (%)</label><input type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500" /></div>
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
