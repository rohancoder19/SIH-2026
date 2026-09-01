import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { api } from '../services/api';
import { UserRole } from '../types';
import {
  LogIn, Lock, Mail, User as UserIcon, Building2, Eye, EyeOff,
  ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State
  const [email, setEmail] = useState('expert@surakshitsthan.gov.in');
  const [password, setPassword] = useState('Expert@123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('Geological Survey of India (GSI)');
  const [role, setRole] = useState<UserRole>('Expert');
  const [showPassword, setShowPassword] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      dispatch(setCredentials({ user: res.user, token: res.access_token }));
      setSuccessMsg(`Welcome back, ${res.user.name}! Redirecting to Command Dashboard...`);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({
        name: fullName,
        email,
        password,
        role,
        organization,
      });
      dispatch(setCredentials({ user: res.user, token: res.access_token }));
      setSuccessMsg(`Account created successfully as ${role}! Redirecting...`);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Soft Light Auth Card */}
      <div className="w-full max-w-xl bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-6 sm:p-8 shadow-xs relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center mx-auto mb-3 p-1.5 shadow-xs">
            <img src="/favicon.svg" alt="SurakshitSthan App Icon" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Surakshit<span className="text-[#4F46E5]">Sthan</span> AI
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            National Disaster Risk & Safe Relocation Command Portal
          </p>
        </div>

        {/* Auth Tabs Navigation */}
        <div className="grid grid-cols-2 p-1 bg-[#E2E8F0]/70 rounded-2xl border border-[#CBD5E1] mb-6 text-xs font-bold">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${mode === 'login' ? 'bg-[#4F46E5] text-white font-bold shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'}`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${mode === 'register' ? 'bg-[#4F46E5] text-white font-bold shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'}`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-100 border border-rose-300 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Official Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@surakshitsthan.gov.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs tracking-wide shadow-xs transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Authorize & Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Dr. Arisudan Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">Organization</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                    placeholder="NDMA Authority / GSI"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@surakshitsthan.gov.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Designated Portal Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5] cursor-pointer font-medium"
              >
                <option value="Admin">System Administrator</option>
                <option value="Expert">Expert Validator (Geologist / Planner)</option>
                <option value="Official">Government Official / NDMA Officer</option>
                <option value="Public">Public Access / Research View</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs tracking-wide shadow-xs transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Creating Credentials...' : 'Complete Registration & Access'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
