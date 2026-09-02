import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import threading
from collections import Counter

logger = logging.getLogger("disaster_scraper.cache")

class DisasterHazardCache:
    """
    Thread-safe cache for live disaster feeds & dynamic hazard zones.
    Includes subscriber notification for real-time WebSocket streaming.
    """
    def __init__(self, ttl_minutes: int = 30):
        self._lock = threading.RLock()
        self._ttl_seconds = ttl_minutes * 60
        self._hazard_zones: List[Dict[str, Any]] = []
        self._last_scraped: Optional[datetime] = None
        self._status: str = "idle"
        self._last_latency_ms: float = 240.0
        self._subscribers: List[Any] = []
        self._logs: List[Dict[str, Any]] = []
        self._sources: List[str] = [
            "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
            "https://www.gdacs.org/xml/rss.xml",
            "CWC Hydrological Real-Time Telemetry",
            "IMD Himalayan Slope Stability Alerts"
        ]
        self._error_message: Optional[str] = None

    def add_subscriber(self, callback):
        with self._lock:
            if callback not in self._subscribers:
                self._subscribers.append(callback)

    def remove_subscriber(self, callback):
        with self._lock:
            if callback in self._subscribers:
                self._subscribers.remove(callback)

    def notify_subscribers(self, event_data: Dict[str, Any]):
        with self._lock:
            subs = list(self._subscribers)
        for sub in subs:
            try:
                sub(event_data)
            except Exception as e:
                logger.warning(f"[DISASTER_CACHE] Error notifying subscriber: {e}")

    def set_latency(self, latency_ms: float):
        with self._lock:
            self._last_latency_ms = round(latency_ms, 2)

    def is_fresh(self) -> bool:
        with self._lock:
            if not self._hazard_zones or self._last_scraped is None:
                return False
            now = datetime.now(timezone.utc)
            last = self._last_scraped if self._last_scraped.tzinfo else self._last_scraped.replace(tzinfo=timezone.utc)
            return (now - last).total_seconds() < self._ttl_seconds

    def get_hazard_zones(self) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self._hazard_zones)

    def update(self, records: List[Dict[str, Any]], latency_ms: float = 250.0):
        with self._lock:
            self._hazard_zones = list(records)
            self._last_scraped = datetime.now(timezone.utc)
            self._status = "success"
            self._error_message = None
            self._last_latency_ms = round(latency_ms, 2)
            log_entry = {
                "timestamp": self._last_scraped.isoformat(),
                "records_fetched": len(records),
                "latency_ms": self._last_latency_ms,
                "status": "success"
            }
            self._logs.insert(0, log_entry)
            self._logs = self._logs[:20]
            logger.info(f"[DISASTER_CACHE] Updated live hazard zones catalog with {len(records)} active zones in {self._last_latency_ms}ms.")

        # Trigger subscriber notification outside lock
        self.notify_subscribers({
            "event": "DATA_REFRESHED",
            "timestamp": self._last_scraped.isoformat(),
            "records_count": len(records),
            "status": "live",
            "pipeline_latency_ms": self._last_latency_ms
        })

    def mark_scraping(self):
        with self._lock:
            self._status = "scraping"
        self.notify_subscribers({
            "event": "SCRAPING_STARTED",
            "status": "scraping",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    def mark_failed(self, error_message: str):
        with self._lock:
            self._status = "failed"
            self._error_message = error_message
            logger.warning(f"[DISASTER_CACHE] Scraper notice: {error_message}. Preserving existing {len(self._hazard_zones)} hazard zones.")
        self.notify_subscribers({
            "event": "SCRAPING_FAILED",
            "status": "failed",
            "error": error_message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    def get_status(self) -> Dict[str, Any]:
        with self._lock:
            now = datetime.now(timezone.utc)
            age_str = "Never"
            diff_seconds = 0
            if self._last_scraped:
                last = self._last_scraped if self._last_scraped.tzinfo else self._last_scraped.replace(tzinfo=timezone.utc)
                diff_seconds = int((now - last).total_seconds())
                if diff_seconds < 60:
                    age_str = f"{diff_seconds} seconds ago"
                elif diff_seconds < 3600:
                    age_str = f"{diff_seconds // 60} minutes ago"
                else:
                    age_str = f"{diff_seconds // 3600} hours ago"

            type_counts = Counter(hz.get("hazard_type", "General") for hz in self._hazard_zones)

            return {
                "status": self._status if self._status != "success" else "live",
                "total_hazard_zones": len(self._hazard_zones),
                "active_hazards_by_type": dict(type_counts),
                "last_scraped": self._last_scraped.isoformat() if self._last_scraped else None,
                "sources": self._sources,
                "cache_age": age_str,
                "cache_age_seconds": diff_seconds,
                "is_cached": len(self._hazard_zones) > 0,
                "is_fresh": self.is_fresh(),
                "error_message": self._error_message,
                "pipeline_latency_ms": self._last_latency_ms,
                "history_logs": list(self._logs)
            }

disaster_hazard_cache = DisasterHazardCache(ttl_minutes=30)
