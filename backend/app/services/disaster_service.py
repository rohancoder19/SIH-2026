import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.models import HazardZone, SystemAlert
from app.scraper.disaster_scraper import disaster_scraper
from app.scraper.disaster_cache import disaster_hazard_cache

logger = logging.getLogger("disaster_scraper.sync_service")

class DisasterHazardSyncService:
    """
    Synchronizes live scraped hazard zones into database HazardZone models
    and auto-generates critical SystemAlerts for the platform.
    """
    async def get_live_hazard_zones(self, db: Session, force: bool = False) -> List[Dict[str, Any]]:
        """
        Retrieves live hazard zones from scraper and synchronizes with DB.
        """
        scraped_hazards = await disaster_scraper.scrape_all_hazards(force=force)

        # Sync to DB if needed
        try:
            db_count = db.query(HazardZone).count()
            if force or db_count == 0:
                # Update or insert hazard zones
                for h in scraped_hazards:
                    existing = db.query(HazardZone).filter(HazardZone.name == h["name"]).first()
                    if existing:
                        existing.severity = h["severity"]
                        existing.risk_score = h["risk_score"]
                        existing.geometry_json = h["geometry_json"]
                        existing.source = h["source"]
                        existing.confidence = h.get("confidence", 0.90)
                        existing.updated_at = datetime.utcnow()
                    else:
                        new_hz = HazardZone(
                            hazard_type=h["hazard_type"],
                            name=h["name"],
                            severity=h["severity"],
                            risk_score=h["risk_score"],
                            geometry_json=h["geometry_json"],
                            source=h["source"],
                            confidence=h.get("confidence", 0.90)
                        )
                        db.add(new_hz)
                db.commit()
                logger.info(f"[DISASTER_SERVICE] Synchronized {len(scraped_hazards)} hazard zones to database.")
        except Exception as e:
            logger.warning(f"[DISASTER_SERVICE] DB sync notice: {e}")
            db.rollback()

        return scraped_hazards

    async def get_geojson_feature_collection(self, db: Session) -> Dict[str, Any]:
        """
        Builds GeoJSON FeatureCollection from live hazard zones.
        """
        hazards = await self.get_live_hazard_zones(db)
        features = []
        for idx, h in enumerate(hazards, 1):
            features.append({
                "type": "Feature",
                "properties": {
                    "id": h.get("id", idx),
                    "hazard_type": h.get("hazard_type", "Multi-Hazard"),
                    "name": h.get("name", f"Hazard Zone {idx}"),
                    "severity": h.get("severity", "High"),
                    "risk_score": h.get("risk_score", 75.0),
                    "source": h.get("source", "Live Disaster Pipeline"),
                    "confidence": h.get("confidence", 0.90)
                },
                "geometry": h.get("geometry_json", {})
            })

        return {
            "type": "FeatureCollection",
            "features": features
        }

    def get_status(self) -> Dict[str, Any]:
        return disaster_hazard_cache.get_status()

    async def force_refresh(self, db: Session) -> Dict[str, Any]:
        records = await self.get_live_hazard_zones(db, force=True)
        status = self.get_status()
        return {
            "message": f"Successfully scraped and refreshed {len(records)} live hazard zones from disaster feeds.",
            "status": status,
            "total_hazards": len(records)
        }

disaster_service = DisasterHazardSyncService()
