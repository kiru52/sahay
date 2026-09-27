import os
from pydantic_settings import BaseSettings
from typing import List, Dict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SAHAY"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DESCRIPTION: str = "AI-Powered Dynamic Mental Health Monitoring and Distress Prediction System for Victims of Atrocities"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sahay_sih_2026_super_secret_jwt_key_decision_support_system_sec")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database (Default to SQLite with full async/sync compatibility for local demo, postgresql ready)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sahay.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Distress Risk Thresholds
    RISK_THRESHOLDS: Dict[str, Dict[str, int]] = {
        "LOW": {"min": 0, "max": 30},
        "MODERATE": {"min": 31, "max": 60},
        "HIGH": {"min": 61, "max": 80},
        "CRITICAL": {"min": 81, "max": 100}
    }
    
    # Baseline Deviation Trigger Thresholds
    SIGNIFICANT_ESCALATION_DELTA: int = 15 # +15 score increase triggers escalation review
    CRITICAL_ESCALATION_DELTA: int = 25    # +25 triggers immediate early warning alert
    
    class Config:
        case_sensitive = True

settings = Settings()
