import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { School, Event, PerformanceLevel } from '../types';
import { Sparkles, Trophy, AlertCircle, TrendingUp, Calendar, CheckSquare } from 'lucide-react';

interface DashboardProps {
  schools: School[];
  events: Event[];
}

const COLORS = ['#10B981', '#3B82F6', '#F1E4D1', '#EF4444']; // Excellent (Green), Good (Blue), Nice (Beige), Bad (Red)
const LEVEL_LABELS = {
  Excellent: 'Excellent',
  Good: 'Good',
  Nice: 'Nice',
  Bad: 'Bad'
};

const Dashboard: React.FC<DashboardProps> = ({ schools, events }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'SMAK' | 'SMTK'>('ALL');

  // Filter Data
  const filteredSchools = useMemo(() => {
    return filterType === 'ALL' 
      ? schools 
      : schools.filter(s => s.type === filterType);
  }, [schools, filterType]);

  // Compute Levels
  const stats = useMemo(() => {
    const levels = { Excellent: 0, Good: 0, Nice: 0, Bad: 0 };
    const sorted = [...filteredSchools].sort((a, b) => b.totalScore - a.totalScore);
    
    filteredSchools.forEach(s => {
      let level: PerformanceLevel = 'Bad';
      const percentage = s.totalEventsPossible > 0 ? (s.eventsParticipated / s.totalEventsPossible) : 0;
      
      if (percentage >= 0.8) level = 'Excellent';
      else if (percentage >= 0.6) level = 'Good';
      else if (percentage >= 0.4) level = 'Nice';
      
      levels[level]++;
    });

    return {
      levels,
      top5: sorted.slice(0, 5),
      avgScore: filteredSchools.length > 0 
        ? Math.round(filteredSchools.reduce((acc, curr) => acc + curr.totalScore, 0) / filteredSchools.length) 
        : 0
    };
  }, [filteredSchools]);

  // Compute Event Participation Details
  const eventStats = useMemo(() => {
    return events.map(event => {
      // Logic assumes s.participatedEventIds contains event.id
      const participants = schools.filter(s => s.participatedEventIds?.includes(event.id));
      const smakCount = participants.filter(s => s.type === 'SMAK').length;
      const smtkCount = participants.filter(s => s.type === 'SMTK').length;
      
      return {
        ...event,
        smakCount,
        smtkCount,
        totalCount: smakCount + smtkCount
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date desc
  }, [events, schools]);

  const pieData = [
    { name: 'Excellent', value: stats.levels['Excellent'] },
    { name: 'Good', value: stats.levels['Good'] },
    { name: 'Nice', value: stats.levels['Nice'] },
    { name: 'Bad', value: stats.levels['Bad'] },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#162660]">Dashboard Performa</h2>
          <p className="text-slate-500">Monitoring partisipasi sekolah dalam kegiatan.</p>
        </div>
        <div className="flex bg-white rounded-lg shadow-sm p-1 border border-slate-200">
          {(['ALL', 'SMAK', 'SMTK'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filterType === type 
                  ? 'bg-[#162660] text-white shadow' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type === 'ALL' ? 'Semua Sekolah' : type}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-[#D0E6FD] text-[#162660] rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Rata-rata Skor</p>
            <h3 className="text-2xl font-bold text-[#162660]">{stats.avgScore}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-[#F1E4D1] text-[#162660] rounded-lg">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Top Performer</p>
            <h3 className="text-lg font-bold text-[#162660] truncate max-w-[150px]" title={stats.top5[0]?.name}>
              {stats.top5[0]?.name || '-'}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Events</p>
            <h3 className="text-2xl font-bold text-[#162660]">{events.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Bad Performance</p>
            <h3 className="text-2xl font-bold text-[#162660]">{stats.levels['Bad']} <span className="text-xs font-normal">Sekolah</span></h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 5 Schools */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-[#162660] mb-6">Top 5 Sekolah Paling Aktif</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.top5} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="totalScore" fill="#162660" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Participation Levels */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-[#162660] mb-6">Distribusi Level Keikutsertaan</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* NEW: Event Participation Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
           <h3 className="text-lg font-bold text-[#162660] flex items-center gap-2">
            <Calendar size={20} />
            Detail Partisipasi Per Kegiatan
           </h3>
           <p className="text-sm text-slate-500 mt-1">
             Jumlah sekolah yang berpartisipasi (Hadir/Mengumpulkan Data) pada setiap kegiatan.
           </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Nama Kegiatan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4 text-center bg-blue-50 text-blue-800">Partisipasi SMAK</th>
                <th className="px-6 py-4 text-center bg-orange-50 text-orange-800">Partisipasi SMTK</th>
                <th className="px-6 py-4 text-center font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {eventStats.length > 0 ? (
                eventStats.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-[#162660]">{event.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{event.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        event.type === 'Socialization' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50 bg-opacity-30 font-medium text-slate-700">
                      {event.smakCount}
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-50 bg-opacity-30 font-medium text-slate-700">
                      {event.smtkCount}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#162660]">
                      {event.totalCount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Belum ada kegiatan yang dibuat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;