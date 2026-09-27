from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.models import (
    User, Victim, Case, CaseEvent, BaselineProfile, Checkin,
    DistressScore, AIPrediction, Alert, Intervention, Consent, AuditLog
)
from app.api.auth import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    # Check if already seeded
    if db.query(Victim).count() >= 20:
        print("Database already seeded with demo data.")
        db.close()
        return

    print("Seeding SAHAY synthetic demo dataset...")
    
    # 1. Create Users
    users_data = [
        User(
            email="worker@sahay.gov.in",
            hashed_password=get_password_hash("worker123"),
            role="SUPPORT_WORKER",
            full_name="Radha Krishnan (Senior Counselor & Protection Officer)",
            center_id="OSC-CHE-01",
            district="Chennai Central"
        ),
        User(
            email="admin@sahay.gov.in",
            hashed_password=get_password_hash("admin123"),
            role="ADMIN",
            full_name="Dr. Sundaramoorthy IAS (District Nodal Officer)",
            center_id="DIST-CHE-ADMIN",
            district="Chennai Central"
        ),
        User(
            email="victim@sahay.gov.in",
            hashed_password=get_password_hash("sahay123"),
            role="VICTIM",
            full_name="Beneficiary Portal (V-1042)",
            center_id="OSC-CHE-01",
            district="Chennai Central"
        )
    ]
    for u in users_data:
        existing = db.query(User).filter(User.email == u.email).first()
        if not existing:
            db.add(u)
    db.commit()
    
    worker_user = db.query(User).filter(User.email == "worker@sahay.gov.in").first()
    
    # 2. Comprehensive Victim Profiles (22 Victims across districts)
    raw_victims = [
        # Flagship Demo Case V-1042
        {
            "id": "V-1042",
            "anonymized_id": "VICTIM-TN-CHE-1042",
            "age_group": "25-34",
            "gender": "Female",
            "district": "Chennai Central",
            "center_name": "One Stop Centre - Royapettah",
            "case_category": "Atrocity / Caste-based Violence & Severe Intimidation",
            "baseline": 32.0,
            "case_num": "FIR/2026/CHE/8842",
            "police_station": "Royapettah All-Women PS",
            "fir_num": "8842/2026",
            "stage": "HEARING",
            "upcoming_event": ("Principal Sessions Court Hearing & Witness Deposition", "HEARING", 2, "HIGH"),
            "history": [
                {"days_ago": 28, "score": 32.0, "text": "Registration completed. Feeling okay today with social worker support.", "mood": 4, "rate": 132, "pause": 2.5, "pitch": 21},
                {"days_ago": 21, "score": 34.0, "text": "Medical examination completed. Routine day at home.", "mood": 4, "rate": 130, "pause": 2.8, "pitch": 22},
                {"days_ago": 14, "score": 38.0, "text": "Met legal aid lawyer. Case statement submitted to magistrate.", "mood": 3, "rate": 124, "pause": 3.4, "pitch": 25},
                {"days_ago": 7, "score": 58.0, "text": "Heard that accused side is asking around about my family. A bit nervous.", "mood": 2, "rate": 110, "pause": 5.2, "pitch": 31},
                {"days_ago": 1, "score": 89.0, "text": "I am terrified of the upcoming court hearing in two days. I cannot sleep at night, I feel intense panic and dread about facing the accused in courtroom.", "mood": 1, "rate": 96, "pause": 7.8, "pitch": 42}
            ],
            "active_alert": True,
            "alert_type": "PRE_HEARING_SPIKE",
            "alert_score_change": 31.0
        },
        # Case V-1088 (High Risk - Investigation phase)
        {
            "id": "V-1088",
            "anonymized_id": "VICTIM-TN-MDU-1088",
            "age_group": "18-24",
            "gender": "Female",
            "district": "Madurai",
            "center_name": "District Atrocity Support Cell - Madurai",
            "case_category": "Workplace Harassment & Physical Assault",
            "baseline": 28.0,
            "case_num": "FIR/2026/MDU/3119",
            "police_station": "Madurai South PS",
            "fir_num": "3119/2026",
            "stage": "INVESTIGATION",
            "upcoming_event": ("DSP Investigation Statement", "INVESTIGATION", 5, "MEDIUM"),
            "history": [
                {"days_ago": 20, "score": 28.0, "text": "Initial counseling attended.", "mood": 4, "rate": 135, "pause": 2.4, "pitch": 20},
                {"days_ago": 12, "score": 35.0, "text": "Waiting for investigation report.", "mood": 3, "rate": 128, "pause": 3.0, "pitch": 24},
                {"days_ago": 2, "score": 76.0, "text": "I have been feeling very isolated and crying every day. Haven't left my room for days.", "mood": 1, "rate": 102, "pause": 6.8, "pitch": 36}
            ],
            "active_alert": True,
            "alert_type": "DISTRESS_ESCALATION",
            "alert_score_change": 41.0
        },
        # Case V-1055 (Critical Risk - Bail hearing)
        {
            "id": "V-1055",
            "anonymized_id": "VICTIM-TN-CBE-1055",
            "age_group": "35-44",
            "gender": "Female",
            "district": "Coimbatore",
            "center_name": "Sakhi OSC - Gandhipuram",
            "case_category": "Domestic Violence & Severe Threat",
            "baseline": 35.0,
            "case_num": "FIR/2026/CBE/1094",
            "police_station": "Gandhipuram All-Women PS",
            "fir_num": "1094/2026",
            "stage": "HEARING",
            "upcoming_event": ("Accused Anticipatory Bail Hearing", "BAIL_HEARING", 3, "HIGH"),
            "history": [
                {"days_ago": 18, "score": 36.0, "text": "Staying in shelter home. Safety measures arranged.", "mood": 3, "rate": 125, "pause": 3.2, "pitch": 23},
                {"days_ago": 1, "score": 84.0, "text": "The lawyer said bail might be approved. If he gets bail, my children and I are in grave danger.", "mood": 1, "rate": 92, "pause": 8.0, "pitch": 44}
            ],
            "active_alert": True,
            "alert_type": "PRE_HEARING_SPIKE",
            "alert_score_change": 48.0
        },
        # Case V-1024 (Moderate Risk - Statement stage)
        {
            "id": "V-1024",
            "anonymized_id": "VICTIM-TN-CHE-1024",
            "age_group": "25-34",
            "gender": "Female",
            "district": "Chennai Central",
            "center_name": "One Stop Centre - Royapettah",
            "case_category": "Severe Cyber Harassment & Blackmail",
            "baseline": 30.0,
            "case_num": "FIR/2026/CHE/4051",
            "police_station": "Cyber Crime Division Chennai",
            "fir_num": "4051/2026",
            "stage": "STATEMENT",
            "upcoming_event": ("Section 164 CrPC Magistrate Statement", "TESTIMONY", 8, "MEDIUM"),
            "history": [
                {"days_ago": 15, "score": 30.0, "text": "Cyber complaint filed, feeling slightly hopeful.", "mood": 4, "rate": 133, "pause": 2.7, "pitch": 22},
                {"days_ago": 2, "score": 54.0, "text": "Magistrate date is coming next week. Little bit worried about the process.", "mood": 3, "rate": 118, "pause": 4.5, "pitch": 28}
            ],
            "active_alert": False,
            "alert_type": None,
            "alert_score_change": 24.0
        },
        # Case V-1034 (Low Risk - Rehabilitation stage)
        {
            "id": "V-1034",
            "anonymized_id": "VICTIM-TN-TRY-1034",
            "age_group": "25-34",
            "gender": "Female",
            "district": "Tiruchirappalli",
            "center_name": "Integrated Support Unit - Trichy",
            "case_category": "Compensation & Rehabilitation Follow-up",
            "baseline": 25.0,
            "case_num": "FIR/2025/TRY/9102",
            "police_station": "Trichy Town PS",
            "fir_num": "9102/2025",
            "stage": "REHABILITATION",
            "upcoming_event": ("Victim Compensation Scheme Disbursement", "COMPENSATION_REVIEW", 14, "LOW"),
            "history": [
                {"days_ago": 30, "score": 38.0, "text": "Judgement concluded. Beginning vocational training.", "mood": 4, "rate": 128, "pause": 3.1, "pitch": 22},
                {"days_ago": 3, "score": 26.0, "text": "Attending computer classes. Feeling much more confident and supported.", "mood": 5, "rate": 140, "pause": 2.1, "pitch": 19}
            ],
            "active_alert": False,
            "alert_type": None,
            "alert_score_change": -12.0
        },
        # Case V-1067 (Moderate Risk - Madurai)
        {
            "id": "V-1067",
            "anonymized_id": "VICTIM-TN-MDU-1067",
            "age_group": "18-24",
            "gender": "Female",
            "district": "Madurai",
            "center_name": "District Atrocity Support Cell - Madurai",
            "case_category": "Physical Trauma & Economic Coercion",
            "baseline": 33.0,
            "case_num": "FIR/2026/MDU/4481",
            "police_station": "Madurai North PS",
            "fir_num": "4481/2026",
            "stage": "INVESTIGATION",
            "upcoming_event": ("Forensic Medical Board Review", "INVESTIGATION", 6, "MEDIUM"),
            "history": [
                {"days_ago": 16, "score": 34.0, "text": "Doctor visit done.", "mood": 3, "rate": 127, "pause": 3.0, "pitch": 23},
                {"days_ago": 2, "score": 48.0, "text": "Waiting for medical certificate clearance.", "mood": 3, "rate": 122, "pause": 3.8, "pitch": 26}
            ],
            "active_alert": False,
            "alert_type": None,
            "alert_score_change": 14.0
        },
        # Case V-1072 (High Risk - Salem)
        {
            "id": "V-1072",
            "anonymized_id": "VICTIM-TN-SLM-1072",
            "age_group": "25-34",
            "gender": "Female",
            "district": "Salem",
            "center_name": "District Crisis Intervention Centre - Salem",
            "case_category": "Atrocity / Forced Eviction & Intimidation",
            "baseline": 29.0,
            "case_num": "FIR/2026/SLM/2091",
            "police_station": "Salem Central PS",
            "fir_num": "2091/2026",
            "stage": "HEARING",
            "upcoming_event": ("District Revenue Officer Summons", "HEARING", 4, "HIGH"),
            "history": [
                {"days_ago": 22, "score": 29.0, "text": "Shelter allotted.", "mood": 4, "rate": 132, "pause": 2.6, "pitch": 21},
                {"days_ago": 1, "score": 73.0, "text": "Villagers came and threatened my brother. We cannot go outside.", "mood": 1, "rate": 105, "pause": 6.5, "pitch": 37}
            ],
            "active_alert": True,
            "alert_type": "DISTRESS_ESCALATION",
            "alert_score_change": 44.0
        },
        # Additional 15 realistic cases across low, moderate, and stable categories
        {
            "id": "V-1011",
            "anonymized_id": "VICTIM-TN-CHE-1011",
            "age_group": "35-44",
            "gender": "Female",
            "district": "Chennai Central",
            "center_name": "One Stop Centre - Royapettah",
            "case_category": "Domestic Violence",
            "baseline": 26.0,
            "case_num": "FIR/2026/CHE/1102",
            "police_station": "Mylapore All-Women PS",
            "fir_num": "1102/2026",
            "stage": "STATEMENT",
            "upcoming_event": ("Protection Order Hearing", "HEARING", 11, "LOW"),
            "history": [{"days_ago": 4, "score": 28.0, "text": "Counseling session helped me feel grounded.", "mood": 4, "rate": 134, "pause": 2.5, "pitch": 21}],
            "active_alert": False, "alert_type": None, "alert_score_change": 2.0
        },
        {
            "id": "V-1015",
            "anonymized_id": "VICTIM-TN-CHE-1015",
            "age_group": "45-54",
            "gender": "Female",
            "district": "Chennai Central",
            "center_name": "One Stop Centre - Royapettah",
            "case_category": "Physical Assault & Property Usurpation",
            "baseline": 31.0,
            "case_num": "FIR/2026/CHE/1155",
            "police_station": "T. Nagar PS",
            "fir_num": "1155/2026",
            "stage": "INVESTIGATION",
            "upcoming_event": ("Witness Identification Parade", "INVESTIGATION", 15, "LOW"),
            "history": [{"days_ago": 5, "score": 32.0, "text": "Living with sister. Routine stable.", "mood": 4, "rate": 131, "pause": 2.7, "pitch": 22}],
            "active_alert": False, "alert_type": None, "alert_score_change": 1.0
        },
        {
            "id": "V-1019",
            "anonymized_id": "VICTIM-TN-CBE-1019",
            "age_group": "18-24",
            "gender": "Female",
            "district": "Coimbatore",
            "center_name": "Sakhi OSC - Gandhipuram",
            "case_category": "Stalking & Threat",
            "baseline": 27.0,
            "case_num": "FIR/2026/CBE/1920",
            "police_station": "RS Puram PS",
            "fir_num": "1920/2026",
            "stage": "INVESTIGATION",
            "upcoming_event": ("Police Charge-sheet Review", "INVESTIGATION", 9, "LOW"),
            "history": [{"days_ago": 3, "score": 29.0, "text": "Police patrol is stationed near bus stop, feeling safer.", "mood": 4, "rate": 136, "pause": 2.3, "pitch": 20}],
            "active_alert": False, "alert_type": None, "alert_score_change": 2.0
        },
        {
            "id": "V-1022",
            "anonymized_id": "VICTIM-TN-MDU-1022",
            "age_group": "25-34",
            "gender": "Female",
            "district": "Madurai",
            "center_name": "District Atrocity Support Cell - Madurai",
            "case_category": "Atrocity / Public Humiliation",
            "baseline": 34.0,
            "case_num": "FIR/2026/MDU/2201",
            "police_station": "Thilagar Thidal PS",
            "fir_num": "2201/2026",
            "stage": "STATEMENT",
            "upcoming_event": ("Social Welfare Officer Inquiry", "TESTIMONY", 7, "MEDIUM"),
            "history": [{"days_ago": 2, "score": 45.0, "text": "Preparing answers for the welfare committee inquiry.", "mood": 3, "rate": 122, "pause": 3.9, "pitch": 27}],
            "active_alert": False, "alert_type": None, "alert_score_change": 11.0
        },
        {
            "id": "V-1028",
            "anonymized_id": "VICTIM-TN-TRY-1028",
            "age_group": "35-44",
            "gender": "Female",
            "district": "Tiruchirappalli",
            "center_name": "Integrated Support Unit - Trichy",
            "case_category": "Marital Cruelty & Abandonment",
            "baseline": 29.0,
            "case_num": "FIR/2026/TRY/2810",
            "police_station": "Fort All-Women PS",
            "fir_num": "2810/2026",
            "stage": "REHABILITATION",
            "upcoming_event": ("Skill Training Orientation", "COUNSELING", 12, "LOW"),
            "history": [{"days_ago": 6, "score": 25.0, "text": "Feeling positive about starting tailoring training next week.", "mood": 5, "rate": 138, "pause": 2.2, "pitch": 19}],
            "active_alert": False, "alert_type": None, "alert_score_change": -4.0
        },
        {
            "id": "V-1033",
            "anonymized_id": "VICTIM-TN-SLM-1033",
            "age_group": "25-34",
            "gender": "Female",
            "district": "Salem",
            "center_name": "District Crisis Intervention Centre - Salem",
            "case_category": "Atrocity / Denial of Water & Way Rights",
            "baseline": 30.0,
            "case_num": "FIR/2026/SLM/3310",
            "police_station": "Omalur PS",
            "fir_num": "3310/2026",
            "stage": "INVESTIGATION",
            "upcoming_event": ("Revenue Divisional Officer Peace Meeting", "INVESTIGATION", 10, "LOW"),
            "history": [{"days_ago": 3, "score": 35.0, "text": "Revenue officer visited the village today.", "mood": 3, "rate": 129, "pause": 2.9, "pitch": 23}],
            "active_alert": False, "alert_type": None, "alert_score_change": 5.0
        },
        {
            "id": "V-1039",
            "anonymized_id": "VICTIM-TN-CHE-1039",
            "age_group": "18-24",
            "gender": "Female",
            "district": "Chennai Central",
            "center_name": "One Stop Centre - Royapettah",
            "case_category": "Acid Attack Threat & Stalking",
            "baseline": 36.0,
            "case_num": "FIR/2026/CHE/3901",
            "police_station": "Triplicane PS",
            "fir_num": "3901/2026",
            "stage": "HEARING",
            "upcoming_event": ("Fast Track Court Trial Commencement", "HEARING", 3, "HIGH"),
            "history": [{"days_ago": 1, "score": 82.0, "text": "Trial starts in 3 days. I can't eat anything, my hands are trembling.", "mood": 1, "rate": 98, "pause": 7.5, "pitch": 41}],
            "active_alert": True, "alert_type": "PRE_HEARING_SPIKE", "alert_score_change": 46.0
        },
        {
            "id": "V-1045",
            "anonymized_id": "VICTIM-TN-MDU-1045",
            "age_group": "25-34",
            "gender": "Female",
            "district": "Madurai",
            "center_name": "District Atrocity Support Cell - Madurai",
            "case_category": "Physical Assault",
            "baseline": 27.0,
            "case_num": "FIR/2026/MDU/4510",
            "police_station": "Anna Nagar PS",
            "fir_num": "4510/2026",
            "stage": "STATEMENT",
            "upcoming_event": ("Legal Aid Briefing", "COUNSELING", 8, "LOW"),
            "history": [{"days_ago": 4, "score": 31.0, "text": "Met legal aid lawyer. He explained the procedures clearly.", "mood": 4, "rate": 130, "pause": 2.6, "pitch": 22}],
            "active_alert": False, "alert_type": None, "alert_score_change": 4.0
        },
        {
            "id": "V-1048",
            "anonymized_id": "VICTIM-TN-CBE-1048",
            "age_group": "35-44",
            "gender": "Female",
            "district": "Coimbatore",
            "center_name": "Sakhi OSC - Gandhipuram",
            "case_category": "Domestic Violence",
            "baseline": 28.0,
            "case_num": "FIR/2026/CBE/4811",
            "police_station": "Singanallur PS",
            "fir_num": "4811/2026",
            "stage": "REHABILITATION",
            "upcoming_event": ("Monthly Support Group Meet", "COUNSELING", 16, "LOW"),
            "history": [{"days_ago": 5, "score": 24.0, "text": "Feeling peaceful and independent in new apartment.", "mood": 5, "rate": 142, "pause": 1.9, "pitch": 18}],
            "active_alert": False, "alert_type": None, "alert_score_change": -4.0
        },
        {
            "id": "V-1051",
            "anonymized_id": "VICTIM-TN-TRY-1051",
            "age_group": "18-24",
            "gender": "Female",
            "district": "Tiruchirappalli",
            "center_name": "Integrated Support Unit - Trichy",
            "case_category": "Attempted Honor Crime & Restraint",
            "baseline": 35.0,
            "case_num": "FIR/2026/TRY/5109",
            "police_station": "KK Nagar PS",
            "fir_num": "5109/2026",
            "stage": "INVESTIGATION",
            "upcoming_event": ("Witness Protection Assessment", "INVESTIGATION", 5, "MEDIUM"),
            "history": [{"days_ago": 2, "score": 52.0, "text": "Staying in safe house. Police protection is active.", "mood": 3, "rate": 120, "pause": 4.6, "pitch": 29}],
            "active_alert": False, "alert_type": None, "alert_score_change": 17.0
        },
        {
            "id": "V-1059",
            "anonymized_id": "VICTIM-TN-SLM-1059",
            "age_group": "45-54",
            "gender": "Female",
            "district": "Salem",
            "center_name": "District Crisis Intervention Centre - Salem",
            "case_category": "Atrocity / False Accusation & Threat",
            "baseline": 30.0,
            "case_num": "FIR/2026/SLM/5901",
            "police_station": "Attur PS",
            "fir_num": "5901/2026",
            "stage": "STATEMENT",
            "upcoming_event": ("Panchayat Special Committee Hearing", "HEARING", 6, "MEDIUM"),
            "history": [{"days_ago": 2, "score": 49.0, "text": "Worried about community perception.", "mood": 3, "rate": 123, "pause": 4.1, "pitch": 27}],
            "active_alert": False, "alert_type": None, "alert_score_change": 19.0
        },
        {
            "id": "V-1062",
            "anonymized_id": "VICTIM-TN-CHE-1062",
            "age_group": "25-34",
            "gender": "Female",
            "district": "Chennai Central",
            "center_name": "One Stop Centre - Royapettah",
            "case_category": "Sexual Harassment at Workplace",
            "baseline": 27.0,
            "case_num": "FIR/2026/CHE/6209",
            "police_station": "Nungambakkam PS",
            "fir_num": "6209/2026",
            "stage": "INVESTIGATION",
            "upcoming_event": ("Internal Complaints Committee Deposition", "TESTIMONY", 7, "MEDIUM"),
            "history": [{"days_ago": 3, "score": 42.0, "text": "Preparing documents for the ICC committee meeting.", "mood": 3, "rate": 126, "pause": 3.5, "pitch": 25}],
            "active_alert": False, "alert_type": None, "alert_score_change": 15.0
        },
        {
            "id": "V-1066",
            "anonymized_id": "VICTIM-TN-MDU-1066",
            "age_group": "35-44",
            "gender": "Female",
            "district": "Madurai",
            "center_name": "District Atrocity Support Cell - Madurai",
            "case_category": "Severe Caste Slur & Public Humiliation",
            "baseline": 32.0,
            "case_num": "FIR/2026/MDU/6604",
            "police_station": "Karimedu PS",
            "fir_num": "6604/2026",
            "stage": "HEARING",
            "upcoming_event": ("Special Atrocity Court Hearing", "HEARING", 4, "HIGH"),
            "history": [{"days_ago": 1, "score": 78.0, "text": "Witnesses are being pressured not to turn up. I feel alone in this fight.", "mood": 1, "rate": 104, "pause": 6.7, "pitch": 38}],
            "active_alert": True, "alert_type": "PRE_HEARING_SPIKE", "alert_score_change": 46.0
        },
        {
            "id": "V-1070",
            "anonymized_id": "VICTIM-TN-CBE-1070",
            "age_group": "18-24",
            "gender": "Female",
            "district": "Coimbatore",
            "center_name": "Sakhi OSC - Gandhipuram",
            "case_category": "Physical Assault",
            "baseline": 26.0,
            "case_num": "FIR/2026/CBE/7012",
            "police_station": "Peelamedu PS",
            "fir_num": "7012/2026",
            "stage": "REHABILITATION",
            "upcoming_event": ("Psychological Wellness Review", "COUNSELING", 15, "LOW"),
            "history": [{"days_ago": 5, "score": 22.0, "text": "Enjoying the art therapy workshops.", "mood": 5, "rate": 144, "pause": 1.8, "pitch": 18}],
            "active_alert": False, "alert_type": None, "alert_score_change": -4.0
        },
        {
            "id": "V-1075",
            "anonymized_id": "VICTIM-TN-TRY-1075",
            "age_group": "25-34",
            "gender": "Female",
            "district": "Tiruchirappalli",
            "center_name": "Integrated Support Unit - Trichy",
            "case_category": "Domestic Violence",
            "baseline": 28.0,
            "case_num": "FIR/2026/TRY/7501",
            "police_station": "Srirangam PS",
            "fir_num": "7501/2026",
            "stage": "STATEMENT",
            "upcoming_event": ("Mediation & Counseling Session", "COUNSELING", 9, "LOW"),
            "history": [{"days_ago": 4, "score": 33.0, "text": "Speaking with the mediation counselor tomorrow.", "mood": 4, "rate": 131, "pause": 2.8, "pitch": 22}],
            "active_alert": False, "alert_type": None, "alert_score_change": 5.0
        }
    ]

    for item in raw_victims:
        v_id = item["id"]
        v_obj = Victim(
            id=v_id,
            anonymized_id=item["anonymized_id"],
            age_group=item["age_group"],
            gender=item["gender"],
            registration_date=datetime.utcnow() - timedelta(days=35),
            district=item["district"],
            center_name=item["center_name"],
            case_category=item["case_category"],
            is_active=True,
            assigned_worker_id=worker_user.id if worker_user else None
        )
        db.add(v_obj)
        db.commit()
        
        # Baseline Profile
        bp = BaselineProfile(
            victim_id=v_id,
            baseline_distress_score=item["baseline"],
            baseline_sentiment_mean=0.2,
            baseline_speaking_rate=132.0,
            baseline_pitch_var=21.0,
            baseline_checkin_interval_days=3.0,
            established_at=datetime.utcnow() - timedelta(days=30),
            notes="Baseline established through intake interviews and initial psychometric calibration."
        )
        db.add(bp)
        
        # Consent
        cons = Consent(
            victim_id=v_id,
            data_sharing_allowed=True,
            voice_analysis_allowed=True,
            case_timeline_sync_allowed=True,
            sms_checkin_allowed=True,
            updated_at=datetime.utcnow() - timedelta(days=30)
        )
        db.add(cons)
        
        # Case
        c_obj = Case(
            victim_id=v_id,
            case_number=item["case_num"],
            police_station=item["police_station"],
            fir_number=item["fir_num"],
            current_stage=item["stage"],
            filing_date=datetime.utcnow() - timedelta(days=32),
            summary=f"Case regarding {item['case_category']} registered at {item['police_station']}."
        )
        db.add(c_obj)
        db.commit()
        
        # Upcoming Case Event
        if item.get("upcoming_event"):
            ev_title, ev_type, days_ahead, stress_rel = item["upcoming_event"]
            ev_obj = CaseEvent(
                case_id=c_obj.id,
                victim_id=v_id,
                event_title=ev_title,
                event_type=ev_type,
                event_date=datetime.utcnow() + timedelta(days=days_ahead),
                description=f"Crucial judicial milestone scheduled before judicial authority. Stress relevance: {stress_rel}.",
                stress_relevance=stress_rel,
                is_completed=False
            )
            db.add(ev_obj)
            
        # Past milestone
        past_ev = CaseEvent(
            case_id=c_obj.id,
            victim_id=v_id,
            event_title="Formal FIR Registration & Initial Statement",
            event_type="STATEMENT",
            event_date=datetime.utcnow() - timedelta(days=30),
            description="First Information Report recorded under applicable sections.",
            stress_relevance="HIGH",
            is_completed=True
        )
        db.add(past_ev)
        
        # Historical Check-ins & Distress Scores
        prev_score = item["baseline"]
        for h in item["history"]:
            chk_dt = datetime.utcnow() - timedelta(days=h["days_ago"])
            
            # Checkin
            chk = Checkin(
                victim_id=v_id,
                timestamp=chk_dt,
                text_response=h["text"],
                speech_to_text=h["text"],
                audio_url=f"/audio/sample_{v_id}_{h['days_ago']}.wav",
                speaking_rate=float(h["rate"]),
                pause_frequency=float(h["pause"]),
                pitch_variation=float(h["pitch"]),
                sentiment_score=-0.6 if h["score"] > 60 else (-0.2 if h["score"] > 35 else 0.4),
                dominant_emotion="FEAR" if h["score"] >= 80 else ("ANXIETY" if h["score"] >= 60 else "NEUTRAL"),
                self_reported_mood=h["mood"],
                engagement_delay_days=0.0
            )
            db.add(chk)
            db.commit()
            
            # Score
            score_val = float(h["score"])
            if score_val >= 81:
                r_level = "CRITICAL"
            elif score_val >= 61:
                r_level = "HIGH"
            elif score_val >= 31:
                r_level = "MODERATE"
            else:
                r_level = "LOW"
                
            base_dev = round(score_val - item["baseline"], 1)
            traj_delta = round(score_val - prev_score, 1)
            prev_score = score_val
            
            dscore = DistressScore(
                victim_id=v_id,
                checkin_id=chk.id,
                timestamp=chk_dt,
                distress_score=score_val,
                risk_level=r_level,
                baseline_deviation=base_dev,
                trajectory_delta=traj_delta,
                confidence=0.91
            )
            db.add(dscore)
            db.commit()
            
            # AI Prediction SHAP
            shap_dict = {
                "baseline_deviation": round(max(0.0, base_dev * 0.38), 1),
                "text_sentiment": round(14.2 if score_val > 70 else (6.1 if score_val > 40 else 1.2), 1),
                "voice_stress": round(10.5 if h["pause"] > 5 else 3.2, 1),
                "upcoming_case_event": round(12.0 if (item.get("upcoming_event") and item["upcoming_event"][2] <= 3 and score_val > 70) else 2.0, 1),
                "engagement_delay": round(3.5 if score_val > 70 else 0.5, 1)
            }
            
            insight = (
                f"Significant escalation (+{base_dev} pts from personal baseline) coincides with upcoming "
                f"{item['upcoming_event'][0] if item.get('upcoming_event') else 'case event'}. "
                f"Vocal tremor indicators and distress keywords present."
                if score_val >= 70 else
                f"Well-being indicators are consistent with victim's personal reference profile."
            )
            
            rec_act = (
                "Urgent: Assign support counselor for supportive accompaniment and pre-hearing stabilization check."
                if score_val >= 70 else
                "Routine check-in: Schedule follow-up prompt in 3 days."
            )
            
            aip = AIPrediction(
                distress_score_id=dscore.id,
                victim_id=v_id,
                shap_values=shap_dict,
                ai_insight_summary=insight,
                recommended_action=rec_act,
                model_version="sahay-multimodal-v1.0",
                created_at=chk_dt
            )
            db.add(aip)
            
        # Active Alert
        if item["active_alert"]:
            alert_obj = Alert(
                victim_id=v_id,
                timestamp=datetime.utcnow() - timedelta(hours=4),
                alert_type=item["alert_type"] or "DISTRESS_ESCALATION",
                previous_score=item["history"][-2]["score"] if len(item["history"]) >= 2 else item["baseline"],
                current_score=item["history"][-1]["score"],
                score_change=item["alert_score_change"],
                risk_level="CRITICAL" if item["history"][-1]["score"] >= 81 else "HIGH",
                status="TRIGGERED",
                assigned_to="Authorized Support Worker"
            )
            db.add(alert_obj)
            
        # Sample Past Intervention
        if v_id in ["V-1042", "V-1024", "V-1034"]:
            iv_obj = Intervention(
                victim_id=v_id,
                officer_name="Radha Krishnan (Senior Counselor)",
                timestamp=datetime.utcnow() - timedelta(days=14),
                intervention_type="COUNSELING_SESSION",
                notes="Conducted 45-minute psychological first aid session. Provided reassurance on legal protection orders.",
                outcome_rating="STABILIZED",
                follow_up_date=datetime.utcnow() + timedelta(days=7)
            )
            db.add(iv_obj)
            
    db.commit()
    db.close()
    print("Database seeding completed successfully! Preloaded 22 victim profiles with longitudinal trajectories.")

if __name__ == "__main__":
    seed_database()
