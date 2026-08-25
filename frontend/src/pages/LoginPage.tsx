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
    <div className="min-h-screen bg-navy-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-accent-blue selection:text-white">
      {/* Background Geospatial Grid Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c2541_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-accent-blue/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Glassmorphism Auth Card */}
      <div className="w-full max-w-xl bg-navy-900/90 border border-navy-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header with Custom App Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue/20 via-accent-cyan/20 to-accent-teal/20 flex items-center justify-center mx-auto mb-3 shadow-2xl shadow-accent-cyan/30 border border-accent-cyan/40 backdrop-blur-md p-1.5 transform hover:scale-105 transition">
            <img src="/favicon.svg" alt="SurakshitSthan App Icon" className="w-full h-full object-contain filter drop-shadow-md" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Surakshit<span className="text-accent-cyan">Sthan</span> AI
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            National Disaster Risk & Safe Relocation Command Portal
          </p>
        </div>

        {/* Auth Tabs Navigation */}
        <div className="grid grid-cols-2 p-1 bg-navy-850 rounded-2xl border border-navy-700 mb-6 text-xs font-bold">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${mode === 'login' ? 'bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${mode === 'register' ? 'bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-accent-red/15 border border-accent-red/40 rounded-2xl text-xs font-bold text-accent-red flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-accent-teal/15 border border-accent-teal/40 rounded-2xl text-xs font-bold text-accent-teal flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@surakshitsthan.gov.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Secret Key / Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-accent-blue/20 hover:opacity-95 transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating Token...' : 'Authorize & Sign In'}
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name & Title</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Dr. Arisudan Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="expert@surakshitsthan.gov.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assigned System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan cursor-pointer"
                >
                  <option value="Expert">Expert Validator (GSI)</option>
                  <option value="Disaster Authority">Disaster Authority (NDMA)</option>
                  <option value="Analyst">GIS Risk Analyst</option>
                  <option value="Admin">System Administrator</option>
                  <option value="Viewer">Field Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Organization / Agency</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                    placeholder="Geological Survey of India"
                    className="w-full pl-10 pr-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-accent-blue/20 hover:opacity-95 transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Creating Official Account...' : 'Register Official Account'}
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
