from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.models import Intervention, Alert, Victim, AuditLog
from app.schemas.schemas import InterventionCreate, InterventionOut

router = APIRouter(prefix="/interventions", tags=["Human Interventions"])

@router.post("", response_model=InterventionOut)
def record_intervention(payload: InterventionCreate, db: Session = Depends(get_db)):
    victim = db.query(Victim).filter(Victim.id == payload.victim_id).first()
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")
        
    intervention = Intervention(
        victim_id=payload.victim_id,
        alert_id=payload.alert_id,
        officer_name=payload.officer_name or "Authorized Support Worker",
        timestamp=datetime.utcnow(),
        intervention_type=payload.intervention_type,
        notes=payload.notes,
        outcome_rating=payload.outcome_rating,
        follow_up_date=payload.follow_up_date
    )
    db.add(intervention)
    
    # If linked to an alert, mark alert as follow-up scheduled or acknowledged
    if payload.alert_id:
        alert = db.query(Alert).filter(Alert.id == payload.alert_id).first()
        if alert:
            alert.status = "FOLLOW_UP_SCHEDULED" if payload.follow_up_date else "ACKNOWLEDGED"
            alert.resolution_notes = f"Intervention logged: {payload.intervention_type} - {payload.notes[:80]}..."
            
    # Audit log
    audit = AuditLog(
        action="RECORD_INTERVENTION",
        resource_type="INTERVENTION",
        resource_id=victim.id,
        user_email=payload.officer_name or "authorized.officer@sahay.gov.in",
        role="SUPPORT_WORKER",
        details={
            "intervention_type": payload.intervention_type,
            "outcome": payload.outcome_rating,
            "notes": payload.notes,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(intervention)
    return intervention

@router.get("", response_model=List[InterventionOut])
def list_interventions(victim_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Intervention)
    if victim_id:
        query = query.filter(Intervention.victim_id == victim_id)
    return query.order_by(Intervention.timestamp.desc()).all()
