import asyncio
import json
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect
from app.scraper.disaster_scraper import disaster_scraper
from app.scraper.disaster_cache import disaster_hazard_cache

logger = logging.getLogger("surakshitsthan.scraper_router")

router = APIRouter(prefix="/api/scrape", tags=["Live Scraping Engine"])

# WebSocket Manager to handle active client streaming connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"[WEBSOCKET] Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"[WEBSOCKET] Client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        disconnected = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(f"[WEBSOCKET] Broadcast failed to a connection: {e}")
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

# Synchronous adapter to bridge sync cache callbacks to async broadcast loop
def _cache_subscriber_callback(event_data: Dict[str, Any]):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.run_coroutine_threadsafe(manager.broadcast(event_data), loop)
    except Exception as e:
        logger.debug(f"[WEBSOCKET] Subscriber notification notice: {e}")

# Register cache subscriber
disaster_hazard_cache.add_subscriber(_cache_subscriber_callback)


@router.websocket("/ws")
async def websocket_scraper_endpoint(websocket: WebSocket):
    """
    WebSocket Endpoint for live real-time sync.
    Pushes live scraping telemetry & dynamic data updates to connected clients.
    """
    await manager.connect(websocket)
    try:
        # Send initial state greeting
        status_data = disaster_hazard_cache.get_status()
        await websocket.send_text(json.dumps({
            "event": "CONNECTED",
            "message": "Connected to SurakshitSthan Live Web Scraping WebSocket Stream",
            "status": status_data["status"],
            "last_scraped": status_data["last_scraped"],
            "total_records": status_data["total_hazard_zones"]
        }))
        while True:
            # Keep connection alive & handle incoming pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"event": "pong", "status": disaster_hazard_cache.get_status()["status"]}))
            elif data == "trigger":
                await disaster_scraper.scrape_all_hazards(force=True)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"[WEBSOCKET] Stream error: {e}")
        manager.disconnect(websocket)


@router.get("/status")
def get_scraper_status() -> Dict[str, Any]:
    """
    Returns scraper telemetry and pipeline health tracking:
    - Status: 'live', 'scraping', or 'failed'
    - Last successful run timestamp
    - Total records fetched
    - Target source URLs
    - Pipeline latency metrics & cache age
    """
    status_data = disaster_hazard_cache.get_status()
    return {
        "status": status_data["status"],
        "last_successful_run": status_data["last_scraped"],
        "cache_age": status_data["cache_age"],
        "cache_age_seconds": status_data["cache_age_seconds"],
        "records_fetched": status_data["total_hazard_zones"],
        "active_hazards_by_type": status_data["active_hazards_by_type"],
        "source_urls": status_data["sources"],
        "is_fresh": status_data["is_fresh"],
        "error_logs": [status_data["error_message"]] if status_data["error_message"] else [],
        "pipeline_latency_ms": status_data["pipeline_latency_ms"],
        "history_logs": status_data.get("history_logs", [])
    }


@router.post("/trigger")
async def trigger_live_scrape(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Manual 'Sync Now / Force Refresh' API endpoint so judges or users
    can trigger a live web scrape on demand from the UI.
    """
    try:
        hazards = await disaster_scraper.scrape_all_hazards(force=True)
        status_data = disaster_hazard_cache.get_status()
        return {
            "message": "Live scraping pipeline triggered successfully!",
            "status": "live",
            "records_scraped": len(hazards),
            "last_successful_run": status_data["last_scraped"],
            "sources": status_data["sources"],
            "pipeline_latency_ms": status_data["pipeline_latency_ms"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraper execution failed: {str(e)}")


@router.get("/data")
def get_scraped_data() -> Dict[str, Any]:
    """
    Exposes raw extracted scraped hazard zone records, source URLs, and timestamps.
    """
    hazards = disaster_hazard_cache.get_hazard_zones()
    status_data = disaster_hazard_cache.get_status()
    return {
        "status": status_data["status"],
        "timestamp": status_data["last_scraped"],
        "records_count": len(hazards),
        "source_attribution": [
            {"name": "USGS Real-Time Earthquake Feed", "url": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", "type": "Seismic"},
            {"name": "Global Disaster Alert & Coordination System (GDACS)", "url": "https://www.gdacs.org/xml/rss.xml", "type": "Multi-Hazard"},
            {"name": "CWC Hydrological & River Gauge Telemetry", "url": "http://cwc.gov.in/hydrological-data", "type": "Flood & Water"},
            {"name": "IMD Himalayan Slope Stability Alerts", "url": "https://mausam.imd.gov.in/", "type": "Landslide"}
        ],
        "hazard_records": hazards
    }

