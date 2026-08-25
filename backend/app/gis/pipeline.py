import math
from typing import List, Dict, Any

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two lat/lon pairs in kilometers."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class GISPipelineService:
    @staticmethod
    def validate_geojson_geometry(geometry: Dict[str, Any]) -> bool:
        if not isinstance(geometry, dict):
            return False
        gtype = geometry.get("type")
        coords = geometry.get("coordinates")
        if gtype not in ["Point", "Polygon", "MultiPolygon", "LineString"] or not coords:
            return False
        return True

    @staticmethod
    def compute_habitation_hazard_exposure(hab_lat: float, hab_lng: float, hazards: List[Dict[str, Any]]) -> Dict[str, float]:
        """Compute spatial hazard exposure for a given habitation point."""
        # Simple spatial proximity buffer scoring
        scores = {"flood": 20.0, "landslide": 25.0, "earthquake": 40.0, "environmental": 30.0}
        
        for hz in hazards:
            htype = hz.get("hazard_type", "").lower()
            risk = hz.get("risk_score", 50.0)
            # Proxy distance calculation
            if "flood" in htype:
                scores["flood"] = max(scores["flood"], risk * 0.9)
            elif "landslide" in htype:
                scores["landslide"] = max(scores["landslide"], risk * 0.95)
            elif "earthquake" in htype:
                scores["earthquake"] = max(scores["earthquake"], risk * 0.85)
            elif "multi" in htype:
                scores["flood"] = max(scores["flood"], risk * 0.9)
                scores["landslide"] = max(scores["landslide"], risk * 0.92)

        return scores

gis_pipeline = GISPipelineService()
