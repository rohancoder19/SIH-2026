import json
import random
import os

random.seed(42)

DARJEELING_HABITATIONS = [
    # Darjeeling Sub-division
    {"name": "Mirik Basti Lower", "district": "Darjeeling", "lat": 26.8872, "lng": 88.1884, "elevation": 1420, "pop": 3450, "vuln_pop": 1280, "priority": "IMMEDIATE", "hazards": {"landslide": 92, "flood": 78, "earthquake": 65, "environmental": 82}},
    {"name": "Sukhiapokhri Valley", "district": "Darjeeling", "lat": 26.9961, "lng": 88.1367, "elevation": 2134, "pop": 2180, "vuln_pop": 850, "priority": "IMMEDIATE", "hazards": {"landslide": 95, "flood": 40, "earthquake": 72, "environmental": 88}},
    {"name": "Ghoom Station Ridge", "district": "Darjeeling", "lat": 27.0102, "lng": 88.2575, "elevation": 2258, "pop": 4120, "vuln_pop": 1450, "priority": "SHORT_TERM", "hazards": {"landslide": 78, "flood": 25, "earthquake": 80, "environmental": 70}},
    {"name": "Lebong Slope Settlement", "district": "Darjeeling", "lat": 27.0621, "lng": 88.2721, "elevation": 1820, "pop": 1950, "vuln_pop": 720, "priority": "IMMEDIATE", "hazards": {"landslide": 89, "flood": 60, "earthquake": 75, "environmental": 84}},
    {"name": "Happy Valley Slope", "district": "Darjeeling", "lat": 27.0485, "lng": 88.2612, "elevation": 1980, "pop": 1620, "vuln_pop": 540, "priority": "SHORT_TERM", "hazards": {"landslide": 76, "flood": 30, "earthquake": 70, "environmental": 68}},
    {"name": "Chowk Bazaar Bottom", "district": "Darjeeling", "lat": 27.0428, "lng": 88.2654, "elevation": 2040, "pop": 5800, "vuln_pop": 2100, "priority": "SHORT_TERM", "hazards": {"landslide": 82, "flood": 35, "earthquake": 85, "environmental": 74}},
    {"name": "Takdah Cantonment Slope", "district": "Darjeeling", "lat": 27.0371, "lng": 88.3542, "elevation": 1550, "pop": 1430, "vuln_pop": 410, "priority": "MEDIUM_TERM", "hazards": {"landslide": 62, "flood": 45, "earthquake": 60, "environmental": 55}},
    {"name": "Tinchuley Lower Village", "district": "Darjeeling", "lat": 27.0184, "lng": 88.3711, "elevation": 1780, "pop": 1150, "vuln_pop": 320, "priority": "MEDIUM_TERM", "hazards": {"landslide": 58, "flood": 20, "earthquake": 65, "environmental": 50}},
    {"name": "Peshok Tea Garden Sector 3", "district": "Darjeeling", "lat": 27.0715, "lng": 88.3948, "elevation": 1200, "pop": 2840, "vuln_pop": 980, "priority": "IMMEDIATE", "hazards": {"landslide": 91, "flood": 68, "earthquake": 74, "environmental": 85}},
    {"name": "Rongtong Lowland", "district": "Darjeeling", "lat": 26.8501, "lng": 88.3712, "elevation": 420, "pop": 3100, "vuln_pop": 1100, "priority": "SHORT_TERM", "hazards": {"landslide": 45, "flood": 88, "earthquake": 50, "environmental": 78}},

    # Kalimpong District
    {"name": "Teesta Bazaar Waterfront", "district": "Kalimpong", "lat": 27.0582, "lng": 88.4285, "elevation": 220, "pop": 3950, "vuln_pop": 1820, "priority": "IMMEDIATE", "hazards": {"landslide": 88, "flood": 96, "earthquake": 72, "environmental": 94}},
    {"name": "Melli Bridge Settlement", "district": "Kalimpong", "lat": 27.0864, "lng": 88.4412, "elevation": 240, "pop": 2750, "vuln_pop": 1150, "priority": "IMMEDIATE", "hazards": {"landslide": 82, "flood": 94, "earthquake": 68, "environmental": 90}},
    {"name": "Relli River Bed Basti", "district": "Kalimpong", "lat": 27.0421, "lng": 88.4891, "elevation": 680, "pop": 2400, "vuln_pop": 920, "priority": "IMMEDIATE", "hazards": {"landslide": 79, "flood": 91, "earthquake": 60, "environmental": 86}},
    {"name": "Gorubathan Lower Block", "district": "Kalimpong", "lat": 26.9734, "lng": 88.7012, "elevation": 410, "pop": 4200, "vuln_pop": 1600, "priority": "SHORT_TERM", "hazards": {"landslide": 70, "flood": 85, "earthquake": 64, "environmental": 76}},
    {"name": "Pedong North Ridge", "district": "Kalimpong", "lat": 27.1512, "lng": 88.6189, "elevation": 1480, "pop": 1890, "vuln_pop": 520, "priority": "MEDIUM_TERM", "hazards": {"landslide": 64, "flood": 15, "earthquake": 70, "environmental": 52}},
    {"name": "Lava Slope Colony", "district": "Kalimpong", "lat": 27.0855, "lng": 88.6592, "elevation": 2138, "pop": 1650, "vuln_pop": 480, "priority": "SHORT_TERM", "hazards": {"landslide": 77, "flood": 10, "earthquake": 78, "environmental": 65}},
    {"name": "Rishyap Edge Basti", "district": "Kalimpong", "lat": 27.1088, "lng": 88.6472, "elevation": 2591, "pop": 980, "vuln_pop": 310, "priority": "MEDIUM_TERM", "hazards": {"landslide": 68, "flood": 5, "earthquake": 82, "environmental": 58}},
    {"name": "Algara Lower Bazaar", "district": "Kalimpong", "lat": 27.1145, "lng": 88.5861, "elevation": 1780, "pop": 3200, "vuln_pop": 1050, "priority": "SHORT_TERM", "hazards": {"landslide": 75, "flood": 35, "earthquake": 72, "environmental": 69}},
    {"name": "Chel River Bank Colony", "district": "Kalimpong", "lat": 26.9214, "lng": 88.6811, "elevation": 320, "pop": 2900, "vuln_pop": 1200, "priority": "IMMEDIATE", "hazards": {"landslide": 65, "flood": 92, "earthquake": 58, "environmental": 88}},
    {"name": "Jaldhaka Valley Lowland", "district": "Kalimpong", "lat": 27.0891, "lng": 88.8712, "elevation": 550, "pop": 2150, "vuln_pop": 890, "priority": "IMMEDIATE", "hazards": {"landslide": 81, "flood": 89, "earthquake": 66, "environmental": 87}},

    # Kurseong Sub-division
    {"name": "Kurseong St. Marys Slope", "district": "Darjeeling", "lat": 26.8791, "lng": 88.2785, "elevation": 1458, "pop": 3800, "vuln_pop": 1250, "priority": "SHORT_TERM", "hazards": {"landslide": 80, "flood": 20, "earthquake": 74, "environmental": 71}},
    {"name": "Pankhabari Lower Bend", "district": "Darjeeling", "lat": 26.8341, "lng": 88.2691, "elevation": 650, "pop": 2650, "vuln_pop": 980, "priority": "IMMEDIATE", "hazards": {"landslide": 88, "flood": 65, "earthquake": 62, "environmental": 82}},
    {"name": "Tindharia Workshop Area", "district": "Darjeeling", "lat": 26.8542, "lng": 88.3341, "elevation": 860, "pop": 2300, "vuln_pop": 810, "priority": "SHORT_TERM", "hazards": {"landslide": 84, "flood": 40, "earthquake": 68, "environmental": 76}},
    {"name": "Rohini Lower Valley", "district": "Darjeeling", "lat": 26.8412, "lng": 88.2312, "elevation": 510, "pop": 3400, "vuln_pop": 1300, "priority": "IMMEDIATE", "hazards": {"landslide": 83, "flood": 72, "earthquake": 60, "environmental": 81}},
    {"name": "Mahananda River Bank Basti", "district": "Darjeeling", "lat": 26.8123, "lng": 88.3912, "elevation": 280, "pop": 4500, "vuln_pop": 1950, "priority": "IMMEDIATE", "hazards": {"landslide": 40, "flood": 95, "earthquake": 55, "environmental": 91}},
]

