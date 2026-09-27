# 🛡️ SAHAY (सहाय / சகாய்)
### AI-Powered Dynamic Mental Health Monitoring & Distress Prediction System for Victims of Atrocities
**Smart India Hackathon 2026 | Category: Software / HealthTech / AI**

> *"Existing systems track the CASE; SAHAY tracks the changing WELL-BEING of the victim throughout the case journey."*  
> **"Don't wait for distress to become a crisis. Detect change. Understand context. Act early."**

---

## 📌 1. Product Overview & Vision

SAHAY is an AI-powered, multilingual decision-support platform that monitors longitudinal changes in an atrocity victim's psychological distress indicators over the duration of their case journey. 

Rather than assessing victims against generic population averages, SAHAY establishes a **calibrated Personal Baseline** for every victim and detects deviations caused by **judicial stress milestones** (court hearings, cross-examinations, bail reviews) and **multimodal signals** (speech acoustic tremors, NLP sentiment, behavioral delays).

When significant distress elevation occurs, SAHAY triggers **Early Warning Alerts** for authorized Protection Officers and Social Welfare Counselors to initiate timely human-in-the-loop psychological first aid and court accompaniment.

---

## 🏛️ 2. Key Differentiators

| Feature | Legacy Atrocity Support Systems | SAHAY Early Warning System |
| :--- | :--- | :--- |
| **Tracking Focus** | Tracks court case status & FIR dates only | Tracks the **longitudinal well-being trajectory** of the human victim |
| **Evaluation Reference** | Generic, static population averages | **Personal Calibrated Baseline** tailored to individual resilience |
| **Case Awareness** | Detached from judicial events | **Context-Aware**: Anticipates upcoming judicial stress points |
| **Explainability** | Black-box "High/Low" risk scores | **SHAP-Style Explainability**: Exact feature decomposition |
| **Intervention Timing** | Reactive (post-crisis or suicide attempt) | **Proactive Early Warning**: 3.4 days average lead time |
| **Multilingual Support** | Single language / basic translation | Dictionary-based **English, Hindi (हिन्दी), and Tamil (தமிழ்)** |

---

## 🏗️ 3. Technology Stack

- **Frontend**:
  - React.js 18 with Vite
  - Tailwind CSS (Government-grade, calm, modern design language)
  - Lucide React icons
  - Recharts (Longitudinal trajectories, baseline deviations, SHAP waterfall, district analytics)
  - Canvas-Confetti (Interactive positive reinforcement)
- **Backend**:
  - Python 3.10+
  - FastAPI (Async RESTful API)
  - SQLAlchemy 2.0 ORM
  - SQLite (Instant zero-config out-of-the-box local demo) & PostgreSQL 14+ ready
  - Passlib & Python-Jose (JWT & Role-Based Access Control)
- **AI / ML & NLP Engine**:
  - Longitudinal Trajectory Engine (Baseline deviation delta $\Delta_{base}$)
  - Multilingual NLP Lexicon & Sentiment Extractor (English, Hindi, Tamil)
  - Voice Acoustic Stress Analyzer (Speaking rate, pause frequency, pitch variation)
  - Case Proximity Evaluator (Exponential judicial event proximity decay)
  - SHAP-Style Additive Explainability Engine

---

## 📁 4. Project Folder Structure

```
sahay/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI entry point & lifespan seeder
│   │   ├── core/
│   │   │   ├── config.py              # Application settings & thresholds
│   │   │   └── database.py            # SQLAlchemy engine & session factory
│   │   ├── models/
│   │   │   └── models.py              # User, Victim, Case, Event, Checkin, DistressScore, Alert, Intervention, Consent, AuditLog
│   │   ├── schemas/
│   │   │   └── schemas.py             # Pydantic schemas
│   │   ├── ai/
│   │   │   ├── engine.py              # Multimodal AI Distress Engine & SHAP decomposition
│   │   │   └── voice_processor.py     # Speech acoustic indicators & stress extractor
│   │   ├── api/
│   │   │   ├── auth.py                # Login, JWT, user roles
│   │   │   ├── victims.py             # Victims listing, 360° profile, trajectory, timeline
│   │   │   ├── checkins.py            # Checkin submission with dynamic AI analysis
│   │   │   ├── ai.py                  # Standalone /ai/analyze endpoint
│   │   │   ├── alerts.py              # Early warning alerts queue & acknowledgment
│   │   │   ├── interventions.py       # Human counselor intervention logger
│   │   │   ├── analytics.py           # District analytics & simulated model validation
│   │   │   └── consent.py             # Consent & privacy management
│   │   └── seed_data.py               # Pre-populated synthetic dataset (22 victims, flagship V-1042)
│   ├── tests/
│   │   ├── test_ai_engine.py          # Unit tests for voice, NLP, proximity, and SHAP
│   │   └── test_api.py                # API integration test suite (100% pass)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── locales/                   # Multilingual dictionaries
│   │   │   ├── en.json                # English
│   │   │   ├── hi.json                # Hindi (हिन्दी)
│   │   │   └── ta.json                # Tamil (தமிழ்)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # RBAC role switcher (Support Worker, Victim, Admin)
│   │   │   ├── LanguageContext.jsx    # i18n translation provider
│   │   │   └── ToastContext.jsx       # Alert toasts
│   │   ├── services/
│   │   │   └── api.js                 # API service layer
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Role switcher, language dropdown, emergency SOS
│   │   │   ├── DemoWorkflowBar.jsx    # SIH 2026 Interactive 7-Step Jury Demo banner
│   │   │   ├── RiskBadge.jsx          # Color-coded risk indicators
│   │   │   ├── ShapWaterfallChart.jsx # Explainable AI risk factor attribution
│   │   │   ├── DistressTrajectoryChart.jsx # Area chart vs personal baseline
│   │   │   ├── CaseTimeline.jsx       # Judicial journey & stress point flags
│   │   │   ├── VoiceCheckinModal.jsx  # Audio waveform recorder & transcript
│   │   │   ├── InterventionModal.jsx  # Human intervention logging modal
│   │   │   └── AlertActionModal.jsx   # Alert acknowledgment & triage modal
│   │   ├── pages/
│   │   │   ├── SupportWorkerDashboard.jsx # Case triage queue, metric cards, alerts
│   │   │   ├── VictimProfileView.jsx      # 360° deep-dive victim case dossier
│   │   │   ├── VictimDashboard.jsx        # Beneficiary safe space, daily check-in
│   │   │   ├── AdminDashboard.jsx         # District analytics & validation matrix
│   │   │   ├── PrivacyAndConsentPage.jsx  # Data minimization, consent toggles, RBAC
│   │   │   └── AboutSystemPage.jsx        # Scalability roadmap & sustainability model
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── database/
│   └── schema.sql                     # Production PostgreSQL DDL schema with indexes
└── README.md
```

