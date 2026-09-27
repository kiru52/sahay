from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from app.schemas.schemas import AIAnalyzeRequest, AIAnalyzeResponse
from app.ai.engine import ai_engine

router = APIRouter(prefix="/ai", tags=["AI Engine Direct"])

@router.post("/analyze", response_model=AIAnalyzeResponse)
def analyze_distress(payload: AIAnalyzeRequest):
    """
    Modular AI Distress Inference Endpoint:
    Combines Personal Baseline, NLP text analysis, Voice acoustic indicators,
    Behavioral delays, and Case timeline context.
    """
    try:
        result = ai_engine.analyze(
            victim_id=payload.victim_id,
            text=payload.text,
            voice_features=payload.voice_features,
            behavioral_features=payload.behavioral_features,
            case_events=payload.case_events,
            historical_baseline=payload.historical_baseline
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI inference error: {str(e)}")
