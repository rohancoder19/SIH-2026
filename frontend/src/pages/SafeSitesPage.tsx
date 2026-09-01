import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Habitation, RankedRelocationSite } from '../types';
import { Badge } from '../components/Badge';
import { ShieldCheck, MapPin, Building2 } from 'lucide-react';

export const SafeSitesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [habitations, setHabitations] = useState<Habitation[]>([]);
  const [selectedHabId, setSelectedHabId] = useState<number>(Number(searchParams.get('habitation_id')) || 1);
  const [recommendations, setRecommendations] = useState<RankedRelocationSite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const habs = await api.getHabitations();
      setHabitations(habs);
      if (habs.length > 0 && !searchParams.get('habitation_id')) {
        setSelectedHabId(habs[0].id);
      }
    };
    init();
  }, [searchParams]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedHabId) return;
      setLoading(true);
      try {
        const res = await api.getRelocationRecommendations(selectedHabId);
        setRecommendations(res.recommended_sites || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [selectedHabId]);

  const activeHab = habitations.find(h => h.id === selectedHabId) || habitations[0];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CBD5E1] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-800" />
            <span>Safe Relocation Site Recommendation Engine</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Multi-Criteria Decision Analysis (MCDA) ranking suitable high-plateau relocation sites
          </p>
        </div>
      </div>

      {/* Target Habitation Selector */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#334155]">Select Vulnerable Settlement:</span>
          <select
            value={selectedHabId}
            onChange={(e) => setSelectedHabId(Number(e.target.value))}
            className="bg-[#E2E8F0]/70 border border-[#CBD5E1] rounded-xl px-4 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
          >
            {habitations.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.district}) - Priority: {h.relocation_priority}
              </option>
            ))}
          </select>
        </div>

        {activeHab && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#64748B]">Vulnerable Pop: <strong className="text-rose-700">{activeHab.vulnerable_population.toLocaleString()}</strong></span>
            <span>•</span>
            <Badge priority={activeHab.relocation_priority} size="sm" />
          </div>
        )}
      </div>

      {/* Ranked Safe Site Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">
          Ranked Relocation Sites for {activeHab?.name || 'Selected Settlement'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((site, index) => {
            const isTop = index === 0;
            return (
              <div
                key={site.site_id}
                className={`rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-xs ${
                  isTop
                    ? 'bg-emerald-100/50 border-emerald-300'
                    : 'bg-[#F8FAFC] border-[#CBD5E1]'
                }`}
              >
                <div>
                  {/* Rank Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${isTop ? 'bg-emerald-700 text-white' : 'bg-[#E2E8F0] text-[#334155]'}`}>
                      #{index + 1} {isTop ? 'TOP MATCH' : 'SUITABLE'}
                    </span>
                    <span className="text-2xl font-extrabold text-[#4F46E5]">{site.overall_score}<span className="text-xs text-[#64748B]">/100</span></span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#0F172A] mb-1">{site.site_name}</h3>
                  <p className="text-xs text-[#64748B] mb-4 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>{site.district} District • {site.distance_km} km away</span>
                  </p>

                  {/* Factor Ratings */}
                  <div className="space-y-2 bg-[#E2E8F0]/60 p-3.5 rounded-xl border border-[#CBD5E1] text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Safety Score (30%):</span>
                      <span className="font-bold text-emerald-800">{site.safety_score}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Available Buffer (20%):</span>
                      <span className="font-bold text-[#0F172A]">{site.available_capacity.toLocaleString()} seats</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Evacuation Access (15%):</span>
                      <span className="font-bold text-[#334155]">{site.accessibility_score}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Infrastructure (15%):</span>
                      <span className="font-bold text-[#334155]">{site.infrastructure_score}/100</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#334155] italic mb-4">
                    "{site.recommendation_reason}"
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/capacity?site_id=${site.site_id}`)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs ${
                    isTop
                      ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                      : 'bg-[#E2E8F0] hover:bg-[#CBD5E1] border border-[#CBD5E1] text-[#334155]'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Inspect Carrying Capacity</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
