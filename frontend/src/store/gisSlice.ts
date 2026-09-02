import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GISState {
  baseLayer: 'openstreetmap' | 'satellite' | 'terrain';
  layers: {
    flood: boolean;
    landslide: boolean;
    earthquake: boolean;
    multiHazard: boolean;
    habitations: boolean;
    relocationSites: boolean;
    evacuationRoutes: boolean;
    infrastructure: boolean;
  };
  selectedHabitationId: number | null;
  selectedSiteId: number | null;
  mapCenter: [number, number]; // [lat, lng]
  zoomLevel: number;
}

const initialState: GISState = {
  baseLayer: 'satellite',
  layers: {
    flood: true,
    landslide: true,
    earthquake: true,
    multiHazard: true,
    habitations: true,
    relocationSites: true,
    evacuationRoutes: true,
    infrastructure: false,
  },
  selectedHabitationId: 1, // Default Mirik Basti Lower
  selectedSiteId: null,
  mapCenter: [26.98, 88.35], // Darjeeling/Kalimpong region center
  zoomLevel: 11,
};

const gisSlice = createSlice({
  name: 'gis',
  initialState,
  reducers: {
    setBaseLayer: (state, action: PayloadAction<'openstreetmap' | 'satellite' | 'terrain'>) => {
      state.baseLayer = action.payload;
    },
    toggleLayer: (state, action: PayloadAction<keyof GISState['layers']>) => {
      state.layers[action.payload] = !state.layers[action.payload];
    },
    setSelectedHabitation: (state, action: PayloadAction<number | null>) => {
      state.selectedHabitationId = action.payload;
    },
    setSelectedSite: (state, action: PayloadAction<number | null>) => {
      state.selectedSiteId = action.payload;
    },
    flyToLocation: (state, action: PayloadAction<{ center: [number, number]; zoom?: number }>) => {
      state.mapCenter = action.payload.center;
      if (action.payload.zoom) state.zoomLevel = action.payload.zoom;
    },
  },
});

export const { setBaseLayer, toggleLayer, setSelectedHabitation, setSelectedSite, flyToLocation } = gisSlice.actions;
export default gisSlice.reducer;
