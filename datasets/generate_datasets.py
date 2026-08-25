import os
import json
import csv
import random

random.seed(42)

os.makedirs("datasets/population", exist_ok=True)
os.makedirs("datasets/disasters", exist_ok=True)
os.makedirs("datasets/rainfall", exist_ok=True)
os.makedirs("datasets/infrastructure", exist_ok=True)
os.makedirs("datasets/gis", exist_ok=True)

# Darjeeling & Kalimpong Villages
VILLAGES = [
    {"id": "VIL-001", "code": "301001", "lgd": "100234", "name": "Mirik Basti Lower", "district": "Darjeeling", "lat": 26.8872, "lng": 88.1884},
    {"id": "VIL-002", "code": "301002", "lgd": "100235", "name": "Sukhiapokhri Valley", "district": "Darjeeling", "lat": 26.9961, "lng": 88.1367},
    {"id": "VIL-003", "code": "301003", "lgd": "100236", "name": "Teesta Bazaar Waterfront", "district": "Kalimpong", "lat": 27.0582, "lng": 88.4285},
    {"id": "VIL-004", "code": "301004", "lgd": "100237", "name": "Lebong Slope Settlement", "district": "Darjeeling", "lat": 27.0621, "lng": 88.2721},
    {"id": "VIL-005", "code": "301005", "lgd": "100238", "name": "Ghoom Station Ridge", "district": "Darjeeling", "lat": 27.0102, "lng": 88.2575},
    {"id": "VIL-006", "code": "301006", "lgd": "100239", "name": "Peshok Tea Garden Sector 3", "district": "Darjeeling", "lat": 27.0715, "lng": 88.3948},
    {"id": "VIL-007", "code": "301007", "lgd": "100240", "name": "Melli Bridge Settlement", "district": "Kalimpong", "lat": 27.0864, "lng": 88.4412},
    {"id": "VIL-008", "code": "301008", "lgd": "100241", "name": "Kurseong St. Marys Slope", "district": "Darjeeling", "lat": 26.8791, "lng": 88.2785},
    {"id": "VIL-009", "code": "301009", "lgd": "100242", "name": "Gorubathan Lower Block", "district": "Kalimpong", "lat": 26.9734, "lng": 88.7012},
    {"id": "VIL-010", "code": "301010", "lgd": "100243", "name": "Pedong North Ridge", "district": "Kalimpong", "lat": 27.1512, "lng": 88.6189},
]

# Generate more villages up to 30
for i in range(11, 31):
    dist = "Kalimpong" if i % 2 == 0 else "Darjeeling"
    VILLAGES.append({
        "id": f"VIL-0{i:02d}" if i < 100 else f"VIL-{i}",
        "code": f"3010{i:02d}",
        "lgd": f"1002{i+34}",
        "name": f"{dist} Sector Village {i}",
        "district": dist,
        "lat": round(26.82 + (i * 0.012) % 0.35, 4),
        "lng": round(88.15 + (i * 0.024) % 0.65, 4)
    })

