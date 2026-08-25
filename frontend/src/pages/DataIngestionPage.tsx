import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IngestionPipeline } from '../types';
import { UploadCloud, CheckCircle2, FileCode, Layers, Clock, AlertCircle } from 'lucide-react';

export const DataIngestionPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<IngestionPipeline[]>([]);
  const [datasetName, setDatasetName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

      const res = await api.uploadGISDataset(formData);
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

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-700/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-accent-cyan" />
            <span>GIS Data Ingestion & Pipeline Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload CSV, GeoJSON, Shapefile, or GeoTIFF datasets for automated format validation & spatial join analysis
          </p>
        </div>
      </div>

      {/* Upload Dropzone Card */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Ingest New Geospatial Dataset</h3>
        {successMsg && (
          <div className="p-3 bg-accent-teal/15 border border-accent-teal/40 rounded-2xl text-xs font-bold text-accent-teal flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dataset Name</label>
              <input
                type="text"
                placeholder="e.g. Kalimpong Landslide Contour Survey 2026"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Format Type</label>
              <select className="w-full px-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-slate-200 focus:outline-none">
                <option value="GeoJSON">GeoJSON (.geojson)</option>
                <option value="CSV">CSV Tabular (.csv)</option>
                <option value="Shapefile">ESRI Shapefile (.zip)</option>
                <option value="GeoTIFF">Raster GeoTIFF (.tif)</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Visual Area */}
          <div className="border-2 border-dashed border-navy-700/80 hover:border-accent-cyan/60 rounded-2xl p-8 text-center bg-navy-850/50 cursor-pointer transition">
            <UploadCloud className="w-10 h-10 text-accent-cyan mx-auto mb-2 animate-bounce" />
            <p className="text-xs font-bold text-slate-200">Drag & drop GeoJSON / CSV files here</p>
            <p className="text-[10px] text-slate-400 mt-1">Supports WGS84 EPSG:4326 geometry validation up to 100 MB</p>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black text-xs shadow-lg shadow-accent-blue/20 hover:opacity-95 transition"
          >
            {uploading ? 'Processing Spatial Analysis...' : 'Upload & Process GIS Pipeline'}
          </button>
        </form>
      </div>

      {/* Ingestion Pipelines Table */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Pipeline Ingestion History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-700 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-4">Dataset Name</th>
                <th className="pb-3 px-4">Source</th>
                <th className="pb-3 px-4">Format</th>
                <th className="pb-3 px-4">Records</th>
                <th className="pb-3 px-4">CRS</th>
                <th className="pb-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {pipelines.map((pipe) => (
                <tr key={pipe.id} className="hover:bg-navy-850/60 transition">
                  <td className="py-3 px-4 font-bold text-white">{pipe.dataset_name}</td>
                  <td className="py-3 px-4 text-slate-300">{pipe.source}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 bg-navy-800 rounded text-[10px] font-mono text-accent-cyan">{pipe.format}</span></td>
                  <td className="py-3 px-4 text-slate-200">{pipe.record_count}</td>
                  <td className="py-3 px-4 text-slate-400">{pipe.crs}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-teal/15 text-accent-teal border border-accent-teal/40 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{pipe.status}</span>
                    </span>
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
