from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.models.models import (
    Victim, Case, CaseEvent, BaselineProfile, Checkin,
    DistressScore, AIPrediction, Alert, Intervention, Consent, AuditLog
)
from app.schemas.schemas import (
    VictimListOut, VictimDetailOut, CaseOut, CaseEventOut,
    BaselineProfileOut, CheckinOut, DistressScoreOut, AIPredictionOut,
    AlertOut, InterventionOut, ConsentOut
)

router = APIRouter(prefix="/victims", tags=["Victim Management"])

@router.get("", response_model=List[VictimListOut])
def list_victims(
    risk_level: Optional[str] = None,
    district: Optional[str] = None,
    has_alert: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Victim).filter(Victim.is_active == True)
    
    if district:
        query = query.filter(Victim.district.ilike(f"%{district}%"))
        
    victims = query.all()
    results = []
    
    for v in victims:
        # Get baseline
        baseline = v.baseline_profile.baseline_distress_score if v.baseline_profile else 30.0
        
        # Get latest distress score
        latest_score_obj = (
            db.query(DistressScore)
            .filter(DistressScore.victim_id == v.id)
            .order_by(DistressScore.timestamp.desc())
            .first()
        )
        
        curr_score = latest_score_obj.distress_score if latest_score_obj else baseline
        curr_risk = latest_score_obj.risk_level if latest_score_obj else "LOW"
        trend_delta = latest_score_obj.trajectory_delta if latest_score_obj else 0.0
        
        if trend_delta >= 8.0:
            trend = "INCREASING"
        elif trend_delta <= -8.0:
            trend = "IMPROVING"
        else:
            trend = "STABLE"
            
        # Get active alerts
        active_alert_count = (
            db.query(Alert)
            .filter(Alert.victim_id == v.id, Alert.status.in_(["TRIGGERED", "ACKNOWLEDGED"]))
            .count()
        )
        
        # Get upcoming event
        nearest_event = None
        min_days = None
        for case in v.cases:
            for event in case.events:
                if not event.is_completed:
                    days = (event.event_date.date() - datetime.utcnow().date()).days
                    if days >= 0 and (min_days is None or days < min_days):
                        min_days = days
                        nearest_event = f"{event.event_title} ({event.event_type.replace('_', ' ').title()})"
        
        # Latest checkin date
        latest_checkin = (
            db.query(Checkin)
            .filter(Checkin.victim_id == v.id)
            .order_by(Checkin.timestamp.desc())
            .first()
        )
        
        # Filters
        if risk_level and curr_risk.upper() != risk_level.upper():
            continue
        if has_alert is True and active_alert_count == 0:
            continue
        if search:
            search_str = search.lower()
            if not (search_str in v.id.lower() or search_str in v.anonymized_id.lower() or search_str in v.case_category.lower()):
                continue
                
        results.append({
            "id": v.id,
            "anonymized_id": v.anonymized_id,
            "age_group": v.age_group,
            "gender": v.gender,
            "district": v.district,
            "center_name": v.center_name,
            "case_category": v.case_category,
            "current_distress_score": round(curr_score, 1),
            "risk_level": curr_risk,
            "trend": trend,
            "baseline_score": round(baseline, 1),
            "last_checkin_date": latest_checkin.timestamp if latest_checkin else None,
            "upcoming_event": nearest_event,
            "upcoming_event_days": min_days,
            "active_alert": active_alert_count > 0
        })
        
    # Sort critical and high risk first
    risk_weights = {"CRITICAL": 4, "HIGH": 3, "MODERATE": 2, "LOW": 1}
    results.sort(key=lambda x: (risk_weights.get(x["risk_level"], 0), x["current_distress_score"]), reverse=True)
    
    return results

