import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Home,
  Flame,
  Cpu,
  ShieldCheck,
  Building2,
  BarChart3,
  FileText,
  UploadCloud,
  CheckCircle2,
  Settings
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Risk Map', path: '/map', icon: MapPin },
  { name: 'Habitations', path: '/habitations', icon: Home },
  { name: 'Hazard Zones', path: '/hazards', icon: Flame },
  { name: 'Relocation Engine', path: '/relocation', icon: Cpu },
  { name: 'Safe Sites', path: '/sites', icon: ShieldCheck },
  { name: 'Carrying Capacity', path: '/capacity', icon: Building2 },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Reports & Exports', path: '/reports', icon: FileText },
  { name: 'Data Management', path: '/data', icon: UploadCloud },
  { name: 'Expert Validation', path: '/validation', icon: CheckCircle2 },
  { name: 'Admin Controls', path: '/admin', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-700/60 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header with App Icon */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-navy-700/60 bg-navy-950/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue/20 via-accent-cyan/20 to-accent-teal/20 flex items-center justify-center p-1 border border-accent-cyan/40 shadow-lg shadow-accent-cyan/20">
          <img src="/favicon.svg" alt="SurakshitSthan Icon" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
            Surakshit<span className="text-accent-cyan">Sthan</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            AI + GIS Platform
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Geospatial Intelligence
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-blue/20 to-accent-cyan/10 text-accent-cyan font-bold border border-accent-cyan/30 shadow-md shadow-accent-blue/10'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0 text-accent-cyan" />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded shadow-sm">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Version */}
      <div className="p-3.5 border-t border-navy-700/60 bg-navy-950/30">
        <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/60 text-center">
          <p className="text-xs font-bold text-slate-200">West Bengal GIS Command</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Version 2.4.0 • Multi-Hazard AI Platform</p>
        </div>
      </div>
    </aside>
  );
};
