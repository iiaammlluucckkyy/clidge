import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  LogOut,
  Radio,
  Clock,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  MapPin,
  Calendar
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useAttendance } from '../../context/AttendanceContext';

export const AttendanceReportModal = ({ isOpen, onClose, event }) => {
  const { fetchAttendanceReport, exportCsvReport } = useAttendance();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, CHECKED_IN, CHECKED_OUT, ABSENT

  const eventId = event?.id || event?.eventId;

  const loadReport = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const data = await fetchAttendanceReport(eventId);
      setReport(data);
    } catch (err) {
      console.warn('Failed to load report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && eventId) {
      loadReport();
    }
  }, [isOpen, eventId]);

  if (!event) return null;

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await exportCsvReport(eventId, event.title);
    } finally {
      setIsExporting(false);
    }
  };

  // Filter individual records
  const records = report?.individual_records || [];
  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || r.attendance_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalReg = report?.total_registered || 0;
  const totalIn = report?.total_check_ins || 0;
  const totalOut = report?.total_check_outs || 0;
  const liveCount = report?.live_locations || 0;
  const outdatedCount = report?.outdated_locations || 0;
  const unavailCount = report?.unavailable_locations || 0;
  const attRate = report?.attendance_rate_percentage || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Campus Event Attendance & Verification Report"
      subtitle={`${event.title} • ${event.venue}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Event Quick Overview Header */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold text-navy-950">
              <Calendar className="w-3.5 h-3.5 text-cyan-600" /> {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600" /> {event.startTime} - {event.endTime}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" /> {event.venue} (Radius: {event.radius || 65}m)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadReport}
              disabled={isLoading}
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Button
              variant="cyan"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting || isLoading}
              icon={Download}
            >
              {isExporting ? 'Exporting...' : 'Export CSV Report'}
            </Button>
          </div>
        </div>

        {/* 1. Core Summary Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Enrolled</span>
            <div className="text-xl font-extrabold text-navy-950 flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-400" /> {totalReg}
            </div>
            <span className="text-[10px] text-slate-400">Registered Roster</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-sm bg-emerald-50/20">
            <span className="text-[11px] font-semibold text-emerald-800 block mb-1">Check-Ins</span>
            <div className="text-xl font-extrabold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {totalIn}
            </div>
            <span className="text-[10px] text-emerald-700/80 font-semibold">{attRate}% Compliance</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-cyan-200/80 shadow-sm bg-cyan-50/20">
            <span className="text-[11px] font-semibold text-cyan-800 block mb-1">Check-Outs</span>
            <div className="text-xl font-extrabold text-cyan-700 flex items-center gap-1">
              <LogOut className="w-4 h-4" /> {totalOut}
            </div>
            <span className="text-[10px] text-cyan-700/80">Completed Session</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-700 block mb-1">Live Locations</span>
            <div className="text-xl font-extrabold text-emerald-600 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> {liveCount}
            </div>
            <span className="text-[10px] text-slate-400">&lt; 5m update</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-amber-700 block mb-1">Outdated</span>
            <div className="text-xl font-extrabold text-amber-600 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {outdatedCount}
            </div>
            <span className="text-[10px] text-slate-400">&gt; 5m stale</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Unavailable</span>
            <div className="text-xl font-extrabold text-slate-500 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> {unavailCount}
            </div>
            <span className="text-[10px] text-slate-400">No GNSS ping</span>
          </div>
        </div>

        {/* 2. Visual Attendance & Location Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart 1: Attendance Ratio Progress Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-navy-950">Attendance Compliance Breakdown</span>
              <span className="font-mono font-bold text-cyan-700">{attRate}%</span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${totalReg ? (totalIn / totalReg) * 100 : 0}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Checked-in: ${totalIn}`}
              ></div>
              <div
                style={{ width: `${totalReg ? ((totalReg - totalIn) / totalReg) * 100 : 0}%` }}
                className="bg-slate-200 transition-all duration-500"
                title={`Absent: ${totalReg - totalIn}`}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Checked-In ({totalIn})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span> Absent / Not Checked In ({Math.max(0, totalReg - totalIn)})
              </span>
            </div>
          </div>

          {/* Chart 2: Location Stream Quality Distribution */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-navy-950">GNSS Location Quality Distribution</span>
              <span className="text-[11px] text-slate-500 font-medium">Active Monitoring</span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${totalReg ? (liveCount / totalReg) * 100 : 0}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Live: ${liveCount}`}
              ></div>
              <div
                style={{ width: `${totalReg ? (outdatedCount / totalReg) * 100 : 0}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Outdated: ${outdatedCount}`}
              ></div>
              <div
                style={{ width: `${totalReg ? (unavailCount / totalReg) * 100 : 0}%` }}
                className="bg-slate-300 transition-all duration-500"
                title={`Unavailable: ${unavailCount}`}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live ({liveCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Outdated ({outdatedCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span> Unavailable ({unavailCount})
              </span>
            </div>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or roll..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'CHECKED_IN', 'CHECKED_OUT', 'ABSENT'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-navy-950 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Individual Participation Roster Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-600 mb-2" />
              <p className="text-xs font-medium">Compiling event attendance records...</p>
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 font-semibold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Student Details</th>
                    <th className="px-3 py-3">Attendance</th>
                    <th className="px-3 py-3">Check-In Time</th>
                    <th className="px-3 py-3">Check-Out Time</th>
                    <th className="px-3 py-3">Location Status</th>
                    <th className="px-4 py-3">Geofence Boundary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.student_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-navy-950">{rec.student_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {rec.registration_number} • {rec.department}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant={
                            rec.attendance_status === 'CHECKED_IN'
                              ? 'Ongoing'
                              : rec.attendance_status === 'CHECKED_OUT'
                              ? 'Completed'
                              : 'Cancelled'
                          }
                          size="sm"
                        >
                          {rec.attendance_status === 'CHECKED_IN'
                            ? 'CHECKED-IN'
                            : rec.attendance_status === 'CHECKED_OUT'
                            ? 'CHECKED-OUT'
                            : 'ABSENT'}
                        </Badge>
                        {rec.offline_synced && (
                          <span className="block text-[9px] font-mono text-cyan-700 mt-0.5">
                            ⚡ Synced Offline
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-mono text-[11px]">
                        {rec.check_in_time
                          ? new Date(rec.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-mono text-[11px]">
                        {rec.check_out_time
                          ? new Date(rec.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.location_status === 'LIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.location_status === 'OUTDATED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rec.location_status === 'LIVE'
                                ? 'bg-emerald-500'
                                : rec.location_status === 'OUTDATED'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          ></span>
                          {rec.location_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                              rec.is_inside_geofence
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {rec.is_inside_geofence ? 'INSIDE' : 'OUTSIDE'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {rec.distance_meters !== null ? `${Math.round(rec.distance_meters)}m` : '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No student records match filter criteria.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Students will appear once they register for this event.</p>
            </div>
          )}
        </div>

        {/* 5. Academic Disclaimer Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Academic Disclaimer:</strong> Attendance verification records (QR scan) are maintained separately from continuous GPS positioning records. Geofencing calculations represent real-time device proximity and do not constitute official attendance proof.
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default AttendanceReportModal;
