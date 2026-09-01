import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, Printer, ShieldAlert } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [district, setDistrict] = useState('Darjeeling');

  useEffect(() => {
    const fetchReport = async () => {
      const data = await api.getSummaryReport(district);
      setReport(data);
    };
    fetchReport();
  }, [district]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CBD5E1] pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#4F46E5]" />
            <span>Disaster Management Reports & Exports</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Generate printable PDF & CSV executive summaries for government authorities and disaster relief teams
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-[#E2E8F0]/70 border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
          >
            <option value="Darjeeling">Darjeeling District</option>
            <option value="Kalimpong">Kalimpong District</option>
          </select>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      {report && (
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-8 shadow-xs space-y-6 text-[#0F172A] print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          {/* Report Document Header */}
          <div className="border-b border-[#CBD5E1] pb-6 print:border-black">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#4F46E5] print:text-blue-700">
                  NATIONAL DISASTER MITIGATION AUTHORITY (NDMA)
                </span>
                <h2 className="text-2xl font-extrabold mt-1 text-[#0F172A] print:text-black">{report.report_title}</h2>
                <p className="text-xs text-[#64748B] mt-1 print:text-gray-600">Generated: {report.timestamp} • Platform: SurakshitSthan AI v2.4.0</p>
              </div>
              <ShieldAlert className="w-10 h-10 text-rose-600" />
            </div>
          </div>

          {/* Key Executive Metrics */}
          <div className="grid grid-cols-3 gap-4 bg-[#E2E8F0]/60 p-4 rounded-xl border border-[#CBD5E1] print:bg-gray-100 print:border-gray-300">
            <div>
              <span className="text-[10px] text-[#64748B] block uppercase font-bold print:text-gray-600">Total Habitations</span>
              <span className="text-2xl font-extrabold text-[#0F172A] print:text-black">{report.metrics.total_habitations}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] block uppercase font-bold print:text-gray-600">Vulnerable Population</span>
              <span className="text-2xl font-extrabold text-rose-700 print:text-red-600">{report.metrics.total_vulnerable_population.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] block uppercase font-bold print:text-gray-600">Safe Site Capacity Buffer</span>
              <span className="text-2xl font-extrabold text-emerald-800 print:text-green-600">{report.metrics.available_buffer_capacity.toLocaleString()} seats</span>
            </div>
          </div>

          {/* Critical Habitations Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider print:text-black">
              Immediate Relocation Priority Settlements
            </h3>
            <div className="space-y-2">
              {report.critical_habitations?.map((hab: any) => (
                <div key={hab.id} className="p-3 bg-[#E2E8F0]/50 rounded-xl border border-[#CBD5E1] flex items-center justify-between text-xs print:bg-gray-50 print:border-gray-300">
                  <div>
                    <span className="font-bold text-[#0F172A] print:text-black">{hab.name}</span>
                    <span className="text-[#64748B] block text-[11px] print:text-gray-600">Population: {hab.population.toLocaleString()} • Vulnerable: {hab.vulnerable_population.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-rose-700 print:text-red-600">Score: {hab.risk_score}/100</span>
                    <span className="block text-[10px] text-[#64748B] font-bold uppercase">{hab.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
