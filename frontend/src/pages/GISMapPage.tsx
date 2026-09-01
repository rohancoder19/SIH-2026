import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setBaseLayer, toggleLayer, setSelectedHabitation } from '../store/gisSlice';
import { GISMapComponent } from '../features/map/GISMapComponent';
import { api } from '../services/api';
import { Habitation, HazardZone, RelocationSite } from '../types';
import { Badge } from '../components/Badge';
import { Layers, Flame, Home, ShieldCheck, Search, Filter } from 'lucide-react';
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
      <div className={`w-80 bg-white border-r border-[#E2E8F0] p-4 overflow-y-auto flex flex-col gap-4 z-20 shadow-xs transition-all ${showControls ? 'translate-x-0' : '-translate-x-full absolute'}`}>
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-sm font-extrabold text-[#0F172A]">GIS Layer Controls</h2>
          </div>
          <button onClick={() => setShowControls(false)} className="text-xs text-[#64748B] hover:text-[#0F172A] font-semibold">Hide</button>
        </div>

        {/* Base Layer Switcher */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2">Base Imagery</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <button
              onClick={() => dispatch(setBaseLayer('satellite'))}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${baseLayer === 'satellite' ? 'bg-[#4F46E5] text-white' : 'text-[#475569] hover:text-[#0F172A]'}`}
            >
              Satellite
            </button>
            <button
              onClick={() => dispatch(setBaseLayer('openstreetmap'))}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${baseLayer === 'openstreetmap' ? 'bg-[#4F46E5] text-white' : 'text-[#475569] hover:text-[#0F172A]'}`}
            >
              OSM Map
            </button>
            <button
              onClick={() => dispatch(setBaseLayer('terrain'))}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${baseLayer === 'terrain' ? 'bg-[#4F46E5] text-white' : 'text-[#475569] hover:text-[#0F172A]'}`}
            >
              Terrain
            </button>
          </div>
        </div>

        {/* GIS Layers Toggle Checklist */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2">Active Spatial Layers</label>
          <div className="space-y-1.5 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-xs">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-[#334155]"><Flame className="w-3.5 h-3.5 text-rose-600" /> Flood Red Zones</span>
              <input type="checkbox" checked={layers.flood} onChange={() => dispatch(toggleLayer('flood'))} className="rounded accent-[#4F46E5] cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-[#334155]"><Flame className="w-3.5 h-3.5 text-amber-600" /> Landslide Slopes</span>
              <input type="checkbox" checked={layers.landslide} onChange={() => dispatch(toggleLayer('landslide'))} className="rounded accent-[#4F46E5] cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-[#334155]"><Flame className="w-3.5 h-3.5 text-[#4F46E5]" /> Seismic MBT Faults</span>
              <input type="checkbox" checked={layers.earthquake} onChange={() => dispatch(toggleLayer('earthquake'))} className="rounded accent-[#4F46E5] cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-[#334155]"><Home className="w-3.5 h-3.5 text-[#4F46E5]" /> Vulnerable Habitations</span>
              <input type="checkbox" checked={layers.habitations} onChange={() => dispatch(toggleLayer('habitations'))} className="rounded accent-[#4F46E5] cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 text-[#334155]"><ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Safe Relocation Sites</span>
              <input type="checkbox" checked={layers.relocationSites} onChange={() => dispatch(toggleLayer('relocationSites'))} className="rounded accent-[#4F46E5] cursor-pointer" />
            </label>
          </div>
        </div>

        {/* Quick Habitations Search List */}
        <div className="flex-1 flex flex-col min-h-0">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2">Search Habitations ({filteredHabs.length})</label>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredHabs.map((hab) => (
              <div
                key={hab.id}
                onClick={() => dispatch(setSelectedHabitation(hab.id))}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${selectedHabitationId === hab.id ? 'bg-[#EEF2FF] border-[#E0E7FF] text-[#0F172A] font-bold shadow-xs' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{hab.name}</span>
                  <Badge priority={hab.relocation_priority} size="sm" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#64748B] mt-1">
                  <span>Pop: {hab.population.toLocaleString()}</span>
                  <span className="font-bold text-amber-600">Score: {hab.hazard_score}/100</span>
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
            className="absolute top-4 left-4 z-20 p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] shadow-md hover:bg-[#F8FAFC] flex items-center gap-2 text-xs font-bold transition"
          >
            <Filter className="w-4 h-4 text-[#4F46E5]" />
            <span>Show Layer Controls</span>
          </button>
        )}
        <GISMapComponent habitations={habitations} relocationSites={relocationSites} hazardZones={hazardZones} />

        {/* Selected Habitation Bottom Sheet Drawer */}
        {selectedHab && (
          <div className="absolute bottom-4 right-4 z-20 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xl text-[#0F172A] animate-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B]">SELECTED HABITATION</span>
                <h3 className="text-base font-extrabold text-[#0F172A] leading-tight">{selectedHab.name}</h3>
              </div>
              <Badge priority={selectedHab.relocation_priority} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] block">District</span>
                <span className="font-bold text-[#0F172A]">{selectedHab.district}</span>
              </div>
              <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] block">Vulnerable Pop</span>
                <span className="font-bold text-rose-600">{selectedHab.vulnerable_population.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/habitations/${selectedHab.id}`)}
                className="flex-1 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#334155] transition text-center"
              >
                In-Depth Risk
              </button>
              <button
                onClick={() => navigate(`/relocation?habitation_id=${selectedHab.id}`)}
                className="flex-1 py-2 bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl text-xs font-bold text-white transition text-center shadow-xs"
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
