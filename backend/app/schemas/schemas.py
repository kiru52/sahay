from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    role: str
    full_name: str
    center_id: Optional[str] = None
    district: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str # "VICTIM", "SUPPORT_WORKER", "ADMIN"
    center_id: Optional[str] = None
    district: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    full_name: str
    center_id: Optional[str] = None
    district: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Baseline Schemas ---
class BaselineProfileOut(BaseModel):
    id: int
    victim_id: str
    baseline_distress_score: float
    baseline_sentiment_mean: float
    baseline_speaking_rate: float
    baseline_pitch_var: float
    baseline_checkin_interval_days: float
    established_at: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# --- Case & Event Schemas ---
class CaseEventOut(BaseModel):
    id: int
    case_id: int
    victim_id: str
    event_title: str
    event_type: str
    event_date: datetime
    description: Optional[str] = None
    stress_relevance: str
    is_completed: bool

    class Config:
        from_attributes = True

class CaseEventCreate(BaseModel):
    event_title: str
    event_type: str
    event_date: datetime
    description: Optional[str] = None
    stress_relevance: str = "MEDIUM"

class CaseOut(BaseModel):
    id: int
    victim_id: str
    case_number: str
    police_station: str
    fir_number: Optional[str] = None
    current_stage: str
    filing_date: datetime
    summary: Optional[str] = None
    events: List[CaseEventOut] = []

    class Config:
        from_attributes = True

# --- AI Prediction & SHAP Schemas ---
class SHAPAttribution(BaseModel):
    baseline_deviation: float
    text_sentiment: float
    voice_stress: float
    upcoming_case_event: float
    engagement_delay: float

class AIPredictionOut(BaseModel):
    id: int
    distress_score_id: int
    victim_id: str
    shap_values: Dict[str, float]
    ai_insight_summary: str
    recommended_action: str
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Distress Score Schemas ---
class DistressScoreOut(BaseModel):
    id: int
    victim_id: str
    checkin_id: Optional[int] = None
    timestamp: datetime
    distress_score: float
    risk_level: str
    baseline_deviation: float
    trajectory_delta: float
    confidence: float
    ai_prediction: Optional[AIPredictionOut] = None

    class Config:
        from_attributes = True

# --- Check-in Schemas ---
class CheckinCreate(BaseModel):
    victim_id: str
    text_response: Optional[str] = None
    speech_to_text: Optional[str] = None
    audio_url: Optional[str] = None
    speaking_rate: Optional[float] = None
    pause_frequency: Optional[float] = None
    pitch_variation: Optional[float] = None
    self_reported_mood: Optional[int] = Field(None, ge=1, le=5)
    engagement_delay_days: Optional[float] = 0.0

class CheckinOut(BaseModel):
    id: int
    victim_id: str
    timestamp: datetime
    text_response: Optional[str] = None
    speech_to_text: Optional[str] = None
    speaking_rate: Optional[float] = None
    pause_frequency: Optional[float] = None
    pitch_variation: Optional[float] = None
    sentiment_score: Optional[float] = None
    dominant_emotion: Optional[str] = None
    self_reported_mood: Optional[int] = None
    distress_score: Optional[DistressScoreOut] = None

    class Config:
        from_attributes = True

# --- AI Engine Direct Request/Response ---
class AIAnalyzeRequest(BaseModel):
    victim_id: str
    text: Optional[str] = None
    voice_features: Optional[Dict[str, float]] = None # {"speaking_rate": 110, "pause_frequency": 6, "pitch_variation": 38}
    behavioral_features: Optional[Dict[str, float]] = None # {"engagement_delay_days": 4, "self_reported_mood": 2}
    case_events: Optional[List[Dict[str, Any]]] = None # [{"type": "HEARING", "days_until": 2, "stress_relevance": "HIGH"}]
    historical_baseline: Optional[Dict[str, float]] = None # {"baseline_distress_score": 32, "baseline_speaking_rate": 130}

class AIAnalyzeResponse(BaseModel):
    distress_score: float
    risk_level: str # "LOW", "MODERATE", "HIGH", "CRITICAL"
    trend: str # "IMPROVING", "STABLE", "INCREASING"
    confidence: float
    baseline_deviation: float
    contributing_factors: Dict[str, float]
    ai_insight_summary: str
    recommended_action: str
    early_warning_triggered: bool

