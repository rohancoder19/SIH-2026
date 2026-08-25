from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.database.db import engine, Base, SessionLocal
from app.utils.seeder import seed_database

# Import routers
from app.api.auth_router import router as auth_router
from app.api.dashboard_router import router as dashboard_router
from app.api.habitations_router import router as habitations_router
from app.api.hazards_router import router as hazards_router
from app.api.risk_router import router as risk_router
from app.api.relocation_router import router as relocation_router
from app.api.sites_router import router as sites_router
from app.api.ml_router import router as ml_router
from app.api.gis_router import router as gis_router
from app.api.validation_router import router as validation_router
from app.api.reports_router import router as reports_router
from app.api.admin_router import router as admin_router

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered GIS Decision-Support Platform for Multi-Hazard Risk & Safe Relocation Planning",
    version="2.4.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Seed database with Darjeeling / Kalimpong demo dataset on startup
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

# Include API Routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(habitations_router)
app.include_router(hazards_router)
app.include_router(risk_router)
app.include_router(relocation_router)
app.include_router(sites_router)
app.include_router(ml_router)
app.include_router(gis_router)
app.include_router(validation_router)
app.include_router(reports_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "status": "ONLINE",
        "docs": "/docs",
        "message": "Welcome to SurakshitSthan AI - Multi-Hazard GIS & Safe Relocation Command Platform"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
