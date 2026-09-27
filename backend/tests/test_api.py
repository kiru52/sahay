import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"

def test_get_victims_list():
    response = client.get("/api/victims")
    assert response.status_code == 200
    victims = response.json()
    assert len(victims) >= 20
    # Verify flagship case exists
    ids = [v["id"] for v in victims]
    assert "V-1042" in ids

def test_get_victim_detail():
    response = client.get("/api/victims/V-1042")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "V-1042"
    assert data["current_distress_score"] >= 70.0
    assert len(data["cases"]) > 0
    assert len(data["recent_checkins"]) > 0

def test_get_victim_trajectory():
    response = client.get("/api/victims/V-1042/trajectory")
    assert response.status_code == 200
    data = response.json()
    assert data["victim_id"] == "V-1042"
    assert len(data["trajectory"]) >= 4

def test_alerts_endpoint():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0

def test_direct_ai_analyze():
    payload = {
        "victim_id": "V-1042",
        "text": "I feel severe anxiety about the upcoming court trial.",
        "case_events": [{"event_type": "HEARING", "days_until": 2, "stress_relevance": "HIGH"}],
        "historical_baseline": {"baseline_distress_score": 32.0}
    }
    response = client.post("/api/ai/analyze", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["distress_score"] > 60
    assert "contributing_factors" in res
    assert res["early_warning_triggered"] is True

def test_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_registered_victims"] >= 20
    assert data["critical_risk_count"] > 0
