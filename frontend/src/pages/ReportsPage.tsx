import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, Download, Printer, ShieldAlert, CheckCircle2 } from 'lucide-react';

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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-700/60 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent-cyan" />
            <span>Disaster Management Reports & Exports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable PDF & CSV executive summaries for government authorities and disaster relief teams
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-navy-850 border border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none"
          >
            <option value="Darjeeling">Darjeeling District</option>
            <option value="Kalimpong">Kalimpong District</option>
          </select>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-950 font-black text-xs shadow-lg shadow-accent-blue/20 hover:opacity-95 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      {report && (
        <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-100 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          {/* Report Document Header */}
          <div className="border-b border-navy-700 pb-6 print:border-black">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-accent-cyan print:text-blue-700">
                  NATIONAL DISASTER MITIGATION AUTHORITY (NDMA)
                </span>
                <h2 className="text-2xl font-black mt-1 text-white print:text-black">{report.report_title}</h2>
                <p className="text-xs text-slate-400 mt-1 print:text-gray-600">Generated: {report.timestamp} • Platform: SurakshitSthan AI v2.4.0</p>
              </div>
              <ShieldAlert className="w-10 h-10 text-accent-red" />
            </div>
          </div>

          {/* Key Executive Metrics */}
          <div className="grid grid-cols-3 gap-4 bg-navy-850 p-4 rounded-2xl border border-navy-700 print:bg-gray-100 print:border-gray-300">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase print:text-gray-600">Total Habitations</span>
              <span className="text-2xl font-black text-white print:text-black">{report.metrics.total_habitations}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase print:text-gray-600">Vulnerable Population</span>
              <span className="text-2xl font-black text-accent-red print:text-red-600">{report.metrics.total_vulnerable_population.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase print:text-gray-600">Safe Site Capacity Buffer</span>
              <span className="text-2xl font-black text-accent-teal print:text-green-600">{report.metrics.available_buffer_capacity.toLocaleString()} seats</span>
            </div>
          </div>

          {/* Critical Habitations Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider print:text-black">
              Immediate Relocation Priority Settlements
            </h3>
            <div className="space-y-2">
              {report.critical_habitations?.map((hab: any) => (
                <div key={hab.id} className="p-3 bg-navy-850 rounded-xl border border-navy-700/60 flex items-center justify-between text-xs print:bg-gray-50 print:border-gray-300">
                  <div>
                    <span className="font-bold text-white print:text-black">{hab.name}</span>
                    <span className="text-slate-400 block text-[11px] print:text-gray-600">Population: {hab.population.toLocaleString()} • Vulnerable: {hab.vulnerable_population.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-accent-red print:text-red-600">Score: {hab.risk_score}/100</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">{hab.priority}</span>
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
