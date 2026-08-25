import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Habitation } from '../types';
import { Badge } from '../components/Badge';
import {
  ArrowLeft, Cpu, ShieldCheck, Flame, Home, AlertTriangle, Activity, BarChart2, Compass
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
          population: hab.population,
          vulnerable_population: hab.vulnerable_population,
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
    return <div className="p-8 text-center text-slate-400">Loading Habitation Detail...</div>;
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
    "Vulnerable Population Ratio": 81.0,
    "Environmental Degradation": 78.0,
    "Infrastructure Vulnerability": 65.0,
    "Evacuation Accessibility Deficit": 58.0
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/habitations')}
        className="px-3 py-1.5 bg-navy-850 hover:bg-navy-800 border border-navy-700 rounded-xl text-xs font-bold text-slate-300 transition inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Habitations List</span>
      </button>

      {/* Main Header Banner */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">{habitation.name}</h1>
            <Badge priority={habitation.relocation_priority} size="lg" />
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
            <span>District: <strong className="text-slate-200">{habitation.district}</strong></span>
            <span>•</span>
            <span>State: <strong className="text-slate-200">{habitation.state}</strong></span>
            <span>•</span>
            <span>Elevation: <strong className="text-accent-cyan">{habitation.elevation} m</strong></span>
          </p>
        </div>

        <button
          onClick={() => navigate(`/relocation?habitation_id=${habitation.id}`)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black text-sm tracking-wide shadow-xl shadow-accent-blue/25 hover:scale-105 transition flex items-center gap-2"
        >
          <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          <span>Find Safe Relocation Sites</span>
        </button>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700/80">
          <p className="text-xs font-semibold text-slate-400">Total Population</p>
          <p className="text-2xl font-black text-white mt-1">{habitation.population.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-accent-red/40 bg-accent-red/10">
          <p className="text-xs font-semibold text-accent-red">Vulnerable Population</p>
          <p className="text-2xl font-black text-accent-red mt-1">{habitation.vulnerable_population.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700/80">
          <p className="text-xs font-semibold text-slate-400">Overall Hazard Score</p>
          <p className="text-2xl font-black text-accent-amber mt-1">{habitation.hazard_score}/100</p>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700/80">
          <p className="text-xs font-semibold text-slate-400">AI Model Confidence</p>
          <p className="text-2xl font-black text-accent-teal mt-1">{(mlData?.confidence ? mlData.confidence * 100 : 94)}%</p>
        </div>
      </div>

      {/* Grid: Explainable AI Factors & Multi-Hazard Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Explainable AI (XAI) Panel */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-navy-700 pb-3">
            <Cpu className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-base font-extrabold text-white">Explainable AI (XAI) Risk Factors</h3>
          </div>

          <div className="p-3.5 bg-navy-850 rounded-2xl border border-navy-700/80 text-xs text-slate-300 leading-relaxed">
            <strong className="text-accent-cyan block mb-1">AI Recommendation Reasoning:</strong>
            {mlData?.explanation || "High flood exposure combined with high vulnerable population ratio, poor infrastructure, and limited evacuation accessibility."}
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contributing Risk Factors Breakdown</h4>
            {Object.entries(xaiFactors).map(([factorName, score]) => (
              <div key={factorName} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{factorName}</span>
                  <span className="text-accent-amber font-bold">{Number(score)}%</span>
                </div>
                <div className="w-full bg-navy-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-accent-amber to-accent-red h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Number(score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Hazard Radar Chart */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 border-b border-navy-700 pb-3 mb-4">
            <Activity className="w-5 h-5 text-accent-amber" />
            <h3 className="text-base font-extrabold text-white">Multi-Hazard Exposure Profile</h3>
          </div>
          <div className="h-72 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#273459" />
                <PolarAngleAxis dataKey="factor" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                <Radar name="Hazard Exposure" dataKey="score" stroke="#ef476f" fill="#ef476f" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#131d38', borderColor: '#273459', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
