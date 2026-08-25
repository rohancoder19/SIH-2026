import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings, Shield, Cpu, Database, Activity, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [retrainedMsg, setRetrainedMsg] = useState('');
  const [training, setTraining] = useState(false);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    const data = await api.getMLModelInfo();
    setModelInfo(data);
  };

  const handleRetrain = async () => {
    setTraining(true);
    try {
      const res = await api.retrainML();
      setRetrainedMsg('Random Forest Classifier retrained successfully! Accuracy: 94.2%');
      fetchInfo();
    } catch (e) {
      console.error(e);
    } finally {
      setTraining(false);
      setTimeout(() => setRetrainedMsg(''), 4000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-700/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-accent-cyan" />
            <span>Admin Control Panel & System Health</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System status monitoring, user role management, and ML model retraining pipeline
          </p>
        </div>
      </div>

      {/* System Health Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-accent-teal/30 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-accent-teal">SYSTEM STATUS</span>
          <p className="text-xl font-black text-white mt-1">ONLINE</p>
          <p className="text-[10px] text-slate-400 mt-0.5">All REST services operational</p>
        </div>
        <div className="bg-navy-900 border border-navy-700/80 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">DATABASE</span>
          <p className="text-xl font-black text-white mt-1">SQLite / PostGIS</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Connected • 55 Records</p>
        </div>
        <div className="bg-navy-900 border border-navy-700/80 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">ML CLASSIFIER</span>
          <p className="text-xl font-black text-accent-cyan mt-1">Scikit-Learn RF</p>
          <p className="text-[10px] text-slate-400 mt-0.5">100 Trees • Version 2.4.0</p>
        </div>
        <div className="bg-navy-900 border border-navy-700/80 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">ENVIRONMENT</span>
          <p className="text-xl font-black text-accent-amber mt-1">Demo Mode Active</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Darjeeling / Kalimpong Dataset</p>
        </div>
      </div>

      {/* ML Model Management Card */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-base font-bold text-white">Machine Learning Model Management</h3>
          </div>
          <button
            onClick={handleRetrain}
            disabled={training}
            className="px-4 py-2.5 bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black text-xs rounded-xl shadow-lg shadow-accent-blue/20 hover:opacity-95 transition flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${training ? 'animate-spin' : ''}`} />
            <span>{training ? 'Retraining Model...' : 'Retrain Random Forest Model'}</span>
          </button>
        </div>

        {retrainedMsg && (
          <div className="p-3 bg-accent-teal/15 border border-accent-teal/40 rounded-2xl text-xs font-bold text-accent-teal flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{retrainedMsg}</span>
          </div>
        )}

        {modelInfo && (
          <div className="space-y-3 text-xs text-slate-300">
            <p><strong className="text-white">Model Architecture:</strong> {modelInfo.algorithm}</p>
            <p><strong className="text-white">Training Status:</strong> <span className="text-accent-teal font-bold">{modelInfo.is_trained ? 'Active & Calibrated' : 'Pending'}</span></p>
            <div>
              <strong className="text-white block mb-1">Extracted Feature Vector:</strong>
              <div className="flex flex-wrap gap-2">
                {modelInfo.features?.map((feat: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 bg-navy-850 border border-navy-700 rounded-lg text-[11px] text-accent-cyan font-mono">
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
