import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Habitation, HazardZone } from '../types';
import { GISMapComponent } from '../features/map/GISMapComponent';
import { Badge } from '../components/Badge';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
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
    { name: 'Immediate', value: 14, color: '#ef476f' },
    { name: 'Short-Term', value: 18, color: '#f77f00' },
    { name: 'Medium-Term', value: 15, color: '#ffd166' },
    { name: 'Monitor', value: 8, color: '#06d6a0' }
  ];

  const hazardChartData = [
    { hazard: 'Landslide', habitations: 28, risk: 92 },
    { hazard: 'Teesta Flood', habitations: 18, risk: 96 },
    { hazard: 'Seismic MBT', habitations: 12, risk: 85 },
    { hazard: 'Flash Flood', habitations: 15, risk: 89 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-700/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Disaster Management Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial intelligence, multi-hazard risk analysis, and safe relocation monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 bg-navy-850 hover:bg-navy-800 border border-navy-700 rounded-xl text-slate-300 transition"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/relocation')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black text-xs tracking-wide shadow-lg shadow-accent-blue/20 hover:opacity-95 transition flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 stroke-[2.5]" />
            <span>AI Relocation Engine</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Habitations</span>
            <Home className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl font-black text-white">{kpis.total_habitations}</p>
          <p className="text-[10px] text-slate-400 mt-1">Monitored Settlements</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-accent-red/30 shadow-md bg-accent-red/5">
          <div className="flex items-center justify-between text-accent-red mb-2">
            <span className="text-xs font-semibold uppercase">High-Risk Red Zones</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-accent-red">{kpis.high_risk_habitations}</p>
          <p className="text-[10px] text-accent-red mt-1 font-medium">Critical / High Severity</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-accent-red/40 shadow-md bg-accent-red/10">
          <div className="flex items-center justify-between text-accent-red mb-2">
            <span className="text-xs font-semibold uppercase">Immediate Relocation</span>
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-accent-red">{kpis.immediate_relocation_required}</p>
          <p className="text-[10px] text-accent-red mt-1 font-bold">Action Required Now</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700/80 shadow-md">
          <div className="flex items-center justify-between text-accent-teal mb-2">
            <span className="text-xs font-semibold uppercase">Safe Relocation Sites</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-accent-teal">{kpis.safe_relocation_sites}</p>
          <p className="text-[10px] text-slate-400 mt-1">Elevated High Plateaus</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700/80 shadow-md">
          <div className="flex items-center justify-between text-accent-amber mb-2">
            <span className="text-xs font-semibold uppercase">Available Capacity</span>
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-accent-amber">{kpis.available_capacity.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Buffer Seats Available</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700/80 shadow-md">
          <div className="flex items-center justify-between text-accent-orange mb-2">
            <span className="text-xs font-semibold uppercase">Active Multi-Hazards</span>
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-accent-orange">{kpis.active_hazards}</p>
          <p className="text-[10px] text-slate-400 mt-1">Mapped Geo-Polygons</p>
        </div>
      </div>

      {/* Main Grid: Interactive GIS Map & Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive GIS Map Command Center (2 Cols) */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-700/80 rounded-3xl p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Multi-Hazard Risk Map</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent-blue/15 text-accent-cyan font-bold border border-accent-blue/30">
                  LIVE GIS PIPELINE
                </span>
              </h3>
              <p className="text-xs text-slate-400">Click any marker to inspect vulnerability and safe relocation options</p>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs font-bold text-accent-cyan hover:underline flex items-center gap-1"
            >
              <span>Expand Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden">
            <GISMapComponent habitations={habitations} />
          </div>
        </div>

        {/* Analytics Charts Side Column (1 Col) */}
        <div className="space-y-6">
          {/* Priority Distribution Pie Chart */}
          <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-5">
            <h3 className="text-sm font-bold text-white mb-2">Relocation Priority Breakdown</h3>
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
                  <Tooltip contentStyle={{ backgroundColor: '#131d38', borderColor: '#273459', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-navy-800 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-red" /> Immediate (14)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-orange" /> Short-Term (18)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-amber" /> Medium-Term (15)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-teal" /> Monitor (8)</div>
            </div>
          </div>

          {/* Hazard Distribution Bar Chart */}
          <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-5">
            <h3 className="text-sm font-bold text-white mb-2">Hazard Exposure by Settlement</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hazardChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="hazard" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#131d38', borderColor: '#273459', borderRadius: '8px' }} />
                  <Bar dataKey="habitations" fill="#00b4d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top Vulnerable Habitations Table */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white">Top Vulnerable Habitations Needing Action</h3>
            <p className="text-xs text-slate-400 mt-0.5">Priority sorted based on AI risk score & vulnerable population ratio</p>
          </div>
          <button
            onClick={() => navigate('/habitations')}
            className="px-3.5 py-1.5 bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs font-bold text-accent-cyan rounded-xl transition"
          >
            View All 55 Habitations
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-700 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-3">Habitation Name</th>
                <th className="pb-3 px-3">District</th>
                <th className="pb-3 px-3">Total Pop</th>
                <th className="pb-3 px-3">Vulnerable Pop</th>
                <th className="pb-3 px-3">Risk Score</th>
                <th className="pb-3 px-3">Priority</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {habitations.slice(0, 6).map((hab) => (
                <tr key={hab.id} className="hover:bg-navy-850/60 transition group">
                  <td className="py-3 px-3 font-bold text-white group-hover:text-accent-cyan transition">{hab.name}</td>
                  <td className="py-3 px-3 text-slate-300">{hab.district}</td>
                  <td className="py-3 px-3 text-slate-300">{hab.population.toLocaleString()}</td>
                  <td className="py-3 px-3 font-semibold text-accent-red">{hab.vulnerable_population.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-accent-amber">{hab.hazard_score}/100</span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge priority={hab.relocation_priority} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/habitations/${hab.id}`)}
                      className="px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold rounded-lg transition"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => navigate(`/relocation?habitation_id=${hab.id}`)}
                      className="px-2.5 py-1 bg-accent-blue hover:bg-accent-blue/80 text-navy-950 font-extrabold rounded-lg transition"
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
