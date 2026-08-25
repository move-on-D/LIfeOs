import React from 'react';
import { 
  LayoutDashboard, 
  KeyRound, 
  ShieldCheck, 
  Laptop, 
  FolderLock, 
  GraduationCap, 
  Code2, 
  Wallet, 
  Target, 
  Gamepad2,
  Map,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeModule, setActiveModule, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Main', color: 'text-cyan-400' },
    { id: 'accounts', label: 'Accounts Hub', icon: KeyRound, badge: 'Safe', color: 'text-sky-400' },
    { id: 'security', label: 'Security Center', icon: ShieldCheck, badge: '2FA', color: 'text-rose-400' },
    { id: 'devices', label: 'Devices Manager', icon: Laptop, badge: 'Sync', color: 'text-indigo-400' },
    { id: 'vault', label: 'Documents Vault', icon: FolderLock, badge: 'Vault', color: 'text-amber-400' },
    { id: 'study', label: 'College & Study', icon: GraduationCap, badge: 'Notes', color: 'text-emerald-400' },
    { id: 'projects', label: 'Projects Hub', icon: Code2, badge: 'Dev', color: 'text-cyan-400' },
    { id: 'finance', label: 'Finance Tracker', icon: Wallet, badge: '₹ UPI', color: 'text-emerald-400' },
    { id: 'habits', label: 'Goals & Habits', icon: Target, badge: 'Streak', color: 'text-rose-400' },
    { id: 'entertainment', label: 'Entertainment', icon: Gamepad2, badge: 'Anime', color: 'text-purple-400' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        w-64 glass-panel border-r border-slate-800/80 p-4 flex-col justify-between 
        ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 bg-slate-950/95 flex top-[65px] h-[calc(100vh-65px)]' : 'sticky top-[65px] h-[calc(100vh-65px)] hidden md:flex'}
      `}>
        {/* Navigation Links */}
        <div className="space-y-1 overflow-y-auto pr-1">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase px-3 py-2">
            Core Modules
          </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-800/90 text-slate-100 border border-slate-700 shadow-md shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${item.color} ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              <div className="flex items-center space-x-1.5">
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                    isActive 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quote & Footer Banner */}
      <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl"></div>
        <p className="text-[11px] font-mono text-cyan-300 font-semibold mb-1">
          "夢は逃げない。逃げるのはいつも自分だ。"
        </p>
        <p className="text-[10px] text-slate-400 italic">
          (Dreams don't run away. It's you who gives up.)
        </p>
        <div className="mt-2 text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider">
          Created by MOVE ON.
        </div>
      </div>
    </aside>
    </>
  );
}
