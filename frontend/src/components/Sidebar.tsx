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
  Settings,
  Activity
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
  { name: 'Data Transparency', path: '/transparency', icon: Activity, badge: 'NEW' },
  { name: 'Data Management', path: '/data', icon: UploadCloud },
  { name: 'Expert Validation', path: '/validation', icon: CheckCircle2 },
  { name: 'Admin Controls', path: '/admin', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#F8FAFC] border-r border-[#CBD5E1] flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header with App Icon */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-[#CBD5E1] bg-[#F8FAFC]">
        <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center p-1 shadow-xs">
          <img src="/favicon.svg" alt="SurakshitSthan Icon" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-[#0F172A] leading-tight">
            Surakshit<span className="text-[#4F46E5]">Sthan</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[#64748B] font-bold">
            AI + GIS Platform
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
          Geospatial Intelligence
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold border border-[#E0E7FF] shadow-xs'
                    : 'text-[#334155] hover:text-[#0F172A] hover:bg-[#E2E8F0]/70'
                }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0 text-[#4F46E5]" />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider bg-[#4F46E5] text-white rounded shadow-xs">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Version */}
      <div className="p-3.5 border-t border-[#CBD5E1] bg-[#F8FAFC]">
        <div className="p-3 rounded-xl bg-[#E2E8F0]/60 border border-[#CBD5E1] text-center">
          <p className="text-xs font-bold text-[#0F172A]">West Bengal GIS Command</p>
          <p className="text-[10px] text-[#64748B] mt-0.5">Version 2.4.0 • Multi-Hazard AI Platform</p>
        </div>
      </div>
    </aside>
  );
};
