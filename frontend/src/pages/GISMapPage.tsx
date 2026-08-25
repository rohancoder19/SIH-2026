import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setBaseLayer, toggleLayer, setSelectedHabitation } from '../store/gisSlice';
import { GISMapComponent } from '../features/map/GISMapComponent';
import { api } from '../services/api';
import { Habitation, HazardZone, RelocationSite } from '../types';
import { Badge } from '../components/Badge';
import { Layers, Map, Eye, Filter, ArrowRight, Home, ShieldCheck, Flame, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GISMapPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { baseLayer, layers, selectedHabitationId } = useSelector((state: RootState) => state.gis);

  const [habitations, setHabitations] = useState<Habitation[]>([]);
  const [relocationSites, setRelocationSites] = useState<RelocationSite[]>([]);
  const [hazardZones, setHazardZones] = useState<HazardZone[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const [habs, sites, haz] = await Promise.all([
          api.getHabitations(),
          api.getRelocationSites(),
          api.getHazardsGeoJSON()
        ]);
        setHabitations(habs);
        setRelocationSites(sites);
        setHazardZones(haz.features.map((f: any) => f.properties));
      } catch (e) {
        console.error(e);
      }
    };
    loadMapData();
  }, []);

  const selectedHab = habitations.find(h => h.id === selectedHabitationId) || habitations[0];

  const filteredHabs = habitations.filter(h =>
    h.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    h.district.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] relative flex overflow-hidden">
      {/* Sidebar Controls Overlay */}
      <div className={`w-80 bg-navy-900/95 border-r border-navy-700/80 p-4 overflow-y-auto flex flex-col gap-4 z-20 backdrop-blur-md transition-all ${showControls ? 'translate-x-0' : '-translate-x-full absolute'}`}>
        <div className="flex items-center justify-between border-b border-navy-700 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-sm font-extrabold text-white">GIS Layer Controls</h2>
          </div>
          <button onClick={() => setShowControls(false)} className="text-xs text-slate-400 hover:text-white">Hide</button>
        </div>

        {/* Base Layer Switcher */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Base Imagery</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-navy-850 rounded-xl border border-navy-700">
            <button
              onClick={() => dispatch(setBaseLayer('satellite'))}
              className={`py-1.5 rounded-lg text-xs font-semibold transition ${baseLayer === 'satellite' ? 'bg-accent-blue text-navy-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Satellite
            </button>
            <button
              onClick={() => dispatch(setBaseLayer('openstreetmap'))}
              className={`py-1.5 rounded-lg text-xs font-semibold transition ${baseLayer === 'openstreetmap' ? 'bg-accent-blue text-navy-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              OSM Map
            </button>
            <button
              onClick={() => dispatch(setBaseLayer('terrain'))}
              className={`py-1.5 rounded-lg text-xs font-semibold transition ${baseLayer === 'terrain' ? 'bg-accent-blue text-navy-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              Terrain
            </button>
          </div>
        </div>

        {/* GIS Layers Toggle Checklist */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Active Spatial Layers</label>
          <div className="space-y-1.5 bg-navy-850 p-3 rounded-2xl border border-navy-700 text-xs">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-slate-200"><Flame className="w-3.5 h-3.5 text-accent-red" /> Flood Red Zones</span>
              <input type="checkbox" checked={layers.flood} onChange={() => dispatch(toggleLayer('flood'))} className="rounded accent-accent-cyan cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-slate-200"><Flame className="w-3.5 h-3.5 text-accent-orange" /> Landslide Slopes</span>
              <input type="checkbox" checked={layers.landslide} onChange={() => dispatch(toggleLayer('landslide'))} className="rounded accent-accent-cyan cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-slate-200"><Flame className="w-3.5 h-3.5 text-accent-amber" /> Seismic MBT Faults</span>
              <input type="checkbox" checked={layers.earthquake} onChange={() => dispatch(toggleLayer('earthquake'))} className="rounded accent-accent-cyan cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-slate-200"><Home className="w-3.5 h-3.5 text-accent-cyan" /> Vulnerable Habitations</span>
              <input type="checkbox" checked={layers.habitations} onChange={() => dispatch(toggleLayer('habitations'))} className="rounded accent-accent-cyan cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-slate-200"><ShieldCheck className="w-3.5 h-3.5 text-accent-teal" /> Safe Relocation Sites</span>
              <input type="checkbox" checked={layers.relocationSites} onChange={() => dispatch(toggleLayer('relocationSites'))} className="rounded accent-accent-cyan cursor-pointer" />
            </label>
          </div>
        </div>

        {/* Quick Habitations Search List */}
        <div className="flex-1 flex flex-col min-h-0">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Search Habitations ({filteredHabs.length})</label>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-navy-850 border border-navy-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredHabs.map((hab) => (
              <div
                key={hab.id}
                onClick={() => dispatch(setSelectedHabitation(hab.id))}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${selectedHabitationId === hab.id ? 'bg-navy-800 border-accent-cyan text-white shadow-md' : 'bg-navy-850 border-navy-700/60 text-slate-300 hover:bg-navy-800/60'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{hab.name}</span>
                  <Badge priority={hab.relocation_priority} size="sm" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Pop: {hab.population.toLocaleString()}</span>
                  <span className="font-bold text-accent-amber">Score: {hab.hazard_score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Leaflet GIS Map Canvas */}
      <div className="flex-1 relative h-full">
        {!showControls && (
          <button
            onClick={() => setShowControls(true)}
            className="absolute top-4 left-4 z-20 p-2.5 bg-navy-900/90 border border-navy-700 rounded-xl text-slate-200 shadow-xl backdrop-blur-md hover:text-white flex items-center gap-2 text-xs font-bold"
          >
            <Filter className="w-4 h-4 text-accent-cyan" />
            <span>Show Layer Controls</span>
          </button>
        )}
        <GISMapComponent habitations={habitations} relocationSites={relocationSites} hazardZones={hazardZones} />

        {/* Selected Habitation Bottom Sheet Drawer */}
        {selectedHab && (
          <div className="absolute bottom-4 right-4 z-20 w-80 sm:w-96 bg-navy-900/95 border border-navy-700/80 rounded-3xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between border-b border-navy-700 pb-2 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">SELECTED HABITATION</span>
                <h3 className="text-base font-extrabold text-white leading-tight">{selectedHab.name}</h3>
              </div>
              <Badge priority={selectedHab.relocation_priority} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-navy-850 p-2 rounded-xl border border-navy-700">
                <span className="text-[10px] text-slate-400 block">District</span>
                <span className="font-bold text-slate-100">{selectedHab.district}</span>
              </div>
              <div className="bg-navy-850 p-2 rounded-xl border border-navy-700">
                <span className="text-[10px] text-slate-400 block">Vulnerable Pop</span>
                <span className="font-bold text-accent-red">{selectedHab.vulnerable_population.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/habitations/${selectedHab.id}`)}
                className="flex-1 py-2 bg-navy-800 hover:bg-navy-700 border border-navy-600 rounded-xl text-xs font-bold text-slate-200 transition text-center"
              >
                In-Depth Risk
              </button>
              <button
                onClick={() => navigate(`/relocation?habitation_id=${selectedHab.id}`)}
                className="flex-1 py-2 bg-accent-blue hover:bg-accent-blue/80 rounded-xl text-xs font-black text-navy-950 transition text-center shadow-lg shadow-accent-blue/20"
              >
                Find Safe Sites
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
