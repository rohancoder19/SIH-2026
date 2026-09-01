import React from 'react';
import { BarChart3, TrendingUp, Users } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CBD5E1] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#4F46E5]" />
            <span>Advanced Disaster Analytics & Trends</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Historical vulnerability trends, seasonal monsoon hazard forecasting, and district comparative statistics
          </p>
        </div>
      </div>

      {/* Grid: Historical Risk Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
            <span>Seasonal Multi-Hazard Risk Trend (2026 Monsoon Forecast)</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Area type="monotone" dataKey="landslideRisk" stroke="#4F46E5" fill="#EEF2FF" fillOpacity={0.7} name="Landslide Risk" />
                <Area type="monotone" dataKey="floodRisk" stroke="#DC2626" fill="#FEE2E2" fillOpacity={0.6} name="Flood Exposure" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4F46E5]" />
            <span>District Disaster Vulnerability Comparison</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtComparison}>
                <XAxis dataKey="district" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="totalHabs" fill="#4F46E5" name="Total Habitations" radius={[4, 4, 0, 0]} />
                <Bar dataKey="immediateRelocation" fill="#DC2626" name="Immediate Relocation" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
