from typing import Dict, Any, List

class MultiHazardExplainabilityEngine:
    """
    Deterministic Explainable AI (XAI) Engine:
    Calculates statistical feature contributions & feature importances for hazard risk scores.
    """
    def __init__(self):
        self.default_weights = {
            "rainfall": 0.31,
            "slope": 0.24,
            "seismic_history": 0.21,
            "river_proximity": 0.14,
            "elevation": 0.10
        }

    def compute_feature_attribution(self, hazard_breakdown: Dict[str, float], overall_risk: float) -> List[Dict[str, Any]]:
        """
        Computes normalized feature contribution weights and percentage influence for habitations.
        """
        landslide = hazard_breakdown.get("landslide", 50.0)
        flood = hazard_breakdown.get("flood", 50.0)
        earthquake = hazard_breakdown.get("earthquake", 50.0)
        environmental = hazard_breakdown.get("environmental", 50.0)

        raw_factors = [
            {"factor": "Heavy Rainfall & Soil Saturation", "key": "rainfall", "val": flood * 0.9 + landslide * 0.2, "weight": 0.31},
            {"factor": "Steep Slope & Geotechnical Shear Instability", "key": "slope", "val": landslide * 0.95, "weight": 0.24},
            {"factor": "Historical Seismic & Tectonic Belt Activity", "key": "seismic", "val": earthquake * 0.90, "weight": 0.21},
            {"factor": "River & Hydrological Channel Proximity", "key": "river", "val": flood * 0.85, "weight": 0.14},
            {"factor": "Topographic Elevation & Deforestation Index", "key": "environmental", "val": environmental * 0.80, "weight": 0.10}
        ]

        # Calculate weighted contribution scores
        total_weighted_val = sum(item["val"] * item["weight"] for item in raw_factors) or 1.0

        attribution = []
        for item in raw_factors:
            contribution_pct = round(((item["val"] * item["weight"]) / total_weighted_val) * 100.0, 1)
            attribution.append({
                "factor_name": item["factor"],
                "raw_value": round(item["val"], 1),
                "model_weight": item["weight"],
                "contribution_percentage": contribution_pct,
                "impact_level": "HIGH" if contribution_pct >= 25.0 else ("MEDIUM" if contribution_pct >= 15.0 else "LOW")
            })

        attribution.sort(key=lambda x: x["contribution_percentage"], reverse=True)
        return attribution

xai_engine = MultiHazardExplainabilityEngine()
