import math
from typing import List, Dict, Any, Tuple

def create_geodesic_buffer_polygon(center_lat: float, center_lng: float, radius_km: float, num_points: int = 32) -> List[List[float]]:
    """
    Synthesizes GeoJSON Polygon coordinates [lng, lat] for a geodesic circular buffer around center.
    """
    coords = []
    R = 6371.0  # Earth radius in km
    lat_rad = math.radians(center_lat)
    lng_rad = math.radians(center_lng)
    d = radius_km / R

    for i in range(num_points):
        bearing = math.radians((360.0 / num_points) * i)
        point_lat_rad = math.asin(
            math.sin(lat_rad) * math.cos(d) +
            math.cos(lat_rad) * math.sin(d) * math.cos(bearing)
        )
        point_lng_rad = lng_rad + math.atan2(
            math.sin(bearing) * math.sin(d) * math.cos(lat_rad),
            math.cos(d) - math.sin(lat_rad) * math.sin(point_lat_rad)
        )
        coords.append([round(math.degrees(point_lng_rad), 6), round(math.degrees(point_lat_rad), 6)])

    # Close polygon ring
    coords.append(coords[0])
    return coords

def point_in_polygon(lat: float, lng: float, polygon_coords: List[List[float]]) -> bool:
    """
    Raycasting point-in-polygon algorithm.
    polygon_coords is a list of [lng, lat] vertices ring.
    """
    inside = False
    n = len(polygon_coords)
    if n < 3:
        return False

    j = n - 1
    for i in range(n):
        xi, yi = polygon_coords[i][0], polygon_coords[i][1]  # lng, lat
        xj, yj = polygon_coords[j][0], polygon_coords[j][1]

        intersect = ((yi > lat) != (yj > lat)) and (lng < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi)
        if intersect:
            inside = not inside
        j = i

    return inside

class RedZoneEngine:
    """
    Dynamic Red-Zone GIS Processor:
    Generates multi-tiered Red (Critical >75), Orange (High 50-75), and Yellow (Moderate 25-50) spatial hazard zones.
    Evaluates point-in-polygon containment for habitations.
    """
    def generate_red_zones(self, hazards: List[Dict[str, Any]]) -> Dict[str, Any]:
        features = []
        for hz in hazards:
            hid = hz.get("id", "hz_0")
            htype = hz.get("hazard_type", "Hazard")
            location = hz.get("location_name", "Location")
            severity = hz.get("severity", "MEDIUM").upper()
            risk_score = float(hz.get("risk_score", 60.0))

            geom = hz.get("geometry_json", {})
            coords = geom.get("coordinates", [0.0, 0.0]) if isinstance(geom, dict) else [0.0, 0.0]
            if not coords or len(coords) < 2:
                continue

            center_lng, center_lat = coords[0], coords[1]

            # Determine Zone Tier, Color Code and Dynamic Radius
            if risk_score >= 75.0 or severity in ["CRITICAL", "EXTREME", "HIGH"]:
                zone_tier = "RED"
                color = "#ef4444"
                fill_color = "rgba(239, 68, 68, 0.35)"
                buffer_km = 25.0
            elif risk_score >= 50.0 or severity in ["MEDIUM"]:
                zone_tier = "ORANGE"
                color = "#f97316"
                fill_color = "rgba(249, 115, 22, 0.30)"
                buffer_km = 15.0
            else:
                zone_tier = "YELLOW"
                color = "#eab308"
                fill_color = "rgba(234, 179, 8, 0.25)"
                buffer_km = 8.0

            poly_coords = create_geodesic_buffer_polygon(center_lat, center_lng, radius_km=buffer_km)

            feature = {
                "type": "Feature",
                "id": f"red_zone_{hid}_{zone_tier}",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [poly_coords]
                },
                "properties": {
                    "hazard_id": hid,
                    "hazard_type": htype,
                    "location_name": location,
                    "zone_tier": zone_tier,
                    "risk_score": risk_score,
                    "color": color,
                    "fill_color": fill_color,
                    "radius_km": buffer_km,
                    "center": [center_lat, center_lng],
                    "confidence": hz.get("confidence", 0.90)
                }
            }
            features.append(feature)

        return {
            "type": "FeatureCollection",
            "features": features
        }

    def check_habitation_zone_intersection(self, hab_lat: float, hab_lng: float, red_zones_geojson: Dict[str, Any]) -> Tuple[str, float, List[str]]:
        """
        Determines highest priority zone tier containing habitation coordinate, highest risk score, and list of overlapping hazard types.
        Returns tuple of (zone_tier, max_risk_score, hazards_list)
        """
        highest_tier = "NONE"
        max_risk = 0.0
        overlapping_hazards = []

        tier_weights = {"RED": 3, "ORANGE": 2, "YELLOW": 1, "NONE": 0}

        features = red_zones_geojson.get("features", [])
        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            poly_rings = geom.get("coordinates", [])
            if not poly_rings:
                continue

            outer_ring = poly_rings[0]  # list of [lng, lat]
            if point_in_polygon(hab_lat, hab_lng, outer_ring):
                tier = props.get("zone_tier", "YELLOW")
                risk = props.get("risk_score", 50.0)
                htype = props.get("hazard_type", "Hazard")

                if htype not in overlapping_hazards:
                    overlapping_hazards.append(htype)

                if risk > max_risk:
                    max_risk = risk

                if tier_weights.get(tier, 0) > tier_weights.get(highest_tier, 0):
                    highest_tier = tier

        return highest_tier, max_risk, overlapping_hazards

red_zone_engine = RedZoneEngine()
