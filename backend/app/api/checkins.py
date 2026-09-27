from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.models.models import (
    Victim, Checkin, DistressScore, AIPrediction, Alert, BaselineProfile, Case
)
from app.schemas.schemas import CheckinCreate, CheckinOut, DistressScoreOut
from app.ai.engine import ai_engine
from app.ai.voice_processor import voice_extractor

router = APIRouter(prefix="/checkins", tags=["Victim Check-ins"])

@router.post("", response_model=CheckinOut)
def submit_checkin(payload: CheckinCreate, db: Session = Depends(get_db)):
    victim = db.query(Victim).filter(Victim.id == payload.victim_id).first()
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")
        
    # Baseline
    baseline = victim.baseline_profile
    baseline_dict = {
        "baseline_distress_score": baseline.baseline_distress_score if baseline else 30.0,
        "baseline_speaking_rate": baseline.baseline_speaking_rate if baseline else 130.0,
        "baseline_pitch_var": baseline.baseline_pitch_var if baseline else 22.0
    }
    
    # Get previous score
    prev_score_obj = (
        db.query(DistressScore)
        .filter(DistressScore.victim_id == victim.id)
        .order_by(DistressScore.timestamp.desc())
        .first()
    )
    prev_score = prev_score_obj.distress_score if prev_score_obj else baseline_dict["baseline_distress_score"]
    
    # Collect case events
    case_events_list = []
    for c in victim.cases:
        for ev in c.events:
            case_events_list.append({
                "type": ev.event_type,
                "event_title": ev.event_title,
                "event_date": ev.event_date.isoformat(),
                "stress_relevance": ev.stress_relevance,
                "is_completed": ev.is_completed
            })
            
    # Voice features processing
    text_input = payload.text_response or payload.speech_to_text or ""
    voice_metrics = None
    if payload.speaking_rate or payload.pause_frequency or payload.pitch_variation:
        voice_metrics = voice_extractor.extract_or_simulate_features(
            text=text_input,
            raw_audio_meta={
                "speaking_rate": payload.speaking_rate,
                "pause_frequency": payload.pause_frequency,
                "pitch_variation": payload.pitch_variation
            }
        )
    else:
        voice_metrics = voice_extractor.extract_or_simulate_features(text=text_input)
        
    # Run AI Distress Inference
    behavioral_meta = {
        "engagement_delay_days": payload.engagement_delay_days or 0.0,
        "self_reported_mood": payload.self_reported_mood
    }
    
    ai_result = ai_engine.analyze(
        victim_id=victim.id,
        text=text_input,
        voice_features=voice_metrics,
        behavioral_features=behavioral_meta,
        case_events=case_events_list,
        historical_baseline=baseline_dict,
        previous_score=prev_score
    )
    
    # 1. Create Checkin record
    checkin = Checkin(
        victim_id=victim.id,
        timestamp=datetime.utcnow(),
        text_response=payload.text_response,
        speech_to_text=payload.speech_to_text or (text_input if payload.audio_url else None),
        audio_url=payload.audio_url,
        speaking_rate=voice_metrics.get("speaking_rate"),
        pause_frequency=voice_metrics.get("pause_frequency"),
        pitch_variation=voice_metrics.get("pitch_variation"),
        sentiment_score=ai_result["sentiment_score"],
        dominant_emotion=ai_result["dominant_emotion"],
        self_reported_mood=payload.self_reported_mood,
        engagement_delay_days=payload.engagement_delay_days or 0.0
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    
    # 2. Create DistressScore record
    trajectory_delta = round(ai_result["distress_score"] - prev_score, 1)
    distress_score = DistressScore(
        victim_id=victim.id,
        checkin_id=checkin.id,
        timestamp=datetime.utcnow(),
        distress_score=ai_result["distress_score"],
        risk_level=ai_result["risk_level"],
        baseline_deviation=ai_result["baseline_deviation"],
        trajectory_delta=trajectory_delta,
        confidence=ai_result["confidence"]
    )
    db.add(distress_score)
    db.commit()
    db.refresh(distress_score)
    
    # 3. Create AIPrediction with SHAP attribution
    ai_prediction = AIPrediction(
        distress_score_id=distress_score.id,
        victim_id=victim.id,
        shap_values=ai_result["contributing_factors"],
        ai_insight_summary=ai_result["ai_insight_summary"],
        recommended_action=ai_result["recommended_action"],
        model_version="sahay-multimodal-v1.0"
    )
    db.add(ai_prediction)
    
    # 4. Generate Alert if Early Warning triggered
    if ai_result["early_warning_triggered"]:
        alert_type = "PRE_HEARING_SPIKE" if "hearing" in ai_result["ai_insight_summary"].lower() else "DISTRESS_ESCALATION"
        alert = Alert(
            victim_id=victim.id,
            timestamp=datetime.utcnow(),
            alert_type=alert_type,
            previous_score=prev_score,
            current_score=ai_result["distress_score"],
            score_change=trajectory_delta,
            risk_level=ai_result["risk_level"],
            status="TRIGGERED"
        )
        db.add(alert)
        
    db.commit()
    db.refresh(checkin)
    return checkin

@router.get("/{victim_id}", response_model=List[CheckinOut])
def get_victim_checkins(victim_id: str, db: Session = Depends(get_db)):
    checkins = (
        db.query(Checkin)
        .filter(Checkin.victim_id == victim_id)
        .order_by(Checkin.timestamp.desc())
        .all()
    )
    return checkins
