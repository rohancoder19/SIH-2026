import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Cpu, ShieldCheck, ArrowRight, Activity, BarChart } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] flex flex-col font-sans overflow-x-hidden">
      {/* Top Header Navigation */}
      <header className="h-20 border-b border-[#CBD5E1] bg-[#F8FAFC] px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center p-1 shadow-xs">
            <img src="/favicon.svg" alt="SurakshitSthan App Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-[#0F172A]">
              Surakshit<span className="text-[#4F46E5]">Sthan</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#64748B] font-bold">
              AI + GIS Disaster Command
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-xs font-bold text-[#334155] hover:text-[#0F172A] transition"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs tracking-wide shadow-xs transition"
          >
            Launch Command Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 lg:px-12 max-w-7xl mx-auto text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#4F46E5] mb-8 shadow-xs">
          <Activity className="w-4 h-4 text-rose-600 animate-pulse" />
          <span>Government-Grade Geospatial Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-tight max-w-4xl">
          AI-Powered Disaster Risk & <br />
          <span className="text-[#4F46E5]">
            Safe Relocation Intelligence
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#334155] max-w-2xl font-normal leading-relaxed">
          Identify vulnerable habitations, map multi-hazard red-zones, and discover safer relocation sites using explainable AI, GIS spatial analysis, and carrying-capacity modeling.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm tracking-wide shadow-xs hover:translate-y-[-1px] transition flex items-center gap-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/map')}
            className="px-8 py-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] font-bold text-sm transition flex items-center gap-2 shadow-xs"
          >
            <Map className="w-4 h-4 text-[#4F46E5]" />
            <span>Explore Live Risk Map</span>
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-left shadow-xs">
            <p className="text-xs font-bold text-[#64748B] uppercase">Monitored Habitations</p>
            <p className="text-3xl font-extrabold text-[#0F172A] mt-1">55+</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Darjeeling / Kalimpong</p>
          </div>
          <div className="p-5 rounded-2xl bg-rose-100/60 border border-rose-300 text-left shadow-xs">
            <p className="text-xs font-bold text-rose-800 uppercase">High Risk Red-Zones</p>
            <p className="text-3xl font-extrabold text-rose-800 mt-1">14</p>
            <p className="text-[11px] text-rose-700 font-semibold mt-0.5">Immediate Relocation</p>
          </div>
          <div className="p-5 rounded-2xl bg-emerald-100/60 border border-emerald-300 text-left shadow-xs">
            <p className="text-xs font-bold text-emerald-800 uppercase">Safe Relocation Sites</p>
            <p className="text-3xl font-extrabold text-emerald-800 mt-1">20</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">High Plateaus</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-left shadow-xs">
            <p className="text-xs font-bold text-[#64748B] uppercase">Buffer Capacity</p>
            <p className="text-3xl font-extrabold text-[#0F172A] mt-1">84.2K</p>
            <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Sustainable Seats</p>
          </div>
        </div>
      </section>

      {/* Capabilities Features Grid */}
      <section className="py-16 px-6 lg:px-12 bg-[#F8FAFC] border-t border-b border-[#CBD5E1]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A]">
              Complete Disaster Management Lifecycle
            </h2>
            <p className="text-[#334155] text-sm mt-3">
              Built for disaster management authorities, urban planners, NGOs, and field researchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#F1F5F9] border border-[#CBD5E1] hover:border-[#94A3B8] hover:translate-y-[-2px] transition group shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-4 border border-[#E0E7FF]">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">GIS Multi-Hazard Mapping</h3>
              <p className="text-xs text-[#334155] mt-2 leading-relaxed">
                Overlay flood contours, landslide slope instability, seismic fault lines, and telemetry sensors on interactive Leaflet maps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F1F5F9] border border-[#CBD5E1] hover:border-[#94A3B8] hover:translate-y-[-2px] transition group shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4 border border-rose-300">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">AI Relocation Engine</h3>
              <p className="text-xs text-[#334155] mt-2 leading-relaxed">
                Scikit-Learn Random Forest classification engine providing explainable priority levels (Immediate, Short-Term, Medium-Term, Monitor).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F1F5F9] border border-[#CBD5E1] hover:border-[#94A3B8] hover:translate-y-[-2px] transition group shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Safe Site Recommendation</h3>
              <p className="text-xs text-[#334155] mt-2 leading-relaxed">
                Multi-Criteria Decision Analysis (MCDA) ranking safe sites based on safety, land area, accessibility, and evacuation distance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F1F5F9] border border-[#CBD5E1] hover:border-[#94A3B8] hover:translate-y-[-2px] transition group shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 border border-amber-300">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Carrying Capacity Assessment</h3>
              <p className="text-xs text-[#334155] mt-2 leading-relaxed">
                Calculate sustainable land area utilization across usable hectares, water availability, infrastructure quality, and environmental bounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-[#CBD5E1] bg-[#F8FAFC] text-center text-xs text-[#64748B]">
        <p>© 2026 SurakshitSthan AI • National Disaster Management & Geospatial Intelligence Platform</p>
      </footer>
    </div>
  );
};
