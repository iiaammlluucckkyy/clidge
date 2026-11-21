import React, { useEffect } from 'react';
import {
  CalendarCheck2,
  Clock,
  MapPin,
  CheckCircle2,
  LogOut,
  AlertCircle,
  RefreshCw,
  Award,
  Calendar
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAttendance } from '../../context/AttendanceContext';

export const StudentAttendanceHistory = () => {
  const { studentHistory, isLoadingHistory, fetchStudentHistory } = useAttendance();

  useEffect(() => {
    fetchStudentHistory();
  }, [fetchStudentHistory]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-navy-950 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-600" /> Attendance History
          </h3>
          <p className="text-xs text-slate-500">
            Verified check-in and check-out logs for campus sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStudentHistory}
            disabled={isLoadingHistory}
            icon={RefreshCw}
          >
            {isLoadingHistory ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* History List or Empty State */}
      {isLoadingHistory ? (
        <div className="py-10 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-600 mb-2" />
          <p className="text-xs font-medium">Loading verified attendance logs...</p>
        </div>
      ) : studentHistory && studentHistory.length > 0 ? (
        <div className="space-y-3">
          {studentHistory.map((item, idx) => {
            const hasCheckedIn = Boolean(item.check_in_time || item.checkInTime);
            const hasCheckedOut = Boolean(item.check_out_time || item.checkOutTime);
            const checkInStr = item.check_in_time || item.checkInTime;
            const checkOutStr = item.check_out_time || item.checkOutTime;

            return (
              <div
                key={item.attendance_id || item.attendanceId || idx}
                className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Event info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasCheckedOut
                          ? 'bg-cyan-100 text-cyan-800'
                          : hasCheckedIn
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {hasCheckedOut ? 'CHECKED OUT' : hasCheckedIn ? 'CHECKED IN' : 'PENDING'}
                    </span>
                    {item.offline_synced && (
                      <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded">
                        Offline Synced
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-navy-900 line-clamp-1">
                    {item.event_title || item.eventTitle || 'Campus Session'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600" /> {item.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-600" /> {item.date}
                    </span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 text-xs text-slate-600 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-0 border-slate-200/60 font-mono text-[11px]">
                  {hasCheckedIn && (
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>In: {new Date(checkInStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                  {hasCheckedOut && (
                    <div className="flex items-center gap-1.5 text-cyan-700">
                      <LogOut className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Out: {new Date(checkOutStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <CalendarCheck2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">No attendance history logged yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Scan an event QR code during an active workshop to generate verified attendance records.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentAttendanceHistory;
