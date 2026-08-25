from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_habitations"] > 0

def test_habitations_list():
    response = client.get("/api/habitations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_hazards_geojson():
    response = client.get("/api/hazards/geojson")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 0

def test_ml_predict():
    payload = {
        "landslide_risk": 90.0,
        "flood_risk": 80.0,
        "earthquake_risk": 70.0,
        "environmental_risk": 85.0,
        "population": 3000,
        "vulnerable_population": 1200,
        "accessibility_score": 40.0,
        "infrastructure_score": 45.0,
        "distance_to_safe_area_km": 8.0
    }
    response = client.post("/api/ml/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["relocation_priority"] in ["IMMEDIATE", "SHORT_TERM", "MEDIUM_TERM", "MONITOR"]
    assert "contributing_factors" in data

def test_relocation_recommendations():
    response = client.get("/api/relocation/recommendations/1")
    assert response.status_code == 200
    data = response.json()
    assert "recommended_sites" in data
    assert len(data["recommended_sites"]) > 0
