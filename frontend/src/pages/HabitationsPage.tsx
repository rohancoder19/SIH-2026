import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Habitation } from '../types';
import { Badge } from '../components/Badge';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Home, Download, FileSearch } from 'lucide-react';

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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CBD5E1] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Home className="w-6 h-6 text-[#4F46E5]" />
            <span>Vulnerable Habitations Registry</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Catalog of surveyed settlements with multi-hazard scores and relocation priority rankings
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-xs font-bold text-[#0F172A] transition flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-[#4F46E5]" />
          <span>Export CSV Dataset</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search habitation name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-xs font-semibold text-[#334155]">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
            >
              <option value="All">All Districts (55)</option>
              <option value="Darjeeling">Darjeeling District</option>
              <option value="Kalimpong">Kalimpong District</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#334155]">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
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
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="h-6 bg-[#E2E8F0] rounded-lg animate-pulse w-1/4" />
            <div className="h-10 bg-[#E2E8F0]/50 rounded-lg animate-pulse" />
            <div className="h-10 bg-[#E2E8F0]/50 rounded-lg animate-pulse" />
            <div className="h-10 bg-[#E2E8F0]/50 rounded-lg animate-pulse" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileSearch className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0F172A]">No habitation statements found</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              Try changing your search query or filter selection to view matching habitation records.
            </p>
            <button
              onClick={() => { setSearch(''); setDistrictFilter('All'); setPriorityFilter('All'); }}
              className="mt-4 px-4 py-2 bg-[#EEF2FF] text-[#4F46E5] font-bold text-xs rounded-xl border border-[#E0E7FF] hover:bg-[#E0E7FF] transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#CBD5E1] text-[#64748B] uppercase text-[10px] tracking-wider bg-[#E2E8F0]/60">
                  <th className="py-2.5 px-4 rounded-l-lg">Habitation</th>
                  <th className="py-2.5 px-4">District</th>
                  <th className="py-2.5 px-4">Elevation</th>
                  <th className="py-2.5 px-4">Total Pop</th>
                  <th className="py-2.5 px-4">Vulnerable Pop</th>
                  <th className="py-2.5 px-4">Risk Score</th>
                  <th className="py-2.5 px-4">Relocation Priority</th>
                  <th className="py-2.5 px-4 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((hab) => (
                  <tr key={hab.id} className="hover:bg-[#E2E8F0]/40 transition group">
                    <td className="py-3.5 px-4 font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition">{hab.name}</td>
                    <td className="py-3.5 px-4 text-[#334155]">{hab.district}</td>
                    <td className="py-3.5 px-4 text-[#334155]">{hab.elevation} m</td>
                    <td className="py-3.5 px-4 text-[#334155]">{hab.population.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-semibold text-rose-700">{hab.vulnerable_population.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-amber-700">{hab.hazard_score}/100</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge priority={hab.relocation_priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/habitations/${hab.id}`)}
                        className="px-3 py-1.5 bg-[#E2E8F0] hover:bg-[#CBD5E1] border border-[#CBD5E1] text-[#334155] font-semibold rounded-lg transition"
                      >
                        Detail & XAI
                      </button>
                      <button
                        onClick={() => navigate(`/relocation?habitation_id=${hab.id}`)}
                        className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-lg transition shadow-xs"
                      >
                        Find Sites
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
