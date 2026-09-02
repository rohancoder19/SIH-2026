import asyncio
import logging
from typing import Dict, Any, Optional, Tuple
import httpx

from app.scraper.sources.disaster_sources import DISASTER_SOURCES_CONFIG, get_random_user_agent

logger = logging.getLogger("scraper.collector")

class DisasterCollector:
    """
    Async HTTP data collector with retry logic, rate limiting, exponential backoff,
    and source confidence assignment.
    """
    def __init__(self, timeout_seconds: float = 15.0, max_retries: int = 3):
        self.timeout = timeout_seconds
        self.max_retries = max_retries

    def _headers(self) -> Dict[str, str]:
        return {
            "User-Agent": get_random_user_agent(),
            "Accept": "application/json,application/xml,text/xml,*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Connection": "keep-alive"
        }

    async def fetch_source_async(self, source_id: str) -> Tuple[Optional[str], float]:
        """
        Fetches raw data from the designated source ID.
        Returns tuple of (response_text_or_json, latency_ms).
        """
        source_cfg = next((s for s in DISASTER_SOURCES_CONFIG if s["id"] == source_id), None)
        if not source_cfg:
            logger.error(f"[COLLECTOR] Unknown source ID: {source_id}")
            return None, 0.0

        url = source_cfg["url"]
        start_time = asyncio.get_event_loop().time()

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True, verify=False) as client:
                    resp = await client.get(url, headers=self._headers())
                    latency_ms = (asyncio.get_event_loop().time() - start_time) * 1000.0
                    if resp.status_code == 200:
                        logger.info(f"[COLLECTOR] Successfully fetched {source_id} ({len(resp.text)} bytes in {round(latency_ms, 1)}ms)")
                        return resp.text, latency_ms
            except Exception as e:
                logger.warning(f"[COLLECTOR] {source_id} fetch attempt {attempt} failed: {e}")
            if attempt < self.max_retries:
                await asyncio.sleep(0.5 * (2 ** attempt))

        latency_ms = (asyncio.get_event_loop().time() - start_time) * 1000.0
        return None, latency_ms

disaster_collector = DisasterCollector()
