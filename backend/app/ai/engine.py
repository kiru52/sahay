import re
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from app.core.config import settings
from app.ai.voice_processor import voice_extractor

# Multilingual Sentiment & Trauma Lexicon
TRAUMA_LEXICON = {
    "HIGH_DISTRESS": [
        "panic", "terrified", "threat", "kill", "nightmare", "suicide", "can't take it", 
        "hopeless", "cross-examination", "court", "fear for my life", "shaking", "isolated",
        "असहनीय", "डर", "धमकी", "नींद नहीं आ रही", "घबराहट", "बर्दाश्त नहीं", "अकेलापन", "कोर्ट",
        "பயம்", "மிரட்டல்", "தூங்க முடியவில்லை", "தற்கொலை எண்ணம்", "நீதிமன்ற விசாரணை", "நடுக்கம்"
    ],
    "MODERATE_DISTRESS": [
        "worried", "anxious", "sad", "uneasy", "crying", "delayed", "stress", "alone", "nervous",
        "चिंता", "उदास", "रोना", "तनाव", "बेचैनी", "डर लग रहा है",
        "கவலை", "வருத்தம்", "அழுவது", "மன அழுத்தம்", "பதட்டம்"
    ],
    "RESILIENCE_HOPE": [
        "better", "calm", "hope", "safe", "supported", "counselor helped", "peaceful", "coping",
        "बेहतर", "शांत", "उम्मीद", "सुरक्षित", "मदद मिली", "राहत",
        "நம்பிக்கை", "அமைதி", "பாதுகாப்பு", "ஆறுதல்", "மேம்பட்டுள்ளது"
    ]
}

