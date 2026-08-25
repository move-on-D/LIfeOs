import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Search, Check, Lock, X } from 'lucide-react';

export default function AccountsHub() {
  const [accounts, setAccounts] = useState([
    { id: 1, service: 'Google Account', identity: 'moveon.main@gmail.com', category: 'Primary', recovery: '2FA Enabled + Phone', status: 'Secured' },
    { id: 2, service: 'GitHub', identity: '@moveon-dev', category: 'Development', recovery: 'SSH Key + Security Keys', status: 'Secured' },
    { id: 3, service: 'LinkedIn', identity: 'MOVE ON', category: 'Professional', recovery: 'Authenticator App', status: 'Secured' },
    { id: 4, service: 'Vercel', identity: 'moveon-vercel', category: 'Deployment', recovery: 'GitHub OAuth', status: 'Secured' },
    { id: 5, service: 'Discord', identity: 'MOVEON#0001', category: 'Social', recovery: 'Backup Codes Downloaded', status: 'Secured' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    service: '',
    identity: '',
    category: 'Development',
    recovery: '2FA Enabled'
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/accounts')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAccounts(data); })
      .catch(() => {});
  }, []);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!formData.service || !formData.identity) return;

    try {
      const res = await fetch('http://localhost:5000/api/accounts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'Secured' })
      });
      const data = await res.json();
      if (data.accounts) setAccounts(data.accounts);
    } catch (err) {
      setAccounts(prev => [
        ...prev,
        { id: Date.now(), ...formData, status: 'Secured' }
      ]);
    }
    setShowModal(false);
    setFormData({ service: '', identity: '', category: 'Development', recovery: '2FA Enabled' });
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.identity || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-sky-400" />
            Accounts Hub
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Central directory for all your accounts, linked services, and recovery info.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Total Accounts</div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1">{accounts.length}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Security Health</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">100% Protected</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Recovery Status</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">Safe & Backed Up</div>
        </div>
      </div>

      {/* Main Directory Table with Search */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-100">Linked Accounts Directory</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search accounts..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-lg">Service</th>
                <th className="p-3">Identity / Login</th>
                <th className="p-3">Category</th>
                <th className="p-3">Recovery Method</th>
                <th className="p-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-bold text-slate-200 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    {acc.service}
                  </td>
                  <td className="p-3 font-mono text-slate-300">{acc.identity || acc.email || acc.username}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">
                      {acc.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 font-mono">{acc.recovery}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono text-[10px] flex items-center gap-1 w-max">
                      <Check className="w-3 h-3" /> {acc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-sky-400" /> Add New Account
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS / ChatGPT / Steam"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Identity / Email / Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user@gmail.com"
                  value={formData.identity}
                  onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Primary">Primary</option>
                  <option value="Development">Development</option>
                  <option value="Professional">Professional</option>
                  <option value="Deployment">Deployment</option>
                  <option value="Social">Social</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Recovery Info</label>
                <input
                  type="text"
                  placeholder="e.g. Authenticator App + Security Key"
                  value={formData.recovery}
                  onChange={(e) => setFormData({ ...formData, recovery: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/20"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

