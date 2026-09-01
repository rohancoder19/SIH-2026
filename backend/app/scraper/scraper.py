import asyncio
import logging
import time
from typing import Dict, Any, List, Optional
import httpx

from app.config.settings import settings
from app.scraper.parser import parse_sih_html
from app.scraper.normalizer import deduplicate_problems
from app.scraper.validator import validate_scraped_batch
from app.scraper.cache import problem_cache

logger = logging.getLogger("sih_scraper.service")

class SIHScraper:
    """
    Production-grade web scraper for SIH 2026 Problem Statements.
    Implements HTTP connection handling, retries with exponential backoff,
    parsing, normalization, batch validation, and fallback caching.
    """
    def __init__(self):
        self.source_url = settings.SIH_SOURCE_URL
        self.user_agent = settings.SCRAPER_USER_AGENT
        self.timeout = settings.SCRAPER_TIMEOUT_SECONDS
        self.max_retries = settings.SCRAPER_MAX_RETRIES

    def _get_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.sih.gov.in/",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }

    async def fetch_html_async(self, url: str) -> str:
        """
        Fetches HTML from target URL asynchronously with exponential backoff retries.
        """
        last_error = None
        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(f"[SCRAPER] Fetching {url} (Attempt {attempt}/{self.max_retries})...")
                async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True, verify=False) as client:
                    resp = await client.get(url, headers=self._get_headers())
                    if resp.status_code == 200:
                        logger.info(f"[SCRAPER] Successfully retrieved {len(resp.text)} bytes (HTTP 200)")
                        return resp.text
                    else:
                        logger.warning(f"[SCRAPER] HTTP status {resp.status_code} received on attempt {attempt}")
                        last_error = f"HTTP status {resp.status_code}"
            except Exception as e:
                logger.warning(f"[SCRAPER] Attempt {attempt} failed: {e}")
                last_error = str(e)
            
            if attempt < self.max_retries:
                backoff_time = (2 ** attempt) * 0.5
                await asyncio.sleep(backoff_time)

        raise RuntimeError(f"Failed to fetch {url} after {self.max_retries} attempts. Last error: {last_error}")

    def fetch_html_sync(self, url: str) -> str:
        """
        Fetches HTML synchronously with exponential backoff retries.
        """
        last_error = None
        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(f"[SCRAPER] Sync Fetching {url} (Attempt {attempt}/{self.max_retries})...")
                with httpx.Client(timeout=self.timeout, follow_redirects=True, verify=False) as client:
                    resp = client.get(url, headers=self._get_headers())
                    if resp.status_code == 200:
                        return resp.text
                    else:
                        last_error = f"HTTP status {resp.status_code}"
            except Exception as e:
                logger.warning(f"[SCRAPER] Sync Attempt {attempt} failed: {e}")
                last_error = str(e)

            if attempt < self.max_retries:
                time.sleep((2 ** attempt) * 0.5)

        raise RuntimeError(f"Failed to fetch {url} synchronously after {self.max_retries} attempts: {last_error}")

    async def scrape_live(self, force: bool = False, custom_url: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Orchestrates full scraping pipeline:
        1. Check cache freshness unless forced
        2. Fetch HTML from official SIH site
        3. Parse HTML table & details
        4. Normalize & Deduplicate
        5. Validate batch & check safety limits
        6. Update cache & return normalized data
        """
        target_url = custom_url or self.source_url

        if not force and problem_cache.is_fresh():
            logger.info("[SCRAPER] Cache is fresh. Returning cached data.")
            return problem_cache.get_data()

        start_time = time.time()
        logger.info(f"[SCRAPER] Started live scraping pipeline from: {target_url}")
        problem_cache.mark_scraping()

        try:
            html_text = await self.fetch_html_async(target_url)
            discovered_records = parse_sih_html(html_text, source_url=target_url)
            logger.info(f"[SCRAPER] Records discovered: {len(discovered_records)}")

            # Deduplicate
            deduped_records = deduplicate_problems(discovered_records)
            duplicate_diff = len(discovered_records) - len(deduped_records)
            logger.info(f"[SCRAPER] Duplicates filtered: {duplicate_diff}")

            # Validation & Safety Threshold Check
            prev_status = problem_cache.get_status()
            prev_count = prev_status.get("total_problems", 0)

            is_valid, valid_records, val_msg = validate_scraped_batch(
                deduped_records,
                previous_count=prev_count
            )

            if not is_valid:
                problem_cache.mark_failed(val_msg)
                logger.error(f"[SCRAPER] Batch validation failed: {val_msg}. Retaining previous cache.")
                return problem_cache.get_data()

            # Update cache
            problem_cache.update(valid_records, source_url=target_url)
            duration = round(time.time() - start_time, 2)
            logger.info(f"[SCRAPER] Completed successfully in {duration}s. Valid records: {len(valid_records)}")

            return valid_records

        except Exception as e:
            err_msg = str(e)
            logger.error(f"[SCRAPER] Pipeline error: {err_msg}")
            problem_cache.mark_failed(err_msg)
            # Safe fallback: return whatever is in cache
            return problem_cache.get_data()

scraper_service = SIHScraper()
