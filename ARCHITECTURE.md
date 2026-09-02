# SurakshitSthan AI — System Architecture Document

## Overview

**SurakshitSthan AI** is an AI-Powered Multi-Hazard Risk & Proactive Relocation Decision Support System built for Smart India Hackathon 2026 (SIH 2026). It ingests live multi-hazard disaster data (USGS, GDACS, CWC, NDMA), synthesizes dynamic spatial Red-Zones, calculates deterministic and Random-Forest-based vulnerability risk scores, and formulates carrying-capacity-optimized safe relocation strategies for vulnerable settlements.

---

## Architectural Dataflow

```
LIVE MULTI-HAZARD FEEDS (USGS, GDACS, CWC, NDMA)
  │
  ▼
DATA NORMALIZATION & CONFIDENCE SCORING (Gov: 0.95, Global: 0.90)
  │
  ▼
GEODESIC DEDUPLICATION ENGINE (50 km spatial / temporal window)
  │
  ▼
DYNAMIC RED-ZONE SYNTHESIS (RED >75, ORANGE 50-75, YELLOW 25-50 Buffers)
  │
  ▼
POINT-IN-POLYGON HABITATION EXPOSURE & VULNERABILITY SCORING
  │
  ▼
CARRYING CAPACITY & MULTI-SITE RELOCATION ALLOCATION ENGINE
  │
  ▼
EXPLAINABLE AI & GEMINI STATE AUTHORITY ACTION BRIEF
  │
  ▼
REACT 18 GIS COMMAND CENTER (Leaflet Canvas, Telemetry & Interactive Layers)
```

---

## Technical Stack

| Component | Framework / Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Leaflet, Tailwind CSS, Recharts | Interactive GIS Command Center & decision dashboard |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn, Asyncio | High-performance REST APIs & background cron scraper |
| **GIS Math** | Geodesic math, Raycasting Point-in-Polygon, Circular Buffers | Spatial geometry calculations without external binary spatial DB |
| **Data Layer** | SQLite (`surakshitsthan.db`) with SQLAlchemy ORM | Relational storage for habitations, sites, and telemetry |
| **Scraping** | Async HTTP (`httpx`), BeautifulSoup4, lxml | Live continuous ingestion with 15-minute background cron loop |
| **AI / ML** | Scikit-Learn (Random Forest) + Google Gemini API | Deterministic feature attribution + natural-language authority briefs |
