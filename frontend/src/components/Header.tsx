import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MapPin, User, ChevronDown, Activity, LogOut, Shield, Check, X, AlertTriangle, Flame, Droplets, ExternalLink } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { flyToLocation } from '../store/gisSlice';
import { logout, setCredentials } from '../store/authSlice';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { ScraperStatusBanner } from './ScraperStatusBanner';
import { ScraperTelemetryDrawer } from './ScraperTelemetryDrawer';
import { getLiveDisasters, getLiveEarthquakes } from '../services/api';

interface NotificationAlert {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Info';
  timeAgo: string;
  read: boolean;
  category: 'Landslide' | 'Flood' | 'Earthquake' | 'Weather';
  lat?: number;
  lng?: number;
}

const INITIAL_ALERTS: NotificationAlert[] = [
  {
    id: 'alert-1',
    title: 'Mirik Basti Lower - Slope Instability',
    description: 'Landslide hazard index 92%. Emergency evacuation notice active for lower slopes.',
    severity: 'Critical',
    timeAgo: '12 mins ago',
    read: false,
    category: 'Landslide',
    lat: 26.8872,
    lng: 88.1884
  },
  {
    id: 'alert-2',
    title: 'Teesta River Basin Flood Flash Warning',
    description: 'Hydrological gauge #204 river level rising near Melli bridge (240m elev).',
    severity: 'Critical',
    timeAgo: '28 mins ago',
    read: false,
    category: 'Flood',
    lat: 27.0582,
    lng: 88.4285
  },
  {
    id: 'alert-3',
    title: 'Himalayan Fault M4.8 Seismic Activity',
    description: 'USGS GeoJSON telemetry detected M4.8 seismic tremor along Himalayan MBT corridor.',
    severity: 'Warning',
    timeAgo: '1 hour ago',
    read: false,
    category: 'Earthquake',
    lat: 27.0312,
    lng: 88.2415
  }
];

