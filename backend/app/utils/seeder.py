import json
import csv
import os
from sqlalchemy.orm import Session
from app.models.models import User, Habitation, HazardZone, RelocationSite, SystemAlert, HazardWeightsConfig, IngestionPipeline
from app.auth.security import get_password_hash
from app.database.db import mongo_db, mongo_connected

def seed_database(db: Session):
    # 1. Seed Default Admin & Expert Users
    if db.query(User).count() == 0:
        users = [
            User(
                name="System Administrator",
                email="admin@surakshitsthan.gov.in",
                password_hash=get_password_hash("Admin@123"),
                role="Admin",
                organization="National Disaster Management Authority (NDMA)"
            ),
            User(
                name="Dr. Arisudan Sharma",
                email="expert@surakshitsthan.gov.in",
                password_hash=get_password_hash("Expert@123"),
                role="Expert",
                organization="Geological Survey of India (GSI)"
            ),
            User(
                name="Priya Banerjee",
                email="analyst@surakshitsthan.gov.in",
                password_hash=get_password_hash("Analyst@123"),
                role="Analyst",
                organization="West Bengal Disaster Relief"
            )
        ]
        db.add_all(users)
        db.commit()

    # 2. Seed Hazard Weights Configuration
    if db.query(HazardWeightsConfig).count() == 0:
        db.add(HazardWeightsConfig(flood_w=0.25, landslide_w=0.30, earthquake_w=0.20, cyclone_w=0.10, environmental_w=0.15))
        db.commit()

    # 3. Seed Habitations from datasets/population/village_population.csv
    datasets_pop_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../datasets/population/village_population.csv"))
    demo_hab_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/demo/habitations.json"))

    if db.query(Habitation).count() == 0:
        if os.path.exists(datasets_pop_path):
            hab_objects = []
            with open(datasets_pop_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for idx, row in enumerate(reader):
                    pop = int(row["total_population"])
                    vuln_pop = int(row["vulnerable_population"])
                    lat = 26.85 + (idx * 0.012) % 0.35
                    lng = 88.15 + (idx * 0.024) % 0.65
                    ls = 85.0 if idx % 2 == 0 else 55.0
                    fl = 90.0 if idx % 3 == 0 else 40.0
                    eq = 70.0
                    env = 75.0
                    overall = round(ls * 0.35 + fl * 0.25 + eq * 0.20 + env * 0.20, 1)
                    prio = "IMMEDIATE" if overall > 75 else ("SHORT_TERM" if overall > 60 else "MEDIUM_TERM")

                    hab_objects.append(Habitation(
                        name=row["village_name"],
                        district=row["district"],
                        state=row.get("state", "West Bengal"),
                        population=pop,
                        vulnerable_population=vuln_pop,
                        latitude=round(lat, 4),
                        longitude=round(lng, 4),
                        elevation=1200.0,
                        infrastructure_score=round(100 - (overall * 0.4), 1),
                        accessibility_score=round(100 - (overall * 0.5), 1),
                        hazard_score=overall,
                        vulnerability_score=round((vuln_pop / max(1, pop)) * 100, 1),
                        relocation_priority=prio,
                        hazard_breakdown={"landslide": ls, "flood": fl, "earthquake": eq, "environmental": env},
                        geometry_json={"type": "Point", "coordinates": [round(lng, 4), round(lat, 4)]}
                    ))
            db.add_all(hab_objects)
            db.commit()
        elif os.path.exists(demo_hab_path):
            with open(demo_hab_path, "r") as f:
                habs_data = json.load(f)
            hab_objects = []
            for h in habs_data:
                ls = h["hazards"]["landslide"]
                fl = h["hazards"]["flood"]
                eq = h["hazards"]["earthquake"]
                env = h["hazards"]["environmental"]
                overall_hazard = round(ls * 0.35 + fl * 0.25 + eq * 0.20 + env * 0.20, 1)
                hab_objects.append(Habitation(
                    name=h["name"],
                    district=h["district"],
                    state="West Bengal",
                    population=h["pop"],
                    vulnerable_population=h["vuln_pop"],
                    latitude=h["lat"],
                    longitude=h["lng"],
                    elevation=h["elevation"],
                    infrastructure_score=round(100 - (overall_hazard * 0.4), 1),
                    accessibility_score=round(100 - (overall_hazard * 0.5), 1),
                    hazard_score=overall_hazard,
                    vulnerability_score=round((h["vuln_pop"] / max(1, h["pop"])) * 100, 1),
                    relocation_priority=h["priority"],
                    hazard_breakdown=h["hazards"],
                    geometry_json={"type": "Point", "coordinates": [h["lng"], h["lat"]]}
                ))
            db.add_all(hab_objects)
            db.commit()

    # 4. Seed Relocation Sites
    site_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/demo/relocation_sites.json"))
    if db.query(RelocationSite).count() == 0 and os.path.exists(site_path):
        with open(site_path, "r") as f:
            sites_data = json.load(f)
        site_objects = []
        for s in sites_data:
            overall = round((s["safety"] * 0.35) + (s["access"] * 0.25) + (s["infra"] * 0.20) + (s["env"] * 0.20), 1)
            site_objects.append(RelocationSite(
                name=s["name"],
                district=s["district"],
                latitude=s["lat"],
                longitude=s["lng"],
                geometry_json={"type": "Point", "coordinates": [s["lng"], s["lat"]]},
                land_area=s["land_area"],
                available_area=s["avail_area"],
                population_capacity=s["capacity"],
                current_population=s["current_pop"],
                safety_score=s["safety"],
                accessibility_score=s["access"],
                infrastructure_score=s["infra"],
                environmental_score=s["env"],
                overall_score=overall,
                suitability_status="HIGHLY_SUITABLE" if overall >= 85 else "SUITABLE"
            ))
        db.add_all(site_objects)
        db.commit()

    # 5. Seed Hazard Zones
    hazard_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/demo/hazard_zones.geojson"))
    if db.query(HazardZone).count() == 0 and os.path.exists(hazard_path):
        with open(hazard_path, "r") as f:
            hz_data = json.load(f)
        hz_objects = []
        for feat in hz_data.get("features", []):
            props = feat["properties"]
            hz_objects.append(HazardZone(
                hazard_type=props["hazard_type"],
                name=props.get("name"),
                severity=props["severity"],
                risk_score=props["risk_score"],
                geometry_json=feat["geometry"],
                source=props.get("source", "NDMA Spatial Survey"),
                confidence=props.get("confidence", 0.92)
            ))
        db.add_all(hz_objects)
        db.commit()

    # 6. Seed Ingestion Pipelines
    if db.query(IngestionPipeline).count() == 0:
        pipelines = [
            IngestionPipeline(dataset_name="datasets/population/village_population.csv", source="Census 2021 Survey", format="CSV", size_bytes=14200, record_count=30, crs="WGS84", status="Completed"),
            IngestionPipeline(dataset_name="datasets/disasters/landslide_inventory.csv", source="GSI Landslide Records", format="CSV", size_bytes=28500, record_count=20, crs="WGS84", status="Completed"),
            IngestionPipeline(dataset_name="datasets/disasters/flood_history.csv", source="CWC Hydrological Board", format="CSV", size_bytes=18400, record_count=15, crs="WGS84", status="Completed"),
            IngestionPipeline(dataset_name="datasets/infrastructure/roads.geojson", source="PWD Geospatial Survey", format="GeoJSON", size_bytes=64000, record_count=15, crs="EPSG:4326", status="Completed"),
            IngestionPipeline(dataset_name="datasets/gis/landslide_risk.tif", source="Sentinel-2 Elevation Grid", format="GeoTIFF", size_bytes=245000, record_count=1, crs="EPSG:4326", status="Completed"),
        ]
        db.add_all(pipelines)
        db.commit()

    # 7. Seed System Alerts
    if db.query(SystemAlert).count() == 0:
        alerts = [
            SystemAlert(
                title="CRITICAL RISK: Mirik Basti Lower",
                message="Slope instability index exceeded 92%. High risk of landslide triggered by heavy rainfall.",
                severity="Critical",
                entity_id="HAB-001"
            ),
            SystemAlert(
                title="FLOOD WARNING: Teesta River Basin",
                message="Teesta river water level nearing red warning threshold (220m elevation).",
                severity="Warning",
                entity_id="HZ-FL-001"
            ),
            SystemAlert(
                title="RELOCATION ACTION REQUIRED",
                message="Sukhiapokhri Valley identified for immediate relocation. Safe site 'Sukhiapokhri Ridge Reserve' recommended.",
                severity="Critical",
                entity_id="HAB-002"
            )
        ]
        db.add_all(alerts)
        db.commit()

    # 8. MongoDB Atlas Sync
    if mongo_connected and mongo_db is not None:
        try:
            if mongo_db.system_status.count_documents({}) == 0:
                mongo_db.system_status.insert_one({
                    "cluster": "cluster0.ob6kbnf.mongodb.net",
                    "database": "surakshitsthan",
                    "status": "ONLINE",
                    "seeded_at": "2026-08-25"
                })
            
            # Sync Habitations to MongoDB Collection
            if mongo_db.habitations.count_documents({}) == 0:
                habs = db.query(Habitation).all()
                hab_docs = [
                    {
                        "habitation_id": h.id,
                        "name": h.name,
                        "district": h.district,
                        "population": h.population,
                        "vulnerable_population": h.vulnerable_population,
                        "latitude": h.latitude,
                        "longitude": h.longitude,
                        "hazard_score": h.hazard_score,
                        "relocation_priority": h.relocation_priority
                    } for h in habs
                ]
                if hab_docs:
                    mongo_db.habitations.insert_many(hab_docs)
        except Exception as e:
            print(f"MongoDB sync notice: {e}")
