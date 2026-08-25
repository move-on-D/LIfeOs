import React, { useState, useEffect } from 'react';
import { Code2, ExternalLink, GitBranch, Plus, Folder, X } from 'lucide-react';

export default function ProjectsHub() {
  const [projects, setProjects] = useState([
    { id: 1, name: 'LifeOS', desc: 'Personal Digital Command Center (React, Express, Tailwind)', status: 'V1/V2 Building', github: 'https://github.com', deploy: 'Local / Vercel', progress: 73 },
    { id: 2, name: 'Portfolio Site', desc: 'Personal Cyberpunk Developer Portfolio', status: 'Completed', github: 'https://github.com', deploy: 'vercel.app', progress: 100 },
    { id: 3, name: 'AI Habit Engine', desc: 'Predictive routines based on user discipline score', status: 'Planning (V3)', github: '#', deploy: 'Internal', progress: 25 }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    status: 'Active Build',
    github: 'https://github.com',
    deploy: 'Vercel',
    progress: 50
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setProjects(data); })
      .catch(() => {});
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const res = await fetch('http://localhost:5000/api/projects/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (err) {
      setProjects(prev => [
        { id: Date.now(), ...formData },
        ...prev
      ]);
    }
    setShowModal(false);
    setFormData({ name: '', desc: '', status: 'Active Build', github: 'https://github.com', deploy: 'Vercel', progress: 50 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-cyan-400" />
            Projects Hub
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            GitHub links, Vercel deployments, active builds & progress tracker.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div key={proj.id || proj.name} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between hover:border-cyan-500/50 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                  <Folder className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {proj.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{proj.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{proj.desc}</p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Build Progress</span>
                  <span className="text-cyan-400 font-bold">{proj.progress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800">
                  <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <a href={proj.github} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" /> Repo
                </a>
                <span className="text-slate-500 flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" /> {proj.deploy}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" /> Create / Track New Project
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LifeOS Mobile App"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description & Tech Stack</label>
                <input
                  type="text"
                  placeholder="e.g. React Native + Node.js sync"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">GitHub Repo URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/username/repo"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Deployment Status / URL</label>
                <input
                  type="text"
                  placeholder="e.g. Local / Vercel / PlayStore"
                  value={formData.deploy}
                  onChange={(e) => setFormData({ ...formData, deploy: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Progress ({formData.progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="w-full text-cyan-500 bg-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

