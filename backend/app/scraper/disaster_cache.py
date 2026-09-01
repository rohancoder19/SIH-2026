import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import threading
from collections import Counter

logger = logging.getLogger("disaster_scraper.cache")

class DisasterHazardCache:
    """
    Thread-safe cache for live disaster feeds & dynamic hazard zones.
    """
    def __init__(self, ttl_minutes: int = 30):
        self._lock = threading.RLock()
        self._ttl_seconds = ttl_minutes * 60
        self._hazard_zones: List[Dict[str, Any]] = []
        self._last_scraped: Optional[datetime] = None
        self._status: str = "idle"
        self._sources: List[str] = [
            "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
            "https://www.gdacs.org/xml/rss.xml",
            "CWC Hydrological Real-Time Telemetry"
        ]
        self._error_message: Optional[str] = None

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

    def update(self, records: List[Dict[str, Any]]):
        with self._lock:
            self._hazard_zones = list(records)
            self._last_scraped = datetime.now(timezone.utc)
            self._status = "success"
            self._error_message = None
            logger.info(f"[DISASTER_CACHE] Updated live hazard zones catalog with {len(records)} active zones.")

    def mark_scraping(self):
        with self._lock:
            self._status = "scraping"

    def mark_failed(self, error_message: str):
        with self._lock:
            self._status = "failed"
            self._error_message = error_message
            logger.warning(f"[DISASTER_CACHE] Scraper notice: {error_message}. Preserving existing {len(self._hazard_zones)} hazard zones.")

    def get_status(self) -> Dict[str, Any]:
        with self._lock:
            now = datetime.now(timezone.utc)
            age_str = "Never"
            if self._last_scraped:
                last = self._last_scraped if self._last_scraped.tzinfo else self._last_scraped.replace(tzinfo=timezone.utc)
                diff = (now - last).total_seconds()
                if diff < 60:
                    age_str = f"{int(diff)} seconds ago"
                elif diff < 3600:
                    age_str = f"{int(diff // 60)} minutes ago"
                else:
                    age_str = f"{int(diff // 3600)} hours ago"

            type_counts = Counter(hz.get("hazard_type", "General") for hz in self._hazard_zones)

            return {
                "status": self._status,
                "total_hazard_zones": len(self._hazard_zones),
                "active_hazards_by_type": dict(type_counts),
                "last_scraped": self._last_scraped.isoformat() if self._last_scraped else None,
                "sources": self._sources,
                "cache_age": age_str,
                "is_cached": len(self._hazard_zones) > 0,
                "is_fresh": self.is_fresh(),
                "error_message": self._error_message
            }

disaster_hazard_cache = DisasterHazardCache(ttl_minutes=30)
