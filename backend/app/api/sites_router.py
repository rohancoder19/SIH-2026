from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.db import get_db
from app.models.models import RelocationSite
from app.schemas.schemas import RelocationSiteOut
from app.services.capacity_service import capacity_service

router = APIRouter(prefix="/api/sites", tags=["Relocation Sites & Capacity"])

@router.get("", response_model=List[RelocationSiteOut])
def get_relocation_sites(db: Session = Depends(get_db)):
    return db.query(RelocationSite).all()

@router.get("/{site_id}", response_model=RelocationSiteOut)
def get_site_detail(site_id: int, db: Session = Depends(get_db)):
    site = db.query(RelocationSite).filter(RelocationSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Relocation Site not found")
    return site

@router.get("/{site_id}/capacity")
def get_site_capacity(site_id: int, db: Session = Depends(get_db)):
    site = db.query(RelocationSite).filter(RelocationSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Relocation Site not found")
    
    site_dict = {
        "id": site.id,
        "name": site.name,
        "land_area": site.land_area,
        "available_area": site.available_area,
        "safety_score": site.safety_score,
        "infrastructure_score": site.infrastructure_score,
        "environmental_score": site.environmental_score
    }
    
    return capacity_service.evaluate_site_capacity(site_dict)
