import React from 'react';
import { BarChart3, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const trendData = [
    { month: 'Jan', landslideRisk: 65, floodRisk: 30, eqRisk: 45 },
    { month: 'Feb', landslideRisk: 68, floodRisk: 35, eqRisk: 45 },
    { month: 'Mar', landslideRisk: 72, floodRisk: 40, eqRisk: 48 },
    { month: 'Apr', landslideRisk: 78, floodRisk: 55, eqRisk: 48 },
    { month: 'May', landslideRisk: 85, floodRisk: 75, eqRisk: 50 },
    { month: 'Jun (Monsoon)', landslideRisk: 94, floodRisk: 92, eqRisk: 52 },
    { month: 'Jul', landslideRisk: 96, floodRisk: 95, eqRisk: 52 },
  ];

  const districtComparison = [
    { district: 'Darjeeling', totalHabs: 32, immediateRelocation: 9, vulnPop: 24500 },
    { district: 'Kalimpong', totalHabs: 23, immediateRelocation: 5, vulnPop: 18200 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-700/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent-cyan" />
            <span>Advanced Disaster Analytics & Trends</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical vulnerability trends, seasonal monsoon hazard forecasting, and district comparative statistics
          </p>
        </div>
      </div>

      {/* Grid: Historical Risk Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-cyan" />
            <span>Seasonal Multi-Hazard Risk Trend (2026 Monsoon Forecast)</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#131d38', borderColor: '#273459', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="landslideRisk" stroke="#f77f00" fill="#f77f00" fillOpacity={0.2} name="Landslide Risk" />
                <Area type="monotone" dataKey="floodRisk" stroke="#ef476f" fill="#ef476f" fillOpacity={0.2} name="Flood Exposure" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-accent-amber" />
            <span>District Disaster Vulnerability Comparison</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtComparison}>
                <XAxis dataKey="district" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#131d38', borderColor: '#273459', borderRadius: '8px' }} />
                <Bar dataKey="totalHabs" fill="#00b4d8" name="Total Habitations" radius={[4, 4, 0, 0]} />
                <Bar dataKey="immediateRelocation" fill="#ef476f" name="Immediate Relocation" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