export const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [district, setDistrict] = useState('Darjeeling');
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [alerts, setAlerts] = useState<NotificationAlert[]>(INITIAL_ALERTS);

  const alertsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click-outside listener to close dropdown popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setShowAlerts(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real-time live disaster updates on load
  useEffect(() => {
    const fetchLiveTelemetry = async () => {
      try {
        const [disastersRes, quakesRes] = await Promise.all([
          getLiveDisasters(),
          getLiveEarthquakes()
        ]);

        const freshAlerts: NotificationAlert[] = [...alerts];

        if (quakesRes?.earthquakes && quakesRes.earthquakes.length > 0) {
          const topQuake = quakesRes.earthquakes[0];
          if (!freshAlerts.some(a => a.id === `eq-${topQuake.id}`)) {
            freshAlerts.unshift({
              id: `eq-${topQuake.id}`,
              title: `Seismic Alert: M${topQuake.magnitude} - ${topQuake.location}`,
              description: `USGS Real-Time Quake feed. Depth: ${topQuake.depth_km} km. Status: ${topQuake.status}.`,
              severity: topQuake.magnitude >= 5.0 ? 'Critical' : 'Warning',
              timeAgo: 'Just now',
              read: false,
              category: 'Earthquake',
              lat: topQuake.latitude,
              lng: topQuake.longitude
            });
          }
        }

        if (disastersRes?.alerts && disastersRes.alerts.length > 0) {
          const topDisaster = disastersRes.alerts[0];
          if (!freshAlerts.some(a => a.id === `dis-${topDisaster.id}`)) {
            freshAlerts.unshift({
              id: `dis-${topDisaster.id}`,
              title: `${topDisaster.event_type} - ${topDisaster.location}`,
              description: topDisaster.description || 'GDACS live alert feed notice.',
              severity: topDisaster.severity === 'Red' ? 'Critical' : 'Warning',
              timeAgo: 'Just now',
              read: false,
              category: topDisaster.event_type.includes('Flood') ? 'Flood' : 'Landslide'
            });
          }
        }

        setAlerts(freshAlerts);
      } catch (err) {
        console.error('Failed to update live notification telemetry:', err);
      }
    };

    fetchLiveTelemetry();
  }, []);

  const unreadCount = alerts.filter(a => !a.read).length;

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const handleClearAlert = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleAlertClick = (alert: NotificationAlert) => {
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a));
    if (alert.lat && alert.lng) {
      dispatch(flyToLocation({ center: [alert.lat, alert.lng], zoom: 13 }));
      navigate('/map');
    } else {
      navigate('/dashboard');
    }
    setShowAlerts(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const searchMap: Record<string, [number, number]> = {
      'mirik': [26.8872, 88.1884],
      'sukhiapokhri': [26.9961, 88.1367],
      'teesta': [27.0582, 88.4285],
      'kalimpong': [27.0712, 88.4812],
      'kurseong': [26.8791, 88.2785],
      'darjeeling': [27.0312, 88.2415],
      'lebong': [27.0621, 88.2721],
      'pedong': [27.1512, 88.6189],
    };

    const key = searchQuery.toLowerCase().trim();
    const foundLoc = Object.keys(searchMap).find(k => key.includes(k));
    
    if (foundLoc) {
      dispatch(flyToLocation({ center: searchMap[foundLoc], zoom: 13 }));
      navigate('/map');
    }
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      dispatch(setCredentials({ user: updatedUser, token: 'demo-token' }));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-[#CBD5E1] bg-[#F8FAFC] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs select-none">
        {/* Search & Location Picker */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <form onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search habitation, district, hazard zone, or relocation site..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-[#E2E8F0]/70 border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] focus:bg-[#F8FAFC] transition"
              />
            </form>
          </div>

          {/* District Selector */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#E2E8F0]/70 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#4F46E5]" />
            <select 
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-transparent focus:outline-none text-[#0F172A] font-bold cursor-pointer"
            >
              <option value="Darjeeling" className="bg-[#F8FAFC] text-[#0F172A]">Darjeeling District</option>
              <option value="Kalimpong" className="bg-[#F8FAFC] text-[#0F172A]">Kalimpong District</option>
              <option value="Jalpaiguri" className="bg-[#F8FAFC] text-[#0F172A]">Jalpaiguri Region</option>
            </select>
          </div>
        </div>

        {/* Right Controls, Scraper Live Badge, & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Live Scraping Engine Status Indicator */}
          <div className="hidden sm:block">
            <ScraperStatusBanner compact={true} onOpenTelemetry={() => setShowTelemetry(true)} />
          </div>

          {/* Role Selector Badge for Judges */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#EEF2FF] border border-[#E0E7FF] rounded-xl text-xs font-bold text-[#4F46E5]">
            <Shield className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span className="text-[10px] uppercase text-[#64748B]">Role:</span>
            <select
              value={user?.role || 'Expert'}
              onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
              className="bg-transparent focus:outline-none font-extrabold text-[#4F46E5] cursor-pointer"
            >
              <option value="Admin">Admin</option>
              <option value="Expert">Expert Validator</option>
              <option value="Official">NDMA Officer</option>
              <option value="Public">Citizen View</option>
            </select>
          </div>

          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={alertsRef}>
            <button 
              onClick={() => { setShowAlerts(!showAlerts); setShowUserMenu(false); }}
              title="View Live Disaster Notifications"
              className={`relative p-2 rounded-xl border transition cursor-pointer ${
                showAlerts 
                  ? 'bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]' 
                  : 'bg-[#E2E8F0]/70 hover:bg-[#E2E8F0] border-[#CBD5E1] text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#F8FAFC] animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#F8FAFC]" />
                </>
              )}
            </button>

            {showAlerts && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3 mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                    <Activity className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>Live Disaster Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 transition"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                      unreadCount > 0 ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}>
                      {unreadCount > 0 ? `${unreadCount} Unread` : '0 Unread'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {alerts.length === 0 ? (
                    <div className="py-8 text-center text-[#64748B] space-y-2">
                      <Check className="w-8 h-8 mx-auto text-emerald-600 bg-emerald-50 p-1.5 rounded-full border border-emerald-200" />
                      <p className="text-xs font-bold text-[#0F172A]">All disaster channels nominal</p>
                      <p className="text-[11px]">No active red alerts at this time.</p>
                    </div>
                  ) : (
                    alerts.map((alert) => {
                      const isCritical = alert.severity === 'Critical';
                      const isWarning = alert.severity === 'Warning';
                      return (
                        <div
                          key={alert.id}
                          onClick={() => handleAlertClick(alert)}
                          className={`p-3 rounded-xl border transition cursor-pointer relative group ${
                            !alert.read 
                              ? isCritical 
                                ? 'bg-rose-50/90 border-rose-300 hover:bg-rose-100/90' 
                                : isWarning 
                                  ? 'bg-amber-50/90 border-amber-300 hover:bg-amber-100/90'
                                  : 'bg-sky-50/90 border-sky-300 hover:bg-sky-100/90'
                              : 'bg-[#E2E8F0]/40 border-[#CBD5E1] hover:bg-[#E2E8F0]/70 opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {alert.category === 'Flood' && <Droplets className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                              {alert.category === 'Landslide' && <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                              {alert.category === 'Earthquake' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                              <p className={`text-xs font-bold ${isCritical ? 'text-rose-900' : isWarning ? 'text-amber-900' : 'text-[#0F172A]'}`}>
                                {alert.title}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleClearAlert(e, alert.id)}
                              title="Dismiss Alert"
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-[11px] text-[#334155] mt-1 leading-relaxed">{alert.description}</p>
                          
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 text-[10px] text-[#64748B]">
                            <span>{alert.timeAgo}</span>
                            {alert.lat && alert.lng && (
                              <span className="text-[#4F46E5] font-bold flex items-center gap-0.5">
                                View GIS Location <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-[#CBD5E1] text-center">
                  <button
                    onClick={() => { navigate('/map'); setShowAlerts(false); }}
                    className="w-full py-1.5 text-xs font-bold text-[#4F46E5] hover:bg-[#EEF2FF] border border-transparent hover:border-[#E0E7FF] rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <span>View All Active GIS Layers & Radar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowAlerts(false); }}
              className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 bg-[#E2E8F0]/70 hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5] font-bold text-xs">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#0F172A] leading-tight">{user?.name || 'Dr. A. Sharma'}</p>
                <p className="text-[10px] text-[#4F46E5] font-medium leading-tight">{user?.role || 'Expert Validator'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] ml-1" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-[#CBD5E1] bg-[#E2E8F0]/50 rounded-xl mb-2">
                  <p className="text-xs font-bold text-[#0F172A]">{user?.name || 'Authorized User'}</p>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">{user?.email || 'user@surakshitsthan.gov.in'}</p>
                  <span className="mt-1.5 inline-block px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] text-[10px] font-bold">
                    {user?.organization || 'NDMA Authority'}
                  </span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => { setShowTelemetry(true); setShowUserMenu(false); }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#334155] hover:text-[#0F172A] hover:bg-[#E2E8F0] text-left transition flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4 text-[#4F46E5]" />
                    <span>View Scraper Telemetry Audit</span>
                  </button>
                  <button
                    onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#334155] hover:text-[#0F172A] hover:bg-[#E2E8F0] text-left transition flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#4F46E5]" />
                    <span>Manage Profile & Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-100 text-left transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Scraper Telemetry Audit Drawer */}
      <ScraperTelemetryDrawer isOpen={showTelemetry} onClose={() => setShowTelemetry(false)} />
    </>
  );
};
