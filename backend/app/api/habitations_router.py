from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.models.models import Habitation
from app.schemas.schemas import HabitationOut, HabitationCreate

router = APIRouter(prefix="/api/habitations", tags=["Habitations"])

@router.get("", response_model=List[HabitationOut])
def get_habitations(
    district: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Habitation)
    if district:
        query = query.filter(Habitation.district.ilike(f"%{district}%"))
    if priority:
        query = query.filter(Habitation.relocation_priority == priority.upper())
    if search:
        query = query.filter(
            (Habitation.name.ilike(f"%{search}%")) |
            (Habitation.district.ilike(f"%{search}%"))
        )
    return query.limit(limit).all()

@router.get("/{id}", response_model=HabitationOut)
def get_habitation_detail(id: int, db: Session = Depends(get_db)):
    hab = db.query(Habitation).filter(Habitation.id == id).first()
    if not hab:
        raise HTTPException(status_code=404, detail="Habitation not found")
    return hab

@router.post("", response_model=HabitationOut)
def create_habitation(hab_in: HabitationCreate, db: Session = Depends(get_db)):
    new_hab = Habitation(**hab_in.dict())
    db.add(new_hab)
    db.commit()
    db.refresh(new_hab)
    return new_hab
