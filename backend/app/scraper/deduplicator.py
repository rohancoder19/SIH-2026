import logging
import math
from typing import List, Dict, Any

logger = logging.getLogger("scraper.deduplicator")

def calculate_haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates geodesic distance between two points in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class DisasterDeduplicator:
    """
    Spatial & temporal event deduplicator.
    Merges duplicate reports within 50 km radius of the same hazard type,
    preserving the record with the highest confidence score.
    """
    def __init__(self, proximity_threshold_km: float = 50.0):
        self.proximity_threshold_km = proximity_threshold_km

    def deduplicate(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not records:
            return []

        # Sort records descending by confidence score so higher confidence takes priority
        sorted_records = sorted(records, key=lambda x: x.get("confidence", 0.5), reverse=True)
        unique_records: List[Dict[str, Any]] = []

        for record in sorted_records:
            geometry = record.get("geometry_json", {})
            coords = geometry.get("coordinates", [0, 0]) if isinstance(geometry, dict) else [0, 0]
            if not coords or len(coords) < 2:
                continue

            lon1, lat1 = coords[0], coords[1]
            hazard_type = record.get("hazard_type", "").lower()

            is_duplicate = False
            for existing in unique_records:
                existing_geom = existing.get("geometry_json", {})
                existing_coords = existing_geom.get("coordinates", [0, 0])
                lon2, lat2 = existing_coords[0], existing_coords[1]
                existing_type = existing.get("hazard_type", "").lower()

                if hazard_type == existing_type:
                    dist_km = calculate_haversine_km(lat1, lon1, lat2, lon2)
                    if dist_km <= self.proximity_threshold_km:
                        is_duplicate = True
                        logger.info(f"[DEDUPLICATOR] Merged duplicate {hazard_type} event within {round(dist_km, 1)}km of existing event.")
                        break

            if not is_duplicate:
                unique_records.append(record)

        logger.info(f"[DEDUPLICATOR] Deduplication reduced {len(records)} raw records to {len(unique_records)} unique hazard records.")
        return unique_records

disaster_deduplicator = DisasterDeduplicator()