# Generate more habitations systematically up to 52 habitations
names_prefix = ["Upper", "Lower", "East", "West", "Central", "North", "South"]
names_base = ["Bungkulung", "Soureni", "Nagri Spur", "Pulbazar", "Singla", "Bijanbari", "Lodhoma", "Rimbick", "Sirikhola", "Manebhanjan", "Dilaram", "Sonada", "Tung", "Gayabari", "Chimney", "Chatakpur", "Sittong", "Mongpu", "Latpanchar", "Kalijhora", "Rongpo", "Samthar", "Kaffer", "Sillery Gaon", "Pedong", "Bindu", "Parenti", "Todey", "Tangta", "Kumai"]

for idx, bname in enumerate(names_base):
    pfx = names_prefix[idx % len(names_prefix)]
    dist = "Kalimpong" if idx % 2 == 0 else "Darjeeling"
    lat = 26.80 + (idx * 0.011) % 0.38
    lng = 88.12 + (idx * 0.023) % 0.72
    elev = random.randint(300, 2400)
    pop = random.randint(1200, 6500)
    vuln_pop = int(pop * random.uniform(0.25, 0.48))
    
    ls = random.randint(40, 96)
    fl = random.randint(20, 95) if elev < 800 else random.randint(10, 45)
    eq = random.randint(45, 88)
    env = int((ls * 0.4) + (fl * 0.3) + (eq * 0.3))
    
    overall = int(ls * 0.35 + fl * 0.25 + eq * 0.2 + env * 0.2)
    if overall > 75:
        prio = "IMMEDIATE"
    elif overall > 60:
        prio = "SHORT_TERM"
    elif overall > 45:
        prio = "MEDIUM_TERM"
    else:
        prio = "MONITOR"
        
    DARJEELING_HABITATIONS.append({
        "name": f"{pfx} {bname}",
        "district": dist,
        "lat": round(lat, 4),
        "lng": round(lng, 4),
        "elevation": elev,
        "pop": pop,
        "vuln_pop": vuln_pop,
        "priority": prio,
        "hazards": {"landslide": ls, "flood": fl, "earthquake": eq, "environmental": env}
    })

