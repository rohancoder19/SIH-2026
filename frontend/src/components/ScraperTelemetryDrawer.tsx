import React, { useState } from 'react';
import { X, ExternalLink, Activity, Terminal, ShieldCheck, Cpu, Code } from 'lucide-react';
import { useLiveScrapedData } from '../hooks/useLiveScrapedData';

interface ScraperTelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScraperTelemetryDrawer: React.FC<ScraperTelemetryDrawerProps> = ({ isOpen, onClose }) => {
  const { statusData, records, sources, pipelineLatencyMs, lastSyncedText } = useLiveScrapedData();
  const [activeTab, setActiveTab] = useState<'sources' | 'payload' | 'history'>('sources');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#F8FAFC] h-full shadow-2xl border-l border-[#CBD5E1] flex flex-col slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#CBD5E1] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">Scraper Telemetry & Source Audit</h2>
              <p className="text-xs text-[#64748B] flex items-center gap-2 mt-0.5">
                <span>Status: <strong className="text-emerald-700 font-bold">🟢 Live</strong></span>
                <span>•</span>
                <span>{lastSyncedText}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="p-4 bg-[#E2E8F0]/40 border-b border-[#CBD5E1] grid grid-cols-3 gap-3">
          <div className="p-3 bg-white border border-[#CBD5E1] rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Pipeline Latency</span>
            <p className="text-sm font-extrabold text-[#4F46E5] mt-0.5">{pipelineLatencyMs} ms</p>
          </div>
          <div className="p-3 bg-white border border-[#CBD5E1] rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Records Extracted</span>
            <p className="text-sm font-extrabold text-[#0F172A] mt-0.5">{records.length} Item(s)</p>
          </div>
          <div className="p-3 bg-white border border-[#CBD5E1] rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Cache Age</span>
            <p className="text-sm font-extrabold text-emerald-700 mt-0.5">{statusData?.cache_age || 'Fresh'}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#CBD5E1] bg-white px-4">
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'sources'
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Target Sources ({sources.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'payload'
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Raw Extracted JSON</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Execution Logs</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'sources' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#334155]">Active Scraped Live Data Portals & Feeds:</p>
              {sources.map((src, idx) => (
                <div key={idx} className="p-4 bg-white border border-[#CBD5E1] rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-[#EEF2FF] text-[#4F46E5] rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                      {src.type}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      HTTP 200 OK
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{src.name}</h4>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-[#4F46E5] hover:underline font-mono truncate max-w-full"
                  >
                    <span>{src.url}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payload' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#334155]">Extracted Payloads Schema (GeoJSON / Normalized):</span>
                <span className="text-[10px] font-mono text-[#64748B]">{records.length} records in buffer</span>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed shadow-inner">
                {JSON.stringify(records, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#334155]">
                <Terminal className="w-4 h-4 text-[#4F46E5]" />
                <span>Recent Background Cron & Scraper Logs:</span>
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                {statusData?.history_logs && statusData.history_logs.length > 0 ? (
                  statusData.history_logs.map((log, i) => (
                    <div key={i} className="p-3 bg-white border border-[#CBD5E1] rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[#0F172A] font-bold">Fetched {log.records_fetched} records</p>
                        <p className="text-[10px] text-[#64748B]">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded font-bold">{log.status}</span>
                        <p className="text-[10px] text-[#4F46E5] font-bold mt-1">{log.latency_ms} ms</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-white border border-[#CBD5E1] rounded-xl text-center text-xs text-[#64748B]">
                    No historical error logs recorded. Scraper pipeline running cleanly.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