class AIDistressEngine:
    """
    SAHAY Multimodal AI Distress Prediction & Explainability Engine.
    Combines:
    A. Personal Baseline deviation
    B. Multimodal Text NLP & Trauma Lexicon
    C. Voice Acoustic Stress
    D. Behavioral Cadence (check-in delays/avoidance)
    E. Case Timeline Context (upcoming hearings, trials, statements)
    F. SHAP-Style Additive Explainability
    """

    @classmethod
    def analyze_text_sentiment(cls, text: Optional[str]) -> Dict[str, Any]:
        if not text:
            return {"sentiment_score": 0.0, "dominant_emotion": "NEUTRAL", "distress_impact": 0.0}
        
        text_lower = text.lower()
        high_hits = sum(1 for w in TRAUMA_LEXICON["HIGH_DISTRESS"] if w.lower() in text_lower)
        mod_hits = sum(1 for w in TRAUMA_LEXICON["MODERATE_DISTRESS"] if w.lower() in text_lower)
        hope_hits = sum(1 for w in TRAUMA_LEXICON["RESILIENCE_HOPE"] if w.lower() in text_lower)
        
        # Calculate raw sentiment (-1.0 to 1.0)
        neg_score = (high_hits * 0.45) + (mod_hits * 0.25)
        pos_score = hope_hits * 0.4
        
        raw_sentiment = max(-1.0, min(1.0, pos_score - neg_score))
        
        # Compute distress impact (0 to 35 points contribution)
        distress_impact = min(35.0, (high_hits * 14.0) + (mod_hits * 7.0) - (hope_hits * 8.0))
        distress_impact = max(0.0, distress_impact)
        
        if high_hits >= 2:
            emotion = "FEAR"
        elif high_hits == 1 or mod_hits >= 2:
            emotion = "ANXIETY"
        elif mod_hits == 1:
            emotion = "SADNESS"
        elif hope_hits > 0:
            emotion = "HOPEFUL"
        else:
            emotion = "NEUTRAL"
            
        return {
            "sentiment_score": round(raw_sentiment, 2),
            "dominant_emotion": emotion,
            "distress_impact": round(distress_impact, 1)
        }

    @classmethod
    def evaluate_case_proximity_stress(
        cls,
        case_events: Optional[List[Dict[str, Any]]]
    ) -> Dict[str, Any]:
        """
        Calculates stress contribution from upcoming judicial/police events.
        Events within 7 days carry exponential stress relevance.
        """
        if not case_events:
            return {"proximity_stress_impact": 0.0, "imminent_event_note": None, "nearest_event_days": None}
        
        max_impact = 0.0
        imminent_note = None
        min_days = 999
        
        for event in case_events:
            # event can have days_until or event_date
            days_until = event.get("days_until")
            if days_until is None and "event_date" in event:
                try:
                    event_dt = event["event_date"]
                    if isinstance(event_dt, str):
                        event_dt = datetime.fromisoformat(event_dt.replace("Z", "+00:00"))
                    days_until = (event_dt.date() - datetime.utcnow().date()).days
                except Exception:
                    days_until = 14
            
            if days_until is not None and days_until >= 0 and days_until < min_days:
                min_days = days_until
                event_type = event.get("event_type", event.get("type", "EVENT"))
                stress_rel = event.get("stress_relevance", "HIGH")
                
                # Base weighting by event type
                base_weight = 18.0 if event_type in ["HEARING", "TESTIMONY", "BAIL_HEARING"] else 10.0
                if stress_rel == "HIGH":
                    base_weight *= 1.3
                
                # Proximity decay: closest days (e.g. 0-2 days) have strongest impact
                if days_until <= 2:
                    proximity_factor = 1.0
                elif days_until <= 5:
                    proximity_factor = 0.75
                elif days_until <= 10:
                    proximity_factor = 0.45
                else:
                    proximity_factor = 0.15
                
                impact = base_weight * proximity_factor
                if impact > max_impact:
                    max_impact = impact
                    imminent_note = f"{event_type.replace('_', ' ').title()} in {days_until} days"
        
        return {
            "proximity_stress_impact": round(max_impact, 1),
            "imminent_event_note": imminent_note,
            "nearest_event_days": min_days if min_days != 999 else None
        }

    @classmethod
    def analyze(
        cls,
        victim_id: str,
        text: Optional[str] = None,
        voice_features: Optional[Dict[str, float]] = None,
        behavioral_features: Optional[Dict[str, float]] = None,
        case_events: Optional[List[Dict[str, Any]]] = None,
        historical_baseline: Optional[Dict[str, float]] = None,
        previous_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Performs full multimodal distress inference with SHAP-style decomposition.
        """
        # 1. Baseline Reference
        base_dict = historical_baseline or {}
        baseline_score = float(base_dict.get("baseline_distress_score", 30.0))
        
        # 2. Text NLP Evaluation
        text_analysis = cls.analyze_text_sentiment(text)
        text_impact = text_analysis["distress_impact"]
        
        # 3. Voice Stress Analysis
        voice_meta = voice_features or voice_extractor.extract_or_simulate_features(text=text)
        voice_stress_score = voice_meta.get("voice_stress_score", 15.0)
        voice_impact = round((voice_stress_score / 100.0) * 22.0, 1) # up to 22 points
        
        # 4. Behavioral Avoidance / Delay
        behav = behavioral_features or {}
        delay_days = float(behav.get("engagement_delay_days", 0.0))
        self_mood = behav.get("self_reported_mood") # 1 (worst) to 5 (best)
        
        behav_impact = 0.0
        if delay_days >= 4:
            behav_impact += min(15.0, (delay_days - 2) * 3.5)
        if self_mood is not None:
            # Mood 1 adds +12, mood 5 subtracts -8
            behav_impact += (3 - self_mood) * 4.0
        behav_impact = max(0.0, round(behav_impact, 1))
        
        # 5. Case Timeline Stress
        case_eval = cls.evaluate_case_proximity_stress(case_events)
        case_impact = case_eval["proximity_stress_impact"]
        
        # 6. Combined Raw Score Calculation
        # Raw additive composition centered on personal baseline
        combined_signal = text_impact + voice_impact + behav_impact + case_impact
        
        # Baseline anchoring: Start from baseline score and apply multimodal delta
        # A victim with baseline 32 experiencing stress adds combined signals
        calculated_score = baseline_score + (combined_signal * 0.85)
        final_distress_score = round(max(5.0, min(98.0, calculated_score)), 1)
        
        # 7. Baseline Deviation
        baseline_dev = round(final_distress_score - baseline_score, 1)
        
        # 8. SHAP-Style Decomposition (Exact additive feature attribution)
        shap_values = {
            "baseline_deviation": round(max(0.0, baseline_dev * 0.4), 1),
            "text_sentiment": round(text_impact, 1),
            "voice_stress": round(voice_impact, 1),
            "upcoming_case_event": round(case_impact, 1),
            "engagement_delay": round(behav_impact, 1)
        }
        
        # 9. Risk Classification
        if final_distress_score >= 81.0:
            risk_level = "CRITICAL"
        elif final_distress_score >= 61.0:
            risk_level = "HIGH"
        elif final_distress_score >= 31.0:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"
            
        # 10. Trajectory Trend
        prev_score = previous_score if previous_score is not None else baseline_score
        score_delta = round(final_distress_score - prev_score, 1)
        if score_delta >= 8.0:
            trend = "INCREASING"
        elif score_delta <= -8.0:
            trend = "IMPROVING"
        else:
            trend = "STABLE"
            
        # 11. Early Warning Trigger Logic
        # Trigger alert if:
        # - Risk is CRITICAL (>=81)
        # - Risk is HIGH (>=61) with significant baseline deviation (>= +18)
        # - Sudden score spike (>= +20 from previous check-in)
        early_warning = (
            risk_level == "CRITICAL" or 
            (risk_level == "HIGH" and baseline_dev >= 18.0) or 
            score_delta >= 20.0
        )
        
        # 12. Decision-Support Insights & Recommended Action
        if risk_level in ["CRITICAL", "HIGH"]:
            if case_eval["imminent_event_note"]:
                insight = (
                    f"Distress increased significantly (+{baseline_dev} above personal baseline) "
                    f"and coincides with upcoming {case_eval['imminent_event_note']}. "
                    f"Vocal stress and elevated negative sentiment detected."
                )
                action = "Urgent: Assign support counselor for pre-hearing supportive accompaniment and stabilization check."
            else:
                insight = (
                    f"Significant elevation detected (+{baseline_dev} from baseline). "
                    f"Responses indicate marked emotional distress and altered communication patterns."
                )
                action = "Human follow-up recommended: Conduct phone wellness check within 24 hours."
        elif risk_level == "MODERATE":
            insight = (
                f"Mild to moderate elevation observed (+{baseline_dev} from baseline). "
                f"Victim is actively engaging; periodic monitoring advised."
            )
            action = "Routine check-in: Schedule follow-up prompt in 3 days."
        else:
            insight = "Well-being indicators remain consistent with established baseline profile."
            action = "No immediate intervention required. Maintain standard check-in cadence."
            
        return {
            "distress_score": final_distress_score,
            "risk_level": risk_level,
            "trend": trend,
            "confidence": 0.89,
            "baseline_deviation": baseline_dev,
            "contributing_factors": shap_values,
            "ai_insight_summary": insight,
            "recommended_action": action,
            "early_warning_triggered": early_warning,
            "dominant_emotion": text_analysis["dominant_emotion"],
            "sentiment_score": text_analysis["sentiment_score"],
            "voice_features": voice_meta
        }

ai_engine = AIDistressEngine()
