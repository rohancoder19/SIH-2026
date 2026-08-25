import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Habitation } from '../types';
import { Badge } from '../components/Badge';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Home, Download, ArrowUpDown, ChevronRight } from 'lucide-react';

export const HabitationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [habitations, setHabitations] = useState<Habitation[]>([]);
  const [districtFilter, setDistrictFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHabs = async () => {
      setLoading(true);
      try {
        const data = await api.getHabitations();
        setHabitations(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHabs();
  }, []);

  const filtered = habitations.filter((h) => {
    const matchDist = districtFilter === 'All' || h.district === districtFilter;
    const matchPrio = priorityFilter === 'All' || h.relocation_priority === priorityFilter;
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.district.toLowerCase().includes(search.toLowerCase());
    return matchDist && matchPrio && matchSearch;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'District', 'Population', 'Vulnerable Pop', 'Hazard Score', 'Priority'];
    const rows = filtered.map(h => [h.id, `"${h.name}"`, `"${h.district}"`, h.population, h.vulnerable_population, h.hazard_score, h.relocation_priority]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `surakshitsthan_habitations_${districtFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-700/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Home className="w-6 h-6 text-accent-cyan" />
            <span>Vulnerable Habitations Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Catalog of surveyed settlements with multi-hazard scores and relocation priority rankings
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs font-bold text-slate-200 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-accent-cyan" />
          <span>Export CSV Dataset</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-navy-900 border border-navy-700/80 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search habitation name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-850 border border-navy-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-navy-850 border border-navy-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Districts (55)</option>
              <option value="Darjeeling">Darjeeling District</option>
              <option value="Kalimpong">Kalimpong District</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-navy-850 border border-navy-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="IMMEDIATE">Immediate</option>
              <option value="SHORT_TERM">Short-Term</option>
              <option value="MEDIUM_TERM">Medium-Term</option>
              <option value="MONITOR">Monitor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-700 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-4">Habitation</th>
                <th className="pb-3 px-4">District</th>
                <th className="pb-3 px-4">Elevation</th>
                <th className="pb-3 px-4">Total Pop</th>
                <th className="pb-3 px-4">Vulnerable Pop</th>
                <th className="pb-3 px-4">Risk Score</th>
                <th className="pb-3 px-4">Relocation Priority</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {filtered.map((hab) => (
                <tr key={hab.id} className="hover:bg-navy-850/60 transition group">
                  <td className="py-3.5 px-4 font-bold text-white group-hover:text-accent-cyan transition">{hab.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{hab.district}</td>
                  <td className="py-3.5 px-4 text-slate-300">{hab.elevation} m</td>
                  <td className="py-3.5 px-4 text-slate-300">{hab.population.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-semibold text-accent-red">{hab.vulnerable_population.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-accent-amber">{hab.hazard_score}/100</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge priority={hab.relocation_priority} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/habitations/${hab.id}`)}
                      className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold rounded-lg transition"
                    >
                      Detail & XAI
                    </button>
                    <button
                      onClick={() => navigate(`/relocation?habitation_id=${hab.id}`)}
                      className="px-3 py-1.5 bg-accent-blue hover:bg-accent-blue/80 text-navy-950 font-black rounded-lg transition"
                    >
                      Find Sites
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
