from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.database.db import get_db
from app.models.models import Habitation, RelocationSite
from app.services.relocation_service import relocation_service

router = APIRouter(prefix="/api/relocation", tags=["AI Relocation Engine"])

class SimulationRequest(BaseModel):
    habitation_ids: Optional[List[int]] = None
    district: Optional[str] = None

@router.get("/recommendations/{habitation_id}")
def get_relocation_recommendations(habitation_id: int, db: Session = Depends(get_db)):
    hab = db.query(Habitation).filter(Habitation.id == habitation_id).first()
    if not hab:
        raise HTTPException(status_code=404, detail="Habitation not found")
    
    sites_query = db.query(RelocationSite).all()
    sites_data = [
        {
            "id": s.id,
            "name": s.name,
            "district": s.district,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "land_area": s.land_area,
            "available_area": s.available_area,
            "population_capacity": s.population_capacity,
            "current_population": s.current_population,
            "safety_score": s.safety_score,
            "accessibility_score": s.accessibility_score,
            "infrastructure_score": s.infrastructure_score,
            "environmental_score": s.environmental_score,
        } for s in sites_query
    ]
    
    hab_dict = {
        "id": hab.id,
        "name": hab.name,
        "latitude": hab.latitude,
        "longitude": hab.longitude,
        "vulnerable_population": hab.vulnerable_population
    }
    
    ranked_sites = relocation_service.calculate_site_recommendations(hab_dict, sites_data)
    
    return {
        "habitation": {
            "id": hab.id,
            "name": hab.name,
            "district": hab.district,
            "population": hab.population,
            "vulnerable_population": hab.vulnerable_population,
            "priority": hab.relocation_priority,
            "latitude": hab.latitude,
            "longitude": hab.longitude
        },
        "recommended_sites": ranked_sites
    }

@router.post("/simulate")
def simulate_relocation_plan(req: Optional[SimulationRequest] = None, db: Session = Depends(get_db)):
    """
    Executes multi-site carrying capacity matching simulation across habitations.
    Tracks allocation percentages and capacity deficit for emergency response teams.
    """
    hab_query = db.query(Habitation)
    if req and req.habitation_ids:
        hab_query = hab_query.filter(Habitation.id.in_(req.habitation_ids))
    elif req and req.district:
        hab_query = hab_query.filter(Habitation.district.ilike(f"%{req.district}%"))

    habitations = hab_query.all()
    sites = db.query(RelocationSite).all()

    habs_data = [
        {
            "id": h.id,
            "name": h.name,
            "district": h.district,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "population": h.population,
            "vulnerable_population": h.vulnerable_population,
            "relocation_priority": h.relocation_priority or "SHORT_TERM",
            "hazard_score": h.hazard_score or 50.0
        } for h in habitations
    ]

    sites_data = [
        {
            "id": s.id,
            "name": s.name,
            "district": s.district,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "population_capacity": s.population_capacity,
            "current_population": s.current_population,
            "safety_score": s.safety_score,
            "accessibility_score": s.accessibility_score,
            "infrastructure_score": s.infrastructure_score,
            "environmental_score": s.environmental_score
        } for s in sites
    ]

    return relocation_service.simulate_multi_site_relocation(habs_data, sites_data)
