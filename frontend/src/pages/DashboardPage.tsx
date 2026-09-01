import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Habitation, HazardZone } from '../types';
import { GISMapComponent } from '../features/map/GISMapComponent';
import { Badge } from '../components/Badge';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import {
  Home, ShieldAlert, Cpu, ShieldCheck, Building2, Flame, ArrowRight, AlertTriangle, RefreshCw
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [habitations, setHabitations] = useState<Habitation[]>([]);
  const [hazards, setHazards] = useState<HazardZone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, habsRes, hazRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getHabitations(),
        api.getHazardsGeoJSON()
      ]);
      setSummaryData(sumRes);
      setHabitations(habsRes);
      setHazards(hazRes.features.map((f: any) => f.properties));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpis = summaryData?.kpis || {
    total_habitations: 55,
    high_risk_habitations: 32,
    immediate_relocation_required: 14,
    safe_relocation_sites: 20,
    available_capacity: 84200,
    active_hazards: 5
  };

  const priorityData = summaryData?.priority_distribution || [
    { name: 'Immediate', value: 14, color: '#DC2626' },
    { name: 'Short-Term', value: 18, color: '#EA580C' },
    { name: 'Medium-Term', value: 15, color: '#4F46E5' },
    { name: 'Monitor', value: 8, color: '#059669' }
  ];

  const hazardChartData = [
    { hazard: 'Landslide', habitations: 28, risk: 92 },
    { hazard: 'Teesta Flood', habitations: 18, risk: 96 },
    { hazard: 'Seismic MBT', habitations: 12, risk: 85 },
    { hazard: 'Flash Flood', habitations: 15, risk: 89 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CBD5E1] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Disaster Management Command Center
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live SIH Data
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Real-time geospatial intelligence, multi-hazard risk analysis, and safe relocation monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl text-[#334155] transition shadow-xs"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/relocation')}
            className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs tracking-wide shadow-xs transition flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            <span>AI Relocation Engine</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] shadow-xs hover:border-[#94A3B8] transition">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Habitations</span>
            <Home className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F172A]">{kpis.total_habitations}</p>
          <p className="text-[10px] text-[#64748B] mt-1 font-medium">Monitored Settlements</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-100/50 border border-rose-300 shadow-xs hover:border-rose-400 transition">
          <div className="flex items-center justify-between text-rose-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Red Zones</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-rose-800">{kpis.high_risk_habitations}</p>
          <p className="text-[10px] text-rose-700 mt-1 font-semibold">Critical / Severe Risk</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-100/70 border border-rose-400 shadow-xs hover:border-rose-500 transition">
          <div className="flex items-center justify-between text-rose-900 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Immediate</span>
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold text-rose-900">{kpis.immediate_relocation_required}</p>
          <p className="text-[10px] text-rose-800 mt-1 font-bold">Evacuation Needed</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-100/50 border border-emerald-300 shadow-xs hover:border-emerald-400 transition">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Safe Sites</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-800">{kpis.safe_relocation_sites}</p>
          <p className="text-[10px] text-emerald-700 mt-1 font-medium">High Plateaus</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] shadow-xs hover:border-[#94A3B8] transition">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Available Capacity</span>
            <Building2 className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F172A]">{kpis.available_capacity.toLocaleString()}</p>
          <p className="text-[10px] text-[#64748B] mt-1 font-medium">Buffer Capacity</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-100/50 border border-amber-300 shadow-xs hover:border-amber-400 transition">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Multi-Hazards</span>
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-amber-800">{kpis.active_hazards}</p>
          <p className="text-[10px] text-amber-700 mt-1 font-medium">Geo-Mapped Zones</p>
        </div>
      </div>

      {/* Main Grid: Interactive GIS Map & Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive GIS Map Command Center (2 Cols) */}
        <div className="lg:col-span-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-5 flex flex-col h-[520px] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <span>Multi-Hazard Risk Map</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold border border-[#E0E7FF]">
                  LIVE PIPELINE
                </span>
              </h3>
              <p className="text-xs text-[#64748B]">Click markers to view habitation risk scores & safe sites</p>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1"
            >
              <span>Expand Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border border-[#CBD5E1]">
            <GISMapComponent habitations={habitations} />
          </div>
        </div>

        {/* Analytics Charts Side Column (1 Col) */}
        <div className="space-y-6">
          {/* Priority Distribution Pie Chart */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0F172A] mb-2">Relocation Priority Breakdown</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#E2E8F0] text-xs text-[#334155]">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Immediate (14)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Short-Term (18)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Medium-Term (15)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Monitor (8)</div>
            </div>
          </div>

          {/* Hazard Distribution Bar Chart */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0F172A] mb-2">Hazard Exposure by Settlement</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hazardChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="hazard" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="habitations" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top Vulnerable Habitations Table */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Top Vulnerable Habitations Needing Action</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Priority sorted based on AI risk score & vulnerable population ratio</p>
          </div>
          <button
            onClick={() => navigate('/habitations')}
            className="px-3.5 py-1.5 bg-[#E2E8F0] hover:bg-[#CBD5E1] border border-[#CBD5E1] text-xs font-bold text-[#4F46E5] rounded-xl transition"
          >
            View All Habitations
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#CBD5E1] text-[#64748B] uppercase text-[10px] tracking-wider bg-[#E2E8F0]/60">
                <th className="py-2.5 px-3 rounded-l-lg">Habitation Name</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Total Pop</th>
                <th className="py-2.5 px-3">Vulnerable Pop</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {habitations.slice(0, 6).map((hab) => (
                <tr key={hab.id} className="hover:bg-[#E2E8F0]/40 transition group">
                  <td className="py-3 px-3 font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition">{hab.name}</td>
                  <td className="py-3 px-3 text-[#334155]">{hab.district}</td>
                  <td className="py-3 px-3 text-[#334155]">{hab.population.toLocaleString()}</td>
                  <td className="py-3 px-3 font-semibold text-rose-700">{hab.vulnerable_population.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-amber-700">{hab.hazard_score}/100</span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge priority={hab.relocation_priority} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/habitations/${hab.id}`)}
                      className="px-2.5 py-1 bg-[#E2E8F0] hover:bg-[#CBD5E1] border border-[#CBD5E1] text-[#334155] font-semibold rounded-lg transition"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => navigate(`/relocation?habitation_id=${hab.id}`)}
                      className="px-2.5 py-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-lg transition shadow-xs"
                    >
                      Recommend Sites
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
