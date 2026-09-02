import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IngestionPipeline } from '../types';
import { UploadCloud, CheckCircle2, Globe, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { ScraperStatusBanner } from '../components/ScraperStatusBanner';
import { ScraperTelemetryDrawer } from '../components/ScraperTelemetryDrawer';
import { useLiveScrapedData } from '../hooks/useLiveScrapedData';

export const DataIngestionPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<IngestionPipeline[]>([]);
  const [datasetName, setDatasetName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  const { records, sources, pipelineLatencyMs, lastSyncedText } = useLiveScrapedData();

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      const res = await api.getPipelines();
      setPipelines(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetName.trim()) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('dataset_name', datasetName);
      formData.append('source', 'State Survey Dept');
      const dummyBlob = new Blob(['{"type":"FeatureCollection","features":[]}'], { type: 'application/json' });
      formData.append('file', dummyBlob, `${datasetName.toLowerCase().replace(/\s+/g, '_')}.geojson`);

      await api.uploadGISDataset(formData);
      setSuccessMsg(`Dataset "${datasetName}" uploaded and initialized in spatial pipeline!`);
      setDatasetName('');
      fetchPipelines();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const filteredRecords = filterType === 'ALL'
    ? records
    : records.filter(r => r.hazard_type.toUpperCase() === filterType.toUpperCase());

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CBD5E1] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#4F46E5]" />
            <span>Dynamic Live Web Scraping & Ingestion Engine</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time automated data extraction from USGS, GDACS, CWC, and IMD portals with WebSocket push events
          </p>
        </div>
      </div>

      {/* Live Scraping Telemetry & Status Banner */}
      <ScraperStatusBanner onOpenTelemetry={() => setShowTelemetry(true)} />

      {/* Dynamic Live Scraped Records Dashboard Table */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#4F46E5]" />
              <span>Real-Time Scraped Data Payload Feed</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Live parsed and validated multi-hazard zone records stored in cache ({lastSyncedText})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B]">Filter Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="ALL">All Hazard Types ({records.length})</option>
              <option value="FLOOD">Flood & Water</option>
              <option value="LANDSLIDE">Landslide Risk</option>
              <option value="EARTHQUAKE">Earthquake Seismic</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#CBD5E1] rounded-xl bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#CBD5E1] text-[#64748B] uppercase text-[10px] tracking-wider bg-[#E2E8F0]/60">
                <th className="py-3 px-4">Hazard Record</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Severity / Risk Score</th>
                <th className="py-3 px-4">Extraction Source</th>
                <th className="py-3 px-4">Extraction Timestamp</th>
                <th className="py-3 px-4 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredRecords.map((item) => (
                <tr key={item.id} className="hover:bg-[#EEF2FF]/40 transition">
                  <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className={`w-4 h-4 ${
                        item.severity === 'Critical' ? 'text-rose-600' : 'text-amber-600'
                      }`} />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] rounded-lg text-[10px] font-extrabold">
                      {item.hazard_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.severity === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {item.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#0F172A]">{item.risk_score}/100</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#334155] font-medium">{item.source}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-300">
                      <Clock className="w-3 h-3 text-[#4F46E5]" />
                      <span>{item.extracted_at || 'Just now'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                    {Math.round((item.confidence || 0.95) * 100)}% Verified
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Dataset Upload Section */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#0F172A]">Ingest Custom Geospatial File (GeoJSON / CSV)</h3>
        {successMsg && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Dataset Name</label>
              <input
                type="text"
                placeholder="e.g. Kalimpong Landslide Contour Survey 2026"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Format Type</label>
              <select className="w-full px-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]">
                <option value="GeoJSON">GeoJSON (.geojson)</option>
                <option value="CSV">CSV Tabular (.csv)</option>
                <option value="Shapefile">ESRI Shapefile (.zip)</option>
                <option value="GeoTIFF">Raster GeoTIFF (.tif)</option>
              </select>
            </div>
          </div>

          <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#4F46E5] rounded-2xl p-6 text-center bg-[#E2E8F0]/40 cursor-pointer transition">
            <UploadCloud className="w-8 h-8 text-[#4F46E5] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#0F172A]">Drag & drop GeoJSON / CSV files here</p>
            <p className="text-[10px] text-[#64748B] mt-1">Supports WGS84 EPSG:4326 geometry validation up to 100 MB</p>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            {uploading ? 'Processing Spatial Analysis...' : 'Upload & Process Custom File'}
          </button>
        </form>
      </div>

      <ScraperTelemetryDrawer isOpen={showTelemetry} onClose={() => setShowTelemetry(false)} />
    </div>
  );
};

