import React, { useState } from 'react';
import { School } from '../types';
import { Award, AlertCircle, Filter } from 'lucide-react';

interface RankingTableProps {
  schools: School[];
}

const RankingTable: React.FC<RankingTableProps> = ({ schools }) => {
  const [activeType, setActiveType] = useState<'SMAK' | 'SMTK'>('SMAK');

  const filteredSchools = schools.filter(s => s.type === activeType);
  const sortedSchools = [...filteredSchools].sort((a, b) => b.totalScore - a.totalScore);

  const getLevelBadge = (score: number, totalEvents: number, eventsParticipated: number) => {
    const percentage = totalEvents > 0 ? (eventsParticipated / totalEvents) : 0;
    
    let color = 'bg-gray-100 text-gray-800';
    let label = 'Unknown';

    if (percentage >= 0.8) {
      color = 'bg-emerald-100 text-emerald-800';
      label = 'Excellent';
    } else if (percentage >= 0.6) {
      color = 'bg-blue-100 text-blue-800';
      label = 'Good';
    } else if (percentage >= 0.4) {
      color = 'bg-[#F1E4D1] text-[#162660]';
      label = 'Nice';
    } else {
      color = 'bg-red-100 text-red-800';
      label = 'Bad';
    }

    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>{label}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-[#D0E6FD] bg-opacity-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-[#162660] flex items-center gap-2">
            <Award className="text-[#162660]" size={20} />
            Daftar Peringkat Sekolah
          </h3>
          
          {/* Tabs for Separation */}
          <div className="flex bg-white rounded-lg p-1 border border-blue-200 shadow-sm">
            <button
              onClick={() => setActiveType('SMAK')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                activeType === 'SMAK' 
                  ? 'bg-[#162660] text-white shadow' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              SMAK
            </button>
            <button
              onClick={() => setActiveType('SMTK')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                activeType === 'SMTK' 
                  ? 'bg-[#162660] text-white shadow' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              SMTK
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Rank</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">NPSN</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Sekolah</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Provinsi</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Partisipasi</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total Skor</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedSchools.length > 0 ? (
              sortedSchools.map((school, index) => (
                <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-slate-200 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                    {school.npsn}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{school.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{school.status}</div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {school.province}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-slate-600">
                      {school.eventsParticipated} <span className="text-slate-400">/ {school.totalEventsPossible}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-[#162660]">{school.totalScore}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getLevelBadge(school.totalScore, school.totalEventsPossible, school.eventsParticipated)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  Tidak ada data sekolah untuk kategori {activeType}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTable;