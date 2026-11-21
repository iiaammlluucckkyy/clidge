import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  UserCheck,
  CheckCircle2,
  Mail,
  Compass,
  Edit,
  XCircle,
  StopCircle,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';

export const EventDetailsModal = ({
  isOpen,
  onClose,
  event,
  onScanQR,
  onShowQR,
  onOpenReport,
  onOpenEdit,
  onOpenParticipants
}) => {
  const { currentUser } = useAuth();
  const {
    isStudentJoined,
    joinEvent,
    leaveEvent,
    cancelEvent,
    endEvent
  } = useEvents();

  const [sharingConsent, setSharingConsent] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!event) return null;

  const isTeacher = currentUser?.role === 'teacher';
  const isOwnerTeacher = isTeacher && (event.teacherId === currentUser?.uid);
  const isJoined = !isTeacher && isStudentJoined(event.id || event.eventId);
  const isCancelled = event.status === 'Cancelled';
  const isCompleted = event.status === 'Completed';
  const isEventClosed = isCancelled || isCompleted;

  const handleJoin = async () => {
    setErrorMessage('');
    if (!sharingConsent) {
      setErrorMessage('Please consent to voluntary location sharing to participate in this geofenced event.');
      return;
    }
    try {
      setActionLoading(true);
      await joinEvent(event.id || event.eventId, sharingConsent);
      setActionLoading(false);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to join event.');
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to unregister from this event? Your location sharing will be stopped.')) {
      return;
    }
    try {
      setActionLoading(true);
      await leaveEvent(event.id || event.eventId);
      setActionLoading(false);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to leave event.');
      setActionLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!window.confirm(`Are you sure you want to cancel "${event.title}"? This will automatically terminate location tracking for all registered participants.`)) {
      return;
    }
    try {
      setActionLoading(true);
      await cancelEvent(event.id || event.eventId);
      setActionLoading(false);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to cancel event.');
      setActionLoading(false);
    }
  };

  const handleEndEvent = async () => {
    if (!window.confirm(`Mark "${event.title}" as Completed? This will conclude the session and automatically end all student location sharing.`)) {
      return;
    }
    try {
      setActionLoading(true);
      await endEvent(event.id || event.eventId);
      setActionLoading(false);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to end event.');
      setActionLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      subtitle={`${event.category || 'Academic Session'} • ${event.teacherDepartment || event.department || 'Engineering'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Banner Image if available */}
        {event.imageUrl && (
          <div className="h-44 w-full rounded-2xl overflow-hidden relative shadow-inner">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent flex items-end p-4">
              <Badge variant={event.status}>{event.status}</Badge>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Status and Capacity Header (if no image banner or secondary) */}
        {!event.imageUrl && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Badge variant={event.status}>{event.status}</Badge>
              <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200">
                {event.venue}
              </span>
            </div>

            <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-cyan-600" />
              <span>
                <strong>{event.registeredCount || 0}</strong> registered of <strong>{event.maxCapacity || 150}</strong> max
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Event Description
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            {event.description}
          </p>
        </div>

        {/* Schedule & Geofence Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 bg-navy-50/50 rounded-2xl border border-navy-100 space-y-2">
            <h5 className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-600" /> Session Schedule
            </h5>
            <p className="text-xs text-slate-700">Date: <span className="font-semibold text-navy-900">{event.date}</span></p>
            <p className="text-xs text-slate-700">Time: <span className="font-semibold text-navy-900">{event.startTime} - {event.endTime}</span></p>
            <p className="text-xs text-slate-700">Venue: <span className="font-semibold text-navy-900">{event.venue}</span></p>
          </div>

          <div className="p-4 bg-cyan-50/40 rounded-2xl border border-cyan-100 space-y-2">
            <h5 className="text-xs font-bold text-cyan-950 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-600" /> Geofence Perimeter
            </h5>
            <p className="text-xs text-slate-700">Coordinates: <span className="font-mono font-semibold text-navy-900">{event.latitude?.toFixed?.(4) || event.latitude}, {event.longitude?.toFixed?.(4) || event.longitude}</span></p>
            <p className="text-xs text-slate-700">Radius: <span className="font-semibold text-cyan-800">{event.radius || event.geofenceRadius || 65} meters</span></p>
            <p className="text-xs text-slate-700">Policy: <span className="font-semibold text-emerald-700">Auto Verification Inside Bounds</span></p>
          </div>
        </div>

        {/* Faculty Organizer Info */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Faculty Coordinator</span>
            <p className="font-bold text-navy-900">{event.teacherName || 'Faculty In-Charge'}</p>
            <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {event.teacherEmail || 'coordinator@muthayammal.edu.in'}
            </p>
          </div>
          <div className="text-[11px] text-slate-500">
            Registered: <strong className="text-navy-900">{event.registeredCount || 0}</strong> / {event.maxCapacity || 150} Students
          </div>
        </div>

        {/* Student Location Sharing Consent Box */}
        {!isTeacher && !isJoined && !isEventClosed && (
          <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-200">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="sharingConsentModal"
                checked={sharingConsent}
                onChange={(e) => setSharingConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500"
              />
              <label htmlFor="sharingConsentModal" className="text-xs text-navy-950 font-medium cursor-pointer">
                <strong>Voluntary Location Consent:</strong> I agree to share my GPS location within the {event.radius || 65}m venue geofence strictly during this event. Tracking stops automatically when the event ends.
              </label>
            </div>
          </div>
        )}

        {/* Modal Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={actionLoading}>
            Close
          </Button>

          {/* Student Actions */}
          {!isTeacher && (
            <div className="flex items-center gap-2">
              {isJoined ? (
                <>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Registered
                  </span>

                  {!isEventClosed && (
                    <Button
                      variant="cyan"
                      size="sm"
                      icon={QrCode}
                      onClick={() => {
                        onClose();
                        onScanQR && onScanQR(event);
                      }}
                    >
                      Scan QR
                    </Button>
                  )}

                  {!isCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLeave}
                      disabled={actionLoading}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      {actionLoading ? 'Leaving...' : 'Leave'}
                    </Button>
                  )}
                </>
              ) : isEventClosed ? (
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-xl">
                  {isCancelled ? 'Session Cancelled' : 'Session Completed'}
                </span>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleJoin}
                  disabled={actionLoading || (event.registeredCount >= (event.maxCapacity || 150))}
                >
                  {actionLoading ? 'Registering...' : 'Join Event'}
                </Button>
              )}
            </div>
          )}

          {/* Teacher Actions */}
          {isTeacher && (
            <div className="flex flex-wrap items-center gap-2">
              {/* If Owning Teacher, full management */}
              {isOwnerTeacher ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Users}
                    onClick={() => {
                      onClose();
                      onOpenParticipants && onOpenParticipants(event);
                    }}
                  >
                    Participants ({event.registeredCount || 0})
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => {
                      onClose();
                      onOpenEdit && onOpenEdit(event);
                    }}
                  >
                    Edit
                  </Button>

                  {!isCompleted && !isCancelled && (
                    <>
                      <Button
                        variant="cyan"
                        size="sm"
                        icon={StopCircle}
                        onClick={handleEndEvent}
                        disabled={actionLoading}
                      >
                        End Event
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={XCircle}
                        onClick={handleCancelEvent}
                        disabled={actionLoading}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        Cancel Event
                      </Button>
                    </>
                  )}

                  <Button
                    variant="cyan"
                    size="sm"
                    icon={QrCode}
                    onClick={() => {
                      onClose();
                      onShowQR && onShowQR(event);
                    }}
                  >
                    Show QR Token
                  </Button>

                  {onOpenReport && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FileSpreadsheet}
                      onClick={() => {
                        onClose();
                        onOpenReport(event);
                      }}
                    >
                      Attendance Report
                    </Button>
                  )}
                </>
              ) : (
                /* Non-owner teacher: can view participants and QR token */
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Users}
                    onClick={() => {
                      onClose();
                      onOpenParticipants && onOpenParticipants(event);
                    }}
                  >
                    View Roster
                  </Button>
                  <Button
                    variant="cyan"
                    size="sm"
                    icon={QrCode}
                    onClick={() => {
                      onClose();
                      onShowQR && onShowQR(event);
                    }}
                  >
                    QR Token
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EventDetailsModal;
