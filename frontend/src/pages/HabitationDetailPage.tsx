import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Habitation } from '../types';
import { Badge } from '../components/Badge';
import {
  ArrowLeft, Cpu, ShieldCheck, Activity
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

export const HabitationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [habitation, setHabitation] = useState<Habitation | null>(null);
  const [mlData, setMlData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHabDetail = async () => {
      setLoading(true);
      try {
        const habId = Number(id) || 1;
        const hab = await api.getHabitationDetail(habId);
        setHabitation(hab);

        // Fetch Explainable AI (XAI) analysis
        const mlRes = await api.predictML({
          landslide_risk: hab.hazard_breakdown?.landslide || 90.0,
          flood_risk: hab.hazard_breakdown?.flood || 80.0,
          earthquake_risk: hab.hazard_breakdown?.earthquake || 70.0,
          environmental_risk: hab.hazard_breakdown?.environmental || 85.0,
          accessibility_score: hab.accessibility_score,
          infrastructure_score: hab.infrastructure_score,
          distance_to_safe_area_km: 7.5
        });
        setMlData(mlRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadHabDetail();
  }, [id]);

  if (!habitation) {
    return <div className="p-8 text-center text-[#64748B]">Loading Habitation Detail...</div>;
  }

  const radarData = [
    { factor: 'Landslide', score: habitation.hazard_breakdown?.landslide || 85 },
    { factor: 'Flood Exposure', score: habitation.hazard_breakdown?.flood || 75 },
    { factor: 'Earthquake', score: habitation.hazard_breakdown?.earthquake || 65 },
    { factor: 'Environmental', score: habitation.hazard_breakdown?.environmental || 80 },
    { factor: 'Infra Deficit', score: round(100 - habitation.infrastructure_score, 1) },
    { factor: 'Access Deficit', score: round(100 - habitation.accessibility_score, 1) },
  ];

  function round(num: number, decimals: number) {
    return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
  }

  const xaiFactors = mlData?.contributing_factors || {
    "Landslide Exposure": 92.0,
    "Flood Exposure": 85.0,
    "Environmental Degradation": 78.0,
    "Infrastructure Vulnerability": 65.0,
    "Evacuation Accessibility Deficit": 58.0
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/habitations')}
        className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#334155] transition inline-flex items-center gap-1.5 shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Habitations List</span>
      </button>

      {/* Main Header Banner */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0F172A]">{habitation.name}</h1>
            <Badge priority={habitation.relocation_priority} size="lg" />
          </div>
          <p className="text-xs text-[#64748B] mt-1 flex items-center gap-3">
            <span>District: <strong className="text-[#0F172A]">{habitation.district}</strong></span>
            <span>•</span>
            <span>State: <strong className="text-[#0F172A]">{habitation.state}</strong></span>
            <span>•</span>
            <span>Elevation: <strong className="text-[#4F46E5]">{habitation.elevation} m</strong></span>
          </p>
        </div>

        <button
          onClick={() => navigate(`/relocation?habitation_id=${habitation.id}`)}
          className="px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm tracking-wide shadow-xs transition flex items-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Find Safe Relocation Sites</span>
        </button>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] shadow-xs">
          <p className="text-xs font-bold text-[#64748B]">Infrastructure Score</p>
          <p className="text-2xl font-extrabold text-[#0F172A] mt-1">{habitation.infrastructure_score}/100</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] shadow-xs">
          <p className="text-xs font-bold text-[#64748B]">Accessibility Score</p>
          <p className="text-2xl font-extrabold text-sky-800 mt-1">{habitation.accessibility_score}/100</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] shadow-xs">
          <p className="text-xs font-bold text-[#64748B]">Overall Hazard Score</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{habitation.hazard_score}/100</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] shadow-xs">
          <p className="text-xs font-bold text-[#64748B]">AI Model Confidence</p>
          <p className="text-2xl font-extrabold text-emerald-800 mt-1">{(mlData?.confidence ? mlData.confidence * 100 : 94)}%</p>
        </div>
      </div>

      {/* Grid: Explainable AI Factors & Multi-Hazard Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Explainable AI (XAI) Panel */}
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#CBD5E1] pb-3">
            <Cpu className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="text-base font-bold text-[#0F172A]">Explainable AI (XAI) Risk Factors</h3>
          </div>

          <div className="p-3.5 bg-[#EEF2FF] rounded-xl border border-[#E0E7FF] text-xs text-[#334155] leading-relaxed">
            <strong className="text-[#4F46E5] block mb-1">AI Recommendation Reasoning:</strong>
            {mlData?.explanation || "High flood exposure combined with environmental risk factors, poor infrastructure, and limited evacuation accessibility."}
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Contributing Risk Factors Breakdown</h4>
            {Object.entries(xaiFactors).map(([factorName, score]) => (
              <div key={factorName} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#334155]">{factorName}</span>
                  <span className="text-[#4F46E5] font-bold">{Number(score)}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4F46E5] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Number(score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Hazard Radar Chart */}
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 border-b border-[#CBD5E1] pb-3 mb-4">
            <Activity className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="text-base font-bold text-[#0F172A]">Multi-Hazard Exposure Profile</h3>
          </div>
          <div className="h-72 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#CBD5E1" />
                <PolarAngleAxis dataKey="factor" stroke="#64748B" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" fontSize={10} />
                <Radar name="Hazard Exposure" dataKey="score" stroke="#4F46E5" fill="#EEF2FF" fillOpacity={0.7} />
                <Tooltip contentStyle={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
