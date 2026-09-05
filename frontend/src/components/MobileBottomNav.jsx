import React from 'react';
import { LayoutDashboard, KeyRound, FolderLock, Wallet, Menu } from 'lucide-react';

export default function MobileBottomNav({ activeModule, setActiveModule, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const primaryTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: KeyRound },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'vault', label: 'Vault', icon: FolderLock }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-panel bg-slate-950/95 border-t border-slate-800/80 px-2 py-1.5 safe-pb">
      <div className="flex items-center justify-around">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id && !isMobileMenuOpen;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveModule(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-[10px] font-mono mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Menu / Drawer Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isMobileMenuOpen ? 'text-rose-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className={`w-5 h-5 ${isMobileMenuOpen ? 'text-rose-400' : 'text-slate-400'}`} />
          <span className="text-[10px] font-mono mt-0.5 tracking-tight">More</span>
        </button>
      </div>
    </div>
  );
}
