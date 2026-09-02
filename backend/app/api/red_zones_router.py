from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.scraper.disaster_cache import disaster_hazard_cache
from app.gis.red_zone import red_zone_engine

router = APIRouter(prefix="/api/red-zones", tags=["Red Zones GIS"])

@router.get("", response_model=Dict[str, Any])
@router.get("/", response_model=Dict[str, Any])
def get_dynamic_red_zones():
    """
    Returns spatial Red-Zone GeoJSON FeatureCollection generated dynamically
    from live scraped disaster hazards (USGS, GDACS, CWC, NDMA).
    Categorized into RED (>75 risk), ORANGE (50-75 risk), and YELLOW (25-50 risk) buffer polygons.
    """
    hazards = disaster_hazard_cache.get_hazard_zones()
    return red_zone_engine.generate_red_zones(hazards)
