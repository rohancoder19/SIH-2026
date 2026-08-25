from typing import Dict, Any

class CarryingCapacityService:
    @staticmethod
    def evaluate_site_capacity(site: Dict[str, Any]) -> Dict[str, Any]:
        land_area = site.get("land_area", 40.0)  # hectares
        avail_area = site.get("available_area", 30.0)
        current_pop = site.get("current_population", 1000)

        # Capacity metrics computation
        # Land capacity: ~200 people per available hectare
        land_cap = int(avail_area * 220)
        # Water capacity: based on environmental & infrastructure score
        water_cap = int(land_cap * (site.get("environmental_score", 85.0) / 100.0) * 1.05)
        # Infrastructure capacity (healthcare, housing, sanitation)
        infra_cap = int(land_cap * (site.get("infrastructure_score", 80.0) / 100.0))
        # Environmental boundary capacity
        env_cap = int(land_cap * (site.get("safety_score", 90.0) / 100.0))

        # Recommended sustainable capacity is the bottleneck (minimum)
        sustainable_capacity = min(land_cap, water_cap, infra_cap, env_cap)
        available_capacity = max(0, sustainable_capacity - current_pop)
        utilization_pct = round((current_pop / max(1, sustainable_capacity)) * 100, 1)

        status = "OPTIMAL"
        if utilization_pct > 90:
            status = "CRITICAL_CAPACITY"
        elif utilization_pct > 75:
            status = "HIGH_UTILIZATION"

        return {
            "site_id": site.get("id"),
            "site_name": site.get("name"),
            "land_area_ha": land_area,
            "usable_area_ha": avail_area,
            "land_capacity": land_cap,
            "water_capacity": water_cap,
            "infrastructure_capacity": infra_cap,
            "environmental_capacity": env_cap,
            "recommended_sustainable_capacity": sustainable_capacity,
            "current_population": current_pop,
            "available_capacity": available_capacity,
            "utilization_percentage": utilization_pct,
            "capacity_status": status,
            "breakdown": {
                "Land": land_cap,
                "Water Supply": water_cap,
                "Infrastructure & Health": infra_cap,
                "Environmental Bounds": env_cap
            }
        }

capacity_service = CarryingCapacityService()
