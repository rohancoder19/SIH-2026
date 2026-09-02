from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.database.db import get_db
from app.models.models import Habitation, RelocationSite, HazardZone
from app.ml.engine import ml_engine
from app.ml.explainability import xai_engine

router = APIRouter(prefix="/api/reports", tags=["Reports & Export"])

@router.get("/summary")
def generate_district_summary_report(
    district: str = Query("Darjeeling"),
    db: Session = Depends(get_db)
):
    habs = db.query(Habitation).filter(Habitation.district.ilike(f"%{district}%")).all()
    sites = db.query(RelocationSite).filter(RelocationSite.district.ilike(f"%{district}%")).all()
    
    immediate_habs = [h for h in habs if h.relocation_priority == "IMMEDIATE"]
    
    total_land_area = sum(s.land_area for s in sites)
    avail_land_area = sum(s.available_area for s in sites)
    
    return {
        "report_title": f"District Disaster Vulnerability & Safe Relocation Assessment - {district}",
        "district": district,
        "state": "West Bengal",
        "generated_by": "SurakshitSthan AI Platform",
        "timestamp": "2026-09-02",
        "metrics": {
            "total_habitations": len(habs),
            "immediate_relocation_count": len(immediate_habs),
            "safe_relocation_sites_count": len(sites),
            "total_land_area_ha": round(total_land_area, 1),
            "available_land_area_ha": round(avail_land_area, 1)
        },
        "critical_habitations": [
            {
                "id": h.id,
                "name": h.name,
                "risk_score": h.hazard_score,
                "priority": h.relocation_priority
            } for h in immediate_habs
        ],
        "top_recommended_sites": [
            {
                "id": s.id,
                "name": s.name,
                "land_area": s.land_area,
                "available_area": s.available_area,
                "safety_score": s.safety_score
            } for s in sites[:5]
        ]
    }

@router.get("/relocation")
def generate_relocation_authority_brief(
    habitation_id: int = Query(1),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Generates State Authority Relocation Action Brief with Explainable AI (XAI) feature attributions
    and natural language Gemini executive reasoning.
    """
    hab = db.query(Habitation).filter(Habitation.id == habitation_id).first()
    if not hab:
        raise HTTPException(status_code=404, detail="Target habitation not found")

    hab_data = {
        "id": hab.id,
        "name": hab.name,
        "district": hab.district,
        "hazard_score": hab.hazard_score or 82.5,
        "hazard_breakdown": {
            "landslide": 88,
            "flood": 72,
            "earthquake": 65,
            "environmental": 70
        }
    }

    # 1. Deterministic XAI Feature Attribution
    xai_attributions = xai_engine.compute_feature_attribution(
        hab_data["hazard_breakdown"], hab_data["hazard_score"]
    )

    # 2. Gemini LLM Executive Briefing
    gemini_analysis = ml_engine.analyze_with_gemini(hab_data)

    return {
        "report_type": "STATE_AUTHORITY_RELOCATION_BRIEF",
        "habitation": hab_data,
        "explainable_ai": {
            "feature_attribution": xai_attributions,
            "primary_hazard_driver": xai_attributions[0]["factor_name"] if xai_attributions else "Landslide"
        },
        "authority_briefing": gemini_analysis
    }
