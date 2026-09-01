import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HazardZone } from '../types';
import { Badge } from '../components/Badge';
import { Flame, Sliders, Save, Check } from 'lucide-react';

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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-600" />
            <span>Multi-Hazard Risk Engine & Red-Zones</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Map of critical hazard exposure zones and dynamic multi-hazard weight configuration
          </p>
        </div>
      </div>

      {/* Configurable Hazard Weights Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="text-base font-bold text-[#0F172A]">Configurable Multi-Hazard Weighting Model</h3>
          </div>
          <button
            onClick={handleSaveWeights}
            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Config Saved!' : 'Save Weight Configuration'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#334155]">Flood Weight</span>
              <span className="text-[#4F46E5]">{weights.flood_w}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights.flood_w}
              onChange={(e) => setWeights({ ...weights, flood_w: Number(e.target.value) })}
              className="w-full accent-[#4F46E5] cursor-pointer"
            />
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#334155]">Landslide Weight</span>
              <span className="text-amber-600">{weights.landslide_w}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights.landslide_w}
              onChange={(e) => setWeights({ ...weights, landslide_w: Number(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#334155]">Earthquake Weight</span>
              <span className="text-rose-600">{weights.earthquake_w}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights.earthquake_w}
              onChange={(e) => setWeights({ ...weights, earthquake_w: Number(e.target.value) })}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#334155]">Cyclone Weight</span>
              <span className="text-[#4F46E5]">{weights.cyclone_w}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights.cyclone_w}
              onChange={(e) => setWeights({ ...weights, cyclone_w: Number(e.target.value) })}
              className="w-full accent-[#4F46E5] cursor-pointer"
            />
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#334155]">Environmental Weight</span>
              <span className="text-emerald-700">{weights.environmental_w}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={weights.environmental_w}
              onChange={(e) => setWeights({ ...weights, environmental_w: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Hazard Zones Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#0F172A] mb-4">Mapped Hazard Zones Catalog</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] tracking-wider bg-[#F8FAFC]">
                <th className="py-2.5 px-4 rounded-l-lg">Hazard Zone Name</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Severity</th>
                <th className="py-2.5 px-4">Risk Score</th>
                <th className="py-2.5 px-4">Survey Source</th>
                <th className="py-2.5 px-4 rounded-r-lg">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {hazards.map((hz) => (
                <tr key={hz.id} className="hover:bg-[#F8FAFC] transition">
                  <td className="py-3 px-4 font-bold text-[#0F172A]">{hz.name || `Hazard Zone ${hz.id}`}</td>
                  <td className="py-3 px-4 text-[#475569]">{hz.hazard_type}</td>
                  <td className="py-3 px-4"><Badge severity={hz.severity} size="sm" /></td>
                  <td className="py-3 px-4 font-extrabold text-amber-600">{hz.risk_score}/100</td>
                  <td className="py-3 px-4 text-[#64748B]">{hz.source}</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">{Math.round(hz.confidence * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
