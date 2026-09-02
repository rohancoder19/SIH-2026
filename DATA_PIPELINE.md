# SurakshitSthan AI — Data Ingestion & Scraper Pipeline

## 1. Multi-Hazard Ingestion Architecture

SurakshitSthan AI connects directly to primary live hazard feeds:

1. **USGS Earthquake Hazards Program**: Live GeoJSON feed for global seismic events.
2. **Global Disaster Alert & Coordination System (GDACS)**: RSS XML alerts for tropical cyclones, floods, and droughts.
3. **National Disaster Management Authority (NDMA)**: Government official advisories for landslides, cloudbursts, and coastal erosion.
4. **Central Water Commission (CWC)**: Hydrological river level sensors & flood warning stations.

---

## 2. Confidence Scoring Matrix

Every disaster data source is assigned an official confidence weight:

* **Official Government Sources (NDMA, CWC)**: `0.95 – 0.98`
* **Global Monitoring Agencies (USGS, GDACS)**: `0.90 – 0.92`
* **Public / Crowdsourced Feeds**: `0.70 – 0.80`

---

## 3. Deduplication Algorithm

The pipeline executes geodesic distance deduplication:
* Distance formula: Haversine geodesic calculation.
* Proximity threshold: `50.0 km`.
* Duplicate resolution rule: When two events of the same hazard type fall within 50 km, the record with the higher confidence score is preserved.
