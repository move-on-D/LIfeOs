import React, { useState, useEffect } from 'react';
import { Wallet, IndianRupee, ArrowUpRight, ArrowDownLeft, Plus, X } from 'lucide-react';

export default function FinanceTracker() {
  const [finance, setFinance] = useState({
    income: 15000,
    expenses: 2050,
    transactions: [
      { id: 1, title: 'Server Hosting / Domain', category: 'Tech', amount: 850, type: 'expense', date: 'Today' },
      { id: 2, title: 'College Books & Supplies', category: 'Study', amount: 1200, type: 'expense', date: 'Yesterday' },
      { id: 3, title: 'Freelance Coding Stipend', category: 'Income', amount: 15000, type: 'income', date: 'Aug 10' }
    ]
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tech',
    amount: '',
    type: 'expense'
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/finance`)
      .then(res => res.json())
      .then(data => { if (data.transactions) setFinance(data); })
      .catch(() => {});
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/finance/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.finance) setFinance(data.finance);
    } catch (err) {
      const parsedAmt = parseFloat(formData.amount) || 0;
      setFinance(prev => {
        const newIncome = formData.type === 'income' ? prev.income + parsedAmt : prev.income;
        const newExpenses = formData.type === 'expense' ? prev.expenses + parsedAmt : prev.expenses;
        return {
          income: newIncome,
          expenses: newExpenses,
          transactions: [
            { id: Date.now(), title: formData.title, category: formData.category, amount: parsedAmt, type: formData.type, date: 'Just now' },
            ...prev.transactions
          ]
        };
      });
    }
    setShowModal(false);
    setFormData({ title: '', category: 'Tech', amount: '', type: 'expense' });
  };

  const savings = finance.income - finance.expenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            Finance Tracker
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Expenses, budgets, UPI linked accounts, and monthly financial plans.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Total Monthly Income</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 flex items-center">
            <IndianRupee className="w-5 h-5 mr-0.5" /> {finance.income.toLocaleString()}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Monthly Expenses</div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1 flex items-center">
            <IndianRupee className="w-5 h-5 mr-0.5" /> {finance.expenses.toLocaleString()}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Net Savings</div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1 flex items-center">
            <IndianRupee className="w-5 h-5 mr-0.5" /> {savings.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Recent UPI & Account Transactions</h2>
        <div className="space-y-3">
          {finance.transactions.map((exp) => (
            <div key={exp.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg border ${exp.type === 'income' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' : 'bg-rose-950/60 border-rose-800 text-rose-400'}`}>
                  {exp.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{exp.title}</div>
                  <div className="text-xs text-slate-400 font-mono">{exp.category} • {exp.date}</div>
                </div>
              </div>
              <div className={`text-sm font-bold font-mono ${exp.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {exp.type === 'income' ? '+' : '-'} ₹{exp.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" /> New Transaction
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`py-2 rounded-xl font-bold border transition-colors ${formData.type === 'expense' ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`py-2 rounded-xl font-bold border transition-colors ${formData.type === 'income' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                  >
                    Income (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Title / Purpose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Subscription / UPI Food"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Tech">Tech / Server</option>
                  <option value="Study">Study / Books</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Freelance">Freelance / Income</option>
                  <option value="Personal">Personal / Misc</option>
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

