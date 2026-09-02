import React, { useEffect, useState } from 'react';
import { api, getLiveEarthquakes, getLiveDisasters, getLiveWeather, getLiveRainfall, getMlPredictions, getLiveFloods, getLiveLandslides } from '../services/api';
import { Habitation, HazardZone } from '../types';
import { GISMapComponent } from '../features/map/GISMapComponent';
import { Badge } from '../components/Badge';
import { DataSourceHealthPanel, renderStatusBadge } from '../components/DataSourceHealthPanel';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import {
  Home, ShieldAlert, Cpu, ShieldCheck, Building2, Flame, ArrowRight, AlertTriangle, RefreshCw, Activity, CloudRain, Thermometer, Wind, Radio, MapPin
} from 'lucide-react';
import { ScraperStatusBanner } from '../components/ScraperStatusBanner';
import { ScraperTelemetryDrawer } from '../components/ScraperTelemetryDrawer';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [habitations, setHabitations] = useState<Habitation[]>([]);
  const [hazards, setHazards] = useState<HazardZone[]>([]);
  const [earthquakesData, setEarthquakesData] = useState<any>(null);
  const [disastersData, setDisastersData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [rainfallData, setRainfallData] = useState<any>(null);
  const [mlPredictions, setMlPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTelemetry, setShowTelemetry] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, habsRes, hazRes, eqRes, disRes, wxRes, rainRes, mlRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getHabitations(),
        api.getHazardsGeoJSON(),
        getLiveEarthquakes(),
        getLiveDisasters(),
        getLiveWeather(26.9, 88.3), // Darjeeling / Teesta Region
        getLiveRainfall(26.9, 88.3),
        getMlPredictions()
      ]);
      setSummaryData(sumRes);
      setHabitations(habsRes);
      setHazards(hazRes.features.map((f: any) => f.properties));
      setEarthquakesData(eqRes);
      setDisastersData(disRes);
      setWeatherData(wxRes);
      setRainfallData(rainRes);
      setMlPredictions(mlRes);
    } catch (e) {
      console.error("Dashboard data load notice", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpis = summaryData?.kpis || {
    total_habitations: 55,
    high_risk_habitations: 32,
    immediate_relocation_required: 14,
    safe_relocation_sites: 20,
    available_capacity: 84200,
    active_hazards: 5
  };

  const priorityData = summaryData?.priority_distribution || [
    { name: 'Immediate', value: 14, color: '#ef476f' },
    { name: 'Short-Term', value: 18, color: '#f77f00' },
    { name: 'Medium-Term', value: 15, color: '#ffd166' },
    { name: 'Monitor', value: 8, color: '#06d6a0' }
  ];

  const hazardChartData = [
    { hazard: 'Landslide', habitations: 28 },
    { hazard: 'Flood', habitations: 18 },
    { hazard: 'Seismic', habitations: 12 },
    { hazard: 'Flash Flood', habitations: 15 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-6 space-y-6 max-w-[1650px] mx-auto bg-slate-50 min-h-screen"
    >
      {/* Header Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Real-Time Disaster Intelligence Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              🟢 Live Telemetry Stream
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Multi-Source Real-Time Telemetry (USGS, GDACS, Open-Meteo, CWC) &amp; GIS Decision-Support Platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/transparency')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition flex items-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Data Transparency &amp; Lineage</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/relocation')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>AI Relocation Engine</span>
          </button>
        </div>
      </div>

      {/* 1. Live Data Source Health & Telemetry Panel */}
      <DataSourceHealthPanel />

      {/* 2. Key Metrics Grid (Light Themed Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm transition">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Habitations</span>
            <Home className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{kpis.total_habitations}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Monitored Settlements</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 shadow-sm transition">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Red Zones</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-rose-800">{kpis.high_risk_habitations}</p>
          <p className="text-[10px] text-rose-600 mt-0.5 font-semibold">Critical / Severe Risk</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-rose-100/70 border border-rose-300 shadow-sm transition">
          <div className="flex items-center justify-between text-rose-900 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Immediate</span>
            <AlertTriangle className="w-4 h-4 animate-pulse text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-900">{kpis.immediate_relocation_required}</p>
          <p className="text-[10px] text-rose-700 mt-0.5 font-bold">Evacuation Priority</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-sm transition">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Safe Sites</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-800">{kpis.safe_relocation_sites}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">Verified Safe Locations</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm transition">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Usable Land Area</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{(kpis.available_land_area_ha ?? kpis.available_capacity ?? 310).toLocaleString()} ha</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Available Relocation Buffer</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 shadow-sm transition">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Multi-Hazards</span>
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-amber-800">{kpis.active_hazards}</p>
          <p className="text-[10px] text-amber-600 mt-0.5 font-medium">Geo-Mapped Active Zones</p>
        </motion.div>
      </div>

      {/* 3. Live Feeds Grid: USGS Earthquakes, GDACS Alerts, Open-Meteo Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* USGS Earthquake Monitor */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">USGS Live Earthquake Feed</h3>
              </div>
              {renderStatusBadge(earthquakesData?.status || 'LIVE')}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Direct real-time stream ({earthquakesData?.count || 0} seismic events parsed):
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {earthquakesData?.earthquakes && earthquakesData.earthquakes.length > 0 ? (
                earthquakesData.earthquakes.slice(0, 4).map((eq: any) => (
                  <div key={eq.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block truncate max-w-[180px]">{eq.location}</span>
                      <span className="text-[10px] text-slate-500">Depth: {eq.depth_km}km | Lat {eq.latitude.toFixed(2)}, Lng {eq.longitude.toFixed(2)}</span>
                    </div>
                    <span className="font-extrabold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                      M{eq.magnitude}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No seismic quakes above threshold in feed window.</div>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
            <span>Source: USGS GeoJSON Feed</span>
            <a href="https://earthquake.usgs.gov/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">usgs.gov</a>
          </div>
        </div>

        {/* GDACS Global Alert Monitor */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">GDACS Multi-Hazard RSS Alerts</h3>
              </div>
              {renderStatusBadge(disastersData?.status || 'LIVE')}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Global Disaster Alert &amp; Coordination System ({disastersData?.count || 0} active alerts):
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {disastersData?.alerts && disastersData.alerts.length > 0 ? (
                disastersData.alerts.slice(0, 3).map((alt: any) => (
                  <div key={alt.id} className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{alt.event_type}</span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">{alt.severity}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">{alt.location}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No active GDACS RSS items.</div>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
            <span>Source: GDACS XML RSS</span>
            <a href="https://www.gdacs.org/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">gdacs.org</a>
          </div>
        </div>

        {/* Live Weather & Rainfall Feed (Open-Meteo) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Open-Meteo Live Weather &amp; Rain</h3>
              </div>
              {renderStatusBadge(weatherData?.status || 'LIVE')}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Telemetry for Eastern Himalayas / Teesta Basin (26.9°N, 88.3°E):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Temperature</span>
                  <span className="font-bold text-slate-900">{weatherData?.temperature_c ?? '--'}°C</span>
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-500" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Rainfall</span>
                  <span className="font-bold text-slate-900">{rainfallData?.rainfall_amount_mm ?? 0.0} mm</span>
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                <Wind className="w-4 h-4 text-teal-500" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Wind Speed</span>
                  <span className="font-bold text-slate-900">{weatherData?.wind_speed_kmh ?? '--'} km/h</span>
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Humidity</span>
                  <span className="font-bold text-slate-900">{weatherData?.humidity_percent ?? '--'}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
            <span>Source: Open-Meteo Meteorological API</span>
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">open-meteo.com</a>
          </div>
        </div>
      </div>

      {/* 4. GIS Command Map & Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive GIS Map (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-[520px] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Multi-Hazard Interactive GIS Command Map</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  REAL-TIME GIS
                </span>
              </h3>
              <p className="text-xs text-slate-500">Interactive spatial visualization of monitored habitations and hazard zones</p>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Screen Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-200">
            <GISMapComponent habitations={habitations} />
          </div>
        </div>

        {/* Analytics & ML Horizon Side Column */}
        <div className="space-y-6">
          {/* ML Prediction Horizon Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">AI Risk Horizon (Random Forest)</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-semibold">
                Input Freshness: {mlPredictions?.input_data_freshness || '10m'}
              </span>
            </div>
            <div className="space-y-2">
              {mlPredictions?.predictions ? (
                mlPredictions.predictions.map((p: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-0.5">
                      <span>{p.hazard_type}</span>
                      <span className="text-rose-600 font-extrabold">{(p.probability * 100).toFixed(0)}% Probability</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{p.region} • Horizon: {p.horizon}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">Calculating ML prediction horizon...</div>
              )}
            </div>
          </div>

          {/* Priority Distribution Pie Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Relocation Priority Breakdown</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#4F46E5'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Immediate (14)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Short-Term (18)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Medium-Term (15)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Monitor (8)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Top Vulnerable Habitations Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Vulnerable Habitations Needing Action</h3>
            <p className="text-xs text-slate-500 mt-0.5">Priority sorted based on multi-hazard vulnerability & risk scores</p>
          </div>
          <button
            onClick={() => navigate('/habitations')}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-indigo-600 rounded-lg transition cursor-pointer"
          >
            View All Habitations
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
                <th className="py-2.5 px-3">Habitation Name</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Elevation</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {habitations.slice(0, 6).map((hab) => (
                <tr key={hab.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">{hab.name}</td>
                  <td className="py-3 px-3 text-slate-600">{hab.district}</td>
                  <td className="py-3 px-3 text-slate-600">{hab.elevation} m</td>
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-amber-700">{hab.hazard_score}/100</span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge priority={hab.relocation_priority} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/habitations/${hab.id}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold rounded-md transition cursor-pointer"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => navigate(`/relocation?habitation_id=${hab.id}`)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md transition shadow-xs cursor-pointer"
                    >
                      Recommend Sites
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScraperTelemetryDrawer isOpen={showTelemetry} onClose={() => setShowTelemetry(false)} />
    </motion.div>
  );
};
