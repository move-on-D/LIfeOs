import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle, RefreshCw, Key, X } from 'lucide-react';

export default function SecurityCenter() {
  const [securityRules] = useState([
    { title: 'No Plain Password Storage', status: 'Enforced', desc: 'All credentials hashed with bcrypt & salt.' },
    { title: 'End-to-End Encryption', status: 'Active Key', desc: 'Vault data encrypted using your master key.' },
    { title: '2FA for Main Account', status: 'Enabled', desc: 'TOTP Authenticator active on all primary apps.' },
    { title: 'Local Backup (Offline mode)', status: 'Sync Ready', desc: 'Encrypted offline snapshot stored locally.' },
    { title: 'Only I Can Access', status: 'Master Key Locked', desc: 'Zero cloud telemetry or third-party tracking.' }
  ]);

  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState('Today at 18:20');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);

  const handleAudit = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setLastCheck(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1200);
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 6 }, () =>
      Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    );
    setBackupCodes(codes);
    setShowKeyModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
            Security Center
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Password manager, 2FA status, security rules & master key audit.
          </p>
        </div>
        <button
          onClick={generateBackupCodes}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:scale-105 transition-transform"
        >
          <Key className="w-4 h-4" /> Generate Backup Keys
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Rules (Must) Card from Lifeos.jpg */}
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-950 to-slate-950 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              Security Rules (Must)
            </h2>
            <span className="text-xs font-mono text-rose-400">Strict Protocol</span>
          </div>

          <div className="space-y-3">
            {securityRules.map((rule, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {rule.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{rule.desc}</div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {rule.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Master Encryption Key Status */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            Master Vault Lock
          </h2>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-slate-400">Encryption Standard</div>
            <div className="text-sm font-bold text-indigo-300 font-mono">AES-256-GCM + PBKDF2</div>
            <div className="text-[11px] text-slate-500 font-mono">Salted 600,000 rounds</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-slate-400">2FA Authenticator Status</div>
            <div className="text-sm font-bold text-emerald-400 font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Active & Synchronized
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Last check: {lastCheck}</span>
            </div>
          </div>

          <button
            onClick={handleAudit}
            disabled={isChecking}
            className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:border-slate-700 font-mono transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-rose-400 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Auditing Vault Integrity...' : 'Perform Security Checkup'}
          </button>
        </div>
      </div>

      {/* Backup Codes Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-rose-400" /> Generated Recovery Codes
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Store these single-use recovery codes in a safe offline location. They can unlock your LifeOS vault if 2FA is lost.
            </p>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 text-center">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800">{code}</div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold font-mono text-xs"
              >
                Close & Secure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

