from typing import List, Dict, Any
from app.gis.pipeline import haversine_distance

class RelocationRecommendationService:
    @staticmethod
    def calculate_site_recommendations(habitation: Dict[str, Any], relocation_sites: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        hab_lat = habitation["latitude"]
        hab_lng = habitation["longitude"]

        ranked_sites = []

        for site in relocation_sites:
            site_lat = site["latitude"]
            site_lng = site["longitude"]
            dist_km = haversine_distance(hab_lat, hab_lng, site_lat, site_lng)

            # Available land area
            avail_area = site.get("available_area", 20.0)

            # Scoring factors
            safety = site.get("safety_score", 90.0)
            area_score = min(100.0, avail_area * 3.0)
            accessibility = site.get("accessibility_score", 85.0)
            infra = site.get("infrastructure_score", 80.0)
            env = site.get("environmental_score", 88.0)
            distance_score = max(0.0, 100.0 - (dist_km * 4.0))  # Closer is better

            # Multi-Criteria Decision Analysis (MCDA) Weights:
            # Safety: 35%, Accessibility: 20%, Infrastructure: 20%, Environmental: 15%, Distance: 10%
            overall_score = round(
                (safety * 0.35) +
                (accessibility * 0.20) +
                (infra * 0.20) +
                (env * 0.15) +
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
                "area_score": round(area_score, 1),
                "accessibility_score": accessibility,
                "infrastructure_score": infra,
                "environmental_score": env,
                "distance_km": dist_km,
                "available_area": avail_area,
                "suitability": suitability,
                "latitude": site_lat,
                "longitude": site_lng,
                "evacuation_route": route_coords,
                "recommendation_reason": f"High safety rating ({safety}/100) and available land area ({avail_area} ha) located {dist_km} km away."
            })

        # Sort by overall score descending
        ranked_sites.sort(key=lambda x: x["overall_score"], reverse=True)
        return ranked_sites

    @staticmethod
    def simulate_multi_site_relocation(habitations: List[Dict[str, Any]], relocation_sites: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Simulates multi-site spatial allocation across habitations based on proximity and safety ratings.
        """
        allocations = []
        for hab in habitations:
            rec_sites = RelocationRecommendationService.calculate_site_recommendations(hab, relocation_sites)
            allocations.append({
                "habitation_id": hab["id"],
                "habitation_name": hab["name"],
                "relocation_priority": hab.get("relocation_priority", "SHORT_TERM"),
                "recommended_site": rec_sites[0] if rec_sites else None
            })

        return {
            "total_habitations": len(habitations),
            "allocated_sites_count": len(relocation_sites),
            "habitation_allocations": allocations
        }

relocation_service = RelocationRecommendationService()
