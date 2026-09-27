from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # "VICTIM", "SUPPORT_WORKER", "ADMIN"
    full_name = Column(String(255), nullable=False)
    center_id = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    interventions = relationship("Intervention", back_populates="officer")
    audit_logs = relationship("AuditLog", back_populates="user")

class Victim(Base):
    __tablename__ = "victims"
    
    id = Column(String(50), primary_key=True, index=True) # e.g. "V-1042"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    anonymized_id = Column(String(50), unique=True, index=True, nullable=False)
    age_group = Column(String(50), nullable=True) # e.g. "25-34"
    gender = Column(String(50), nullable=True)
    registration_date = Column(DateTime, default=datetime.utcnow)
    district = Column(String(100), index=True, nullable=False)
    center_name = Column(String(150), nullable=False)
    case_category = Column(String(150), nullable=False) # e.g. "Atrocity / Severe Harassment", "Domestic Violence", "POCSO"
    is_active = Column(Boolean, default=True)
    assigned_worker_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    baseline_profile = relationship("BaselineProfile", back_populates="victim", uselist=False, cascade="all, delete-orphan")
    cases = relationship("Case", back_populates="victim", cascade="all, delete-orphan")
    checkins = relationship("Checkin", back_populates="victim", cascade="all, delete-orphan")
    distress_scores = relationship("DistressScore", back_populates="victim", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="victim", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="victim", cascade="all, delete-orphan")
    consent = relationship("Consent", back_populates="victim", uselist=False, cascade="all, delete-orphan")

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    victim_id = Column(String(50), ForeignKey("victims.id"), nullable=False)
    case_number = Column(String(100), unique=True, index=True, nullable=False)
    police_station = Column(String(150), nullable=False)
    fir_number = Column(String(100), nullable=True)
    current_stage = Column(String(100), nullable=False) # "CASE_FILED", "INVESTIGATION", "STATEMENT", "HEARING", "JUDGEMENT", "REHABILITATION"
    filing_date = Column(DateTime, nullable=False)
    summary = Column(Text, nullable=True)
    
    # Relationships
    victim = relationship("Victim", back_populates="cases")
    events = relationship("CaseEvent", back_populates="case", cascade="all, delete-orphan")

class CaseEvent(Base):
    __tablename__ = "case_events"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    victim_id = Column(String(50), ForeignKey("victims.id"), nullable=False)
    event_title = Column(String(200), nullable=False)
    event_type = Column(String(100), nullable=False) # "HEARING", "TESTIMONY", "INVESTIGATION", "BAIL_HEARING", "COUNSELING", "COMPENSATION_REVIEW"
    event_date = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    stress_relevance = Column(String(50), default="MEDIUM") # "HIGH", "MEDIUM", "LOW"
    is_completed = Column(Boolean, default=False)
    
    # Relationships
    case = relationship("Case", back_populates="events")

class BaselineProfile(Base):
    __tablename__ = "baseline_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    victim_id = Column(String(50), ForeignKey("victims.id"), unique=True, nullable=False)
    baseline_distress_score = Column(Float, default=28.0)
    baseline_sentiment_mean = Column(Float, default=0.1)
    baseline_speaking_rate = Column(Float, default=130.0) # words per minute
    baseline_pitch_var = Column(Float, default=22.0)
    baseline_checkin_interval_days = Column(Float, default=3.0)
    established_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    
    # Relationships
    victim = relationship("Victim", back_populates="baseline_profile")

