from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import Habitation, RelocationSite, HazardZone

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
        "timestamp": "2026-08-25",
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
