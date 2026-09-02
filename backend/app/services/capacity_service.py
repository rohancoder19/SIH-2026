from typing import Dict, Any

class CarryingCapacityService:
    @staticmethod
    def evaluate_site_capacity(site: Dict[str, Any]) -> Dict[str, Any]:
        land_area = site.get("land_area", 40.0)  # hectares
        avail_area = site.get("available_area", 30.0)

        # Usable land area percentage
        land_utilization_pct = round((avail_area / max(0.1, land_area)) * 100, 1)

        status = "HIGH_SUITABILITY" if land_utilization_pct > 60 else "MODERATE_SUITABILITY"

        return {
            "site_id": site.get("id"),
            "site_name": site.get("name"),
            "land_area_ha": land_area,
            "usable_area_ha": avail_area,
            "land_utilization_percentage": land_utilization_pct,
            "capacity_status": status,
            "safety_score": site.get("safety_score", 90.0),
            "environmental_score": site.get("environmental_score", 88.0),
            "infrastructure_score": site.get("infrastructure_score", 80.0)
        }

capacity_service = CarryingCapacityService()
