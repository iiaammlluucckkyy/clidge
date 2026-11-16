import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  QrCode,
  UserCheck,
  CheckCircle2,
  Mail,
  Share2
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';

export const EventDetailsModal = ({ isOpen, onClose, event, onScanQR, onShowQR }) => {
  const { currentRole } = useAuth();
  const { joinEvent, leaveEvent } = useEvents();

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      subtitle={`${event.category} • ${event.department}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Status and Capacity Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <Badge variant={event.status}>{event.status}</Badge>
            <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
              {event.venue}
            </span>
          </div>

          <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-cyan-600" />
            <span>
              <strong>{event.registeredCount}</strong> registered of <strong>{event.maxCapacity}</strong> max
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Event Description
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Schedule & Geofence Details */}
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
              <ShieldCheck className="w-4 h-4 text-cyan-600" /> Geofence Perimeter
            </h5>
            <p className="text-xs text-slate-700">Radius: <span className="font-semibold text-navy-900">{event.geofenceRadius} meters</span></p>
            <p className="text-xs text-slate-700">Zone Code: <span className="font-mono font-semibold text-cyan-800">{event.zoneId}</span></p>
            <p className="text-xs text-slate-700">Compliance: <span className="font-semibold text-emerald-700">Auto Attendance Verification</span></p>
          </div>
        </div>

        {/* Agenda */}
        {event.agenda && event.agenda.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Session Agenda
            </h4>
            <div className="space-y-2">
              {event.agenda.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coordinator Info */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-navy-900">{event.coordinator}</p>
            <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {event.coordinatorContact}
            </p>
          </div>
          <span className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 self-start sm:self-auto">
            Token: {event.qrCodeKey}
          </span>
        </div>

        {/* Modal Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {currentRole === 'student' ? (
            <div className="flex items-center gap-2">
              {event.isJoined ? (
                <>
                  <Button
                    variant="cyan"
                    size="sm"
                    icon={QrCode}
                    onClick={() => {
                      onClose();
                      onScanQR(event);
                    }}
                  >
                    {event.studentAttendanceStatus === 'Checked In' ? 'Verified Check-In' : 'Scan Session QR'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      leaveEvent(event.id);
                      onClose();
                    }}
                  >
                    Unregister
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    joinEvent(event.id);
                    onClose();
                  }}
                  disabled={event.registeredCount >= event.maxCapacity}
                >
                  Join This Event
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="cyan"
              size="sm"
              icon={QrCode}
              onClick={() => {
                onClose();
                onShowQR(event);
              }}
            >
              Project Session QR Token
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EventDetailsModal;