# --- Alert Schemas ---
class AlertOut(BaseModel):
    id: int
    victim_id: str
    timestamp: datetime
    alert_type: str
    previous_score: float
    current_score: float
    score_change: float
    risk_level: str
    status: str
    assigned_to: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None

    class Config:
        from_attributes = True

class AlertAcknowledgeRequest(BaseModel):
    assigned_to: Optional[str] = "Authorized Support Worker"
    notes: Optional[str] = None

class AlertResolveRequest(BaseModel):
    resolution_notes: str

# --- Intervention Schemas ---
class InterventionCreate(BaseModel):
    victim_id: str
    alert_id: Optional[int] = None
    officer_name: Optional[str] = "Authorized Support Worker"
    intervention_type: str # "PHONE_CALL", "HOME_VISIT", "COUNSELING_SESSION", "LEGAL_AID_COORDINATION", "EMERGENCY_SUPPORT"
    notes: str
    outcome_rating: Optional[str] = "STABILIZED" # "STABILIZED", "FOLLOW_UP_REQUIRED", "ESCALATED_LEGAL", "ATTENDING_HEARING_ACCOMPANIED"
    follow_up_date: Optional[datetime] = None

class InterventionOut(BaseModel):
    id: int
    victim_id: str
    alert_id: Optional[int] = None
    officer_name: Optional[str] = None
    timestamp: datetime
    intervention_type: str
    notes: str
    outcome_rating: Optional[str] = None
    follow_up_date: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Consent Schemas ---
class ConsentOut(BaseModel):
    victim_id: str
    data_sharing_allowed: bool
    voice_analysis_allowed: bool
    case_timeline_sync_allowed: bool
    sms_checkin_allowed: bool
    updated_at: datetime

    class Config:
        from_attributes = True

class ConsentUpdate(BaseModel):
    data_sharing_allowed: Optional[bool] = None
    voice_analysis_allowed: Optional[bool] = None
    case_timeline_sync_allowed: Optional[bool] = None
    sms_checkin_allowed: Optional[bool] = None

# --- Victim Profile Schemas ---
class VictimListOut(BaseModel):
    id: str
    anonymized_id: str
    age_group: Optional[str] = None
    gender: Optional[str] = None
    district: str
    center_name: str
    case_category: str
    current_distress_score: float
    risk_level: str
    trend: str
    baseline_score: float
    last_checkin_date: Optional[datetime] = None
    upcoming_event: Optional[str] = None
    upcoming_event_days: Optional[int] = None
    active_alert: bool = False

class VictimDetailOut(BaseModel):
    id: str
    anonymized_id: str
    age_group: Optional[str] = None
    gender: Optional[str] = None
    registration_date: datetime
    district: str
    center_name: str
    case_category: str
    baseline_profile: Optional[BaselineProfileOut] = None
    current_risk_level: str
    current_distress_score: float
    baseline_deviation: float
    trend: str
    cases: List[CaseOut] = []
    recent_checkins: List[CheckinOut] = []
    distress_scores: List[DistressScoreOut] = []
    alerts: List[AlertOut] = []
    interventions: List[InterventionOut] = []
    consent: Optional[ConsentOut] = None

# --- Analytics Schemas ---
class DistrictStats(BaseModel):
    district: str
    center_name: str
    total_victims: int
    active_cases: int
    low_risk_count: int
    moderate_risk_count: int
    high_risk_count: int
    critical_risk_count: int
    avg_distress_score: float
    avg_response_time_hours: float
    alerts_triggered: int
    alerts_resolved: int
    interventions_logged: int

class AdminOverviewStats(BaseModel):
    total_registered_victims: int
    total_active_cases: int
    low_risk_count: int
    moderate_risk_count: int
    high_risk_count: int
    critical_risk_count: int
    alerts_today: int
    upcoming_stress_events_count: int
    followup_compliance_rate: float
    avg_intervention_lead_time_days: float

class ModelValidationMetrics(BaseModel):
    is_simulation: bool = True
    metric_type: str = "Prototype Target / Simulation Result"
    accuracy: float = 0.894
    precision: float = 0.882
    recall: float = 0.921
    f1_score: float = 0.901
    false_alert_rate: float = 0.083
    avg_detection_lead_time_days: float = 3.4
    evaluated_sample_size: int = 1420
    benchmark_baseline_comparison: Dict[str, float] = {
        "standard_population_norm_f1": 0.642,
        "sahay_personal_baseline_f1": 0.901
    }
