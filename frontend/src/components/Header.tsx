import React, { useState } from 'react';
import { Search, Bell, MapPin, User, ChevronDown, Activity, LogOut, ShieldCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { flyToLocation } from '../store/gisSlice';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [district, setDistrict] = useState('Darjeeling');
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-navy-700/60 bg-navy-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-lg select-none">
      {/* Search & Location Picker */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <form onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habitation, district, hazard zone, or relocation site..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-navy-850 border border-navy-700/80 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-accent-cyan/60 focus:ring-1 focus:ring-accent-cyan/40 transition"
            />
          </form>
        </div>

        {/* District Selector */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-navy-850 border border-navy-700/80 rounded-xl text-xs text-slate-300 font-medium">
          <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
          <select 
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-transparent focus:outline-none text-slate-200 cursor-pointer"
          >
            <option value="Darjeeling" className="bg-navy-900">Darjeeling District</option>
            <option value="Kalimpong" className="bg-navy-900">Kalimpong District</option>
            <option value="Jalpaiguri" className="bg-navy-900">Jalpaiguri Region</option>
          </select>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowAlerts(!showAlerts); setShowUserMenu(false); }}
            className="relative p-2 text-slate-300 hover:text-white bg-navy-850 hover:bg-navy-800 border border-navy-700/80 rounded-xl transition"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-red rounded-full ring-2 ring-navy-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-red rounded-full ring-2 ring-navy-900" />
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-navy-850 border border-navy-700/80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-navy-700 pb-3 mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                  <Activity className="w-4 h-4 text-accent-red" />
                  <span>Active Disaster Alerts</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-accent-red/20 text-accent-red rounded-full font-semibold">3 New</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                <div className="p-2.5 bg-navy-800/80 rounded-xl border border-accent-red/30">
                  <p className="text-xs font-bold text-accent-red">Mirik Basti Lower - Critical Landslide</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Slope failure risk score 92%. Evacuation notice issued.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">12 mins ago</span>
                </div>
                <div className="p-2.5 bg-navy-800/80 rounded-xl border border-accent-orange/30">
                  <p className="text-xs font-bold text-accent-orange">Teesta River Basin Flood Warning</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">River level rising near Melli bridge (240m elevation).</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">45 mins ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu with Log Out */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowAlerts(false); }}
            className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 bg-navy-850 hover:bg-navy-800 border border-navy-700/80 rounded-xl transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-teal flex items-center justify-center text-navy-950 font-bold text-xs shadow-md">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name || 'Dr. A. Sharma'}</p>
              <p className="text-[10px] text-accent-cyan font-medium leading-tight">{user?.role || 'Expert Validator'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-navy-850 border border-navy-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-navy-700/80 bg-navy-900/60 rounded-xl mb-2">
                <p className="text-xs font-bold text-white">{user?.name || 'Authorized User'}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || 'user@surakshitsthan.gov.in'}</p>
                <span className="mt-1.5 inline-block px-2 py-0.5 rounded bg-accent-blue/15 text-accent-cyan text-[10px] font-bold">
                  {user?.organization || 'NDMA Authority'}
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-navy-800 text-left transition flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-accent-cyan" />
                  <span>Manage Profile & Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-accent-red hover:bg-accent-red/10 text-left transition flex items-center gap-2"
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
  );
};
