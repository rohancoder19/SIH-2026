import random
from typing import Dict, Any, List

USER_AGENTS = [
    "SurakshitSthan-Disaster-GIS-Scraper/2.4.0 (NDMA Geospatial Command)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "SurakshitSthan-LiveScraper/2.4 (+https://surakshitsthan.gov.in/bot)"
]

DISASTER_SOURCES_CONFIG = [
    {
        "id": "USGS_SEISMIC",
        "name": "USGS Earthquake Hazards Program",
        "url": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
        "source_type": "GLOBAL_AGENCY",
        "confidence": 0.92,
        "hazards": ["Earthquake", "Tsunami"]
    },
    {
        "id": "GDACS_GLOBAL",
        "name": "Global Disaster Alert & Coordination System (GDACS)",
        "url": "https://www.gdacs.org/xml/rss.xml",
        "source_type": "GLOBAL_AGENCY",
        "confidence": 0.90,
        "hazards": ["Cyclone", "Flood", "Drought"]
    },
    {
        "id": "NDMA_ADVISORIES",
        "name": "National Disaster Management Authority (NDMA)",
        "url": "https://ndma.gov.in/advisories/feed",
        "source_type": "GOVERNMENT_OFFICIAL",
        "confidence": 0.95,
        "hazards": ["Landslide", "Cloudburst", "Flood", "Coastal Erosion"]
    },
    {
        "id": "CWC_HYDROLOGICAL",
        "name": "Central Water Commission (CWC) Flood Forecasting",
        "url": "https://ffs.india-water.gov.in/api/stations",
        "source_type": "GOVERNMENT_OFFICIAL",
        "confidence": 0.95,
        "hazards": ["Flood"]
    }
]

def get_random_user_agent() -> str:
    return random.choice(USER_AGENTS)
