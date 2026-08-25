import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setSelectedHabitation, setSelectedSite } from '../../store/gisSlice';
import { Habitation, RelocationSite, HazardZone, RankedRelocationSite } from '../../types';
import { Badge } from '../../components/Badge';
import { useNavigate } from 'react-router-dom';

// Custom SVG Leaflet Markers
const createCustomMarkerIcon = (color: string, label: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#0b132b" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="6" fill="#ffffff" opacity="0.9"/>
      <text x="12" y="15" font-size="9" font-weight="bold" fill="#0b132b" text-anchor="middle">${label}</text>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -36],
  });
};

const habIcons = {
  IMMEDIATE: createCustomMarkerIcon('#ef476f', '🔴'),
  SHORT_TERM: createCustomMarkerIcon('#f77f00', '🟠'),
  MEDIUM_TERM: createCustomMarkerIcon('#ffd166', '🟡'),
  MONITOR: createCustomMarkerIcon('#06d6a0', '🟢'),
};

const safeSiteIcon = L.divIcon({
  className: 'custom-safe-site-marker',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="44">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="#06d6a0" stroke="#ffffff" stroke-width="2"/>
      <polygon points="12,5 18,10 16,18 8,18 6,10" fill="#0b132b"/>
      <text x="12" y="15" font-size="8" font-weight="bold" fill="#06d6a0" text-anchor="middle">SAFE</text>
    </svg>
  `,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -38],
});

// Map Controller for Flying to Location
const MapFlyController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

interface GISMapComponentProps {
  habitations: Habitation[];
  relocationSites?: RelocationSite[];
  hazardZones?: HazardZone[];
  activeRoute?: [number, number][];
  onSelectHabitation?: (hab: Habitation) => void;
}

export const GISMapComponent: React.FC<GISMapComponentProps> = ({
  habitations,
  relocationSites = [],
  hazardZones = [],
  activeRoute,
  onSelectHabitation,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { baseLayer, layers, mapCenter, zoomLevel, selectedHabitationId } = useSelector((state: RootState) => state.gis);

  // Map Tile Urls
  const tileUrls = {
    openstreetmap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-navy-700/80">
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapFlyController center={mapCenter} zoom={zoomLevel} />
        
        {/* Base Tile Layer */}
        <TileLayer
          url={tileUrls[baseLayer]}
          attribution='&copy; <a href="https://surakshitsthan.gov.in">SurakshitSthan GIS Engine</a>'
        />

        {/* Hazard Red-Zone Polygons */}
        {layers.multiHazard && hazardZones.map((hz) => {
          if (!hz.geometry_json || !hz.geometry_json.coordinates) return null;
          const coords = hz.geometry_json.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]);
          
          let color = '#ef476f'; // Flood / Multi-hazard red
          if (hz.hazard_type === 'Landslide') color = '#f77f00';
          if (hz.hazard_type === 'Earthquake') color = '#ffd166';

          return (
            <Polygon
              key={`hazard-${hz.id}`}
              positions={coords}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.35,
                weight: 2,
                dashArray: '4, 4'
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <p className="text-xs font-bold text-accent-red uppercase tracking-wider">{hz.hazard_type} Red-Zone</p>
                  <p className="text-sm font-extrabold text-white mt-1">{hz.name || `Hazard Zone ${hz.id}`}</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-300">
                    <p><span className="text-slate-400">Severity:</span> <Badge severity={hz.severity} size="sm" /></p>
                    <p><span className="text-slate-400">Risk Score:</span> <span className="font-bold text-accent-amber">{hz.risk_score}/100</span></p>
                    <p><span className="text-slate-400">Data Source:</span> {hz.source}</p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Active Route Polyline */}
        {layers.evacuationRoutes && activeRoute && activeRoute.length > 0 && (
          <Polyline
            positions={activeRoute.map(([lng, lat]) => [lat, lng])}
            pathOptions={{ color: '#06d6a0', weight: 5, opacity: 0.9, dashArray: '8, 8' }}
          />
        )}

        {/* Habitation Markers */}
        {layers.habitations && habitations.map((hab) => {
          const icon = habIcons[hab.relocation_priority] || habIcons.IMMEDIATE;
          const isSelected = hab.id === selectedHabitationId;

          return (
            <Marker
              key={`hab-${hab.id}`}
              position={[hab.latitude, hab.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  dispatch(setSelectedHabitation(hab.id));
                  if (onSelectHabitation) onSelectHabitation(hab);
                }
              }}
            >
              <Popup>
                <div className="p-2 min-w-[240px]">
                  <div className="flex items-center justify-between border-b border-navy-700 pb-2 mb-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{hab.name}</h4>
                      <p className="text-[11px] text-slate-400">{hab.district} District</p>
                    </div>
                    <Badge priority={hab.relocation_priority} size="sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-navy-850 p-1.5 rounded-lg border border-navy-700">
                      <p className="text-[10px] text-slate-400">Total Population</p>
                      <p className="font-bold text-slate-100">{hab.population.toLocaleString()}</p>
                    </div>
                    <div className="bg-navy-850 p-1.5 rounded-lg border border-navy-700">
                      <p className="text-[10px] text-slate-400">Vulnerable Pop</p>
                      <p className="font-bold text-accent-red">{hab.vulnerable_population.toLocaleString()}</p>
                    </div>
                    <div className="bg-navy-850 p-1.5 rounded-lg border border-navy-700">
                      <p className="text-[10px] text-slate-400">Overall Risk Score</p>
                      <p className="font-bold text-accent-amber">{hab.hazard_score}/100</p>
                    </div>
                    <div className="bg-navy-850 p-1.5 rounded-lg border border-navy-700">
                      <p className="text-[10px] text-slate-400">Elevation</p>
                      <p className="font-bold text-slate-100">{hab.elevation} m</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/habitations/${hab.id}`)}
                      className="flex-1 py-1.5 px-2 bg-navy-800 hover:bg-navy-700 border border-navy-600 rounded-lg text-xs font-semibold text-slate-200 transition text-center"
                    >
                      View Risk Detail
                    </button>
                    <button
                      onClick={() => navigate(`/relocation?habitation_id=${hab.id}`)}
                      className="flex-1 py-1.5 px-2 bg-accent-blue hover:bg-accent-blue/80 rounded-lg text-xs font-bold text-navy-950 transition text-center shadow-md shadow-accent-blue/20"
                    >
                      Safe Sites
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Relocation Site Markers */}
        {layers.relocationSites && relocationSites.map((site) => (
          <Marker
            key={`site-${site.id}`}
            position={[site.latitude, site.longitude]}
            icon={safeSiteIcon}
            eventHandlers={{
              click: () => dispatch(setSelectedSite(site.id))
            }}
          >
            <Popup>
              <div className="p-2 min-w-[220px]">
                <div className="flex items-center justify-between border-b border-navy-700 pb-2 mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-accent-teal">SAFE RELOCATION SITE</span>
                    <h4 className="text-sm font-extrabold text-white">{site.name}</h4>
                  </div>
                  <Badge priority="MONITOR" size="sm" />
                </div>
                <div className="space-y-1 text-xs text-slate-300 mb-3">
                  <p><span className="text-slate-400">Safety Score:</span> <span className="font-bold text-accent-teal">{site.safety_score}/100</span></p>
                  <p><span className="text-slate-400">Total Capacity:</span> <span className="font-bold text-white">{site.population_capacity.toLocaleString()}</span></p>
                  <p><span className="text-slate-400">Available Buffer:</span> <span className="font-bold text-accent-teal">{(site.population_capacity - site.current_population).toLocaleString()}</span></p>
                  <p><span className="text-slate-400">Land Area:</span> {site.land_area} ha</p>
                </div>
                <button
                  onClick={() => navigate(`/capacity?site_id=${site.id}`)}
                  className="w-full py-1.5 bg-accent-teal hover:bg-accent-teal/80 text-navy-950 font-bold text-xs rounded-lg transition text-center shadow-md shadow-accent-teal/20"
                >
                  View Capacity Metrics
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
