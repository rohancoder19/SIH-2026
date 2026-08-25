from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.db import get_db
from app.models.models import HazardZone
from app.schemas.schemas import HazardZoneOut

router = APIRouter(prefix="/api/hazards", tags=["Hazard Zones"])

@router.get("", response_model=List[HazardZoneOut])
def get_hazards(db: Session = Depends(get_db)):
    return db.query(HazardZone).all()

@router.get("/geojson")
def get_hazards_geojson(db: Session = Depends(get_db)) -> Dict[str, Any]:
    hazards = db.query(HazardZone).all()
    features = []
    for h in hazards:
        features.append({
            "type": "Feature",
            "properties": {
                "id": h.id,
                "hazard_type": h.hazard_type,
                "name": h.name or f"{h.hazard_type} Zone {h.id}",
                "severity": h.severity,
                "risk_score": h.risk_score,
                "source": h.source,
                "confidence": h.confidence
            },
            "geometry": h.geometry_json
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }
