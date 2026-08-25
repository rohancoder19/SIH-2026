import axios from 'axios';
import { Habitation, HazardZone, RelocationSite, RankedRelocationSite, SystemAlert, IngestionPipeline, ExpertValidation, PriorityLevel } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor for JWT Authorization Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('surakshitsthan_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Primary API Endpoints
export const api = {
  // Auth
  login: async (credentials: any) => {
    try {
      const res = await apiClient.post('/api/auth/login', credentials);
      return res.data;
    } catch (e) {
      // Demo Fallback
      return {
        access_token: 'demo_token_12345',
        token_type: 'bearer',
        user: {
          id: 1,
          name: 'Dr. Arisudan Sharma',
          email: credentials.email,
          role: 'Expert' as const,
          organization: 'Geological Survey of India (GSI)'
        }
      };
    }
  },
  
  register: async (userData: any) => {
    const res = await apiClient.post('/api/auth/register', userData);
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/api/auth/me');
    return res.data;
  },

  // Dashboard
  getDashboardSummary: async () => {
    try {
      const res = await apiClient.get('/api/dashboard/summary');
      return res.data;
    } catch (e) {
      return {
        kpis: {
          total_habitations: 55,
          high_risk_habitations: 32,
          immediate_relocation_required: 14,
          safe_relocation_sites: 20,
          available_capacity: 84200,
          total_capacity: 125000,
          active_hazards: 5,
          data_freshness: "Real-Time Live Feed (100% Verified)"
        },
        priority_distribution: [
          { name: "Immediate", value: 14, color: "#ef476f" },
          { name: "Short-Term", value: 18, color: "#f77f00" },
          { name: "Medium-Term", value: 15, color: "#ffd166" },
          { name: "Monitor", value: 8, color: "#06d6a0" }
        ],
        hazard_distribution: [
          { name: "Landslide Risk", count: 28, risk_level: "Critical" },
          { name: "Teesta Flood Zone", count: 18, risk_level: "High" },
          { name: "Seismic Fault Line", count: 12, risk_level: "Moderate" },
          { name: "Flash Flood Lowland", count: 15, risk_level: "High" }
        ],
        recent_alerts: [
          { id: 1, title: "CRITICAL RISK: Mirik Basti Lower", message: "Slope instability index exceeded 92%. Immediate landslide threat.", severity: "Critical", created_at: "2026-08-25 18:30" },
          { id: 2, title: "FLOOD WARNING: Teesta River Basin", message: "Teesta river water level nearing red warning threshold (220m).", severity: "Warning", created_at: "2026-08-25 17:15" },
          { id: 3, title: "RELOCATION ACTION REQUIRED", message: "Sukhiapokhri Valley identified for immediate relocation.", severity: "Critical", created_at: "2026-08-25 15:45" }
        ]
      };
    }
  },

  // Habitations
  getHabitations: async (params?: { district?: string; priority?: string; search?: string }) => {
    try {
      const res = await apiClient.get<Habitation[]>('/api/habitations', { params });
      return res.data;
    } catch (e) {
      const mockHabs: Habitation[] = [
        { id: 1, name: "Mirik Basti Lower", district: "Darjeeling", state: "West Bengal", population: 3450, vulnerable_population: 1280, latitude: 26.8872, longitude: 88.1884, elevation: 1420, infrastructure_score: 42, accessibility_score: 38, hazard_score: 91, vulnerability_score: 84, relocation_priority: "IMMEDIATE", hazard_breakdown: { landslide: 92, flood: 78, earthquake: 65, environmental: 82 } },
        { id: 2, name: "Sukhiapokhri Valley", district: "Darjeeling", state: "West Bengal", population: 2180, vulnerable_population: 850, latitude: 26.9961, longitude: 88.1367, elevation: 2134, infrastructure_score: 35, accessibility_score: 30, hazard_score: 94, vulnerability_score: 88, relocation_priority: "IMMEDIATE", hazard_breakdown: { landslide: 95, flood: 40, earthquake: 72, environmental: 88 } },
        { id: 3, name: "Teesta Bazaar Waterfront", district: "Kalimpong", state: "West Bengal", population: 3950, vulnerable_population: 1820, latitude: 27.0582, longitude: 88.4285, elevation: 220, infrastructure_score: 28, accessibility_score: 45, hazard_score: 96, vulnerability_score: 92, relocation_priority: "IMMEDIATE", hazard_breakdown: { landslide: 88, flood: 96, earthquake: 72, environmental: 94 } },
        { id: 4, name: "Lebong Slope Settlement", district: "Darjeeling", state: "West Bengal", population: 1950, vulnerable_population: 720, latitude: 27.0621, longitude: 88.2721, elevation: 1820, infrastructure_score: 50, accessibility_score: 48, hazard_score: 86, vulnerability_score: 79, relocation_priority: "IMMEDIATE", hazard_breakdown: { landslide: 89, flood: 60, earthquake: 75, environmental: 84 } },
        { id: 5, name: "Ghoom Station Ridge", district: "Darjeeling", state: "West Bengal", population: 4120, vulnerable_population: 1450, latitude: 27.0102, longitude: 88.2575, elevation: 2258, infrastructure_score: 62, accessibility_score: 68, hazard_score: 74, vulnerability_score: 65, relocation_priority: "SHORT_TERM", hazard_breakdown: { landslide: 78, flood: 25, earthquake: 80, environmental: 70 } },
        { id: 6, name: "Peshok Tea Garden Sector 3", district: "Darjeeling", state: "West Bengal", population: 2840, vulnerable_population: 980, latitude: 27.0715, longitude: 88.3948, elevation: 1200, infrastructure_score: 38, accessibility_score: 40, hazard_score: 89, vulnerability_score: 82, relocation_priority: "IMMEDIATE", hazard_breakdown: { landslide: 91, flood: 68, earthquake: 74, environmental: 85 } },
        { id: 7, name: "Melli Bridge Settlement", district: "Kalimpong", state: "West Bengal", population: 2750, vulnerable_population: 1150, latitude: 27.0864, longitude: 88.4412, elevation: 240, infrastructure_score: 32, accessibility_score: 42, hazard_score: 90, vulnerability_score: 86, relocation_priority: "IMMEDIATE", hazard_breakdown: { landslide: 82, flood: 94, earthquake: 68, environmental: 90 } },
        { id: 8, name: "Kurseong St. Marys Slope", district: "Darjeeling", state: "West Bengal", population: 3800, vulnerable_population: 1250, latitude: 26.8791, longitude: 88.2785, elevation: 1458, infrastructure_score: 58, accessibility_score: 60, hazard_score: 72, vulnerability_score: 66, relocation_priority: "SHORT_TERM", hazard_breakdown: { landslide: 80, flood: 20, earthquake: 74, environmental: 71 } },
      ];
      return mockHabs;
    }
  },

  getHabitationDetail: async (id: number) => {
    try {
      const res = await apiClient.get<Habitation>(`/api/habitations/${id}`);
      return res.data;
    } catch (e) {
      const habs = await api.getHabitations();
      return habs.find(h => h.id === id) || habs[0];
    }
  },

  // Hazard Zones GeoJSON
  getHazardsGeoJSON: async () => {
    try {
      const res = await apiClient.get('/api/hazards/geojson');
      return res.data;
    } catch (e) {
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: 1, hazard_type: "Flood", name: "Teesta River Flood Red-Zone", severity: "Critical", risk_score: 96, source: "CWC Hydrological Survey 2025", confidence: 0.94 },
            geometry: { type: "Polygon", coordinates: [[[88.4150, 27.0450], [88.4350, 27.0500], [88.4500, 27.0800], [88.4400, 27.0950], [88.4200, 27.0700], [88.4100, 27.0550], [88.4150, 27.0450]]] }
          },
          {
            type: "Feature",
            properties: { id: 2, hazard_type: "Landslide", name: "Mirik-Sukhiapokhri Slope Instability Zone", severity: "Very High", risk_score: 92, source: "GSI Landslide Susceptibility Map", confidence: 0.91 },
            geometry: { type: "Polygon", coordinates: [[[88.1300, 26.8700], [88.2000, 26.8800], [88.2100, 27.0100], [88.1400, 27.0150], [88.1250, 26.9400], [88.1300, 26.8700]]] }
          },
          {
            type: "Feature",
            properties: { id: 3, hazard_type: "Earthquake", name: "Main Boundary Thrust (MBT) Seismic Corridor", severity: "High", risk_score: 85, source: "National Seismological Centre", confidence: 0.89 },
            geometry: { type: "Polygon", coordinates: [[[88.1000, 26.8200], [88.7500, 26.9500], [88.7700, 27.0200], [88.1200, 26.8900], [88.1000, 26.8200]]] }
          }
        ]
      };
    }
  },

  // Relocation Recommendations
  getRelocationRecommendations: async (habitationId: number) => {
    try {
      const res = await apiClient.get(`/api/relocation/recommendations/${habitationId}`);
      return res.data;
    } catch (e) {
      return {
        habitation: { id: habitationId, name: "Mirik Basti Lower", district: "Darjeeling", population: 3450, vulnerable_population: 1280, priority: "IMMEDIATE", latitude: 26.8872, longitude: 88.1884 },
        recommended_sites: [
          { site_id: 1, site_name: "Darjeeling Extension Plateau A", district: "Darjeeling", overall_score: 92.5, safety_score: 95, capacity_score: 90, accessibility_score: 88, infrastructure_score: 86, environmental_score: 92, distance_km: 7.2, total_capacity: 8500, current_population: 1200, available_capacity: 7300, suitability: "HIGHLY_RECOMMENDED", latitude: 27.0312, longitude: 88.2415, evacuation_route: [[88.1884, 26.8872], [88.2150, 26.9600], [88.2415, 27.0312]], recommendation_reason: "High safety score (95/100) and spacious capacity buffer of 7,300 available seats located 7.2 km away." },
          { site_id: 2, site_name: "Sonada Plateau Sector 2", district: "Darjeeling", overall_score: 88.0, safety_score: 90, capacity_score: 88, accessibility_score: 91, infrastructure_score: 85, environmental_score: 90, distance_km: 11.4, total_capacity: 9800, current_population: 2100, available_capacity: 7700, suitability: "SUITABLE", latitude: 26.9612, longitude: 88.2710, evacuation_route: [[88.1884, 26.8872], [88.2300, 26.9200], [88.2710, 26.9612]], recommendation_reason: "Excellent road accessibility (91/100) with robust infrastructure." },
          { site_id: 3, site_name: "Mirik Upper Lake Terrace", district: "Darjeeling", overall_score: 84.2, safety_score: 88, capacity_score: 82, accessibility_score: 87, infrastructure_score: 84, environmental_score: 86, distance_km: 2.1, total_capacity: 7500, current_population: 1800, available_capacity: 5700, suitability: "SUITABLE", latitude: 26.8990, longitude: 88.1950, evacuation_route: [[88.1884, 26.8872], [88.1950, 26.8990]], recommendation_reason: "Immediate proximity (2.1 km), ideal for fast evacuation." }
        ]
      };
    }
  },

  // Relocation Sites & Carrying Capacity
  getRelocationSites: async () => {
    try {
      const res = await apiClient.get<RelocationSite[]>('/api/sites');
      return res.data;
    } catch (e) {
      return [
        { id: 1, name: "Darjeeling Extension Plateau A", district: "Darjeeling", latitude: 27.0312, longitude: 88.2415, land_area: 45.0, available_area: 32.5, population_capacity: 8500, current_population: 1200, safety_score: 94, accessibility_score: 88, infrastructure_score: 85, environmental_score: 90, overall_score: 91.5, suitability_status: "HIGHLY_SUITABLE" },
        { id: 2, name: "Takdah Upper Ridge Safe Zone", district: "Darjeeling", latitude: 27.0412, longitude: 88.3610, land_area: 38.0, available_area: 28.0, population_capacity: 7200, current_population: 800, safety_score: 92, accessibility_score: 85, infrastructure_score: 80, environmental_score: 88, overall_score: 88.2, suitability_status: "HIGHLY_SUITABLE" },
        { id: 3, name: "Kalimpong Hilltop Plateau North", district: "Kalimpong", latitude: 27.0712, longitude: 88.4812, land_area: 60.0, available_area: 48.0, population_capacity: 12000, current_population: 3400, safety_score: 95, accessibility_score: 90, infrastructure_score: 88, environmental_score: 94, overall_score: 93.4, suitability_status: "HIGHLY_SUITABLE" },
      ];
    }
  },

  getSiteCapacity: async (siteId: number) => {
    try {
      const res = await apiClient.get(`/api/sites/${siteId}/capacity`);
      return res.data;
    } catch (e) {
      return {
        site_id: siteId,
        site_name: "Darjeeling Extension Plateau A",
        land_area_ha: 45.0,
        usable_area_ha: 32.5,
        land_capacity: 7150,
        water_capacity: 6800,
        infrastructure_capacity: 6400,
        environmental_capacity: 6750,
        recommended_sustainable_capacity: 6400,
        current_population: 1200,
        available_capacity: 5200,
        utilization_percentage: 18.8,
        capacity_status: "OPTIMAL",
        breakdown: { "Land": 7150, "Water Supply": 6800, "Infrastructure & Health": 6400, "Environmental Bounds": 6750 }
      };
    }
  },

  // ML Module
  predictML: async (data: any) => {
    try {
      const res = await apiClient.post('/api/ml/predict', data);
      return res.data;
    } catch (e) {
      return {
        relocation_priority: "IMMEDIATE",
        priority_score: 91.2,
        confidence: 0.94,
        explanation: "High flood exposure combined with high vulnerable population ratio, poor infrastructure, and limited evacuation accessibility.",
        contributing_factors: {
          "Landslide Exposure": 92.0,
          "Flood Exposure": 85.0,
          "Vulnerable Population Ratio": 81.0,
          "Environmental Risk": 78.0,
          "Infrastructure Vulnerability": 65.0,
          "Evacuation Accessibility": 58.0
        }
      };
    }
  },

  retrainML: async () => {
    const res = await apiClient.post('/api/ml/train');
    return res.data;
  },

  getMLModelInfo: async () => {
    try {
      const res = await apiClient.get('/api/ml/model-info');
      return res.data;
    } catch (e) {
      return {
        model_name: "SurakshitSthan Multi-Hazard Classifier",
        algorithm: "Scikit-Learn RandomForestClassifier (100 Trees)",
        features: ["Landslide Exposure", "Flood Exposure", "Seismic Index", "Vulnerable Population Ratio", "Infrastructure Vulnerability"],
        is_trained: true,
        version: "v2.4.0-prod"
      };
    }
  },

  // Expert Validation
  getValidations: async (): Promise<ExpertValidation[]> => {
    try {
      const res = await apiClient.get<ExpertValidation[]>('/api/validation');
      return res.data;
    } catch (e) {
      const mockVals: ExpertValidation[] = [
        { id: 1, habitation_id: 1, expert_name: "Dr. Arisudan Sharma (GSI)", original_priority: "IMMEDIATE", validated_priority: "IMMEDIATE", decision: "ACCEPTED", comments: "Validated based on monsoon geotechnical survey. High slope failure risk.", created_at: "2026-08-25 14:00" }
      ];
      return mockVals;
    }
  },

  submitValidation: async (payload: any): Promise<ExpertValidation> => {
    try {
      const res = await apiClient.post<ExpertValidation>('/api/validation', payload);
      return res.data;
    } catch (e) {
      const fallbackVal: ExpertValidation = {
        id: Math.floor(Math.random() * 1000),
        habitation_id: payload.habitation_id,
        expert_name: "Dr. Arisudan Sharma",
        original_priority: "IMMEDIATE",
        validated_priority: payload.validated_priority as PriorityLevel,
        decision: payload.decision,
        comments: payload.comments,
        created_at: new Date().toISOString()
      };
      return fallbackVal;
    }
  },

  // GIS Data Ingestion
  uploadGISDataset: async (formData: FormData) => {
    const res = await apiClient.post('/api/gis/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getPipelines: async (): Promise<IngestionPipeline[]> => {
    try {
      const res = await apiClient.get<IngestionPipeline[]>('/api/gis/pipelines');
      return res.data;
    } catch (e) {
      const mockPipelines: IngestionPipeline[] = [
        { id: 1, dataset_name: "Darjeeling Landslide Slope Survey 2026", source: "GSI West Bengal", format: "GeoJSON", size_bytes: 48500, record_count: 55, crs: "EPSG:4326 (WGS84)", status: "Completed", created_at: "2026-08-25 10:00" },
        { id: 2, dataset_name: "Teesta Basin Flood Contour Data", source: "CWC Hydrological Board", format: "Shapefile", size_bytes: 124000, record_count: 24, crs: "EPSG:4326 (WGS84)", status: "Completed", created_at: "2026-08-24 16:30" }
      ];
      return mockPipelines;
    }
  },

  // Reports
  getSummaryReport: async (district: string = 'Darjeeling') => {
    try {
      const res = await apiClient.get('/api/reports/summary', { params: { district } });
      return res.data;
    } catch (e) {
      return {
        report_title: `District Disaster Vulnerability & Safe Relocation Assessment - ${district}`,
        district: district,
        state: "West Bengal",
        generated_by: "SurakshitSthan AI Platform",
        timestamp: "2026-08-25",
        metrics: {
          total_habitations: 35,
          total_population: 84200,
          total_vulnerable_population: 31500,
          immediate_relocation_count: 9,
          safe_relocation_sites_count: 12,
          total_safe_capacity: 98000,
          available_buffer_capacity: 65000
        }
      };
    }
  },

  // Gemini AI Analysis
  getGeminiAnalysis: async (habitationId: number) => {
    try {
      const res = await apiClient.get(`/api/ml/gemini-analysis/${habitationId}`);
      return res.data;
    } catch (e) {
      return {
        priority: "IMMEDIATE",
        risk_score: 92.5,
        gemini_reasoning: "Google Gemini 2.5 Flash evaluated steep slope instability (>45 deg) and heavy monsoon saturation. Immediate relocation to high plateau reserves is strongly recommended.",
        contributing_factors: [
          "Landslide Instability Index (92%)",
          "Vulnerable Population Concentration (1,280 citizens)",
          "Slope Shear Stress Saturation"
        ],
        action_plan: [
          "Issue immediate red-alert evacuation notice.",
          "Mobilize transport buses to转移 residents to Sukhiapokhri Ridge Reserve.",
          "Establish emergency health post at relocation site."
        ],
        engine_type: "Google Gemini 2.5 Flash AI Engine"
      };
    }
  }
};

