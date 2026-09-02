import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Habitation } from '../types';
import { Badge } from '../components/Badge';
import { Cpu, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const RelocationEnginePage: React.FC = () => {
  const [habitations, setHabitations] = useState<Habitation[]>([]);
  const [selectedHabId, setSelectedHabId] = useState<number>(1);
  const [geminiAnalysis, setGeminiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);

  useEffect(() => {
    fetchHabitations();
  }, []);

  const fetchHabitations = async () => {
    try {
      const data = await api.getHabitations();
      setHabitations(data);
      if (data.length > 0) {
        setSelectedHabId(data[0].id);
        runGeminiAnalysis(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runGeminiAnalysis = async (id: number) => {
    setLoadingAnalysis(true);
    try {
      const res = await api.getGeminiAnalysis(id);
      setGeminiAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const selectedHab = habitations.find(h => h.id === selectedHabId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#E0E7FF] text-[#4F46E5] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Google Gemini 2.5 Flash AI Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            AI Relocation Priority & Geotechnical Reasoning Engine
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
            Generates explainable disaster risk attributions, slope instability evaluations, and actionable relocation decision briefs powered by Google Gemini AI.
          </p>
        </div>

        <div className="px-4 py-3 rounded-xl bg-[#E2E8F0]/60 border border-[#CBD5E1] text-right">
          <p className="text-[10px] uppercase font-extrabold text-[#64748B]">AI Model Status</p>
          <p className="text-xs font-bold text-emerald-800 mt-0.5 flex items-center gap-1.5 justify-end">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            Gemini 2.5 Active
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settlement Picker */}
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#4F46E5]" />
            <span>Select Settlement for Analysis</span>
          </h2>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {habitations.map((hab) => (
              <button
                key={hab.id}
                onClick={() => {
                  setSelectedHabId(hab.id);
                  runGeminiAnalysis(hab.id);
                }}
                className={`w-full p-3.5 rounded-xl text-left border transition ${
                  selectedHabId === hab.id
                    ? 'bg-[#EEF2FF] border-[#E0E7FF] text-[#0F172A] font-bold shadow-xs'
                    : 'bg-[#E2E8F0]/50 hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#334155]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">{hab.name}</span>
                  <Badge priority={hab.relocation_priority} />
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-[#64748B]">
                  <span>Elev: {hab.elevation} m</span>
                  <span className="font-bold text-amber-700">Risk: {hab.hazard_score}/100</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Gemini AI Reasoning Output */}
        <div className="lg:col-span-2 space-y-6">
          {selectedHab && (
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-6">
              {/* Selected Hab Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CBD5E1] pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-extrabold text-[#0F172A]">{selectedHab.name}</h3>
                    <Badge priority={selectedHab.relocation_priority} />
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">{selectedHab.district} District • Elevation {selectedHab.elevation}m</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[#4F46E5]">{selectedHab.hazard_score}</span>
                  <span className="text-xs text-[#64748B] block">Risk Score Index</span>
                </div>
              </div>

              {/* Gemini AI Reasoning Brief */}
              <div className="p-5 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#4F46E5] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Google Gemini AI Geotechnical Decision Brief</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E0E7FF] text-[#4F46E5] text-[10px] font-bold shadow-xs">
                    {geminiAnalysis?.engine_type || "Google Gemini 2.5 Flash"}
                  </span>
                </div>

                {loadingAnalysis ? (
                  <div className="py-8 text-center space-y-2">
                    <Sparkles className="w-6 h-6 text-[#4F46E5] animate-spin mx-auto" />
                    <p className="text-xs text-[#334155] font-medium">Running Google Gemini 2.5 Flash Geotechnical Analysis...</p>
                  </div>
                ) : (
                  <p className="text-xs text-[#334155] leading-relaxed font-medium">
                    {geminiAnalysis?.gemini_reasoning || "Analyzing multi-hazard vulnerabilities..."}
                  </p>
                )}
              </div>

              {/* Top Hazard Contributing Factors */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Primary Geotechnical Drivers</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {geminiAnalysis?.contributing_factors?.map((factor: string, idx: number) => (
                    <div key={idx} className="p-3 bg-[#E2E8F0]/50 border border-[#CBD5E1] rounded-xl text-xs text-[#334155] font-semibold flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                  <span>NDMA Strategic Evacuation & Relocation Action Plan</span>
                </h4>
                <div className="space-y-2">
                  {geminiAnalysis?.action_plan?.map((action: string, idx: number) => (
                    <div key={idx} className="p-3 bg-[#E2E8F0]/50 border border-[#CBD5E1] rounded-xl text-xs text-[#334155] font-medium flex items-center gap-3">
                      <ArrowRight className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