@router.get("/{victim_id}", response_model=VictimDetailOut)
def get_victim_details(victim_id: str, db: Session = Depends(get_db)):
    victim = db.query(Victim).filter(Victim.id == victim_id).first()
    if not victim:
        raise HTTPException(status_code=404, detail="Victim profile not found")
    
    # Audit log access
    audit = AuditLog(
        action="VIEW_CASE_PROFILE",
        resource_type="VICTIM",
        resource_id=victim.id,
        user_email="authorized.officer@sahay.gov.in",
        role="SUPPORT_WORKER",
        details={"anonymized_id": victim.anonymized_id, "timestamp": datetime.utcnow().isoformat()}
    )
    db.add(audit)
    db.commit()
    
    # Latest score
    latest_score_obj = (
        db.query(DistressScore)
        .filter(DistressScore.victim_id == victim.id)
        .order_by(DistressScore.timestamp.desc())
        .first()
    )
    
    baseline = victim.baseline_profile.baseline_distress_score if victim.baseline_profile else 30.0
    curr_score = latest_score_obj.distress_score if latest_score_obj else baseline
    curr_risk = latest_score_obj.risk_level if latest_score_obj else "LOW"
    baseline_dev = round(curr_score - baseline, 1)
    
    trend_delta = latest_score_obj.trajectory_delta if latest_score_obj else 0.0
    if trend_delta >= 8.0:
        trend = "INCREASING"
    elif trend_delta <= -8.0:
        trend = "IMPROVING"
    else:
        trend = "STABLE"
        
    # Get scores with predictions
    distress_scores = (
        db.query(DistressScore)
        .filter(DistressScore.victim_id == victim.id)
        .order_by(DistressScore.timestamp.asc())
        .all()
    )
    
    # Recent checkins
    checkins = (
        db.query(Checkin)
        .filter(Checkin.victim_id == victim.id)
        .order_by(Checkin.timestamp.desc())
        .limit(10)
        .all()
    )
    
    alerts = (
        db.query(Alert)
        .filter(Alert.victim_id == victim.id)
        .order_by(Alert.timestamp.desc())
        .all()
    )
    
    interventions = (
        db.query(Intervention)
        .filter(Intervention.victim_id == victim.id)
        .order_by(Intervention.timestamp.desc())
        .all()
    )
    
    return {
        "id": victim.id,
        "anonymized_id": victim.anonymized_id,
        "age_group": victim.age_group,
        "gender": victim.gender,
        "registration_date": victim.registration_date,
        "district": victim.district,
        "center_name": victim.center_name,
        "case_category": victim.case_category,
        "baseline_profile": victim.baseline_profile,
        "current_risk_level": curr_risk,
        "current_distress_score": round(curr_score, 1),
        "baseline_deviation": baseline_dev,
        "trend": trend,
        "cases": victim.cases,
        "recent_checkins": checkins,
        "distress_scores": distress_scores,
        "alerts": alerts,
        "interventions": interventions,
        "consent": victim.consent
    }

@router.get("/{victim_id}/trajectory")
def get_victim_trajectory(victim_id: str, db: Session = Depends(get_db)):
    victim = db.query(Victim).filter(Victim.id == victim_id).first()
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")
        
    baseline = victim.baseline_profile.baseline_distress_score if victim.baseline_profile else 30.0
    
    scores = (
        db.query(DistressScore)
        .filter(DistressScore.victim_id == victim.id)
        .order_by(DistressScore.timestamp.asc())
        .all()
    )
    
    trajectory = []
    for s in scores:
        shap = s.ai_prediction.shap_values if s.ai_prediction else {}
        trajectory.append({
            "timestamp": s.timestamp.strftime("%b %d, %H:%M"),
            "date": s.timestamp.strftime("%Y-%m-%d"),
            "score": s.distress_score,
            "baseline": baseline,
            "risk_level": s.risk_level,
            "baseline_deviation": s.baseline_deviation,
            "shap_values": shap,
            "ai_insight": s.ai_prediction.ai_insight_summary if s.ai_prediction else ""
        })
        
    return {
        "victim_id": victim.id,
        "baseline_distress_score": baseline,
        "trajectory": trajectory
    }

@router.get("/{victim_id}/timeline")
def get_victim_unified_timeline(victim_id: str, db: Session = Depends(get_db)):
    victim = db.query(Victim).filter(Victim.id == victim_id).first()
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")
        
    timeline_events = []
    
    # 1. Case Events
    for c in victim.cases:
        for ev in c.events:
            timeline_events.append({
                "type": "CASE_EVENT",
                "subtype": ev.event_type,
                "title": ev.event_title,
                "timestamp": ev.event_date,
                "description": ev.description,
                "stress_relevance": ev.stress_relevance,
                "is_completed": ev.is_completed,
                "case_number": c.case_number
            })
            
    # 2. Check-ins & AI scores
    for chk in victim.checkins:
        score_obj = chk.distress_score
        timeline_events.append({
            "type": "CHECKIN",
            "subtype": chk.dominant_emotion or "CHECKIN",
            "title": f"Self-Reported Check-in (Mood: {chk.self_reported_mood or 'N/A'}/5)",
            "timestamp": chk.timestamp,
            "description": chk.text_response or chk.speech_to_text or "Voice check-in completed.",
            "distress_score": score_obj.distress_score if score_obj else None,
            "risk_level": score_obj.risk_level if score_obj else None,
            "speaking_rate": chk.speaking_rate,
            "pitch_variation": chk.pitch_variation
        })
        
    # 3. Alerts
    for al in victim.alerts:
        timeline_events.append({
            "type": "ALERT",
            "subtype": al.alert_type,
            "title": f"Early Warning Alert: {al.alert_type.replace('_', ' ')}",
            "timestamp": al.timestamp,
            "description": f"Score changed from {al.previous_score} to {al.current_score} (+{al.score_change})",
            "risk_level": al.risk_level,
            "status": al.status
        })
        
    # 4. Interventions
    for iv in victim.interventions:
        timeline_events.append({
            "type": "INTERVENTION",
            "subtype": iv.intervention_type,
            "title": f"Intervention: {iv.intervention_type.replace('_', ' ')}",
            "timestamp": iv.timestamp,
            "description": iv.notes,
            "outcome": iv.outcome_rating,
            "officer_name": iv.officer_name
        })
        
    # Sort chronologically
    timeline_events.sort(key=lambda x: x["timestamp"])
    
    return {
        "victim_id": victim.id,
        "anonymized_id": victim.anonymized_id,
        "timeline": timeline_events
    }
