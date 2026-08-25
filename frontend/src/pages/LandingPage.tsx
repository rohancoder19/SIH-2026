import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Cpu, ShieldCheck, ArrowRight, Activity, Layers, Users, BarChart } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-accent-blue selection:text-white">
      {/* Top Header Navigation */}
      <header className="h-20 border-b border-navy-800/60 bg-navy-950/80 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue/20 via-accent-cyan/20 to-accent-teal/20 flex items-center justify-center p-1 border border-accent-cyan/40 shadow-lg shadow-accent-cyan/20">
            <img src="/favicon.svg" alt="SurakshitSthan App Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white">
              Surakshit<span className="text-accent-cyan">Sthan</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              AI + GIS Disaster Command
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-extrabold text-xs tracking-wide shadow-lg shadow-accent-blue/20 hover:opacity-95 transition transform hover:-translate-y-0.5"
          >
            Launch Command Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 lg:px-12 max-w-7xl mx-auto text-center flex flex-col items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-blue/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-850 border border-navy-700 text-xs font-semibold text-accent-cyan mb-8 shadow-inner">
          <Activity className="w-4 h-4 text-accent-red animate-pulse" />
          <span>Government-Grade Geospatial Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none max-w-4xl">
          AI-Powered Disaster Risk & <br />
          <span className="bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-teal bg-clip-text text-transparent">
            Safe Relocation Intelligence
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
          Identify vulnerable habitations, map multi-hazard red-zones, and discover safer relocation sites using explainable AI, GIS pipeline spatial analysis, and carrying-capacity modeling.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black text-sm tracking-wide shadow-xl shadow-accent-blue/25 hover:scale-105 transition flex items-center gap-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
          <button
            onClick={() => navigate('/map')}
            className="px-8 py-4 rounded-2xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-100 font-bold text-sm transition flex items-center gap-2"
          >
            <Map className="w-4 h-4 text-accent-cyan" />
            <span>Explore Live Risk Map</span>
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800/80 backdrop-blur-md text-left">
            <p className="text-xs font-semibold text-slate-400 uppercase">Monitored Habitations</p>
            <p className="text-3xl font-black text-white mt-1">55+</p>
            <p className="text-[11px] text-accent-teal font-medium mt-0.5">Darjeeling / Kalimpong</p>
          </div>
          <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800/80 backdrop-blur-md text-left">
            <p className="text-xs font-semibold text-slate-400 uppercase">High Risk Red-Zones</p>
            <p className="text-3xl font-black text-accent-red mt-1">14</p>
            <p className="text-[11px] text-accent-red font-medium mt-0.5">Immediate Relocation</p>
          </div>
          <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800/80 backdrop-blur-md text-left">
            <p className="text-xs font-semibold text-slate-400 uppercase">Safe Relocation Sites</p>
            <p className="text-3xl font-black text-accent-teal mt-1">20</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Verified High Plateaus</p>
          </div>
          <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800/80 backdrop-blur-md text-left">
            <p className="text-xs font-semibold text-slate-400 uppercase">Buffer Capacity</p>
            <p className="text-3xl font-black text-accent-amber mt-1">84.2K</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Sustainable Seats</p>
          </div>
        </div>
      </section>

      {/* Capabilities Features Grid */}
      <section className="py-20 px-6 lg:px-12 bg-navy-900/40 border-t border-b border-navy-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Complete Disaster Management Lifecycle
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Built for disaster management authorities, urban planners, NGOs, and field researchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-navy-850 border border-navy-700/60 hover:border-accent-cyan/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-accent-blue/15 text-accent-cyan flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">GIS Multi-Hazard Mapping</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Overlay flood contours, landslide slope instability, seismic fault lines, and population density on interactive Leaflet maps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-850 border border-navy-700/60 hover:border-accent-cyan/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-accent-red/15 text-accent-red flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">AI Relocation Engine</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Scikit-Learn Random Forest classification engine providing explainable priority levels (Immediate, Short-Term, Medium-Term, Monitor).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-850 border border-navy-700/60 hover:border-accent-teal/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-accent-teal/15 text-accent-teal flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Safe Site Recommendation</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Multi-Criteria Decision Analysis (MCDA) ranking safe sites based on safety, carrying capacity, accessibility, and evacuation distance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-850 border border-navy-700/60 hover:border-accent-amber/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Carrying Capacity Assessment</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Calculate sustainable population bottlenecks across land area, water availability, infrastructure quality, and environmental bounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-navy-800/60 text-center text-xs text-slate-500">
        <p>© 2026 SurakshitSthan AI • National Disaster Management & Geospatial Intelligence Platform</p>
      </footer>
    </div>
  );
};
