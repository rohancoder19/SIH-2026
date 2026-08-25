import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { RelocationSite } from '../types';
import { Building2, Layers, ShieldCheck, Activity, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const CarryingCapacityPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sites, setSites] = useState<RelocationSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<number>(Number(searchParams.get('site_id')) || 1);
  const [capacityData, setCapacityData] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const data = await api.getRelocationSites();
      setSites(data);
      if (data.length > 0 && !searchParams.get('site_id')) {
        setSelectedSiteId(data[0].id);
      }
    };
    init();
  }, [searchParams]);

  useEffect(() => {
    const loadCapacity = async () => {
      if (!selectedSiteId) return;
      try {
        const res = await api.getSiteCapacity(selectedSiteId);
        setCapacityData(res);
      } catch (e) {
        console.error(e);
      }
    };
    loadCapacity();
  }, [selectedSiteId]);

  const activeSite = sites.find(s => s.id === selectedSiteId) || sites[0];

  const chartData = capacityData ? [
    { metric: 'Land Capacity', capacity: capacityData.land_capacity },
    { metric: 'Water Supply', capacity: capacityData.water_capacity },
    { metric: 'Infra & Health', capacity: capacityData.infrastructure_capacity },
    { metric: 'Environmental Bounds', capacity: capacityData.environmental_capacity },
  ] : [];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-700/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-accent-amber" />
            <span>Carrying Capacity Assessment Module</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Calculate sustainable population limits across land area, water supply, healthcare, and environmental bounds
          </p>
        </div>
      </div>

      {/* Target Site Picker */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300">Select Relocation Site:</span>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(Number(e.target.value))}
            className="bg-navy-850 border border-navy-700 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-accent-cyan cursor-pointer"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.district}) - Safety: {s.safety_score}/100
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      {capacityData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Capacity Metrics Summary (1 Col) */}
          <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="border-b border-navy-700 pb-3">
              <span className="text-[10px] uppercase font-bold text-accent-amber">SUSTAINABLE BOTTLENECK</span>
              <h2 className="text-xl font-black text-white">{capacityData.site_name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Usable Area: {capacityData.usable_area_ha} ha</p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-850 border border-navy-700">
              <span className="text-xs text-slate-400 block">Recommended Sustainable Capacity</span>
              <span className="text-3xl font-black text-accent-cyan mt-1 block">
                {capacityData.recommended_sustainable_capacity.toLocaleString()} <span className="text-xs text-slate-400 font-normal">people</span>
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span className="text-slate-400">Current Population:</span>
                <span className="font-bold text-white">{capacityData.current_population.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span className="text-slate-400">Available Buffer Capacity:</span>
                <span className="font-bold text-accent-teal">{capacityData.available_capacity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span className="text-slate-400">Utilization Rate:</span>
                <span className="font-bold text-accent-amber">{capacityData.utilization_percentage}%</span>
              </div>
            </div>

            {/* Utilization Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Capacity Utilization</span>
                <span className="text-accent-teal">{capacityData.utilization_percentage}%</span>
              </div>
              <div className="w-full bg-navy-800 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-accent-teal to-accent-cyan h-full rounded-full transition-all duration-500"
                  style={{ width: `${capacityData.utilization_percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Capacity Breakdown Bar Chart (2 Cols) */}
          <div className="lg:col-span-2 bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl flex flex-col">
            <h3 className="text-base font-bold text-white mb-4">Capacity Limits by Sub-System</h3>
            <div className="h-72 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#131d38', borderColor: '#273459', borderRadius: '8px' }} />
                  <Bar dataKey="capacity" fill="#ffd166" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
