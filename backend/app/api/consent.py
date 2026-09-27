from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models.models import Consent, Victim, AuditLog
from app.schemas.schemas import ConsentOut, ConsentUpdate

router = APIRouter(prefix="/consent", tags=["Consent & Privacy Management"])

@router.get("/{victim_id}", response_model=ConsentOut)
def get_victim_consent(victim_id: str, db: Session = Depends(get_db)):
    consent = db.query(Consent).filter(Consent.victim_id == victim_id).first()
    if not consent:
        # Create default consent
        consent = Consent(
            victim_id=victim_id,
            data_sharing_allowed=True,
            voice_analysis_allowed=True,
            case_timeline_sync_allowed=True,
            sms_checkin_allowed=True
        )
        db.add(consent)
        db.commit()
        db.refresh(consent)
    return consent

@router.put("/{victim_id}", response_model=ConsentOut)
def update_victim_consent(
    victim_id: str,
    payload: ConsentUpdate,
    db: Session = Depends(get_db)
):
    consent = db.query(Consent).filter(Consent.victim_id == victim_id).first()
    if not consent:
        consent = Consent(victim_id=victim_id)
        db.add(consent)
        
    if payload.data_sharing_allowed is not None:
        consent.data_sharing_allowed = payload.data_sharing_allowed
    if payload.voice_analysis_allowed is not None:
        consent.voice_analysis_allowed = payload.voice_analysis_allowed
    if payload.case_timeline_sync_allowed is not None:
        consent.case_timeline_sync_allowed = payload.case_timeline_sync_allowed
    if payload.sms_checkin_allowed is not None:
        consent.sms_checkin_allowed = payload.sms_checkin_allowed
        
    consent.updated_at = datetime.utcnow()
    
    # Audit log
    audit = AuditLog(
        action="MODIFY_CONSENT",
        resource_type="CONSENT",
        resource_id=victim_id,
        user_email="victim.portal@sahay.gov.in",
        role="VICTIM",
        details={"updated_at": consent.updated_at.isoformat()}
    )
    db.add(audit)
    db.commit()
    db.refresh(consent)
    return consent
