import React, { useState } from 'react';
import {
  Search,
  Users,
  MapPin,
  Radio,
  Battery,
  AlertCircle,
  CheckCircle2,
  BellRing,
  Download,
  Filter
} from 'lucide-react';
import { MONITORED_STUDENTS } from '../../data/sampleStudents';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const StudentRoster = ({ onSelectStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pingedStudents, setPingedStudents] = useState({});

  const handlePing = (studentId) => {
    setPingedStudents(prev => ({ ...prev, [studentId]: true }));
    setTimeout(() => {
      setPingedStudents(prev => ({ ...prev, [studentId]: false }));
    }, 3000);
  };

  const handleExportCSV = () => {
    const headers = 'Name,Register Number,Department,Event,Zone,Status,Last Ping,Battery\n';
    const rows = MONITORED_STUDENTS.map(
      s => `"${s.name}","${s.regNumber}","${s.department}","${s.eventName}","${s.zone}","${s.status}","${s.lastPing}","${s.battery}%"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CLIDGE-Attendance-Report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filtered = MONITORED_STUDENTS.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.zone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'INSIDE'
        ? s.status === 'Inside Venue'
        : statusFilter === 'OUTSIDE'
        ? s.status === 'Outside Bounds'
        : s.status === 'Outdated / Idle' || s.status === 'Offline';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" /> Student Attendance & Location Monitoring
          </h3>
          <p className="text-xs text-slate-500">
            Real-time geofence compliance roster for active campus sessions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            title="Download CSV Attendance Log"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-4">
        <div className="w-full sm:max-w-xs relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, register no, zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>

        {/* Tab Filter */}
        <div className="w-full sm:w-auto flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'ALL' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            All ({MONITORED_STUDENTS.length})
          </button>
          <button
            onClick={() => setStatusFilter('INSIDE')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'INSIDE' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Inside (6)
          </button>
          <button
            onClick={() => setStatusFilter('OUTSIDE')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'OUTSIDE' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Outside Bounds (1)
          </button>
          <button
            onClick={() => setStatusFilter('OUTDATED')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              statusFilter === 'OUTDATED' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Outdated/Idle (1)
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Student Details</th>
              <th className="py-3 px-4">Active Session</th>
              <th className="py-3 px-4">Current Geofence Zone</th>
              <th className="py-3 px-4">Status & Signal</th>
              <th className="py-3 px-4">Last Ping</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((std) => {
              const isPinged = pingedStudents[std.id];
              return (
                <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Student Name & Reg */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-navy-100 text-navy-800 font-bold flex items-center justify-center text-xs">
                        {std.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-navy-900">{std.name}</p>
                        <p className="font-mono text-[11px] text-cyan-700">{std.regNumber}</p>
                        <p className="text-[10px] text-slate-400">{std.department}</p>
                      </div>
                    </div>
                  </td>

                  {/* Active Event */}
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                    {std.eventName}
                  </td>

                  {/* Zone */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-slate-800 truncate max-w-[160px]">
                        {std.zone}
                      </span>
                    </div>
                  </td>

                  {/* Status & Signal Quality */}
                  <td className="py-3.5 px-4">
                    <Badge variant={std.status} size="sm">
                      {std.status}
                    </Badge>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      {std.locationQuality}
                    </span>
                  </td>

                  {/* Last Ping & Battery */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700 block">{std.lastPing}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Battery className="w-3 h-3" /> {std.battery}%
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handlePing(std.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1 ${
                        isPinged
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200'
                      }`}
                    >
                      <BellRing className={`w-3 h-3 ${isPinged ? 'animate-bounce text-emerald-600' : ''}`} />
                      <span>{isPinged ? 'Alert Sent!' : 'Ping Alert'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentRoster;
