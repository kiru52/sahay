-- ==========================================================
-- SAHAY: Database Schema Definition (PostgreSQL 14+)
-- Dynamic Mental Health Monitoring & Distress Prediction System
-- ==========================================================

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('VICTIM', 'SUPPORT_WORKER', 'ADMIN')),
    full_name VARCHAR(255) NOT NULL,
    center_id VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Victims (Anonymized Dossier)
CREATE TABLE IF NOT EXISTS victims (
    id VARCHAR(50) PRIMARY KEY, -- e.g. "V-1042"
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    anonymized_id VARCHAR(50) UNIQUE NOT NULL,
    age_group VARCHAR(50),
    gender VARCHAR(50),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    district VARCHAR(100) NOT NULL,
    center_name VARCHAR(150) NOT NULL,
    case_category VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_worker_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_victims_district ON victims(district);
CREATE INDEX idx_victims_active ON victims(is_active);

-- 3. Baseline Profiles
CREATE TABLE IF NOT EXISTS baseline_profiles (
    id SERIAL PRIMARY KEY,
    victim_id VARCHAR(50) UNIQUE NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    baseline_distress_score FLOAT DEFAULT 28.0,
    baseline_sentiment_mean FLOAT DEFAULT 0.1,
    baseline_speaking_rate FLOAT DEFAULT 130.0,
    baseline_pitch_var FLOAT DEFAULT 22.0,
    baseline_checkin_interval_days FLOAT DEFAULT 3.0,
    established_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 4. Cases
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    victim_id VARCHAR(50) NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    police_station VARCHAR(150) NOT NULL,
    fir_number VARCHAR(100),
    current_stage VARCHAR(100) NOT NULL,
    filing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    summary TEXT
);

CREATE INDEX idx_cases_victim ON cases(victim_id);
CREATE INDEX idx_cases_stage ON cases(current_stage);

-- 5. Case Events & Judicial Milestones
CREATE TABLE IF NOT EXISTS case_events (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    victim_id VARCHAR(50) NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    event_title VARCHAR(200) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    stress_relevance VARCHAR(50) DEFAULT 'MEDIUM',
    is_completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_case_events_date ON case_events(event_date);
CREATE INDEX idx_case_events_victim ON case_events(victim_id);

-- 6. Checkins
CREATE TABLE IF NOT EXISTS checkins (
    id SERIAL PRIMARY KEY,
    victim_id VARCHAR(50) NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    text_response TEXT,
    audio_url VARCHAR(255),
    speech_to_text TEXT,
    speaking_rate FLOAT,
    pause_frequency FLOAT,
    pitch_variation FLOAT,
    sentiment_score FLOAT,
    dominant_emotion VARCHAR(50),
    self_reported_mood INTEGER CHECK (self_reported_mood BETWEEN 1 AND 5),
    engagement_delay_days FLOAT DEFAULT 0.0
);

CREATE INDEX idx_checkins_victim_time ON checkins(victim_id, timestamp DESC);

-- 7. Distress Scores
CREATE TABLE IF NOT EXISTS distress_scores (
    id SERIAL PRIMARY KEY,
    victim_id VARCHAR(50) NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    checkin_id INTEGER REFERENCES checkins(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    distress_score FLOAT NOT NULL CHECK (distress_score BETWEEN 0 AND 100),
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    baseline_deviation FLOAT NOT NULL,
    trajectory_delta FLOAT DEFAULT 0.0,
    confidence FLOAT DEFAULT 0.88
);

CREATE INDEX idx_distress_scores_victim ON distress_scores(victim_id, timestamp ASC);

-- 8. AI Predictions & SHAP Attributions
CREATE TABLE IF NOT EXISTS ai_predictions (
    id SERIAL PRIMARY KEY,
    distress_score_id INTEGER UNIQUE NOT NULL REFERENCES distress_scores(id) ON DELETE CASCADE,
    victim_id VARCHAR(50) NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    shap_values JSONB NOT NULL,
    ai_insight_summary TEXT NOT NULL,
    recommended_action VARCHAR(255) NOT NULL,
    model_version VARCHAR(50) DEFAULT 'sahay-multimodal-v1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Early Warning Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    victim_id VARCHAR(50) NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    alert_type VARCHAR(100) NOT NULL,
    previous_score FLOAT NOT NULL,
    current_score FLOAT NOT NULL,
    score_change FLOAT NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'TRIGGERED' CHECK (status IN ('TRIGGERED', 'ACKNOWLEDGED', 'FOLLOW_UP_SCHEDULED', 'RESOLVED')),
    assigned_to VARCHAR(150),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT
);

CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_victim ON alerts(victim_id);

-- 10. Human Interventions
CREATE TABLE IF NOT EXISTS interventions (
    id SERIAL PRIMARY KEY,
    victim_id VARCHAR(50) NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    alert_id INTEGER REFERENCES alerts(id) ON DELETE SET NULL,
    officer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    officer_name VARCHAR(150),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    intervention_type VARCHAR(100) NOT NULL,
    notes TEXT NOT NULL,
    outcome_rating VARCHAR(50),
    follow_up_date TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_interventions_victim ON interventions(victim_id);

-- 11. Consents
CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    victim_id VARCHAR(50) UNIQUE NOT NULL REFERENCES victims(id) ON DELETE CASCADE,
    data_sharing_allowed BOOLEAN DEFAULT TRUE,
    voice_analysis_allowed BOOLEAN DEFAULT TRUE,
    case_timeline_sync_allowed BOOLEAN DEFAULT TRUE,
    sms_checkin_allowed BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Security Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(100) DEFAULT '127.0.0.1',
    details JSONB
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
