import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Users,
  CheckCircle2,
  LogOut,
  Radio,
  RefreshCw,
  TrendingUp,
  QrCode,
  ChevronRight
} from 'lucide-react';
import Button from '../common/Button';
import { useAttendance } from '../../context/AttendanceContext';

/**
 * Compact attendance summary panel for the Teacher Dashboard.
 * Shows live metrics for all teacher-created events.
 * No fabricated data — only fetched from the backend.
 */
export const AttendanceSummaryWidget = ({ events = [], onOpenQR, onOpenReport }) => {
  const { fetchAttendanceReport } = useAttendance();
  const [reports, setReports] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  // Fetch reports for active/ongoing events only
  useEffect(() => {
    const activeEvents = events.filter(e => e.status === 'Ongoing' || e.status === 'Upcoming');
    activeEvents.forEach(async (evt) => {
      const id = evt.id || evt.eventId;
      if (!reports[id]) {
        try {
          const rep = await fetchAttendanceReport(id);
          if (rep) setReports(prev => ({ ...prev, [id]: rep }));
        } catch {}
      }
    });
  }, [events]);

  const activeEvents = events.filter(e => e.status === 'Ongoing' || e.status === 'Upcoming');

  if (activeEvents.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card text-center py-12">
        <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-600">No active events to show attendance for</p>
        <p className="text-xs text-slate-400 mt-1">Create an event and generate a QR code to begin tracking attendance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-navy-950">Live Attendance Summary</h2>
          <p className="text-xs text-slate-500">Real-time check-in counts and active GPS status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeEvents.slice(0, 4).map((evt) => {
          const id = evt.id || evt.eventId;
          const rep = reports[id];
          const isLoading = loadingId === id;

          const totalReg = rep?.total_registered ?? evt.registeredCount ?? '—';
          const totalIn = rep?.total_check_ins ?? '—';
          const totalOut = rep?.total_check_outs ?? '—';
          const liveCount = rep?.live_locations ?? '—';
          const rate = rep?.attendance_rate_percentage;

          return (
            <div
              key={id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all"
            >
              {/* Event header */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1 inline-block ${
                      evt.status === 'Ongoing'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-cyan-100 text-cyan-800'
                    }`}
                  >
                    {evt.status === 'Ongoing' ? '● LIVE' : '○ UPCOMING'}
                  </span>
                  <h3 className="text-sm font-bold text-navy-950 line-clamp-2">{evt.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{evt.venue}</p>
                </div>
                <button
                  onClick={() => onOpenReport && onOpenReport(evt)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 transition-colors flex-shrink-0"
                  title="Full Attendance Report"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Metric grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-lg font-extrabold text-navy-950">{totalReg}</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Enrolled</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-extrabold text-emerald-600">{totalIn}</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Checked-In</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-extrabold text-cyan-600">{totalOut}</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Checked-Out</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-extrabold text-emerald-500 flex items-center justify-center gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                    {liveCount}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">LIVE GPS</div>
                </div>
              </div>

              {/* Attendance rate bar */}
              {rate !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Attendance Compliance</span>
                    <span className="font-bold text-navy-950">{rate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, rate)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={async () => {
                    setLoadingId(id);
                    try {
                      const rep = await fetchAttendanceReport(id);
                      if (rep) setReports(prev => ({ ...prev, [id]: rep }));
                    } finally {
                      setLoadingId(null);
                    }
                  }}
                  disabled={isLoading}
                  icon={RefreshCw}
                >
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onOpenQR && onOpenQR(evt)}
                  icon={QrCode}
                >
                  Show QR
                </Button>
                <Button
                  variant="cyan"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onOpenReport && onOpenReport(evt)}
                  icon={FileSpreadsheet}
                >
                  Report
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceSummaryWidget;
