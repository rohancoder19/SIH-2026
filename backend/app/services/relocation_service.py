from typing import List, Dict, Any
from app.gis.pipeline import haversine_distance

class RelocationRecommendationService:
    @staticmethod
    def calculate_site_recommendations(habitation: Dict[str, Any], relocation_sites: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        hab_lat = habitation["latitude"]
        hab_lng = habitation["longitude"]
        vuln_pop = habitation["vulnerable_population"]

        ranked_sites = []

        for site in relocation_sites:
            site_lat = site["latitude"]
            site_lng = site["longitude"]
            dist_km = haversine_distance(hab_lat, hab_lng, site_lat, site_lng)

            # Available capacity check
            current_pop = site.get("current_population", 0)
            capacity = site.get("population_capacity", 5000)
            available_cap = max(0, capacity - current_pop)

            # Scoring factors
            safety = site.get("safety_score", 90.0)
            capacity_score = min(100.0, (available_cap / max(1, vuln_pop)) * 50.0)
            accessibility = site.get("accessibility_score", 85.0)
            infra = site.get("infrastructure_score", 80.0)
            env = site.get("environmental_score", 88.0)
            distance_score = max(0.0, 100.0 - (dist_km * 4.0))  # Closer is better

            # Multi-Criteria Decision Analysis (MCDA) Weights:
            # Safety: 30%, Carrying Capacity: 20%, Accessibility: 15%, Infrastructure: 15%, Environmental: 10%, Distance: 10%
            overall_score = round(
                (safety * 0.30) +
                (capacity_score * 0.20) +
                (accessibility * 0.15) +
                (infra * 0.15) +
                (env * 0.10) +
                (distance_score * 0.10),
                1
            )

            # Generate evacuation route coordinates
            route_coords = [
                [hab_lng, hab_lat],
                [round((hab_lng + site_lng) / 2, 4), round((hab_lat + site_lat) / 2, 4)],
                [site_lng, site_lat]
            ]

            suitability = "HIGHLY_RECOMMENDED" if overall_score >= 85 else ("SUITABLE" if overall_score >= 75 else "MODERATE")

            ranked_sites.append({
                "site_id": site["id"],
                "site_name": site["name"],
                "district": site.get("district", "Darjeeling"),
                "overall_score": overall_score,
                "safety_score": safety,
                "capacity_score": round(capacity_score, 1),
                "accessibility_score": accessibility,
                "infrastructure_score": infra,
                "environmental_score": env,
                "distance_km": dist_km,
                "total_capacity": capacity,
                "current_population": current_pop,
                "available_capacity": available_cap,
                "suitability": suitability,
                "latitude": site_lat,
                "longitude": site_lng,
                "evacuation_route": route_coords,
                "recommendation_reason": f"High safety rating ({safety}/100) and sufficient capacity buffer ({available_cap} available seats) located {dist_km} km away."
            })

        # Sort by overall score descending
        ranked_sites.sort(key=lambda x: x["overall_score"], reverse=True)
        return ranked_sites

relocation_service = RelocationRecommendationService()
