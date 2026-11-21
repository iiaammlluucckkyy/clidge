import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  QrCode,
  CheckCircle2,
  ArrowRight,
  Edit,
  Users2,
  StopCircle,
  XCircle,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';

export const EventCard = ({
  event,
  onSelect,
  onScanQR,
  onShowQR,
  onOpenReport,
  onOpenEdit,
  onOpenParticipants
}) => {
  const { currentUser } = useAuth();
  const { isStudentJoined, leaveEvent, endEvent, cancelEvent } = useEvents();

  const isTeacher = currentUser?.role === 'teacher';
  const isOwner = isTeacher && (event.teacherId === currentUser?.uid);
  const isJoined = !isTeacher && isStudentJoined(event.id || event.eventId);
  const isFull = (event.registeredCount || 0) >= (event.maxCapacity || 150);
  const isCompleted = event.status === 'Completed';
  const isCancelled = event.status === 'Cancelled';
  const isEventClosed = isCompleted || isCancelled;

  const handleQuickLeave = async (e) => {
    e.stopPropagation();
    if (window.confirm('Do you want to leave this event?')) {
      try {
        await leaveEvent(event.id || event.eventId);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleQuickEnd = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Mark "${event.title}" as Completed? This automatically ends participant location sharing.`)) {
      try {
        await endEvent(event.id || event.eventId);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleQuickCancel = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Cancel "${event.title}"? This will terminate student location tracking.`)) {
      try {
        await cancelEvent(event.id || event.eventId);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group overflow-hidden">
      <div>
        {/* Optional Image Banner */}
        {event.imageUrl && (
          <div className="h-32 w-full overflow-hidden relative bg-slate-900">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
              <span className="text-[10px] font-semibold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                {event.category || 'Academic Session'}
              </span>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge variant={event.status} size="sm">
              {event.status}
            </Badge>
            {!event.imageUrl && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {event.category || 'Workshop'}
              </span>
            )}
            {isTeacher && isOwner && (
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                Created by you
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(event.id || event.eventId)}
            className="text-base sm:text-lg font-bold text-navy-900 group-hover:text-cyan-600 transition-colors cursor-pointer line-clamp-2 mb-2"
          >
            {event.title}
          </h3>

          {/* Department */}
          <p className="text-xs font-medium text-cyan-700 mb-3 truncate">
            {event.teacherDepartment || event.department || 'Engineering & Technology'}
          </p>

          {/* Meta Details */}
          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 mb-3.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-navy-900">
                <Calendar className="w-3.5 h-3.5 text-cyan-600" /> {event.date}
              </span>
              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Clock className="w-3 h-3 text-cyan-600" /> {event.startTime}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
              <span className="truncate text-slate-700">{event.venue}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <span className="text-slate-500 flex items-center gap-1">
                <Shield className="w-3 h-3 text-cyan-600" /> Geofence
              </span>
              <span className="font-semibold text-navy-900">{event.radius || event.geofenceRadius || 65}m radius</span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Registered
              </span>
              <span className="text-navy-900">
                {event.registeredCount || 0} / {event.maxCapacity || 150} ({Math.round(((event.registeredCount || 0) / (event.maxCapacity || 150)) * 100)}%)
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, ((event.registeredCount || 0) / (event.maxCapacity || 150)) * 100)}%` }}
              />
            </div>
            {event.status === 'Ongoing' && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active session in progress
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 sm:p-6 pt-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2 justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(event.id || event.eventId)}
          icon={ArrowRight}
          iconPosition="right"
        >
          Details
        </Button>

        {/* Student View Controls */}
        {!isTeacher && (
          <div className="flex items-center gap-2">
            {isJoined ? (
              <>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Joined
                </span>

                {!isEventClosed && (
                  <Button
                    variant="cyan"
                    size="sm"
                    onClick={() => onScanQR && onScanQR(event)}
                    icon={QrCode}
                    title="Scan session QR Code"
                  >
                    Scan QR
                  </Button>
                )}

                {!isCompleted && (
                  <button
                    onClick={handleQuickLeave}
                    className="text-[11px] text-slate-400 hover:text-rose-600 underline font-medium"
                  >
                    Leave
                  </button>
                )}
              </>
            ) : isEventClosed ? (
              <span className="text-[11px] text-slate-400 font-medium italic">
                {isCancelled ? 'Cancelled' : 'Ended'}
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSelect(event.id || event.eventId)}
                disabled={isFull}
              >
                {isFull ? 'Full' : 'Join Event'}
              </Button>
            )}
          </div>
        )}

        {/* Teacher View Controls */}
        {isTeacher && (
          <div className="flex items-center gap-2">
            {isOwner ? (
              <>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    title="View registered students roster"
                    onClick={() => onOpenParticipants && onOpenParticipants(event)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-navy-950 hover:bg-white transition-colors"
                  >
                    <Users2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    title="Edit event details"
                    onClick={() => onOpenEdit && onOpenEdit(event)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-navy-950 hover:bg-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {onOpenReport && (
                    <button
                      type="button"
                      title="View Attendance Report"
                      onClick={() => onOpenReport(event)}
                      className="p-1.5 rounded-lg text-cyan-700 hover:text-navy-950 hover:bg-white transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                  )}

                  {!isEventClosed && (
                    <>
                      <button
                        type="button"
                        title="End event session"
                        onClick={handleQuickEnd}
                        className="p-1.5 rounded-lg text-cyan-600 hover:text-cyan-800 hover:bg-white transition-colors"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        title="Cancel event"
                        onClick={handleQuickCancel}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-white transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => onShowQR && onShowQR(event)}
                  icon={QrCode}
                >
                  QR
                </Button>
              </>
            ) : (
              <Button
                variant="cyan"
                size="sm"
                onClick={() => onShowQR && onShowQR(event)}
                icon={QrCode}
              >
                Show QR
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