# 1. POPULATION DATASETS
with open("datasets/population/village_population.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["village_id", "village_name", "district", "state", "total_population", "vulnerable_population", "male", "female", "children", "elderly"])
    for v in VILLAGES:
        tot = random.randint(1500, 5800)
        vuln = int(tot * random.uniform(0.28, 0.45))
        m = int(tot * 0.51)
        fem = tot - m
        child = int(tot * 0.22)
        eld = int(tot * 0.14)
        writer.writerow([v["id"], v["name"], v["district"], "West Bengal", tot, vuln, m, fem, child, eld])

with open("datasets/population/village_codes.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["village_id", "census_code_2011", "lgd_code", "district_code", "state_code"])
    for v in VILLAGES:
        writer.writerow([v["id"], v["code"], v["lgd"], "301" if v["district"]=="Darjeeling" else "302", "19"])

with open("datasets/population/demographic_data.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["village_id", "household_count", "literacy_rate_pct", "poverty_ratio_pct", "kutcha_houses_pct"])
    for v in VILLAGES:
        hh = random.randint(300, 1200)
        lit = round(random.uniform(68.5, 88.2), 1)
        pov = round(random.uniform(18.2, 36.4), 1)
        kutcha = round(random.uniform(25.0, 62.0), 1)
        writer.writerow([v["id"], hh, lit, pov, kutcha])

# 2. DISASTERS DATASETS
with open("datasets/disasters/disaster_losses.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["incident_id", "village_id", "event_date", "hazard_type", "fatalities", "houses_destroyed", "economic_loss_inr_lakhs"])
    for idx, v in enumerate(VILLAGES):
        writer.writerow([f"INC-2025-{idx+101}", v["id"], "2025-07-14", "Landslide" if idx % 2 == 0 else "Flash Flood", random.randint(0, 4), random.randint(2, 28), round(random.uniform(12.5, 145.0), 2)])

with open("datasets/disasters/flood_history.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["flood_event_id", "village_id", "year", "peak_inundation_depth_m", "flood_duration_days", "affected_population"])
    for idx, v in enumerate(VILLAGES[:15]):
        writer.writerow([f"FLD-HIST-{idx+1}", v["id"], random.choice([2023, 2024, 2025]), round(random.uniform(1.2, 3.8), 2), random.randint(2, 9), random.randint(400, 2800)])

with open("datasets/disasters/landslide_inventory.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["landslide_id", "village_id", "event_date", "slope_angle_deg", "movement_velocity", "trigger_factor", "volume_cum"])
    for idx, v in enumerate(VILLAGES[:20]):
        writer.writerow([f"LS-INV-{idx+501}", v["id"], "2025-08-02", random.randint(32, 58), "Rapid Debris Flow", "Heavy Monsoon Rainfall", random.randint(1200, 45000)])

# 3. RAINFALL DATASET
with open("datasets/rainfall/rainfall_processed.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["station_id", "village_id", "date", "daily_rainfall_mm", "cum_7day_rainfall_mm", "heavy_rainfall_alert"])
    for v in VILLAGES:
        daily = round(random.uniform(45.0, 280.0), 1)
        cum7 = round(daily * random.uniform(3.5, 6.2), 1)
        alert = "CRITICAL" if daily > 180 or cum7 > 600 else "WARNING"
        writer.writerow(["STN-DAR-01", v["id"], "2026-08-25", daily, cum7, alert])

# 4. INFRASTRUCTURE DATASETS
with open("datasets/infrastructure/hospitals.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["hospital_id", "name", "district", "latitude", "longitude", "bed_capacity", "emergency_unit_available", "icu_beds"])
    hospitals = [
        ["HOSP-01", "Darjeeling District Hospital", "Darjeeling", 27.0392, 88.2612, 250, "YES", 20],
        ["HOSP-02", "Kalimpong Sub-Divisional Hospital", "Kalimpong", 27.0682, 88.4721, 180, "YES", 12],
        ["HOSP-03", "Kurseong Sub-Divisional Hospital", "Darjeeling", 26.8812, 88.2754, 120, "YES", 8],
        ["HOSP-04", "Mirik Rural Health Centre", "Darjeeling", 26.8912, 88.1912, 45, "YES", 4],
        ["HOSP-05", "Pedong Primary Health Centre", "Kalimpong", 27.1550, 88.6210, 30, "NO", 0]
    ]
    for h in hospitals:
        writer.writerow(h)

with open("datasets/infrastructure/schools.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["school_id", "name", "district", "latitude", "longitude", "capacity", "shelter_potential"])
    schools = [
        ["SCH-01", "St. Joseph's North Point School", "Darjeeling", 27.0512, 88.2610, 1200, "HIGH_SHELTER"],
        ["SCH-02", "Kalimpong Govt High School", "Kalimpong", 27.0721, 88.4789, 950, "HIGH_SHELTER"],
        ["SCH-03", "Ghoom Boys School", "Darjeeling", 27.0112, 88.2580, 600, "MODERATE_SHELTER"],
        ["SCH-04", "Sukhiapokhri Higher Secondary", "Darjeeling", 26.9980, 88.1380, 750, "HIGH_SHELTER"],
        ["SCH-05", "Gorubathan Higher Secondary", "Kalimpong", 26.9750, 88.7030, 800, "HIGH_SHELTER"]
    ]
    for s in schools:
        writer.writerow(s)

# Roads GeoJSON
roads_features = []
for idx, v in enumerate(VILLAGES[:15]):
    roads_features.append({
        "type": "Feature",
        "properties": {
            "road_id": f"RD-{idx+100}",
            "name": f"Evacuation Route {v['name']}",
            "road_type": "State Highway / PWD Road",
            "width_m": 6.5,
            "accessibility_status": "CLEAR" if idx % 3 != 0 else "PARTIALLY_BLOCKED"
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [v["lng"], v["lat"]],
                [v["lng"] + 0.02, v["lat"] + 0.02],
                [v["lng"] + 0.05, v["lat"] + 0.04]
            ]
        }
    })

with open("datasets/infrastructure/roads.geojson", "w") as f:
    json.dump({"type": "FeatureCollection", "features": roads_features}, f, indent=2)

# 5. GIS DATASETS
village_features = []
for v in VILLAGES:
    l, g = v["lng"], v["lat"]
    offset = 0.008
    poly = [[
        [round(l - offset, 4), round(g - offset, 4)],
        [round(l + offset, 4), round(g - offset, 4)],
        [round(l + offset, 4), round(g + offset, 4)],
        [round(l - offset, 4), round(g + offset, 4)],
        [round(l - offset, 4), round(g - offset, 4)]
    ]]
    village_features.append({
        "type": "Feature",
        "properties": {
            "village_id": v["id"],
            "name": v["name"],
            "district": v["district"],
            "census_code": v["code"],
            "area_sq_km": 4.2
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": poly
        }
    })

with open("datasets/gis/village_boundaries.geojson", "w") as f:
    json.dump({"type": "FeatureCollection", "features": village_features}, f, indent=2)

# Create lightweight GIS raster placeholder files for dem.tif, flood_hazard.tif, lulc.tif, landslide_risk.tif
rasters = ["dem.tif", "flood_hazard.tif", "lulc.tif", "landslide_risk.tif"]
for r in rasters:
    with open(f"datasets/gis/{r}", "wb") as f:
        # Minimal TIFF header simulation bytes
        f.write(b"II*\x00\x08\x00\x00\x00SurakshitSthan GIS Simulated Raster GeoTIFF Grid Metadata")

print("All 14 datasets generated successfully under datasets/ directory structure!")
