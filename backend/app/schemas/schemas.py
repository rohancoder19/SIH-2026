from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "Analyst"
    organization: Optional[str] = "Disaster Management Authority"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# Habitation Schemas
class HabitationBase(BaseModel):
    name: str
    district: str
    state: str = "West Bengal"
    population: int
    vulnerable_population: int
    latitude: float
    longitude: float
    geometry_json: Optional[Dict[str, Any]] = None
    elevation: float = 1000.0
    infrastructure_score: float = 65.0
    accessibility_score: float = 60.0
    hazard_score: float = 75.0
    vulnerability_score: float = 70.0
    relocation_priority: str = "IMMEDIATE"
    hazard_breakdown: Optional[Dict[str, float]] = None

class HabitationCreate(HabitationBase):
    pass

class HabitationOut(HabitationBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Hazard Zone Schemas
class HazardZoneBase(BaseModel):
    hazard_type: str
    name: Optional[str] = None
    severity: str
    risk_score: float
    geometry_json: Dict[str, Any]
    source: str = "GIS Pipeline"
    confidence: float = 0.90

class HazardZoneOut(HazardZoneBase):
    id: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Relocation Site Schemas
class RelocationSiteBase(BaseModel):
    name: str
    district: str = "Darjeeling"
    latitude: float
    longitude: float
    geometry_json: Optional[Dict[str, Any]] = None
    land_area: float
    available_area: float
    population_capacity: int
    current_population: int = 0
    safety_score: float = 90.0
    accessibility_score: float = 85.0
    infrastructure_score: float = 80.0
    environmental_score: float = 88.0
    overall_score: float = 88.0
    suitability_status: str = "HIGHLY_SUITABLE"

class RelocationSiteOut(RelocationSiteBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ML Schemas
class MLPredictionInput(BaseModel):
    habitation_id: Optional[int] = None
    landslide_risk: float
    flood_risk: float
    earthquake_risk: float
    environmental_risk: float
    population: int
    vulnerable_population: int
    accessibility_score: float
    infrastructure_score: float
    distance_to_safe_area_km: float

class MLPredictionOutput(BaseModel):
    relocation_priority: str
    priority_score: float
    confidence: float
    explanation: str
    contributing_factors: Dict[str, float]

# Risk Weighting Schemas
class RiskWeightsInput(BaseModel):
    flood_w: float = 0.25
    landslide_w: float = 0.30
    earthquake_w: float = 0.20
    cyclone_w: float = 0.10
    environmental_w: float = 0.15

# Expert Validation Schemas
class ValidationCreate(BaseModel):
    habitation_id: int
    validated_priority: str
    decision: str  # ACCEPTED, REJECTED, MODIFIED
    comments: Optional[str] = ""

class ValidationOut(BaseModel):
    id: int
    habitation_id: int
    expert_name: str
    original_priority: str
    validated_priority: str
    decision: str
    comments: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# SIH 2026 Problem Statement Schemas
class ReferenceLink(BaseModel):
    title: str
    url: str

class SIHProblemBase(BaseModel):
    id: str
    serial_no: Optional[int] = None
    title: str
    organization: str
    department: Optional[str] = None
    category: str = "Software"
    theme: str = "General"
    description: str
    background: Optional[str] = None
    expected_solution: Optional[str] = None
    deadline: Optional[str] = None
    submitted_ideas: Optional[str] = None
    references: Optional[List[ReferenceLink]] = []
    source_url: str
    scraped_at: Optional[str] = None

class SIHProblemOut(SIHProblemBase):
    model_config = ConfigDict(from_attributes=True)

class ScraperStatusResponse(BaseModel):
    status: str
    total_problems: int
    last_scraped: Optional[str] = None
    source: str
    cache_age: str
    cache_age_seconds: Optional[int] = None
    is_cached: bool = False
    is_fresh: bool = False
    error_message: Optional[str] = None

class ProblemStats(BaseModel):
    total_problems: int
    software_count: int
    hardware_count: int
    theme_count: int
    organization_count: int
    themes: List[Dict[str, Any]]
    categories: List[Dict[str, Any]]
    organizations: List[Dict[str, Any]]

class HealthResponse(BaseModel):
    status: str
    scraper: str
    database: str
    total_problems_in_cache: int
    timestamp: str
