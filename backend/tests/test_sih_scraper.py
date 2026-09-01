import os
import pytest
from bs4 import BeautifulSoup
from fastapi.testclient import TestClient

from app.main import app
from app.api.problems_router import router as problems_router
from app.scraper.parser import parse_sih_html, extract_problem_ids, parse_problem_statement
from app.scraper.normalizer import clean_text, normalize_problem, deduplicate_problems
from app.scraper.validator import validate_problem, validate_scraped_batch
from app.scraper.cache import ProblemCache, problem_cache

if not any(r.path == "/api/problems" for r in app.routes):
    app.include_router(problems_router)

client = TestClient(app)

FIXTURE_PATH = os.path.join(os.path.dirname(__file__), "fixtures", "sih_sample.html")

@pytest.fixture
def sample_html():
    with open(FIXTURE_PATH, "r", encoding="utf-8") as f:
        return f.read()

def test_parse_sih_html_fixture(sample_html):
    records = parse_sih_html(sample_html, source_url="https://www.sih.gov.in/sih2026PS")
    assert len(records) == 3
    
    r1 = records[0]
    assert r1["id"] == "SIH26001"
    assert r1["serial_no"] == 1
    assert "AI-Based early warning" in r1["title"]
    assert "MDoNER" in r1["organization"]
    assert r1["category"] == "Software"
    assert r1["theme"] == "Disaster Management"
    assert "North Eastern Region" in r1["background"]
    assert "geospatial early warning" in r1["description"]
    assert "Multi-hazard decision support" in r1["expected_solution"]
    assert r1["deadline"] == "20 September 2026"
    assert r1["submitted_ideas"] == "0/500"
    assert len(r1["references"]) >= 2
    assert r1["references"][0]["url"] == "https://youtube.com/watch?v=sih2026demo"

def test_extract_problem_ids(sample_html):
    soup = BeautifulSoup(sample_html, "html.parser")
    ids = extract_problem_ids(soup)
    assert "SIH26001" in ids
    assert "SIH26002" in ids
    assert "SIH26003" in ids

def test_text_cleaning_and_normalization():
    dirty_text = "   Disaster &amp; Risk   Management &nbsp; with &#39;AI&#39; \n\n\n\n Solutions   "
    cleaned = clean_text(dirty_text)
    assert cleaned == "Disaster & Risk Management with 'AI'\n\nSolutions"

    sample_raw = {
        "id": "26001",
        "title": "  Landslide Monitoring  ",
        "organization": "NDMA",
        "category": "software",
        "theme": "Disaster Management",
        "references": ["https://example.com/dataset"]
    }
    normalized = normalize_problem(sample_raw)
    assert normalized["id"] == "SIH26001"
    assert normalized["category"] == "Software"
    assert normalized["references"][0]["url"] == "https://example.com/dataset"

def test_deduplication_prefers_complete_record():
    records = [
        {
            "id": "SIH26001",
            "title": "Short title",
            "organization": "Org A",
            "description": "Short",
            "category": "Software",
            "source_url": "https://sih.gov.in"
        },
        {
            "id": "SIH26001",
            "title": "Short title",
            "organization": "Org A",
            "description": "Much longer and more detailed comprehensive problem statement description",
            "expected_solution": "Detailed full stack GIS solution",
            "category": "Software",
            "source_url": "https://sih.gov.in"
        }
    ]
    deduped = deduplicate_problems(records)
    assert len(deduped) == 1
    assert "Much longer" in deduped[0]["description"]

def test_validation_and_safety_checks():
    # Valid record
    valid_rec = {
        "id": "SIH26001",
        "title": "Valid Problem Title",
        "source_url": "https://sih.gov.in"
    }
    assert validate_problem(valid_rec) is True

    # Invalid record (missing title)
    invalid_rec = {
        "id": "SIH26001",
        "title": "",
        "source_url": "https://sih.gov.in"
    }
    assert validate_problem(invalid_rec) is False

    # Safety check: drop from 200 to 5 records should fail validation
    batch = [valid_rec] * 5
    is_valid, _, msg = validate_scraped_batch(batch, previous_count=200)
    assert is_valid is False
    assert "Safety check triggered" in msg

def test_cache_fallback_behavior():
    test_cache = ProblemCache(ttl_minutes=10)
    records = [
        {"id": "SIH26001", "title": "Test Problem 1", "organization": "Org 1", "category": "Software", "theme": "AI", "description": "Desc 1", "source_url": "https://sih.gov.in"}
    ]
    test_cache.update(records, source_url="https://sih.gov.in")
    assert test_cache.is_fresh() is True
    assert len(test_cache.get_data()) == 1

    # Simulate scrape failure
    test_cache.mark_failed("Upstream connection timeout")
    # Data is retained
    assert len(test_cache.get_data()) == 1
    status = test_cache.get_status()
    assert status["status"] == "failed"
    assert status["error_message"] == "Upstream connection timeout"
    assert status["total_problems"] == 1

def test_sih_api_endpoints(sample_html):
    # Prime the global cache with sample fixture data for API test
    records = parse_sih_html(sample_html, source_url="https://www.sih.gov.in/sih2026PS")
    deduped = deduplicate_problems(records)
    problem_cache.update(deduped, source_url="https://www.sih.gov.in/sih2026PS")

    # 1. GET /api/problems
    res = client.get("/api/problems")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3

    # 2. GET /api/problems/{id}
    res_id = client.get("/api/problems/SIH26001")
    assert res_id.status_code == 200
    assert res_id.json()["id"] == "SIH26001"

    # 3. GET /api/problems/search
    res_search = client.get("/api/problems/search?q=drone")
    assert res_search.status_code == 200
    assert any("drone" in p["title"].lower() or "drone" in p["theme"].lower() for p in res_search.json())

    # 4. GET /api/problems/filter
    res_filter = client.get("/api/problems/filter?category=Hardware")
    assert res_filter.status_code == 200
    assert all(p["category"] == "Hardware" for p in res_filter.json())

    # 5. GET /api/problems/stats
    res_stats = client.get("/api/problems/stats")
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert stats["total_problems"] >= 3
    assert stats["software_count"] >= 1
    assert stats["hardware_count"] >= 1

    # 6. GET /api/scraper/status
    res_status = client.get("/api/scraper/status")
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "success"
    assert res_status.json()["total_problems"] >= 3

    # 7. GET /health
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "ok"
