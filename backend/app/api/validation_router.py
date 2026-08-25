from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.db import get_db
from app.models.models import ExpertValidation, Habitation
from app.schemas.schemas import ValidationCreate, ValidationOut

router = APIRouter(prefix="/api/validation", tags=["Expert Validation"])

@router.get("", response_model=List[ValidationOut])
def get_expert_validations(db: Session = Depends(get_db)):
    return db.query(ExpertValidation).order_by(ExpertValidation.created_at.desc()).all()

@router.post("", response_model=ValidationOut)
def submit_expert_validation(val_in: ValidationCreate, db: Session = Depends(get_db)):
    hab = db.query(Habitation).filter(Habitation.id == val_in.habitation_id).first()
    if not hab:
        raise HTTPException(status_code=404, detail="Habitation not found")
    
    orig_priority = hab.relocation_priority
    
    # If expert modified or accepted, update the habitation's priority in DB
    if val_in.decision in ["ACCEPTED", "MODIFIED"]:
        hab.relocation_priority = val_in.validated_priority.upper()
        db.commit()

    val_record = ExpertValidation(
        habitation_id=hab.id,
        expert_name="Dr. Arisudan Sharma (GSI Expert)",
        original_priority=orig_priority,
        validated_priority=val_in.validated_priority.upper(),
        decision=val_in.decision.upper(),
        comments=val_in.comments
    )
    db.add(val_record)
    db.commit()
    db.refresh(val_record)
    return val_record