# Safe Relocation Sites (20+ high-elevation, safe plateau/flat lands with low hazard score)
RELOCATION_SITES = [
    {"name": "Darjeeling Extension Plateau A", "district": "Darjeeling", "lat": 27.0312, "lng": 88.2415, "land_area": 45.0, "avail_area": 32.5, "capacity": 8500, "current_pop": 1200, "safety": 94, "access": 88, "infra": 85, "env": 90},
    {"name": "Takdah Upper Ridge Safe Zone", "district": "Darjeeling", "lat": 27.0412, "lng": 88.3610, "land_area": 38.0, "avail_area": 28.0, "capacity": 7200, "current_pop": 800, "safety": 92, "access": 85, "infra": 80, "env": 88},
    {"name": "Sonada Plateau Sector 2", "district": "Darjeeling", "lat": 26.9612, "lng": 88.2710, "land_area": 50.0, "avail_area": 39.0, "capacity": 9800, "current_pop": 2100, "safety": 90, "access": 91, "infra": 86, "env": 92},
    {"name": "Kalimpong Hilltop Plateau North", "district": "Kalimpong", "lat": 27.0712, "lng": 88.4812, "land_area": 60.0, "avail_area": 48.0, "capacity": 12000, "current_pop": 3400, "safety": 95, "access": 90, "infra": 88, "env": 94},
    {"name": "Pedong High Plateau", "district": "Kalimpong", "lat": 27.1610, "lng": 88.6210, "land_area": 42.0, "avail_area": 31.0, "capacity": 7800, "current_pop": 1100, "safety": 91, "access": 82, "infra": 79, "env": 89},
    {"name": "Lava Forest Clearance Safe Hub", "district": "Kalimpong", "lat": 27.0910, "lng": 88.6710, "land_area": 55.0, "avail_area": 42.0, "capacity": 10500, "current_pop": 1500, "safety": 96, "access": 84, "infra": 82, "env": 95},
    {"name": "Gorubathan Upper Bench", "district": "Kalimpong", "lat": 26.9890, "lng": 88.7150, "land_area": 35.0, "avail_area": 26.0, "capacity": 6500, "current_pop": 950, "safety": 89, "access": 86, "infra": 81, "env": 87},
    {"name": "Kurseong Dowhill Plateau", "district": "Darjeeling", "lat": 26.8850, "lng": 88.2850, "land_area": 48.0, "avail_area": 35.0, "capacity": 9200, "current_pop": 2400, "safety": 93, "access": 89, "infra": 87, "env": 91},
    {"name": "Mirik Upper Lake Terrace", "district": "Darjeeling", "lat": 26.8990, "lng": 88.1950, "land_area": 40.0, "avail_area": 29.0, "capacity": 7500, "current_pop": 1800, "safety": 88, "access": 87, "infra": 84, "env": 86},
    {"name": "Sukhiapokhri Ridge Reserve", "district": "Darjeeling", "lat": 27.0050, "lng": 88.1450, "land_area": 52.0, "avail_area": 41.0, "capacity": 10000, "current_pop": 2000, "safety": 92, "access": 83, "infra": 80, "env": 93},
    {"name": "Bijanbari Terrace Sector B", "district": "Darjeeling", "lat": 27.0510, "lng": 88.1910, "land_area": 36.0, "avail_area": 27.0, "capacity": 6800, "current_pop": 1400, "safety": 87, "access": 81, "infra": 78, "env": 88},
    {"name": "Mongpu Herb Extension Field", "district": "Darjeeling", "lat": 26.9710, "lng": 88.3810, "land_area": 44.0, "avail_area": 33.0, "capacity": 8200, "current_pop": 1600, "safety": 90, "access": 85, "infra": 83, "env": 89},
    {"name": "Rongpo Upper Buffer Zone", "district": "Kalimpong", "lat": 27.1810, "lng": 88.5310, "land_area": 58.0, "avail_area": 44.0, "capacity": 11200, "current_pop": 2800, "safety": 94, "access": 92, "infra": 89, "env": 92},
    {"name": "Sittong Orange Ridge High Plain", "district": "Darjeeling", "lat": 26.9310, "lng": 88.3610, "land_area": 39.0, "avail_area": 30.0, "capacity": 7400, "current_pop": 1100, "safety": 91, "access": 84, "infra": 81, "env": 90},
    {"name": "Samthar Hill Top Township", "district": "Kalimpong", "lat": 26.9910, "lng": 88.5210, "land_area": 65.0, "avail_area": 52.0, "capacity": 13500, "current_pop": 1900, "safety": 97, "access": 80, "infra": 85, "env": 96},
    {"name": "Chibo Plateau Kalimpong", "district": "Kalimpong", "lat": 27.0550, "lng": 88.4650, "land_area": 47.0, "avail_area": 36.0, "capacity": 9000, "current_pop": 2200, "safety": 93, "access": 88, "infra": 86, "env": 91},
    {"name": "Bungkulung Flat Spur", "district": "Darjeeling", "lat": 26.8610, "lng": 88.1610, "land_area": 33.0, "avail_area": 25.0, "capacity": 6200, "current_pop": 900, "safety": 88, "access": 82, "infra": 79, "env": 87},
    {"name": "Dilaram Ridge Site C", "district": "Darjeeling", "lat": 26.9350, "lng": 88.2910, "land_area": 41.0, "avail_area": 31.0, "capacity": 7900, "current_pop": 1300, "safety": 92, "access": 87, "infra": 83, "env": 90},
    {"name": "Jaldhaka Upper Terrace", "district": "Kalimpong", "lat": 27.1010, "lng": 88.8910, "land_area": 50.0, "avail_area": 38.0, "capacity": 9500, "current_pop": 1700, "safety": 95, "access": 81, "infra": 80, "env": 94},
    {"name": "Rimbick Plateau Zone", "district": "Darjeeling", "lat": 27.1110, "lng": 88.1110, "land_area": 46.0, "avail_area": 34.0, "capacity": 8800, "current_pop": 1000, "safety": 94, "access": 78, "infra": 77, "env": 93}
]

