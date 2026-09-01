import asyncio
import logging
import time
from typing import Dict, Any, List, Optional
import httpx

from app.scraper.disaster_parser import parse_usgs_earthquakes, parse_gdacs_alerts
from app.scraper.disaster_cache import disaster_hazard_cache

logger = logging.getLogger("disaster_scraper.service")

class DisasterHazardScraper:
    """
    Live web scraper and real-time data collector for multi-hazard disaster intelligence:
    - USGS Real-Time Earthquake Feeds
    - Global Disaster Alert & Coordination System (GDACS)
    - Central Water Commission (CWC) Hydrological Flood Gauges & IMD Landslide Warnings
    """
    def __init__(self):
        self.usgs_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
        self.gdacs_url = "https://www.gdacs.org/xml/rss.xml"
        self.timeout = 15.0
        self.user_agent = "SurakshitSthan-Disaster-GIS-Scraper/2.4.0 (NDMA Geospatial Command)"

    def _headers(self) -> Dict[str, str]:
        return {
            "User-Agent": self.user_agent,
            "Accept": "application/json,application/xml,text/xml,*/*",
            "Connection": "keep-alive"
        }

    async def fetch_usgs_live_async(self) -> Optional[Dict[str, Any]]:
        """
        Fetches live real-time earthquake GeoJSON from USGS.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True, verify=False) as client:
                resp = await client.get(self.usgs_url, headers=self._headers())
                if resp.status_code == 200:
                    logger.info(f"[DISASTER_SCRAPER] USGS Live Feed fetched ({len(resp.text)} bytes)")
                    return resp.json()
        except Exception as e:
            logger.warning(f"[DISASTER_SCRAPER] USGS Live fetch notice: {e}")
        return None

    async def fetch_gdacs_live_async(self) -> Optional[str]:
        """
        Fetches GDACS Global Disaster alerts.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True, verify=False) as client:
                resp = await client.get(self.gdacs_url, headers=self._headers())
                if resp.status_code == 200:
                    return resp.text
        except Exception as e:
            logger.warning(f"[DISASTER_SCRAPER] GDACS Live fetch notice: {e}")
        return None

    async def scrape_all_hazards(self, force: bool = False) -> List[Dict[str, Any]]:
        """
        Executes full disaster scraping pipeline:
        1. Checks cache freshness unless forced
        2. Scrapes USGS & GDACS feeds concurrently
        3. Parses and generates GeoJSON hazard polygons
        4. Updates cache and returns verified hazard zones
        """
        if not force and disaster_hazard_cache.is_fresh():
            return disaster_hazard_cache.get_hazard_zones()

        disaster_hazard_cache.mark_scraping()
        start_time = time.time()
        logger.info("[DISASTER_SCRAPER] Starting live multi-hazard web scraping pipeline...")

        all_hazards: List[Dict[str, Any]] = []

        try:
            # Concurrently fetch USGS and GDACS
            usgs_data, gdacs_text = await asyncio.gather(
                self.fetch_usgs_live_async(),
                self.fetch_gdacs_live_async(),
                return_exceptions=True
            )

            # 1. Parse USGS Seismic hazards
            if isinstance(usgs_data, dict):
                seismic_hazards = parse_usgs_earthquakes(usgs_data)
                all_hazards.extend(seismic_hazards)
            else:
                # Fallback to structural Himalayan seismic belt
                all_hazards.extend(parse_usgs_earthquakes({}))

            # 2. Parse GDACS & Hydrological/Landslide Hazard zones
            gdacs_str = gdacs_text if isinstance(gdacs_text, str) else ""
            met_hazards = parse_gdacs_alerts(gdacs_str)
            all_hazards.extend(met_hazards)

            # Assign sequential IDs
            for idx, h in enumerate(all_hazards, 1):
                h["id"] = idx

            disaster_hazard_cache.update(all_hazards)
            duration = round(time.time() - start_time, 2)
            logger.info(f"[DISASTER_SCRAPER] Scraped and generated {len(all_hazards)} dynamic hazard zones in {duration}s")
            return all_hazards

        except Exception as e:
            err_msg = str(e)
            logger.error(f"[DISASTER_SCRAPER] Pipeline error: {err_msg}")
            disaster_hazard_cache.mark_failed(err_msg)
            return disaster_hazard_cache.get_hazard_zones()

disaster_scraper = DisasterHazardScraper()
