import React, { useEffect, useState } from 'react';
import { DataSourceHealthItem, DataStatusTier } from '../types';
import { getDataSourceStatus } from '../services/api';
import { Activity, ExternalLink, RefreshCw } from 'lucide-react';

export const StatusBadge: React.FC<{ status: DataStatusTier }> = ({ status }) => {
  switch (status) {
    case 'LIVE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          🟢 LIVE
        </span>
      );
    case 'RECENT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
          🟡 RECENT
        </span>
      );
    case 'STALE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-orange-500"></span>
          🟠 STALE
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500"></span>
          🔴 FAILED
        </span>
      );
    case 'REFERENCE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-sky-500"></span>
          🔵 REFERENCE
        </span>
      );
    case 'DEMO':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-500"></span>
          ⚪ DEMO
        </span>
      );
    case 'UNAVAILABLE':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-100 border border-slate-700">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-400"></span>
          ⚫ UNAVAILABLE
        </span>
      );
  }
};

export const renderStatusBadge = (status: DataStatusTier) => <StatusBadge status={status} />;

export const DataSourceHealthPanel: React.FC = () => {
  const [sources, setSources] = useState<DataSourceHealthItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const data = await getDataSourceStatus();
      setSources(data);
    } catch (e) {
      console.error("Failed to load data source status", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Data Source Health & Telemetry Status</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict 7-State Freshness Engine (🟢 LIVE | 🟡 RECENT | 🟠 STALE | 🔴 FAILED | 🔵 REFERENCE | ⚪ DEMO | ⚫ UNAVAILABLE)
          </p>
        </div>
        <button
          onClick={fetchSources}
          disabled={loading}
          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status Matrix
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Data Feed Source</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Update Cadence</th>
              <th className="py-2.5 px-3">Data Age</th>
              <th className="py-2.5 px-3">Limitations & Details</th>
              <th className="py-2.5 px-3 text-right">Source Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sources.map((src) => (
              <tr key={src.source_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3 font-semibold text-slate-900">{src.name}</td>
                <td className="py-3 px-3 text-slate-600">{src.category}</td>
                <td className="py-3 px-3">{renderStatusBadge(src.status)}</td>
                <td className="py-3 px-3 text-slate-600">{src.update_frequency}</td>
                <td className="py-3 px-3 text-slate-600">{src.data_age}</td>
                <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{src.limitations}</td>
                <td className="py-3 px-3 text-right">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    View <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
