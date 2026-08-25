from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import Habitation, RelocationSite
from app.services.relocation_service import relocation_service

router = APIRouter(prefix="/api/relocation", tags=["AI Relocation Engine"])

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
