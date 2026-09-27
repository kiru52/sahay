import pytest
from app.ai.engine import ai_engine
from app.ai.voice_processor import voice_extractor

def test_voice_feature_extraction():
    # Test calm baseline text
    calm_meta = voice_extractor.extract_or_simulate_features("Feeling okay today, routine was fine.")
    assert calm_meta["speaking_rate"] >= 120
    assert calm_meta["pause_frequency"] <= 4.0
    
    # Test high distress text
    stressed_meta = voice_extractor.extract_or_simulate_features("I am terrified of the court hearing and cannot sleep.")
    assert stressed_meta["speaking_rate"] <= 120
    assert stressed_meta["pause_frequency"] > 4.0
    assert stressed_meta["voice_stress_score"] > 20.0

def test_multilingual_text_sentiment():
    # English test
    res_en = ai_engine.analyze_text_sentiment("I am in extreme fear and panic about tomorrow's testimony")
    assert res_en["dominant_emotion"] in ["FEAR", "ANXIETY"]
    assert res_en["distress_impact"] > 10.0
    
    # Tamil test
    res_ta = ai_engine.analyze_text_sentiment("எனக்கு பயமாக இருக்கிறது, தூங்க முடியவில்லை")
    assert res_ta["distress_impact"] > 5.0
    
    # Hindi test
    res_hi = ai_engine.analyze_text_sentiment("मुझे बहुत डर लग रहा है और घबराहट हो रही है")
    assert res_hi["distress_impact"] > 5.0

def test_case_event_proximity():
    events = [
        {"event_type": "HEARING", "days_until": 2, "stress_relevance": "HIGH"},
        {"event_type": "COUNSELING", "days_until": 15, "stress_relevance": "LOW"}
    ]
    prox = ai_engine.evaluate_case_proximity_stress(events)
    assert prox["proximity_stress_impact"] > 15.0
    assert "Hearing in 2 days" in prox["imminent_event_note"]

def test_full_multimodal_analysis():
    result = ai_engine.analyze(
        victim_id="V-1042",
        text="I am terrified of the upcoming court hearing in two days. Cannot sleep.",
        case_events=[{"event_type": "HEARING", "days_until": 2, "stress_relevance": "HIGH"}],
        historical_baseline={"baseline_distress_score": 32.0}
    )
    
    assert result["distress_score"] >= 61.0 # High or Critical risk
    assert result["risk_level"] in ["HIGH", "CRITICAL"]
    assert result["baseline_deviation"] > 25.0
    assert "contributing_factors" in result
    assert "baseline_deviation" in result["contributing_factors"]
    assert "upcoming_case_event" in result["contributing_factors"]
    assert result["early_warning_triggered"] is True
