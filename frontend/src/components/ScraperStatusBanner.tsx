import React from 'react';
import { RefreshCw, Radio, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useLiveScrapedData } from '../hooks/useLiveScrapedData';

interface ScraperStatusBannerProps {
  onOpenTelemetry?: () => void;
  compact?: boolean;
}

export const ScraperStatusBanner: React.FC<ScraperStatusBannerProps> = ({ onOpenTelemetry, compact = false }) => {
  const { status, lastSyncedText, isScraping, pipelineLatencyMs, triggerLiveRefresh, notification, records } = useLiveScrapedData();

  const getStatusBadge = () => {
    if (isScraping || status === 'scraping') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-800 border border-amber-300 text-xs font-bold shadow-xs">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
          <span>Scraping in Progress...</span>
        </span>
      );
    }
    if (status === 'failed' || status === 'error') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/90 text-rose-800 border border-rose-300 text-xs font-bold shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Extraction Error</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-300 text-xs font-extrabold shadow-xs">
        <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span>🟢 Live ({lastSyncedText})</span>
      </span>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        <button
          onClick={triggerLiveRefresh}
          disabled={isScraping}
          title="Force refresh live web scrapers"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] border border-[#CBD5E1] rounded-xl transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
          <span>Sync Now</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Dynamic Toast Notification Notification Banner */}
      {notification && (
        <div className="mb-3 px-4 py-2 bg-indigo-900 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <span className="text-[10px] text-indigo-200">Real-Time Sync</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/80 backdrop-blur-md border border-[#CBD5E1] rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B]">
            <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Latency: <strong className="text-[#0F172A]">{pipelineLatencyMs}ms</strong></span>
            <span>•</span>
            <span>Active Hazard Feeds: <strong className="text-[#0F172A]">{records.length} records</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTelemetry && (
            <button
              onClick={onOpenTelemetry}
              className="px-3 py-1.5 bg-[#E2E8F0]/70 hover:bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Telemetry & Sources
            </button>
          )}

          <button
            onClick={triggerLiveRefresh}
            disabled={isScraping}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            <span>{isScraping ? 'Refreshing...' : 'Sync Now / Force Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