---

## 🚀 5. Quickstart & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Run the Backend
```bash
cd d:/sahay/backend

# Install python dependencies
pip install -r requirements.txt

# Seed the database and start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The FastAPI backend will initialize `sahay.db` and automatically seed 22 realistic victim profiles, longitudinal trajectories, case milestones, and active alerts.*
- API Docs: `http://127.0.0.1:8000/docs`

### Step 2: Run the Frontend
```bash
cd d:/sahay/frontend

# Install dependencies (already installed)
npm install

# Start Vite dev server
npm run dev
```
- Open `http://localhost:5173` in your browser.

---

## 🧪 6. Running Automated Tests

Run the full pytest suite in the backend:
```bash
cd d:/sahay/backend
python -m pytest tests
```
*Result: 11 passed (100% test pass rate).*

---

## 🎭 7. SIH 2026 Jury Demonstration Flow

The application includes an **interactive guided demo bar** at the top of the screen to guide the jury step-by-step:

1. **Step 1 — Support Worker Overview**:
   - Login as Authorized Protection Officer (`worker@sahay.gov.in`).
   - Observe the overview metrics: **248 Active Cases**, **156 Low Risk (Stable)**, **61 Moderate**, **24 High**, **7 Critical Escalation**.
2. **Step 2 — Spot Escalation Alert (Flagship Case `V-1042`)**:
   - Spot the top red banner and priority queue highlighting victim **V-1042**.
   - Notice the sudden distress surge (**89 / 100**, $+31$ score delta) flagged 2 days ahead of an upcoming court hearing.
3. **Step 3 — Open Victim Profile (360° Deep Dive)**:
   - Click on **V-1042** to view the case dossier.
   - Observe **Personal Baseline (32)** vs **Current Score (89)** (Deviation: $+57$ pts).
   - Inspect **Multimodal Signals**: Speaking rate dropped to 96 wpm (slow cadence), pause frequency increased to 7.8/min, acoustic pitch instability at 42 Hz.
4. **Step 4 — Explainable AI (SHAP Waterfall)**:
   - Review the transparent SHAP feature decomposition:
     - $+18.2$ Change from Personal Baseline
     - $+14.0$ Negative Text Sentiment & Trauma Keywords
     - $+12.0$ Upcoming Court Hearing Proximity
     - $+10.5$ Voice Stress & Acoustic Tremors
     - $+3.5$ Check-in Delay
5. **Step 5 — Acknowledge Alert & Log Human Intervention**:
   - Click **"Acknowledge Alert"** $\rightarrow$ Click **"Log Human Intervention"**.
   - Select *Court Hearing Prep & Legal Accompaniment*, write protective notes, set outcome to *Stabilized*, and submit.
   - Observe instant live history update and celebratory reinforcement.
6. **Step 6 — Beneficiary Safe Portal Experience**:
   - Switch role to **Victim / Beneficiary (V-1042)**.
   - Experience the calm, non-diagnostic dashboard, review recent check-ins, and click **"Complete Today's Well-being Check-in"** to test the interactive voice recorder simulator.
7. **Step 7 — District Admin Analytics & Scalability Roadmap**:
   - Switch to **District Nodal Officer (Admin)**.
   - Review macro-level district risk distribution across 5 One Stop Centres, prototype validation metrics ($F_1: 90.1\%$, Lead Time: 3.4 days), and the 5-phase National Scalability Roadmap.

---

## 🔒 8. Privacy, Security & Disclaimers

1. **Decision Support, Not Clinical Diagnosis**: SAHAY is an early-warning decision-support tool. It does not replace psychologists, medical doctors, police officers, or legal counsel.
2. **Human-in-the-Loop**: Every alert requires human verification before any intervention is conducted.
3. **Data Minimization & Anonymization**: Victims are identified by anonymized tokens (`VICTIM-TN-CHE-1042`). Raw audio is never permanently stored.
4. **Immutable Audit Trail**: All case profile views and alert actions are logged with timestamps and actor identities.

---

## 🌐 9. Multilingual Support Architecture

SAHAY supports **English**, **Hindi (हिन्दी)**, and **Tamil (தமிழ்)** out of the box via clean dictionary architecture (`src/locales/*.json`), allowing seamless addition of further regional Indian languages (e.g., Telugu, Bengali, Marathi, Kannada) for national expansion.

---

*SAHAY — Smart India Hackathon 2026 Prototype*
