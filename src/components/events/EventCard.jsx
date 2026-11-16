import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  QrCode,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';

export const EventCard = ({ event, onSelect, onScanQR, onShowQR }) => {
  const { currentRole } = useAuth();
  const { joinEvent, leaveEvent } = useEvents();

  const isFull = event.registeredCount >= event.maxCapacity;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={event.status} size="sm">
            {event.status}
          </Badge>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {event.category}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(event.id)}
          className="text-base sm:text-lg font-bold text-navy-900 group-hover:text-cyan-600 transition-colors cursor-pointer line-clamp-2 mb-2"
        >
          {event.title}
        </h3>

        {/* Department */}
        <p className="text-xs font-medium text-cyan-700 mb-4">{event.department}</p>

        {/* Meta Details */}
        <div className="space-y-2 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
            <span className="font-semibold text-navy-900">{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-600" /> Geofence Radius:
            </span>
            <span className="font-bold text-navy-900">{event.geofenceRadius} meters</span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" /> Registered
            </span>
            <span className="text-navy-900">
              {event.registeredCount} / {event.maxCapacity} ({Math.round((event.registeredCount / event.maxCapacity) * 100)}%)
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, (event.registeredCount / event.maxCapacity) * 100)}%` }}
            />
          </div>
          {event.status === 'Ongoing' && (
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {event.currentlyPresent || 0} students currently detected inside venue
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(event.id)}
          icon={ArrowRight}
          iconPosition="right"
        >
          Details
        </Button>

        {currentRole === 'student' ? (
          <div className="flex items-center gap-2">
            {event.isJoined ? (
              <>
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => onScanQR(event)}
                  icon={QrCode}
                  title="Scan session QR Code"
                >
                  {event.studentAttendanceStatus === 'Checked In' ? 'Checked In' : 'Scan QR'}
                </Button>
                <button
                  onClick={() => leaveEvent(event.id)}
                  className="text-[11px] text-slate-400 hover:text-rose-600 underline font-medium"
                >
                  Leave
                </button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => joinEvent(event.id)}
                disabled={isFull}
              >
                {isFull ? 'Full' : 'Join Event'}
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant="cyan"
            size="sm"
            onClick={() => onShowQR(event)}
            icon={QrCode}
          >
            Show QR Token
          </Button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
