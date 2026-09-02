import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { LiveScraperStatus, ScrapedHazardRecord, SourceAttribution } from '../types';

export const useLiveScrapedData = (pollingIntervalMs: number = 10000) => {
  const [statusData, setStatusData] = useState<LiveScraperStatus | null>(null);
  const [records, setRecords] = useState<ScrapedHazardRecord[]>([]);
  const [sources, setSources] = useState<SourceAttribution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pingTimerRef = useRef<any>(null);

  const fetchStatusAndData = useCallback(async () => {
    try {
      const [statusRes, dataRes] = await Promise.all([
        api.getLiveScraperStatus(),
        api.getLiveScrapedData()
      ]);
      
      setStatusData(statusRes);
      if (dataRes?.hazard_records) {
        setRecords(dataRes.hazard_records);
      }
      if (dataRes?.source_attribution) {
        setSources(dataRes.source_attribution);
      }
      setIsScraping(statusRes.status === 'scraping');
      setError(statusRes.error_logs?.[0] || null);
    } catch (e: any) {
      console.error('[USE_LIVE_SCRAPED_DATA] Polling error:', e);
      setError(e.message || 'Failed to sync with live scraping backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerLiveRefresh = async () => {
    setIsScraping(true);
    setNotification('🔄 Triggering live web scraping pipeline...');
    try {
      const res = await api.triggerLiveScrape();
      setNotification(`✅ Scraped ${res.records_scraped} live records in ${res.pipeline_latency_ms}ms!`);
      await fetchStatusAndData();
    } catch (e: any) {
      setError(`Refresh failed: ${e.message}`);
      setNotification('❌ Live scraping execution failed');
    } finally {
      setIsScraping(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Setup WebSocket connection with polling fallback
  useEffect(() => {
    fetchStatusAndData();

    // Determine WS URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = (import.meta as any).env?.VITE_WS_URL || `${window.location.hostname}:8000`;
    const wsUrl = `${protocol}//${host}/api/scrape/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WEBSOCKET] Dynamic Scraper WebSocket connected');
        // Keep-alive ping interval
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'DATA_REFRESHED') {
            setNotification(`⚡ Dynamic WebSocket Update: ${payload.records_count} records refreshed!`);
            fetchStatusAndData();
            setTimeout(() => setNotification(null), 4000);
          } else if (payload.event === 'SCRAPING_STARTED') {
            setIsScraping(true);
          } else if (payload.event === 'SCRAPING_FAILED') {
            setIsScraping(false);
            setError(payload.error || 'Scraping failed');
          }
        } catch (err) {
          console.error('[WEBSOCKET] Message parse error:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WEBSOCKET] Connection error, relying on HTTP polling fallback:', err);
      };

      ws.onclose = () => {
        console.log('[WEBSOCKET] Stream closed');
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      };
    } catch (e) {
      console.warn('[WEBSOCKET] WebSocket init error, active fallback to polling:', e);
    }

    // Polling backup interval
    const interval = setInterval(fetchStatusAndData, pollingIntervalMs);

    return () => {
      clearInterval(interval);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [fetchStatusAndData, pollingIntervalMs]);

  // Compute relative age string
  const formatRelativeTime = (lastRun: string | null): string => {
    if (!lastRun) return 'Synced just now';
    try {
      const date = new Date(lastRun);
      const diffMs = Date.now() - date.getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Synced just now';
      if (mins === 1) return 'Synced 1 min ago';
      return `Synced ${mins} mins ago`;
    } catch (e) {
      return 'Synced recently';
    }
  };

  return {
    status: statusData?.status || (isScraping ? 'scraping' : 'live'),
    statusData,
    records,
    sources,
    isLoading,
    isScraping,
    error,
    notification,
    lastSyncedText: formatRelativeTime(statusData?.last_successful_run || null),
    pipelineLatencyMs: statusData?.pipeline_latency_ms || 240,
    triggerLiveRefresh
  };
};
