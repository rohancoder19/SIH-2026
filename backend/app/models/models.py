from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Analyst")  # Admin, Disaster Authority, Analyst, Expert, Viewer
    organization = Column(String(150), default="National Disaster Mitigation Authority")
    created_at = Column(DateTime, default=datetime.utcnow)

class Habitation(Base):
    __tablename__ = "habitations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    state = Column(String(100), default="West Bengal")
    population = Column(Integer, nullable=False)
    vulnerable_population = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geometry_json = Column(JSON, nullable=True)  # GeoJSON Point
    elevation = Column(Float, default=1000.0)
    infrastructure_score = Column(Float, default=65.0)
    accessibility_score = Column(Float, default=60.0)
    hazard_score = Column(Float, default=75.0)
    vulnerability_score = Column(Float, default=70.0)
    relocation_priority = Column(String(50), default="IMMEDIATE")  # IMMEDIATE, SHORT_TERM, MEDIUM_TERM, MONITOR
    hazard_breakdown = Column(JSON, nullable=True)  # {"flood": 80, "landslide": 90, ...}
    created_at = Column(DateTime, default=datetime.utcnow)

class HazardZone(Base):
    __tablename__ = "hazard_zones"

    id = Column(Integer, primary_key=True, index=True)
    hazard_type = Column(String(80), nullable=False)  # Flood, Landslide, Earthquake, Multi-Hazard, etc.
    name = Column(String(150), nullable=True)
    severity = Column(String(50), nullable=False)  # Low, Moderate, High, Very High, Critical
    risk_score = Column(Float, nullable=False)
    geometry_json = Column(JSON, nullable=False)  # GeoJSON Polygon
    source = Column(String(150), default="SurakshitSthan GIS Pipeline")
    confidence = Column(Float, default=0.90)
    updated_at = Column(DateTime, default=datetime.utcnow)

class RelocationSite(Base):
    __tablename__ = "relocation_sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    district = Column(String(100), default="Darjeeling")
    geometry_json = Column(JSON, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    land_area = Column(Float, nullable=False)  # Hectares
    available_area = Column(Float, nullable=False)
    population_capacity = Column(Integer, nullable=False)
    current_population = Column(Integer, default=0)
    safety_score = Column(Float, default=90.0)
    accessibility_score = Column(Float, default=85.0)
    infrastructure_score = Column(Float, default=80.0)
    environmental_score = Column(Float, default=88.0)
    overall_score = Column(Float, default=88.0)
    suitability_status = Column(String(50), default="HIGHLY_SUITABLE")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    habitation_id = Column(Integer, ForeignKey("habitations.id"))
    hazard_scores = Column(JSON, nullable=False)
    environmental_factors = Column(JSON, nullable=False)
    historical_factors = Column(JSON, nullable=False)
    ai_prediction = Column(String(50), nullable=False)
    confidence_score = Column(Float, nullable=False)
    expert_validation = Column(String(50), default="PENDING")
    timestamp = Column(DateTime, default=datetime.utcnow)

class RelocationRecommendation(Base):
    __tablename__ = "relocation_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    habitation_id = Column(Integer, ForeignKey("habitations.id"))
    recommended_site_id = Column(Integer, ForeignKey("relocation_sites.id"))
    priority = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    distance = Column(Float, nullable=False)  # kilometers
    capacity_available = Column(Integer, nullable=False)
    overall_score = Column(Float, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

class ExpertValidation(Base):
    __tablename__ = "expert_validations"

    id = Column(Integer, primary_key=True, index=True)
    habitation_id = Column(Integer, ForeignKey("habitations.id"))
    expert_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    expert_name = Column(String(120), default="Dr. A. K. Sharma")
    original_priority = Column(String(50), nullable=False)
    validated_priority = Column(String(50), nullable=False)
    decision = Column(String(50), nullable=False)  # ACCEPTED, REJECTED, MODIFIED
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class IngestionPipeline(Base):
    __tablename__ = "ingestion_pipelines"

    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String(150), nullable=False)
    source = Column(String(150), default="Government Survey Department")
    format = Column(String(50), nullable=False)  # GeoJSON, CSV, Shapefile, GeoTIFF
    size_bytes = Column(Integer, default=1024)
    record_count = Column(Integer, default=0)
    crs = Column(String(50), default="EPSG:4326")
    status = Column(String(50), default="Completed")  # Uploaded, Validating, Processing, Spatial Analysis, AI Analysis, Completed
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemAlert(Base):
    __tablename__ = "system_alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(50), default="Critical")  # Critical, Warning, Info
    entity_id = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class HazardWeightsConfig(Base):
    __tablename__ = "hazard_weights_config"

    id = Column(Integer, primary_key=True, index=True)
    flood_w = Column(Float, default=0.25)
    landslide_w = Column(Float, default=0.30)
    earthquake_w = Column(Float, default=0.20)
    cyclone_w = Column(Float, default=0.10)
    environmental_w = Column(Float, default=0.15)
    updated_at = Column(DateTime, default=datetime.utcnow)
