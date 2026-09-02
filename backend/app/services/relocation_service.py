from typing import List, Dict, Any
from app.gis.pipeline import haversine_distance

class RelocationRecommendationService:
    @staticmethod
    def calculate_site_recommendations(habitation: Dict[str, Any], relocation_sites: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        hab_lat = habitation["latitude"]
        hab_lng = habitation["longitude"]
        vuln_pop = habitation.get("vulnerable_population", 500)

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
                "recommendation_reason": f"High safety rating ({safety}/100) and capacity buffer ({available_cap} seats) located {dist_km} km away."
            })

        # Sort by overall score descending
        ranked_sites.sort(key=lambda x: x["overall_score"], reverse=True)
        return ranked_sites

    @staticmethod
    def simulate_multi_site_relocation(habitations: List[Dict[str, Any]], relocation_sites: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Simulates multi-site relocation allocation across habitations with capacity deficit tracking.
        """
        # Create copies of available capacities to track live allocation
        site_capacities = {
            s["id"]: max(0, s.get("population_capacity", 5000) - s.get("current_population", 0))
            for s in relocation_sites
        }
        site_map = {s["id"]: s for s in relocation_sites}

        total_vulnerable_citizens = sum(h.get("vulnerable_population", 0) for h in habitations)
        total_allocated_citizens = 0
        allocations = []

        # Process habitations in priority order: IMMEDIATE > SHORT_TERM > MEDIUM_TERM
        priority_order = {"IMMEDIATE": 1, "SHORT_TERM": 2, "MEDIUM_TERM": 3, "MONITOR": 4}
        sorted_habs = sorted(habitations, key=lambda h: (priority_order.get(h.get("relocation_priority", "SHORT_TERM"), 3), -h.get("hazard_score", 50)))

        for hab in sorted_habs:
            needed = hab.get("vulnerable_population", 0)
            remaining_needed = needed
            hab_allocations = []

            # Find candidate sites sorted by MCDA score for this habitation
            rec_sites = RelocationRecommendationService.calculate_site_recommendations(hab, relocation_sites)

            for rec in rec_sites:
                if remaining_needed <= 0:
                    break
                sid = rec["site_id"]
                avail = site_capacities.get(sid, 0)
                if avail <= 0:
                    continue

                alloc_count = min(remaining_needed, avail)
                site_capacities[sid] -= alloc_count
                remaining_needed -= alloc_count
                total_allocated_citizens += alloc_count

                hab_allocations.append({
                    "site_id": sid,
                    "site_name": rec["site_name"],
                    "allocated_people": alloc_count,
                    "distance_km": rec["distance_km"],
                    "remaining_site_capacity": site_capacities[sid]
                })

            allocations.append({
                "habitation_id": hab["id"],
                "habitation_name": hab["name"],
                "relocation_priority": hab.get("relocation_priority", "SHORT_TERM"),
                "total_vulnerable_population": needed,
                "fully_sheltered": remaining_needed == 0,
                "unallocated_citizens": remaining_needed,
                "allocations": hab_allocations
            })

        total_deficit = total_vulnerable_citizens - total_allocated_citizens

        return {
            "total_vulnerable_citizens": total_vulnerable_citizens,
            "total_allocated_citizens": total_allocated_citizens,
            "capacity_deficit": max(0, total_deficit),
            "allocation_percentage": round((total_allocated_citizens / max(1, total_vulnerable_citizens)) * 100.0, 1),
            "habitation_allocations": allocations,
            "site_capacity_remaining": [
                {
                    "site_id": sid,
                    "site_name": site_map[sid]["name"],
                    "original_available_capacity": max(0, site_map[sid].get("population_capacity", 5000) - site_map[sid].get("current_population", 0)),
                    "remaining_capacity": cap
                }
                for sid, cap in site_capacities.items()
            ]
        }

relocation_service = RelocationRecommendationService()
