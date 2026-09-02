# SurakshitSthan AI — System Implementation Audit

**Date**: September 2, 2026  
**Repository**: [rohancoder19/SIH-2026](https://github.com/rohancoder19/SIH-2026)  
**Target Solution**: AI-Powered Multi-Hazard Risk & Proactive Relocation Decision Support System

---

## 1. Current Architecture

SurakshitSthan AI is built as a full-stack, GIS-enabled decision-support platform designed for Smart India Hackathon 2026 (SIH 2026).

```
                  ┌───────────────────────────────────────────────┐
                  │          React 18 + Vite Frontend             │
                  │   (Leaflet GIS, Recharts, Lucide, Redux)      │
                  └───────────────────────┬───────────────────────┘
                                          │ REST APIs
                                          ▼
                  ┌─────────────────────────────────�       ┌───────────────────┴───┐   ┌───────┴──────┐  ┌─────┴────────────────┐
       │ SQLite / PostGIS DB   │   │  GIS Engine  │  │ Multi-Hazard Scrapers  │
       │ (Habitations, Sites)  │   │  (Geodesic)  │  │(USGS, GDACS, NDMA, CWC)│
       └───────────────────────┘   └──────────────┘  └────────────────────────┘
```

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Leaflet / React-Leaflet, Recharts, Redux Toolkit.
* **Backend**: FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn, Asyncio.
* **GIS Engine**: Geodesic math, Point-in-Polygon containment (pure Python raycasting), Shapely / GeoPandas vector transformer.
* **Data Layer**: SQLite (`surakshitsthan.db`) with PostGIS-ready GeoJSON storage schemas.
* **Scraping Engine**: BeautifulSoup4, lxml, httpx async collectors with 15-minute background cron task.
* **AI/ML Engine**: Scikit-Learn Random Forest risk classifier & Google Gemini integration.

---

## 2. Existing Features

1. **Pan-India Spatial Vector Engine**: Interactive 28 States & 8 Union Territories choropleth map with risk-weighted vulnerability scores and district-level boundary drill-down.
2. **Multi-Layer GIS Command Center**: Map canvas supporting Basemap switching (Dark Matter, Esri World Imagery Satellite, OpenStreetMap), spatial hazard clustering, radial proximity buffer search (10 km – 500 km), and vector layer toggles.
3. **Live Multi-Hazard Scrapers**: Automated continuous ingestion from USGS (seismic events), GDACS (global disasters), NDMA (national advisories), and CWC (river levels).
4. **Governance Telemetry & Scraper Modal**: Executive navigation bar featuring National Macro Overview, State Micro Analysis, Public Advisory Portal, and Scraper Telemetry Diagnostics.
5. **Habitation & Relocation Site Database**: Models and database seeders for habitations, relocation sites, carrying capacities, and risk assessments.
6. **Random Forest Risk Engine**: Baseline ML risk score model and AI report generator.

---

## 3. Existing APIs

| Module | Method | Endpoint | Purpose |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/health` | System health check (API, Scraper availability, DB connection) |
| **System** | `GET` | `/` | Root API directory |
| **GIS** | `GET` | `/api/gis/geojson/states` | Pan-India State boundary GeoJSON FeatureCollection |
| **GIS** | `GET` | `/api/gis/geojson/districts` | Pan-India District boundary GeoJSON FeatureCollection |
| **GIS** | `GET` | `/api/gis/points` | Real-time multi-hazard point cluster GeoJSON |
| **GIS** | `GET` | `/api/gis/stats` | National spatial statistics & vulnerability rankings |
| **Spatial Queries** | `POST` | `/api/gis/query/buffer` | Radial buffer proximity query with geodesic distance calculations |
| **Spatial Queries** | `POST` | `/api/gis/query/bbox` | Viewport bounding box point query |
| **Scraper** | `GET` | `/api/scrape/status` | Current operational status of disaster scrapers |
| **Scraper** | `POST` | `/api/scrape/trigger` | Force manual refresh pass against live hazard feeds |
| **Habitations** | `GET` | `/api/habitations/` | List all monitored habitations |
| **Hazards** | `GET` | `/api/hazards/` | List recorded hazard events |
| **Risk** | `GET` | `/api/risk/habitations` | Risk score analysis for habitations |
| **Relocation** | `GET` | `/api/relocation/sites` | Safe site recommendations and capacity analysis |

---

## 4. Existing Database / Storage

* **ORM Framework**: SQLAlchemy 2.0 with SQLite database (`surakshitsthan.db`).
* **Tables**:
  - `users`: User authentication, roles (`Admin`, `Disaster Authority`, `Analyst`, `Expert`, `Viewer`).
  - `habitations`: Habitations with population, vulnerable population, lat/lng, elevation, infrastructure score, accessibility score, hazard score, vulnerability score, relocation priority (`IMMEDIATE`, `SHORT_TERM`, `MEDIUM_TERM`).
  - `hazard_zones`: Hazard zone polygons with severity, risk score, GeoJSON geometry, source, confidence.
  - `relocation_sites`: Safe candidate sites with area, population capacity, current population, safety score, accessibility score, infrastructure score, suitability status.
  - `risk_assessments`: Record of ML risk scoring runs.
  - `relocation_recommendations`: Recommended site pairings with distance, capacity available, and overall suitability.
  - `expert_validations`: Audits and overrides by human disaster management experts.
  - `ingestion_pipelines`: Logs of imported spatial datasets.
  - `system_alerts`: High-severity system alerts.
  - `hazard_weights_config`: Configurable weights for flood, landslide, earthquake, cyclone, and environmental factors.

---

## 5. Existing ML Models

* **`backend/app/ml/engine.py`**:
  - `MultiHazardRiskEngine`: Uses a trained `RandomForestClassifier` (or synthetic feature training on startup) to predict risk levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and multi-hazard risk scores (0–100).
  - Feature inputs: `elevation`, `rainfall_mm`, `slope_deg`, `dist_to_river_km`, `dist_to_coast_km`, `historical_events_5yr`, `population_density`.
  - Gemini LLM Integration: Uses Google Gemini for generating natural language risk explanations and authority briefings.

---

## 6. Existing GIS Implementation

* **`backend/app/gis/pipeline.py`**:
  - Point-in-polygon containment using geodesic math / raycasting.
  - Distance calculation between lat/lng coordinates.
  - Buffer polygon calculation around point hazards.
* **Vector Datasets**:
  - `backend/data/india_states.geojson`: 28 States & 8 UTs.
  - `backend/data/india_districts.geojson`: District boundaries.

---

## 7. Existing Scraper Implementation

* **`backend/app/scraper/disaster_scraper.py`**:
  - `DisasterScraperHub`: Aggregates live USGS seismic data, GDACS RSS feeds, NDMA advisories, and CWC river level monitoring.
  - Uses `httpx` async fetching, regex parsing, and fallback caches in `disaster_cache.py`.ng geodesic math / raycasting.
  - Distance calculation between lat/lng coordinates.
  - Buffer polygon calculation around point hazards.
* **Vector Datasets**:
  - `backend/data/india_states.geojson`: 28 States & 8 UTs.
  - `backend/data/india_districts.geojson`: District boundaries.

---

## 7. Existing Scraper Implementation

* **`backend/app/scraper/disaster_scraper.py`**:
  - `DisasterScraperHub`: Aggregates live USGS seismic data, GDACS RSS feeds, NDMA advisories, and CWC river level monitoring.
  - Uses `httpx` async fetching, regex parsing, and fallback caches in `disaster_cache.py`.
* **`backend/app/scraper/parser.py`**:
  - SIH 2026 official portal scraper (`https://www.sih.gov.in/sih2026PS`).

---

## 8. Existing Frontend Pages

1. `LandingPage.tsx`: Portal welcome and platform summary.
2. `DashboardPage.tsx`: Executive macro dashboard, KPIs, quick filters.
3. `GISMapPage.tsx`: Interactive multi-layer Leaflet GIS command center.
4. `HabitationsPage.tsx` & `HabitationDetailPage.tsx`: Habitation monitoring & detailed risk breakdown.
5. `HazardsPage.tsx`: Hazard inventory and live disaster alerts feed.
6. `RelocationEnginePage.tsx` & `CarryingCapacityPage.tsx`: Relocation site matcher and carrying capacity simulator.
7. `SafeSitesPage.tsx`: Safe relocation site inventory.
8. `DataIngestionPage.tsx`: Data pipelines, scraper controls, and live refresh status.
9. `AnalyticsPage.tsx`: Statistical charts and vulnerability rankings.
10. `ExpertValidationPage.tsx`: Nodal officer validation and manual overrides.
11. `ReportsPage.tsx`: Authority briefing generator.
12. `AdminPage.tsx` & `LoginPage.tsx`: System settings and auth access.

---

## 9. Existing Map Implementation

* **Components**:
  - `MapContainer.tsx`: Leaflet wrapper with tile layer selection (Dark Matter, Satellite, OSM).
  - `IndiaChoroplethLayer.tsx`: GeoJSON polygon renderer for State & District boundaries.
  - `SpatialClusterLayer.tsx`: Marker layer for live hazard point clusters with severity pulses.
  - `LayerControlPanel.tsx`: GIS widget for layer toggles.
  - `SpatialFilterDrawer.tsx`: Filter panel for state, district, proximity, and severity.

---

## 10. Existing Demo Data

* Pre-seeded habitations in West Bengal / Darjeeling / Uttarakhand risk regions.
* Pre-seeded candidate relocation sites with capacities, land area, and safety scores.
* Sample disaster events and GeoJSON state/district boundaries.

---

## 11. What Already Satisfies the SIH Problem

- [x] Basic GIS map with state/district boundary overlays.
- [x] Database models for Habitations, Relocation Sites, and Risk Assessments.
- [x] Baseline multi-hazard scraper hub (USGS, GDACS).
- [x] Baseline Random Forest risk classification engine.
- [x] Carrying capacity fields in database schema (`population_capacity`, `current_population`).
- [x] Multi-tier governance navigation bar (National Macro, State Micro, Public Portal).

---

## 12. What Is Incomplete (To Be Enhanced for Full SIH Solution)

- [ ] **Disaster Scraper Architecture**: Modularize into `backend/app/scraper/sources/` and `collectors/` with clear source confidence scoring (Government = highest, Public feeds = high, etc.) and schema-validated `DisasterEvent` records.
- [ ] **Normalized Disaster Schema**: Enforce standard fields (`event_id`, `hazard_type`, `severity`, `confidence`, `source_url`, `affected_population`, coordinates) with strict deduplication.
- [ ] **Geospatial Red-Zone Polygon Generation**: Automatically generate spatial GeoJSON polygons (`RED`, `ORANGE`, `YELLOW`) around multi-hazard clusters and save them directly into `HazardZone` table.
- [ ] **Dynamic Red-Zone Refresh Pipeline**: Trigger `POST /api/data/refresh` that ingests live data, recomputes risk, regenerates Red-Zone polygons, updates affected habitations, and broadcasts changes.
- [ ] **Habitation Vulnerability Engine**: Multi-factor scoring combining physical hazard exposure, slope, elevation, historical event count, infrastructure, and vulnerable population.
- [ ] **3-Tier Relocation Priority Classification**: Assign `IMMEDIATE`, `SHORT_TERM`, or `MEDIUM_TERM` priority scores with clear mathematical breakdown.
- [ ] **Carrying Capacity & Relocation Matching Engine**: Smart allocation algorithm that pairs habitations with candidate sites, respects `available_capacity`, splits habitations across multiple sites if capacity is insufficient, and computes population deficit.
- [ ] **Relocation Simulation Endpoint**: `POST /api/relocation/simulate` returning capacity utilization, remaining deficit, and risk reduction metrics.
- [ ] **Deterministic Explainable AI Engine**: Mathematical feature importance contribution breakdown (e.g. Rainfall: 31%, Slope: 24%, History: 21%) coupled with LLM authority briefings.
- [ ] **Relocation Briefing Report Generator**: Executive summary for State Disaster Management Authorities with action plans categorized by timeline (`Immediate`, `Short-term`, `Medium-term`).
- [ ] **"What Changed?" Live Telemetry Panel**: Dashboard widget displaying changes in Red Zone area, newly affected habitations, and capacity usage after data refresh passes.

---

## 13. What Should Be Modified

1. **`backend/app/scraper/`**: Expand into modular architecture with `base.py`, `sources/`, `collectors/`, `parser.py`, `normalizer.py`, `validator.py`, `deduplicator.py`, `scheduler.py`, `pipeline.py`.
2. **`backend/app/gis/pipeline.py` & `red_zone.py`**: Add automated convex-hull / buffer polygon generation for Red-Zone geometries.
3. **`backend/app/ml/engine.py` & `explainability.py`**: Separate mathematical deterministic weighted risk scoring from ML prediction and LLM natural language generation.
4. **`backend/app/services/capacity_service.py` & `relocation_service.py`**: Implement multi-site split allocation and carrying capacity deficit logic.
5. **`frontend/src/pages/DashboardPage.tsx` & `GISMapPage.tsx`**: Connect live Red Zone polygons, "What Changed?" telemetry cards, and interactive relocation planner panels directly to backend API feeds.

---

## 14. What Should Be Newly Created

* `backend/app/scraper/sources/disaster_sources.py`
* `backend/app/scraper/collectors/disaster_collector.py`
* `backend/app/scraper/deduplicator.py`
* `backend/app/scraper/pipeline.py`
* `backend/app/gis/red_zone.py`
* `backend/app/ml/explainability.py`
* `backend/app/api/data_router.py`
* `backend/app/api/red_zones_router.py`
* `ARCHITECTURE.md`
* `DATA_PIPELINE.md`
* `ML_METHODOLOGY.md`
* `RELOCATION_METHODOLOGY.md`

---

## 15. Potential Breaking Changes & Mitigation

* **Database Schema Extension**: Keep existing table names (`habitations`, `relocation_sites`, `hazard_zones`) and add new optional columns (`source_confidence`, `hazard_types`, `allocated_population`) so existing code and tests continue to work without migration breaks.
* **Scraper Routing**: Retain existing `/api/scraper/` routes while creating clean unified endpoints under `/api/data/` and `/api/red-zones/`.
