import React, { useState, useEffect } from 'react';
import { FolderLock, Lock, Upload, Download, Trash2, X, FileText, Shield } from 'lucide-react';
import { apiFetch, API_BASE } from '../utils/api';

export default function DocumentsVault() {
  const [docs, setDocs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('Education');
  const [isUploading, setIsUploading] = useState(false);

  const fetchFiles = () => {
    apiFetch('/api/vault/files')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDocs(data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await apiFetch('/api/vault/upload', {
          method: 'POST',
          body: JSON.stringify({
            name: selectedFile.name,
            category,
            fileData: base64Data
          })
        });
        const data = await res.json();
        if (data.files) setDocs(data.files);
      } catch (err) { } finally {
        setIsUploading(false);
        setShowModal(false);
        setSelectedFile(null);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file from vault?')) return;
    try {
      const res = await apiFetch(`/api/vault/delete/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.files) setDocs(data.files);
    } catch (err) {
      setDocs(prev => prev.filter(d => d.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-amber-400" />
            Documents Vault
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Certificates, notes, ID proofs & encrypted personal archives.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => (
          <div key={doc.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 truncate max-w-[220px]">{doc.title}</h3>
                  <div className="text-xs text-slate-400 font-mono">{doc.category} • {doc.size}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Encrypted
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">{doc.date}</span>
              <div className="flex items-center gap-3">
                {doc.filename && (
                  <a
                    href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/vault/download/${doc.filename}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" /> Secure File Upload
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Select File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Vault Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Education">Education & Certificates</option>
                  <option value="Identity">Identity Proofs (Aadhaar / Passport)</option>
                  <option value="Finance">Finance & Taxes</option>
                  <option value="Dev">Dev Archives & Source</option>
                  <option value="General">General / Personal Notes</option>
                </select>
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
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Encrypt & Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

