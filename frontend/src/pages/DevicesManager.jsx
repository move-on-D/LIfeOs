import React from 'react';
import { Laptop, Smartphone, HardDrive, Wifi, Activity, CheckCircle2 } from 'lucide-react';

export default function DevicesManager() {
  const devices = [
    { name: 'Primary Workstation Laptop', type: 'Windows 11 PC', status: 'Online & Synced', specs: '16GB RAM • Core i7', icon: Laptop, isCurrent: true },
    { name: 'Personal Android Smartphone', type: 'Android (PWA Sync)', status: 'Online & Connected', specs: 'LifeOS App Installed', icon: Smartphone, isCurrent: false },
    { name: 'Backup External Drive', type: 'Local Storage', status: 'Encrypted Snapshot', specs: '1TB Storage', icon: HardDrive, isCurrent: false }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Laptop className="w-6 h-6 text-indigo-400" />
          Devices Manager
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Connected devices, specs, sync status & system health checks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {devices.map((dev, idx) => {
          const Icon = dev.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800 text-indigo-400">
                  <Icon className="w-6 h-6" />
                </div>
                {dev.isCurrent ? (
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    This Device
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Synced
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">{dev.name}</h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{dev.type}</div>
                <div className="text-xs text-indigo-300 font-mono mt-2">{dev.specs}</div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-emerald-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> {dev.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
