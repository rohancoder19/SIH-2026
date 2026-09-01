import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import threading
from app.config.settings import settings

logger = logging.getLogger("sih_scraper.cache")

class ProblemCache:
    """
    Thread-safe in-memory cache with fallback retention and metadata tracking.
    """
    def __init__(self, ttl_minutes: int = 60):
        self._lock = threading.RLock()
        self._ttl_seconds = ttl_minutes * 60
        self._problems: List[Dict[str, Any]] = []
        self._problems_by_id: Dict[str, Dict[str, Any]] = {}
        self._last_scraped: Optional[datetime] = None
        self._status: str = "idle"  # "idle", "scraping", "success", "failed"
        self._source_url: str = settings.SIH_SOURCE_URL
        self._error_message: Optional[str] = None
        self._is_initialized: bool = False

    def is_fresh(self) -> bool:
        with self._lock:
            if not self._problems or self._last_scraped is None:
                return False
            now = datetime.now(timezone.utc)
            last = self._last_scraped if self._last_scraped.tzinfo else self._last_scraped.replace(tzinfo=timezone.utc)
            age_seconds = (now - last).total_seconds()
            return age_seconds < self._ttl_seconds

    def get_data(self) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self._problems)

    def get_by_id(self, problem_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            if not problem_id:
                return None
            clean_id = problem_id.strip().upper()
            if not clean_id.startswith("SIH") and clean_id.isdigit():
                clean_id = f"SIH{clean_id}"
            
            # Direct lookup or case-insensitive search
            if clean_id in self._problems_by_id:
                return self._problems_by_id[clean_id]
            for p in self._problems:
                if p.get("id", "").upper() == clean_id:
                    return p
            return None

    def update(self, records: List[Dict[str, Any]], source_url: str):
        with self._lock:
            self._problems = list(records)
            self._problems_by_id = {r["id"].upper(): r for r in records if r.get("id")}
            self._last_scraped = datetime.now(timezone.utc)
            self._status = "success"
            self._source_url = source_url
            self._error_message = None
            self._is_initialized = True
            logger.info(f"[CACHE] Updated cache with {len(records)} problem statements from {source_url}")

    def mark_scraping(self):
        with self._lock:
            self._status = "scraping"

    def mark_failed(self, error_message: str):
        with self._lock:
            self._status = "failed"
            self._error_message = error_message
            logger.warning(f"[CACHE] Scraping failed: {error_message}. Retaining {len(self._problems)} previous records.")

    def get_status(self) -> Dict[str, Any]:
        with self._lock:
            now = datetime.now(timezone.utc)
            age_str = "Never"
            cache_age_seconds = None
            if self._last_scraped:
                last = self._last_scraped if self._last_scraped.tzinfo else self._last_scraped.replace(tzinfo=timezone.utc)
                diff = (now - last).total_seconds()
                cache_age_seconds = int(diff)
                if diff < 60:
                    age_str = f"{int(diff)} seconds ago"
                elif diff < 3600:
                    age_str = f"{int(diff // 60)} minutes ago"
                else:
                    age_str = f"{int(diff // 3600)} hours ago"

            return {
                "status": self._status,
                "total_problems": len(self._problems),
                "last_scraped": self._last_scraped.isoformat() if self._last_scraped else None,
                "source": self._source_url,
                "cache_age": age_str,
                "cache_age_seconds": cache_age_seconds,
                "is_cached": len(self._problems) > 0,
                "is_fresh": self.is_fresh(),
                "error_message": self._error_message
            }

# Singleton instance
problem_cache = ProblemCache(ttl_minutes=settings.CACHE_TTL_MINUTES)
