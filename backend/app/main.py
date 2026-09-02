import asyncio
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.database.db import engine, Base, SessionLocal
from app.utils.seeder import seed_database

# Import routers
from app.api.auth_router import router as auth_router
from app.api.dashboard_router import router as dashboard_router
from app.api.habitations_router import router as habitations_router
from app.api.hazards_router import router as hazards_router
from app.api.risk_router import router as risk_router
from app.api.relocation_router import router as relocation_router
from app.api.sites_router import router as sites_router
from app.api.ml_router import router as ml_router
from app.api.gis_router import router as gis_router
from app.api.validation_router import router as validation_router
from app.api.reports_router import router as reports_router
from app.api.admin_router import router as admin_router
from app.api.scraper_router import router as scraper_router
from app.api.red_zones_router import router as red_zones_router
from app.api.data_router import router as data_router
from app.api.realtime_router import router as realtime_router
from app.scraper.disaster_scraper import disaster_scraper
from app.scraper.pipeline import disaster_pipeline

logger = logging.getLogger("surakshitsthan.main")

# Create Database Tables
Base.metadata.create_all(bind=engine)

async def _background_scraper_cron(interval_seconds: int = 900):
    """
    Automated background worker loop that periodically scrapes real-time
    multi-hazard disaster data (every 15 mins) and updates cache/WebSockets.
    """
    if os.getenv("TESTING") == "1" or os.getenv("PYTEST_CURRENT_TEST"):
        logger.info("[CRON] Testing environment detected. Skipping background cron worker loop.")
        return
    
    # Initial warmup
    try:
        logger.info("[STARTUP] Initializing Live Disaster & Hazard Intelligence scraper pipeline (USGS, GDACS, CWC, NDMA)...")
        await disaster_pipeline.execute_pipeline(force=True)
        logger.info("[STARTUP] Live Disaster Hazard cache initialization finished.")
    except Exception as e:
        logger.warning(f"[STARTUP] Scraper warm-up non-critical notice: {e}")

    # Recurring cron loop
    while True:
        await asyncio.sleep(interval_seconds)
        try:
            logger.info("[CRON] Executing automated 15-minute background live scraping cycle...")
            await disaster_pipeline.execute_pipeline(force=True)
        except Exception as e:
            logger.warning(f"[CRON] Automated background scraping cycle notice: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Seed database with demo scenarios
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.warning(f"Database seed notice: {e}")
    finally:
        db.close()

    # 2. Start background cron worker loop for live scraping
    cron_task = asyncio.create_task(_background_scraper_cron(interval_seconds=900))

    yield

    # Cancel background task on shutdown
    cron_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered GIS Decision-Support Platform with Live Multi-Hazard Disaster Intelligence Scraper",
    version="2.4.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(habitations_router)
app.include_router(hazards_router)
app.include_router(risk_router)
app.include_router(relocation_router)
app.include_router(sites_router)
app.include_router(ml_router)
app.include_router(gis_router)
app.include_router(validation_router)
app.include_router(reports_router)
app.include_router(admin_router)
app.include_router(scraper_router)
app.include_router(red_zones_router)
app.include_router(data_router)
app.include_router(realtime_router)

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "status": "ONLINE",
        "docs": "/docs",
        "disaster_scraper": "/api/scrape/status",
        "hazards_geojson": "/api/hazards/geojson",
        "message": "Welcome to SurakshitSthan AI - Multi-Hazard GIS & Live Disaster Intelligence Command Center"
    }

@app.get("/health")
def health_check():
    from datetime import datetime, timezone
    return {
        "status": "ok",
        "database": "connected",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
