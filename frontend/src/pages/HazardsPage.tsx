import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HazardZone } from '../types';
import { Badge } from '../components/Badge';
import { Flame, Sliders, Save, ShieldAlert, Check } from 'lucide-react';

export const HazardsPage: React.FC = () => {
  const [hazards, setHazards] = useState<HazardZone[]>([]);
  const [weights, setWeights] = useState({
    flood_w: 25,
    landslide_w: 30,
    earthquake_w: 20,
    cyclone_w: 10,
    environmental_w: 15,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchHazards = async () => {
      try {
        const res = await api.getHazardsGeoJSON();
        setHazards(res.features.map((f: any) => f.properties));
      } catch (e) {
        console.error(e);
      }
    };
    fetchHazards();
  }, []);

  const handleSaveWeights = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-700/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-accent-red" />
            <span>Multi-Hazard Risk Engine & Red-Zones</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Map of critical hazard exposure zones and dynamic multi-hazard weight configuration
          </p>
        </div>
      </div>

      {/* Configurable Hazard Weights Card */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-base font-bold text-white">Configurable Multi-Hazard Weighting Model</h3>
          </div>
          <button
            onClick={handleSaveWeights}
            className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black text-xs rounded-xl shadow-lg shadow-accent-blue/20 hover:opacity-95 transition flex items-center gap-2"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Config Saved!' : 'Save Weight Configuration'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          <div className="bg-navy-850 p-4 rounded-2xl border border-navy-700 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Flood Weight</span>
              <span className="text-accent-cyan">{weights.flood_w}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights.flood_w}
              onChange={(e) => setWeights({ ...weights, flood_w: Number(e.target.value) })}
              className="w-full accent-accent-cyan cursor-pointer"
            />
          </div>

          <div className="bg-navy-850 p-4 rounded-2xl border border-navy-700 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Landslide Weight</span>
              <span className="text-accent-orange">{weights.landslide_w}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights.landslide_w}
              onChange={(e) => setWeights({ ...weights, landslide_w: Number(e.target.value) })}
              className="w-full accent-accent-orange cursor-pointer"
            />
          </div>

          <div className="bg-navy-850 p-4 rounded-2xl border border-navy-700 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Earthquake Weight</span>
              <span className="text-accent-amber">{weights.earthquake_w}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights.earthquake_w}
              onChange={(e) => setWeights({ ...weights, earthquake_w: Number(e.target.value) })}
              className="w-full accent-accent-amber cursor-pointer"
            />
          </div>

          <div className="bg-navy-850 p-4 rounded-2xl border border-navy-700 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Cyclone Weight</span>
              <span className="text-accent-blue">{weights.cyclone_w}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights.cyclone_w}
              onChange={(e) => setWeights({ ...weights, cyclone_w: Number(e.target.value) })}
              className="w-full accent-accent-blue cursor-pointer"
            />
          </div>

          <div className="bg-navy-850 p-4 rounded-2xl border border-navy-700 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Environmental Weight</span>
              <span className="text-accent-teal">{weights.environmental_w}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights.environmental_w}
              onChange={(e) => setWeights({ ...weights, environmental_w: Number(e.target.value) })}
              className="w-full accent-accent-teal cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Hazard Zones Table */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Mapped Hazard Zones Catalog</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-700 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-4">Hazard Zone Name</th>
                <th className="pb-3 px-4">Type</th>
                <th className="pb-3 px-4">Severity</th>
                <th className="pb-3 px-4">Risk Score</th>
                <th className="pb-3 px-4">Survey Source</th>
                <th className="pb-3 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {hazards.map((hz) => (
                <tr key={hz.id} className="hover:bg-navy-850/60 transition">
                  <td className="py-3 px-4 font-bold text-white">{hz.name || `Hazard Zone ${hz.id}`}</td>
                  <td className="py-3 px-4 text-slate-300">{hz.hazard_type}</td>
                  <td className="py-3 px-4"><Badge severity={hz.severity} size="sm" /></td>
                  <td className="py-3 px-4 font-extrabold text-accent-amber">{hz.risk_score}/100</td>
                  <td className="py-3 px-4 text-slate-400">{hz.source}</td>
                  <td className="py-3 px-4 text-accent-teal font-bold">{Math.round(hz.confidence * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
