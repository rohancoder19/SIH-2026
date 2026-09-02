from fastapi import APIRouter
from typing import Dict, Any

from app.scraper.pipeline import disaster_pipeline

router = APIRouter(prefix="/api/data", tags=["Live Data Pipeline"])

@router.post("/refresh")
async def trigger_live_data_refresh() -> Dict[str, Any]:
    """
    Executes live multi-hazard disaster data pipeline pass across USGS, GDACS, CWC, and NDMA feeds.
    Applies async fetching, HTML/GeoJSON normalization, confidence scoring, and spatial deduplication.
    """
    hazards = await disaster_pipeline.execute_pipeline(force=True)
    return {
        "status": "SUCCESS",
        "message": f"Successfully scraped, normalized & deduplicated {len(hazards)} multi-hazard disaster events.",
        "hazards_count": len(hazards),
        "hazards": hazards
    }