HAZARD_ZONES = [
    {
        "type": "Feature",
        "properties": {
            "id": "HZ-FL-001",
            "hazard_type": "Flood",
            "name": "Teesta River Flood Red-Zone",
            "severity": "Critical",
            "risk_score": 96,
            "source": "CWC Hydrological Survey 2025",
            "confidence": 0.94
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [88.4150, 27.0450],
                [88.4350, 27.0500],
                [88.4500, 27.0800],
                [88.4400, 27.0950],
                [88.4200, 27.0700],
                [88.4100, 27.0550],
                [88.4150, 27.0450]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "HZ-LS-002",
            "hazard_type": "Landslide",
            "name": "Mirik-Sukhiapokhri Slope Instability Zone",
            "severity": "Very High",
            "risk_score": 92,
            "source": "GSI Landslide Susceptibility Map",
            "confidence": 0.91
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [88.1300, 26.8700],
                [88.2000, 26.8800],
                [88.2100, 27.0100],
                [88.1400, 27.0150],
                [88.1250, 26.9400],
                [88.1300, 26.8700]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "HZ-EQ-003",
            "hazard_type": "Earthquake",
            "name": "Main Boundary Thrust (MBT) Seismic Risk Corridor",
            "severity": "High",
            "risk_score": 85,
            "source": "National Seismological Centre",
            "confidence": 0.89
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [88.1000, 26.8200],
                [88.7500, 26.9500],
                [88.7700, 27.0200],
                [88.1200, 26.8900],
                [88.1000, 26.8200]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "HZ-MH-004",
            "hazard_type": "Multi-Hazard",
            "name": "Peshok-Teesta Confluence Vulnerability Complex",
            "severity": "Critical",
            "risk_score": 98,
            "source": "SurakshitSthan Multi-Hazard Engine",
            "confidence": 0.96
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [88.3800, 27.0500],
                [88.4400, 27.0500],
                [88.4500, 27.0850],
                [88.3900, 27.0800],
                [88.3800, 27.0500]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "HZ-FL-005",
            "hazard_type": "Flood",
            "name": "Chel & Jaldhaka Flash Flood Zone",
            "severity": "High",
            "risk_score": 89,
            "source": "North Bengal Flood Control Board",
            "confidence": 0.88
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [88.6500, 26.9000],
                [88.7200, 26.9200],
                [88.8900, 27.0900],
                [88.8400, 27.1000],
                [88.6400, 26.9300],
                [88.6500, 26.9000]
            ]]
        }
    }
]

os.makedirs("data/demo", exist_ok=True)

with open("data/demo/habitations.json", "w") as f:
    json.dump(DARJEELING_HABITATIONS, f, indent=2)

with open("data/demo/relocation_sites.json", "w") as f:
    json.dump(RELOCATION_SITES, f, indent=2)

geojson_hazards = {
    "type": "FeatureCollection",
    "features": HAZARD_ZONES
}

with open("data/demo/hazard_zones.geojson", "w") as f:
    json.dump(geojson_hazards, f, indent=2)

print(f"Generated {len(DARJEELING_HABITATIONS)} habitations, {len(RELOCATION_SITES)} relocation sites, and {len(HAZARD_ZONES)} hazard red-zones!")
