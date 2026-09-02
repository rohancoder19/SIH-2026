from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import Habitation, HazardWeightsConfig
from app.schemas.schemas import RiskWeightsInput
from app.ml.engine import ml_engine

router = APIRouter(prefix="/api/risk", tags=["Multi-Hazard Risk Engine"])

@router.get("/config")
def get_risk_weights(db: Session = Depends(get_db)):
    cfg = db.query(HazardWeightsConfig).first()
    if not cfg:
        cfg = HazardWeightsConfig()
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return {
        "flood_w": cfg.flood_w,
        "landslide_w": cfg.landslide_w,
        "earthquake_w": cfg.earthquake_w,
        "cyclone_w": cfg.cyclone_w,
        "environmental_w": cfg.environmental_w,
        "updated_at": cfg.updated_at
    }

@router.post("/config")
def update_risk_weights(weights_in: RiskWeightsInput, db: Session = Depends(get_db)):
    cfg = db.query(HazardWeightsConfig).first()
    if not cfg:
        cfg = HazardWeightsConfig()
        db.add(cfg)
    cfg.flood_w = weights_in.flood_w
    cfg.landslide_w = weights_in.landslide_w
    cfg.earthquake_w = weights_in.earthquake_w
    cfg.cyclone_w = weights_in.cyclone_w
    cfg.environmental_w = weights_in.environmental_w
    db.commit()
    return {"message": "Hazard weights updated successfully", "config": weights_in}

@router.get("/analyze/{habitation_id}")
def analyze_habitation_risk(habitation_id: int, db: Session = Depends(get_db)):
    hab = db.query(Habitation).filter(Habitation.id == habitation_id).first()
    if not hab:
        raise HTTPException(status_code=404, detail="Habitation not found")
    
    breakdown = hab.hazard_breakdown or {"landslide": 85.0, "flood": 75.0, "earthquake": 60.0, "environmental": 70.0}
    
    # Calculate ML prediction
    prediction = ml_engine.predict_relocation_priority({
        "landslide_risk": breakdown.get("landslide", 75.0),
        "flood_risk": breakdown.get("flood", 60.0),
        "earthquake_risk": breakdown.get("earthquake", 65.0),
        "environmental_risk": breakdown.get("environmental", 70.0),
        "accessibility_score": hab.accessibility_score,
        "infrastructure_score": hab.infrastructure_score,
        "distance_to_safe_area_km": 6.5
    })
    
    return {
        "habitation_id": hab.id,
        "habitation_name": hab.name,
        "district": hab.district,
        "overall_risk_score": hab.hazard_score,
        "relocation_priority": prediction["relocation_priority"],
        "ai_prediction": prediction,
        "hazard_breakdown": breakdown,
        "vulnerability_factors": {
            "infrastructure_vulnerability": round(100 - hab.infrastructure_score, 1),
            "accessibility_vulnerability": round(100 - hab.accessibility_score, 1)
        }
    }
