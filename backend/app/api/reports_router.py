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
    
    total_pop = sum(h.population for h in habs)
    total_vuln_pop = sum(h.vulnerable_population for h in habs)
    immediate_habs = [h for h in habs if h.relocation_priority == "IMMEDIATE"]
    
    total_site_capacity = sum(s.population_capacity for s in sites)
    avail_capacity = sum(max(0, s.population_capacity - s.current_population) for s in sites)
    
    return {
        "report_title": f"District Disaster Vulnerability & Safe Relocation Assessment - {district}",
        "district": district,
        "state": "West Bengal",
        "generated_by": "SurakshitSthan AI Platform",
        "timestamp": "2026-09-02",
        "metrics": {
            "total_habitations": len(habs),
            "total_population": total_pop,
            "total_vulnerable_population": total_vuln_pop,
            "immediate_relocation_count": len(immediate_habs),
            "safe_relocation_sites_count": len(sites),
            "total_safe_capacity": total_site_capacity,
            "available_buffer_capacity": avail_capacity
        },
        "critical_habitations": [
            {
                "id": h.id,
                "name": h.name,
                "population": h.population,
                "vulnerable_population": h.vulnerable_population,
                "risk_score": h.hazard_score,
                "priority": h.relocation_priority
            } for h in immediate_habs
        ],
        "top_recommended_sites": [
            {
                "id": s.id,
                "name": s.name,
                "capacity": s.population_capacity,
                "available": max(0, s.population_capacity - s.current_population),
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
        "population": hab.population,
        "vulnerable_population": hab.vulnerable_population,
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
