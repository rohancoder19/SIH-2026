export type PriorityLevel = 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'MONITOR';

export type UserRole = 'Admin' | 'Disaster Authority' | 'Analyst' | 'Expert' | 'Viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
}

export interface HazardBreakdown {
  landslide: number;
  flood: number;
  earthquake: number;
  environmental: number;
}

export interface Habitation {
  id: number;
  name: string;
  district: string;
  state: string;
  population: number;
  vulnerable_population: number;
  latitude: number;
  longitude: number;
  geometry_json?: any;
  elevation: number;
  infrastructure_score: number;
  accessibility_score: number;
  hazard_score: number;
  vulnerability_score: number;
  relocation_priority: PriorityLevel;
  hazard_breakdown?: HazardBreakdown;
  created_at?: string;
}

export interface HazardZone {
  id: number;
  hazard_type: string;
  name?: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Critical';
  risk_score: number;
  geometry_json: any;
  source: string;
  confidence: number;
  updated_at?: string;
}

export interface RelocationSite {
  id: number;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  geometry_json?: any;
  land_area: number;
  available_area: number;
  population_capacity: number;
  current_population: number;
  safety_score: number;
  accessibility_score: number;
  infrastructure_score: number;
  environmental_score: number;
  overall_score: number;
  suitability_status: string;
}

export interface RankedRelocationSite {
  site_id: number;
  site_name: string;
  district: string;
  overall_score: number;
  safety_score: number;
  capacity_score: number;
  accessibility_score: number;
  infrastructure_score: number;
  environmental_score: number;
  distance_km: number;
  total_capacity: number;
  current_population: number;
  available_capacity: number;
  suitability: string;
  latitude: number;
  longitude: number;
  evacuation_route: [number, number][];
  recommendation_reason: string;
}

export interface SystemAlert {
  id: number;
  title: string;
  message: string;
  severity: 'Critical' | 'Warning' | 'Info';
  created_at: string;
}

export interface IngestionPipeline {
  id: number;
  dataset_name: string;
  source: string;
  format: string;
  size_bytes: number;
  record_count: number;
  crs: string;
  status: string;
  created_at: string;
}

export interface ExpertValidation {
  id: number;
  habitation_id: number;
  expert_name: string;
  original_priority: PriorityLevel;
  validated_priority: PriorityLevel;
  decision: 'ACCEPTED' | 'REJECTED' | 'MODIFIED';
  comments?: string;
  created_at: string;
}



export interface SourceAttribution {
  name: string;
  url: string;
  type: string;
}

export interface ScrapedHazardRecord {
  id: number;
  hazard_type: string;
  name: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Critical';
  risk_score: number;
  source: string;
  confidence: number;
  extracted_at?: string;
  geometry_json?: any;
}

export interface LiveScraperStatus {
  status: 'live' | 'scraping' | 'failed' | 'idle' | string;
  last_successful_run: string | null;
  cache_age: string;
  cache_age_seconds: number;
  records_fetched: number;
  active_hazards_by_type: Record<string, number>;
  source_urls: string[];
  is_fresh: boolean;
  error_logs: string[];
  pipeline_latency_ms: number;
  history_logs?: Array<{ timestamp: string; records_fetched: number; latency_ms: number; status: string }>;
}


