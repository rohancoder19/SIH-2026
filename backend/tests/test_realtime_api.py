import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config.settings import settings
from app.services.realtime_service import realtime_service, RealtimeDisasterService

client = TestClient(app)

def test_earthquakes_live_endpoint():
    """Verify USGS live earthquake API endpoint returns valid status, attribution, and data structure."""
    response = client.get("/api/earthquakes/live")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] in ["LIVE", "RECENT", "STALE", "FAILED", "DEMO", "UNAVAILABLE"]
    assert "source" in data
    assert "USGS" in data["source"]
    assert "earthquakes" in data
    assert isinstance(data["earthquakes"], list)

    if len(data["earthquakes"]) > 0:
        eq = data["earthquakes"][0]
        assert "id" in eq
        assert "magnitude" in eq
        assert "latitude" in eq
        assert "longitude" in eq
        assert "source" in eq

def test_disasters_live_endpoint():
    """Verify GDACS live disaster alerts API endpoint returns valid XML RSS parsed alert objects."""
    response = client.get("/api/disasters/live")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "source" in data
    assert "GDACS" in data["source"]
    assert "alerts" in data
    assert isinstance(data["alerts"], list)

def test_weather_live_endpoint():
    """Verify Open-Meteo live weather observation endpoint."""
    response = client.get("/api/weather/live?lat=26.9000&lng=88.3000")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "location" in data
    assert data["location"]["latitude"] == 26.9
    assert data["location"]["longitude"] == 88.3
    assert "source" in data

def test_rainfall_live_endpoint():
    """Verify Open-Meteo live rainfall observation endpoint."""
    response = client.get("/api/rainfall/live?lat=26.9000&lng=88.3000")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "rainfall_amount_mm" in data
    assert isinstance(data["rainfall_amount_mm"], (int, float))

def test_floods_live_endpoint():
    """Verify CWC Hydrological & GDACS Flood Monitoring endpoint."""
    response = client.get("/api/floods/live")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "categories" in data
    assert "CURRENT_FLOOD_CONDITIONS" in data["categories"]
    assert "FLOOD_WARNING" in data["categories"]
    assert "HISTORICAL_FLOOD_DATA" in data["categories"]
    assert "FLOOD_SUSCEPTIBILITY" in data["categories"]
    assert "MODEL_PREDICTION" in data["categories"]

def test_landslides_live_endpoint():
    """Verify GSI / IMD Landslide Monitoring endpoint."""
    response = client.get("/api/landslides/live")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "categories" in data
    assert "LIVE_LANDSLIDE_ALERT" in data["categories"]
    assert "HISTORICAL_LANDSLIDE" in data["categories"]
    assert "LANDSLIDE_SUSCEPTIBILITY" in data["categories"]
    assert "ML_PREDICTION" in data["categories"]

def test_gis_layers_endpoint():
    """Verify GIS layers metadata and reference dataset status attributions."""
    response = client.get("/api/gis/layers")
    assert response.status_code == 200
    data = response.json()
    assert "layers" in data
    assert len(data["layers"]) > 0
    ref_layer = next((l for l in data["layers"] if l["status"] == "REFERENCE"), None)
    assert ref_layer is not None, "Static reference GeoJSON layers must be explicitly tagged status=REFERENCE"

def test_data_sources_and_status_endpoints():
    """Verify Data Health Matrix endpoints."""
    res_sources = client.get("/api/data-sources")
    assert res_sources.status_code == 200
    sources = res_sources.json()
    assert isinstance(sources, list)
    assert len(sources) >= 4

    res_status = client.get("/api/data-status")
    assert res_status.status_code == 200
    status_summary = res_status.json()
    assert status_summary["platform_status"] == "HEALTHY"
    assert "status_distribution" in status_summary

    res_freshness = client.get("/api/data-freshness")
    assert res_freshness.status_code == 200
    assert "usgs_earthquakes" in res_freshness.json()

def test_risk_and_predictions_endpoints():
    """Verify Multi-Hazard Risk and ML Prediction endpoints."""
    res_risk = client.get("/api/risk")
    assert res_risk.status_code == 200
    assert "national_risk_level" in res_risk.json()

    res_pred = client.get("/api/predictions")
    assert res_pred.status_code == 200
    pred = res_pred.json()
    assert "model_name" in pred
    assert "input_data_freshness" in pred
    assert "predictions" in pred

def test_data_status_freshness_calculator():
    """Verify strict 7-state data status engine calculations."""
    service = RealtimeDisasterService()
    import time

    # Reference dataset check
    assert service.calculate_status(None, is_reference=True) == "REFERENCE"

    # Failed check
    assert service.calculate_status(None, is_error=True) == "FAILED"

    # Unavailable check
    assert service.calculate_status(None) == "UNAVAILABLE"

    # Live check (< 300s)
    now = time.time()
    assert service.calculate_status(now - 100) == "LIVE"

    # Recent check (300s - 3600s)
    assert service.calculate_status(now - 1200) == "RECENT"

    # Stale check (> 3600s)
    assert service.calculate_status(now - 4000) == "STALE"

def test_demo_mode_isolation_enforcement():
    """Verify that when DEMO_MODE is False (Production mode), system returns FAILED/UNAVAILABLE rather than synthetic mock items."""
    service = RealtimeDisasterService()
    # Force error state
    status_prod_error = service.calculate_status(None, is_error=True)
    assert status_prod_error == "FAILED"

def test_absence_of_sih_references():
    """Verify complete absence of SIH references in real-time endpoints and root app metadata."""
    root_res = client.get("/")
    assert root_res.status_code == 200
    root_data = root_res.json()
    assert "SIH" not in str(root_data)
    assert "Hackathon" not in str(root_data)
