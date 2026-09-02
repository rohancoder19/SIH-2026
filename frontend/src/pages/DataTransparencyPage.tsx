import React, { useEffect, useState } from 'react';
import { DataSourceHealthPanel, renderStatusBadge } from '../components/DataSourceHealthPanel';
import { getDataStatus, getGisLayers } from '../services/api';
import { ShieldCheck, Database, Cpu, Layers, Info, CheckCircle2, AlertTriangle, FileText, ArrowUpRight } from 'lucide-react';

export const DataTransparencyPage: React.FC = () => {
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [gisLayers, setGisLayers] = useState<any[]>([]);

  useEffect(() => {
    getDataStatus().then(setDataSummary).catch(console.error);
    getGisLayers().then(res => setGisLayers(res.layers || [])).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-3 border border-indigo-100">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              SurakshitSthan AI Methodology & Compliance Disclosure
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Data Transparency & Methodology Center
            </h1>
            <p className="text-slate-600 text-sm mt-2 max-w-3xl leading-relaxed">
              SurakshitSthan AI operates with 100% data lineage transparency. Every hazard score, earthquake event, river gauge, and ML recommendation is tagged with explicit source attribution and real-time freshness telemetry.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[220px]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Monitored Feeds</span>
            <span className="text-2xl font-bold text-slate-900 block mt-1">
              {dataSummary?.total_monitored_sources || 5} Active Pipelines
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                🟢 System Healthy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Data Source Matrix Panel */}
      <DataSourceHealthPanel />

      {/* Grid: 7-State Engine & Machine Learning Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 7-State Freshness Engine Explanation */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base mb-4 border-b border-slate-100 pb-3">
            <Database className="w-5 h-5 text-indigo-600" />
            7-State Data Status Engine Standard
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            All data served by the platform undergoes automated staleness classification based on network response time, age, and source classification:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="mt-0.5">{renderStatusBadge('LIVE')}</div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">🟢 LIVE (&lt; 5 Minutes)</h4>
                <p className="text-[11px] text-slate-500">Real-time HTTP telemetry fetched directly from live web services (e.g., USGS GeoJSON, GDACS RSS).</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="mt-0.5">{renderStatusBadge('RECENT')}</div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">🟡 RECENT (&lt; 1 Hour)</h4>
                <p className="text-[11px] text-slate-500">Fresh observation data updated periodically within hourly cycles (e.g., CWC River Telemetry, IMD bulletins).</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="mt-0.5">{renderStatusBadge('STALE')}</div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">🟠 STALE (&gt; 1 Hour or Cache Fallback)</h4>
                <p className="text-[11px] text-slate-500">Cached real-time feed served during temporary network failure or API throttling.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="mt-0.5">{renderStatusBadge('REFERENCE')}</div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">🔵 REFERENCE (Static Administrative Polygons & Basemaps)</h4>
                <p className="text-[11px] text-slate-500">Official state/district administrative boundaries and GIS topography maps.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="mt-0.5">{renderStatusBadge('FAILED')}</div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">🔴 FAILED / ⚫ UNAVAILABLE</h4>
                <p className="text-[11px] text-slate-500">Production response when an external feed is unreachable and no previous cache exists.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Learning Methodology */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base mb-4 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-indigo-600" />
            AI & Machine Learning Risk Methodology
          </div>
          <div className="space-y-4 text-xs text-slate-700">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Random Forest Relocation Classifier (v1.2)</h4>
              <p className="text-slate-600 leading-relaxed">
                The platform utilizes a trained 100-tree Scikit-Learn Random Forest model to compute multi-hazard risk indices and relocation priorities (<span className="font-semibold text-rose-600">IMMEDIATE</span>, <span className="font-semibold text-amber-600">SHORT_TERM</span>, <span className="font-semibold text-yellow-600">MEDIUM_TERM</span>, <span className="font-semibold text-emerald-600">MONITOR</span>).
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <h5 className="font-semibold text-slate-900">Key Input Feature Weights:</h5>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li><strong className="text-slate-800">Landslide Instability Score (35%)</strong> — Slope angle, rainfall radar telemetry & soil saturation</li>
                <li><strong className="text-slate-800">Flood Inundation Index (30%)</strong> — Teesta & Jaldhaka CWC gauge levels & elevation deficit</li>
                <li><strong className="text-slate-800">Seismic Hazard Index (20%)</strong> — Distance to Himalayan MBT fault & USGS M&gt;4.0 quakes</li>
                <li><strong className="text-slate-800">Environmental Risk Index (15%)</strong> — Slope degradation & weather vector</li>
              </ul>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Human-in-the-Loop Governance
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                AI model outputs serve as decision-support guidance for disaster management officials. All automated recommendations require explicit validation by NDMA / WBDMA experts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GIS Layers Transparency Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base mb-4 border-b border-slate-100 pb-3">
          <Layers className="w-5 h-5 text-indigo-600" />
          Authoritative GIS Vector & Raster Layer Catalog
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Layer Name</th>
                <th className="py-2.5 px-3">Source Organization</th>
                <th className="py-2.5 px-3">Data Format</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 text-right">Reference Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {gisLayers.map((layer, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{layer.name}</td>
                  <td className="py-3 px-3 text-slate-600">{layer.source}</td>
                  <td className="py-3 px-3 text-slate-600">{layer.data_type}</td>
                  <td className="py-3 px-3">{renderStatusBadge(layer.status as any)}</td>
                  <td className="py-3 px-3 text-right">
                    <a href={layer.source_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center">
                      Official Source <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </a>
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
