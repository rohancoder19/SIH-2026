# SurakshitSthan AI — Production-Ready Full-Stack AI + GIS Disaster Management Platform

![SurakshitSthan Banner](https://img.shields.io/badge/Platform-SurakshitSthan%20AI-00b4d8?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20FastAPI%20%7C%20PostGIS%20%7C%20Scikit--Learn-06d6a0?style=for-the-badge)

SurakshitSthan is a government-grade geospatial intelligence and AI decision-support platform designed for:
- Multi-hazard red-zone identification (Landslide, Flood, Earthquake, Multi-hazard)
- Vulnerable habitation prioritization (Immediate, Short-Term, Medium-Term, Monitor)
- Safe relocation-site recommendation via Multi-Criteria Decision Analysis (MCDA)
- Carrying-capacity assessment modeling across Land, Water, Infrastructure, and Environmental bounds
- Human-in-the-loop expert validation audit logging
- Executive report generation & PDF export

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Docker & Docker Compose (optional for containerized deployment)

### 1. Backend Setup & Local Server Execution
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend API docs available at: `http://localhost:8000/docs`*

### 2. Frontend Setup & Execution
```bash
cd frontend
npm install
npm run dev
```
*Frontend application available at: `http://localhost:3000`*

---

## 🐳 Docker Deployment
To launch the entire platform (Frontend + Backend + PostgreSQL + PostGIS container):
```bash
docker-compose up --build
```

---

## 📊 Demo Scenario Details
The application comes pre-loaded with a realistic disaster management scenario for the **Darjeeling & Kalimpong hilly region (West Bengal, India)**:
- **55 Monitored Settlements** (e.g., *Mirik Basti Lower*, *Sukhiapokhri Valley*, *Teesta Bazaar Waterfront*)
- **20 Safe Relocation Sites** on high elevated plateaus (e.g., *Darjeeling Extension Plateau A*, *Takdah Upper Ridge*)
- **5 Multi-Hazard Geo-Polygons** (Teesta River flood red-zone, Mirik landslide slope instability, Seismic MBT corridor)

---

## 🛡️ Architecture & Tech Stack

### Frontend
- **Framework**: React.js 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom dark geospatial navy aesthetic)
- **State**: Redux Toolkit
- **GIS Mapping**: Leaflet.js & React-Leaflet
- **Charts**: Recharts

### Backend & AI/ML
- **API Framework**: FastAPI + Pydantic v2
- **ORM & DB**: SQLAlchemy + PostGIS / SQLite spatial layer
- **Machine Learning**: Scikit-Learn `RandomForestClassifier` with Explainable AI (XAI) feature attribution
- **GIS Pipeline**: GeoPandas, Shapely distance matrix computation
- **Auth**: JWT Authentication & Role-Based Access Control (Admin, Expert, Analyst)
