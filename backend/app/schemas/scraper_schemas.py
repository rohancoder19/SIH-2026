from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

class SourceAttribution(BaseModel):
    name: str
    url: str
    type: str

class ScrapedHazardPayload(BaseModel):
    id: int
    hazard_type: str
    name: str
    severity: str
    risk_score: float
    source: str
    confidence: float
    extracted_at: str
    geometry_json: Dict[str, Any]

class LiveScraperTelemetry(BaseModel):
    status: str  # "live", "scraping", "failed"
    last_successful_run: Optional[str] = None
    cache_age: str
    cache_age_seconds: int
    records_fetched: int
    active_hazards_by_type: Dict[str, int]
    source_urls: List[str]
    is_fresh: bool
    error_logs: List[str]
    pipeline_latency_ms: float

class TriggerScrapeResponse(BaseModel):
    message: str
    status: str
    records_scraped: int
    last_successful_run: Optional[str] = None
    sources: List[str]
    pipeline_latency_ms: float

class ScrapedDataResponse(BaseModel):
    status: str
    timestamp: Optional[str] = None
    records_count: int
    source_attribution: List[SourceAttribution]
    hazard_records: List[ScrapedHazardPayload]
