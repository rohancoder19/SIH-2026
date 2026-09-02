# SurakshitSthan AI — BHARAT-GIS Pan-India Multi-Hazard & Spatial Decision-Support Platform

![SurakshitSthan Banner](https://img.shields.io/badge/Platform-SurakshitSthan%20AI%20%7C%20BHARAT--GIS-00b4d8?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20FastAPI%20%7C%20Leaflet%20%7C%20PostGIS--GeoJSON%20%7C%20Scikit--Learn-06d6a0?style=for-the-badge)
![SIH Live Scraper](https://img.shields.io/badge/SIH%202026-Live%20Multi--Hazard%20Scraper-f72585?style=for-the-badge)

**SurakshitSthan AI (BHARAT-GIS)** is a government-grade geospatial intelligence, live multi-hazard scraping, and AI-driven disaster risk assessment platform developed for **Smart India Hackathon 2026 (SIH 2026)**. It provides real-time spatial analytics across 28 States and 8 Union Territories of India, continuous multi-source disaster telemetry (USGS, GDACS, NDMA, CWC), AI safe relocation site decision support, and an official SIH 2026 problem statement scraper.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Data & Scraper Layer
        USGS["USGS Seismic Feed"] --> Aggregator["National Multi-Hazard Scraper<br/>(httpx + Async Cron Loop)"]
        GDACS["GDACS RSS Alert Feed"] --> Aggregator
        NDMA["NDMA Advisories Feed"] --> Aggregator
        CWC["CWC River Station Feed"] --> Aggregator
        SIH_PS["Official SIH Portal<br/>(https://www.sih.gov.in/sih2026PS)"] --> SIH_Scraper["SIH 2026 Scraper & Normalizer"]
    end

    subgraph Backend Core (FastAPI)
        Aggregator --> GeoTransformer["Spatial Transformer & Geodesic Math<br/>(Point-in-Polygon & Radial Buffer)"]
        SIH_Scraper --> SIH_Service["SIH Problem Service & Validator"]
        GeoTransformer --> CacheDB["Thread-Safe Cache & SQLite/PostGIS DB"]
        CacheDB --> MLEngine["ML Risk Engine & Relocation Selector<br/>(Scikit-Learn Random Forest)"]
        MLEngine --> APIRoutes["FastAPI REST Routers<br/>(/api/gis, /api/risk, /api/relocation, /api/scraper)"]
    end

    subgraph Frontend Command Center (React + Vite + Leaflet)
        APIRoutes --> TopBar["Executive Governance Bar<br/>(National Macro | State Micro | Citizen Portal)"]
        APIRoutes --> GISMap["Multi-Layer Leaflet Engine<br/>(Choropleth + Spatial Clusters + Buffer Search)"]
        APIRoutes --> Telemetry["Real-time Telemetry Bar & Analytics Charts"]
    end

    GISMap --> User["Disaster Authorities & Citizens"]
```

---

## 🌟 Key Features

### 1. Pan-India Spatial Vector & Choropleth Engine
* **Complete Boundary Datasets**: GeoJSON boundaries for all **28 States and 8 Union Territories** (`india_states.geojson`) and district-level polygons (`india_districts.geojson`).
* **Risk-Weighted Choropleth**: Dynamic color-gradient maps visualizing vulnerability scores, active alert counts, and population density metrics.
* **Basemap & Vector Controls**: Seamlessly switch between Dark Matter, Esri World Imagery Satellite, and OpenStreetMap basemaps with layer opacity and visibility controls.

### 2. Live Multi-Hazard Scraping Pipeline
* **Multi-Source Aggregation**: Real-time automated ingestion from **USGS** (earthquakes), **GDACS** (cyclones/floods), **NDMA** (national advisories), and **CWC** (river water levels).
* **Automated 15-Minute Background Cron**: Background lifespan loop continuously refreshes live disaster feeds without service interruption.
* **Proximity & Spatial Queries**: Geodesic point-in-polygon containment checking, dynamic radial buffer search (10 km – 500 km radius), and bounding-box queries.

### 3. Official SIH 2026 Web Scraping Engine
* **Live Problem Statement Pipeline**: Direct ingestion from the official SIH 2026 portal (`https://www.sih.gov.in/sih2026PS`).
* **Resilient Parser & Normalizer**: Cleans HTML entities, deduplicates entries based on completeness scores, and validates input constraints.
* **Safety Threshold Engine**: Prevents cache corruption by rejecting incomplete data batches if network or DOM structures fluctuate.

### 4. AI Risk Assessment & Safe Relocation Engine
* **Predictive Risk Scoring**: Machine learning algorithms (Random Forest) evaluate multi-hazard vulnerability for habitations.
* **Safe Relocation Recommender**: Recommends optimal safe relocation sites considering elevation, proximity to hazards, capacity, and accessibility.

### 5. Multi-Tier Governance Telemetry & Command Center
* **National Macro Overview**: Central Ministry view with national KPIs (Monitored Area 3.287M sq km, Critical Red Zones, At-Risk Citizens).
* **State & District Micro Analysis**: State Nodal Officer view with district boundary drill-downs and local risk metrics.
* **Public Advisory Portal**: Citizen-facing alert feed and location safety checking.
* **Scraper Telemetry Diagnostics**: Real-time inspection modal for scrapers, network latency, parser health, and live GeoJSON audit logs.

---

## 📡 REST API Reference

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/health` | System health check (API, Scraper availability, DB connection) |
| **System** | `GET` | `/` | Root status and API directory |
| **GIS Engine** | `GET` | `/api/gis/geojson/states` | Pan-India State boundary GeoJSON FeatureCollection |
| **GIS Engine** | `GET` | `/api/gis/geojson/districts` | Pan-India District boundary GeoJSON FeatureCollection |
| **GIS Engine** | `GET` | `/api/gis/points` | Real-time multi-hazard point cluster GeoJSON |
| **GIS Engine** | `GET` | `/api/gis/stats` | National spatial statistics & vulnerability rankings |
| **Spatial Queries**| `POST`| `/api/gis/query/buffer` | Radial buffer proximity query with geodesic distance calculations |
| **Spatial Queries**| `POST`| `/api/gis/query/bbox` | Viewport bounding box point query |
| **Scraper** | `GET` | `/api/scraper/status` | Current status of disaster & SIH scrapers |
| **Scraper** | `POST`| `/api/scraper/trigger` | Force manual refresh pass against live hazard feeds |
| **SIH 2026** | `GET` | `/api/problems` | List all scraped SIH 2026 problem statements with filters |
| **SIH 2026** | `GET` | `/api/problems/{id}` | Retrieve specific SIH problem statement |
| **SIH 2026** | `GET` | `/api/problems/search?q=`| Full-text query search across title, description, org |
| **Risk & AI** | `GET` | `/api/risk/habitations` | Risk score analysis for habitations |
| **Relocation** | `GET` | `/api/relocation/sites` | Safe site recommendations and capacity analysis |

---

## 📁 Project Directory Structure

```text
SurakshitSthan AI/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints (GIS, Scraper, Risk, SIH Problems, ML)
│   │   ├── config/          # Environment configuration & settings
│   │   ├── database/        # SQLite / PostGIS SQLAlchemy ORM models & database setup
│   │   ├── ml/              # Scikit-Learn risk assessment & relocation logic
│   │   ├── scraper/         # Multi-hazard scrapers (USGS, GDACS, NDMA, CWC, SIH)
│   │   ├── spatial/         # Geodesic math, point-in-polygon, vector transformer
│   │   ├── utils/           # Database seeder & helper utilities
│   │   └── main.py          # FastAPI application & lifespan background cron loop
│   ├── data/                # Spatial vector datasets (india_states.geojson, etc.)
│   ├── tests/               # Pytest suite for API endpoints, spatial math & scrapers
│   ├── requirements.txt     # Python backend dependencies
│   └── surakshitsthan.db    # SQLite local database
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI components, TopNavBar, LiveSyncBar, Scraper Modal
│   │   ├── components/gis/  # Leaflet map container, Choropleth, Spatial Clusters, Filters
│   │   ├── services/        # API client services & telemetry state management
│   │   └── App.tsx          # Main React Command Center application
│   ├── package.json         # Frontend Node dependencies
│   └── vite.config.ts       # Vite build configuration
├── docker-compose.yml       # Docker deployment configuration
└── README.md                # Project documentation
```

---

## 🚀 Quick Start & Local Execution

### Prerequisites
* **Python**: 3.10+
* **Node.js**: 18+

### 1. Backend Execution (FastAPI + Spatial Scraper Engine)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

* **Interactive API Documentation (Swagger)**: `http://localhost:8000/docs`
* **Health Check Endpoint**: `http://localhost:8000/health`

### 2. Frontend Execution (React + Vite Command Center)

```bash
cd frontend
npm install
npm run dev
```

* **Web Application Interface**: `http://localhost:3000`

---

## 🧪 Automated Testing

Execute the test suite covering spatial calculations, API routers, HTML parsers, normalizers, validator safety engines, and cache fallbacks:

```bash
cd backend
python -m pytest tests/
```

### Verified Test Results:
- ✅ `tests/test_api.py`: GIS endpoints, health checks, spatial buffer queries, risk routes.
- ✅ `tests/test_sih_scraper.py`: HTML table/modal parser, ID pattern extraction, normalization, deduplication, safety threshold protection, and cache fallbacks.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet, Recharts, Redux Toolkit
* **Backend**: FastAPI, Pydantic v2, SQLAlchemy, Uvicorn, Asyncio
* **Spatial & Geospatial**: GeoJSON (28 States & 8 UTs), Geodesic Proximity Math, Shapely / PostGIS
* **Scraping Engine**: BeautifulSoup4, lxml, httpx, Async Background Cron Loop
* **AI & Machine Learning**: Scikit-Learn Random Forest, Google Gemini