class Checkin(Base):
    __tablename__ = "checkins"
    
    id = Column(Integer, primary_key=True, index=True)
    victim_id = Column(String(50), ForeignKey("victims.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    text_response = Column(Text, nullable=True)
    audio_url = Column(String(255), nullable=True)
    speech_to_text = Column(Text, nullable=True)
    speaking_rate = Column(Float, nullable=True) # words per min
    pause_frequency = Column(Float, nullable=True) # pauses per min
    pitch_variation = Column(Float, nullable=True) # pitch std dev (Hz)
    sentiment_score = Column(Float, nullable=True) # -1.0 to +1.0
    dominant_emotion = Column(String(50), nullable=True) # "FEAR", "ANXIETY", "SADNESS", "NEUTRAL", "HOPEFUL"
    self_reported_mood = Column(Integer, nullable=True) # 1 to 5 scale
    engagement_delay_days = Column(Float, default=0.0)
    
    # Relationships
    victim = relationship("Victim", back_populates="checkins")
    distress_score = relationship("DistressScore", back_populates="checkin", uselist=False, cascade="all, delete-orphan")

class DistressScore(Base):
    __tablename__ = "distress_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    victim_id = Column(String(50), ForeignKey("victims.id"), nullable=False)
    checkin_id = Column(Integer, ForeignKey("checkins.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    distress_score = Column(Float, nullable=False) # 0 to 100
    risk_level = Column(String(50), nullable=False) # "LOW", "MODERATE", "HIGH", "CRITICAL"
    baseline_deviation = Column(Float, nullable=False) # Score - Baseline Score
    trajectory_delta = Column(Float, default=0.0) # Score - Previous Score
    confidence = Column(Float, default=0.88)
    
    # Relationships
    victim = relationship("Victim", back_populates="distress_scores")
    checkin = relationship("Checkin", back_populates="distress_score")
    ai_prediction = relationship("AIPrediction", back_populates="distress_score", uselist=False, cascade="all, delete-orphan")

class AIPrediction(Base):
    __tablename__ = "ai_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    distress_score_id = Column(Integer, ForeignKey("distress_scores.id"), unique=True, nullable=False)
    victim_id = Column(String(50), ForeignKey("victims.id"), nullable=False)
    shap_values = Column(JSON, nullable=False) # {"baseline_deviation": 18, "text_sentiment": 12, "voice_stress": 8, "upcoming_event": 6, "engagement_delay": 4}
    ai_insight_summary = Column(Text, nullable=False)
    recommended_action = Column(String(255), nullable=False)
    model_version = Column(String(50), default="sahay-multimodal-v1.0")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    distress_score = relationship("DistressScore", back_populates="ai_prediction")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    victim_id = Column(String(50), ForeignKey("victims.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    alert_type = Column(String(100), nullable=False) # "DISTRESS_ESCALATION", "MISSED_CHECKIN_CLUSTER", "PRE_HEARING_SPIKE"
    previous_score = Column(Float, nullable=False)
    current_score = Column(Float, nullable=False)
    score_change = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False) # "HIGH", "CRITICAL"
    status = Column(String(50), default="TRIGGERED") # "TRIGGERED", "ACKNOWLEDGED", "FOLLOW_UP_SCHEDULED", "RESOLVED"
    assigned_to = Column(String(150), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # Relationships
    victim = relationship("Victim", back_populates="alerts")
    interventions = relationship("Intervention", back_populates="alert")

class Intervention(Base):
    __tablename__ = "interventions"
    
    id = Column(Integer, primary_key=True, index=True)
    victim_id = Column(String(50), ForeignKey("victims.id"), nullable=False)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    officer_name = Column(String(150), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    intervention_type = Column(String(100), nullable=False) # "PHONE_CALL", "HOME_VISIT", "COUNSELING_SESSION", "LEGAL_AID_COORDINATION", "EMERGENCY_SUPPORT"
    notes = Column(Text, nullable=False)
    outcome_rating = Column(String(50), nullable=True) # "STABILIZED", "FOLLOW_UP_REQUIRED", "ESCALATED_LEGAL", "ATTENDING_HEARING_ACCOMPANIED"
    follow_up_date = Column(DateTime, nullable=True)
    
    # Relationships
    victim = relationship("Victim", back_populates="interventions")
    alert = relationship("Alert", back_populates="interventions")
    officer = relationship("User", back_populates="interventions")

class Consent(Base):
    __tablename__ = "consents"
    
    id = Column(Integer, primary_key=True, index=True)
    victim_id = Column(String(50), ForeignKey("victims.id"), unique=True, nullable=False)
    data_sharing_allowed = Column(Boolean, default=True)
    voice_analysis_allowed = Column(Boolean, default=True)
    case_timeline_sync_allowed = Column(Boolean, default=True)
    sms_checkin_allowed = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    victim = relationship("Victim", back_populates="consent")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(255), nullable=True)
    role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False) # "VIEW_CASE", "ACKNOWLEDGE_ALERT", "RECORD_INTERVENTION", "EXPORT_REPORT", "MODIFY_CONSENT"
    resource_type = Column(String(100), nullable=False) # "VICTIM", "ALERT", "INTERVENTION", "AUDIT"
    resource_id = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    ip_address = Column(String(100), default="127.0.0.1")
    details = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
