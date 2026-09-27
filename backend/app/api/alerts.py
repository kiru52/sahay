from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.models import Alert, AuditLog
from app.schemas.schemas import AlertOut, AlertAcknowledgeRequest, AlertResolveRequest

router = APIRouter(prefix="/alerts", tags=["Early Warning Alerts"])

@router.get("", response_model=List[AlertOut])
def get_alerts(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    victim_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status.upper())
    if risk_level:
        query = query.filter(Alert.risk_level == risk_level.upper())
    if victim_id:
        query = query.filter(Alert.victim_id == victim_id)
        
    alerts = query.order_by(Alert.timestamp.desc()).all()
    return alerts

@router.post("/{alert_id}/acknowledge", response_model=AlertOut)
def acknowledge_alert(
    alert_id: int,
    payload: AlertAcknowledgeRequest,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = "ACKNOWLEDGED"
    alert.acknowledged_at = datetime.utcnow()
    alert.assigned_to = payload.assigned_to or "Authorized Support Worker"
    if payload.notes:
        alert.resolution_notes = f"[Acknowledged: {payload.notes}]"
        
    # Audit log
    audit = AuditLog(
        action="ACKNOWLEDGE_ALERT",
        resource_type="ALERT",
        resource_id=str(alert.id),
        user_email=alert.assigned_to,
        role="SUPPORT_WORKER",
        details={
            "victim_id": alert.victim_id,
            "risk_level": alert.risk_level,
            "score_change": alert.score_change,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(
    alert_id: int,
    payload: AlertResolveRequest,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = "RESOLVED"
    alert.resolution_notes = payload.resolution_notes
    
    # Audit log
    audit = AuditLog(
        action="RESOLVE_ALERT",
        resource_type="ALERT",
        resource_id=str(alert.id),
        user_email=alert.assigned_to or "authorized.officer@sahay.gov.in",
        role="SUPPORT_WORKER",
        details={
            "victim_id": alert.victim_id,
            "resolution_notes": payload.resolution_notes,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)
    return alert
