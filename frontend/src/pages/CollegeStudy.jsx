import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, FileText, Plus, X } from 'lucide-react';

export default function CollegeStudy() {
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Data Structures & Algorithms', code: 'CS-301', progress: 85, teacher: 'Dept. Head', notesCount: 12 },
    { id: 2, name: 'Operating Systems & Architecture', code: 'CS-302', progress: 70, teacher: 'Prof. Sharma', notesCount: 8 },
    { id: 3, name: 'Database Management Systems', code: 'CS-303', progress: 90, teacher: 'Dr. Rao', notesCount: 15 },
    { id: 4, name: 'Web Engineering & Frameworks', code: 'CS-304', progress: 95, teacher: 'Prof. Gupta', notesCount: 20 }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    progress: 50,
    teacher: ''
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/college`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSubjects(data); })
      .catch(() => {});
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/college/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.subjects) setSubjects(data.subjects);
    } catch (err) {
      setSubjects(prev => [
        ...prev,
        { id: Date.now(), ...formData, notesCount: 0 }
      ]);
    }
    setShowModal(false);
    setFormData({ name: '', code: '', progress: 50, teacher: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            College & Study Hub
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Subjects, lecture notes, exam timetables & academic roadmap.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((sub) => (
          <div key={sub.id || sub.code} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{sub.name}</h3>
                  <div className="text-xs text-slate-400 font-mono">{sub.code} • {sub.teacher}</div>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">{sub.progress}% Syllabus</span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style={{ width: `${sub.progress}%` }}></div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
              <span className="text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5"/> {sub.notesCount || 10} Notes Uploaded
              </span>
              <button className="text-cyan-400 hover:underline">Open Notes →</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" /> Add College Course / Subject
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & ML"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-305"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Instructor / Professor</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Verma"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Initial Syllabus Completion ({formData.progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="w-full text-emerald-500 bg-slate-900"
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

