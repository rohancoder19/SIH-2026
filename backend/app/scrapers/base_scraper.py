import abc
import asyncio
import logging
import random
import time
from typing import Dict, Any, Optional, List
import httpx

logger = logging.getLogger("scrapers.base")

DEFAULT_USER_AGENTS = [
    "SurakshitSthan-PanIndia-Scraper/2.4.0 (NDMA Geospatial Command)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
    "SurakshitSthan-NationalFeed/1.0 (+https://surakshitsthan.gov.in/bot)"
]

class BaseScraper(abc.ABC):
    """
    Abstract base class for all Pan-India web scraper modules.
    Enforces HTTP connection management, user-agent rotation,
    exponential retries, and timing telemetry.
    """
    def __init__(self, name: str, source_url: str, timeout: float = 15.0, max_retries: int = 3):
        self.name = name
        self.source_url = source_url
        self.timeout = timeout
        self.max_retries = max_retries
        self.user_agents = DEFAULT_USER_AGENTS

    def _get_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": random.choice(self.user_agents),
            "Accept": "application/json,text/html,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
            "Connection": "keep-alive"
        }

    async def fetch(self, url: Optional[str] = None) -> Optional[str]:
        target_url = url or self.source_url
        for attempt in range(1, self.max_retries + 1):
            try:
                start_time = time.time()
                logger.info(f"[{self.name}] Fetching {target_url} (Attempt {attempt}/{self.max_retries})...")
                async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True, verify=False) as client:
                    resp = await client.get(target_url, headers=self._get_headers())
                    latency_ms = round((time.time() - start_time) * 1000, 2)
                    if resp.status_code == 200:
                        logger.info(f"[{self.name}] Received {len(resp.text)} bytes in {latency_ms}ms")
                        return resp.text
                    logger.warning(f"[{self.name}] HTTP {resp.status_code} received on attempt {attempt}")
            except Exception as e:
                logger.warning(f"[{self.name}] Attempt {attempt} error: {e}")
            
            if attempt < self.max_retries:
                await asyncio.sleep(0.5 * (2 ** attempt))

        return None

    @abc.abstractmethod
    async def scrape_and_parse(self) -> List[Dict[str, Any]]:
        """Abstract method to be implemented by state & national scrapers."""
        pass
