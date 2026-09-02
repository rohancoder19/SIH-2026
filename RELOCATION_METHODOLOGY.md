# SurakshitSthan AI — Carrying Capacity & Safe Relocation Methodology

## 1. Multi-Criteria Decision Analysis (MCDA)

Candidate relocation sites are evaluated using weighted Multi-Criteria Decision Analysis:

$$\text{Suitability Score} = (S \times 0.30) + (C \times 0.20) + (A \times 0.15) + (I \times 0.15) + (E \times 0.10) + (D \times 0.10)$$

Where:
- $S$: Safety Score (Geotechnical & Hazard Immunity)
- $C$: Available Carrying Capacity Score
- $A$: Accessibility & Road Transport Infrastructure Score
- $I$: Infrastructure Readiness (Healthcare, Water, Power)
- $E$: Environmental Carrying Capacity
- $D$: Proximity / Geodesic Distance Score

---

## 2. Multi-Site Carrying Capacity Allocation & Deficit Tracking

Displaced populations are allocated across candidate high-plateau sites:
- **Priority Queue**: `IMMEDIATE` habitations are processed first, followed by `SHORT_TERM` and `MEDIUM_TERM`.
- **Bottleneck Capacity**: Site carrying capacity is determined by the minimum threshold of land, water supply, and health infrastructure.
- **Deficit Tracking**: Unallocated citizens exceeding regional safe site capacity are calculated as `capacity_deficit` to signal the need for emergency relief centers.
