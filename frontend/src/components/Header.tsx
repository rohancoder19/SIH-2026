import React, { useState } from 'react';
import { Search, Bell, MapPin, User, ChevronDown, Activity, LogOut } from 'lucide-react';
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

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowAlerts(!showAlerts); setShowUserMenu(false); }}
            className="relative p-2 text-[#475569] hover:text-[#0F172A] bg-[#E2E8F0]/70 hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#F8FAFC] animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#F8FAFC]" />
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3 mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span>Active Disaster Alerts</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-semibold">3 New</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                  <p className="text-xs font-bold text-rose-800">Mirik Basti Lower - Critical Landslide</p>
                  <p className="text-[11px] text-[#334155] mt-0.5">Slope failure risk score 92%. Evacuation notice issued.</p>
                  <span className="text-[10px] text-[#64748B] mt-1 block">12 mins ago</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-bold text-amber-800">Teesta River Basin Flood Warning</p>
                  <p className="text-[11px] text-[#334155] mt-0.5">River level rising near Melli bridge (240m elevation).</p>
                  <span className="text-[10px] text-[#64748B] mt-1 block">45 mins ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="relative">
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
  );
};
