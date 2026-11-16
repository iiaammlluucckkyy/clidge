import React, { useState } from 'react';
import {
  Users,
  CalendarCheck2,
  Radio,
  Award,
  PlusCircle,
  QrCode,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatCard from '../components/common/StatCard';
import GeofenceMap from '../components/monitoring/GeofenceMap';
import StudentRoster from '../components/monitoring/StudentRoster';
import CreateEventModal from '../components/events/CreateEventModal';
import EventDetailsModal from '../components/events/EventDetailsModal';
import QRScannerModal from '../components/common/QRScannerModal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const { events, selectedEvent, setSelectedEventId } = useEvents();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [qrModalEvent, setQrModalEvent] = useState(null);

  // KPIs
  const totalStudents = 142;
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'Ongoing');
  const avgAttendance = 91.4;

  const handleOpenDetails = (eventId) => {
    setSelectedEventId(eventId);
    setDetailsModalOpen(true);
  };

  const handleShowQR = (event) => {
    setQrModalEvent(event);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* 1. Welcome Section */}
      <WelcomeBanner
        user={currentUser}
        role="teacher"
        actionLabel="Create Campus Event"
        actionIcon={PlusCircle}
        onActionClick={() => setCreateModalOpen(true)}
      />

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students Monitored"
          value={totalStudents}
          subtitle="Enrolled Across Active Sessions"
          trend="+18 this semester"
          icon={Users}
          colorScheme="navy"
        />
        <StatCard
          title="Campus Events"
          value={totalEvents}
          subtitle="Symposiums & Workshops"
          trend="5 Active"
          icon={CalendarCheck2}
          colorScheme="cyan"
        />
        <StatCard
          title="Active Live Sessions"
          value={activeEvents.length}
          subtitle="Auditorium & Hall 302"
          trend="Live Geofencing"
          icon={Radio}
          colorScheme="emerald"
        />
        <StatCard
          title="Attendance Compliance"
          value={`${avgAttendance}%`}
          subtitle="Continuous Geofence Presence"
          trend="High (+4.2%)"
          icon={Award}
          colorScheme="cyan"
        />
      </div>

      {/* 3. Student Monitoring Section (Radar Map) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-navy-950 flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-600 animate-pulse" />
              Live Campus Student Monitoring & Geofence Radar
            </h2>
            <p className="text-xs text-slate-500">
              Visualizes real-time GNSS student pings across college halls, laboratories, and boundary perimeters
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 self-start sm:self-auto">
            Live Stream Connected
          </span>
        </div>

        {/* Geofence SVG Radar Map */}
        <GeofenceMap />
      </section>

      {/* 4. Student Roster Table */}
      <section>
        <StudentRoster />
      </section>

      {/* 5. Recent Events List & Attendance Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-navy-950">Active & Recent Events Supervised</h2>
            <p className="text-xs text-slate-500">
              Real-time attendance rates and QR code tokens for classroom projection
            </p>
          </div>
          <Button
            variant="cyan"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            icon={PlusCircle}
          >
            Create New Event
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant={evt.status} size="sm">
                    {evt.status}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {evt.category}
                  </span>
                </div>

                <h3
                  onClick={() => handleOpenDetails(evt.id)}
                  className="text-base font-bold text-navy-900 hover:text-cyan-600 transition-colors cursor-pointer line-clamp-2 mb-2"
                >
                  {evt.title}
                </h3>
                <p className="text-xs text-cyan-700 mb-3">{evt.department}</p>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{evt.startTime} - {evt.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

                {/* Live stats */}
                <div className="flex justify-between items-center text-xs font-semibold py-1">
                  <span className="text-slate-500">Attendance Rate:</span>
                  <span className="text-emerald-600 font-bold">
                    {evt.attendanceRate > 0 ? `${evt.attendanceRate}%` : 'Upcoming'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold py-1">
                  <span className="text-slate-500">Students Inside Hall:</span>
                  <span className="text-navy-900 font-bold">
                    {evt.currentlyPresent} / {evt.registeredCount}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDetails(evt.id)}
                >
                  Details
                </Button>
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => handleShowQR(evt)}
                  icon={QrCode}
                >
                  Project QR
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EventDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        event={selectedEvent}
        onShowQR={handleShowQR}
      />

      <QRScannerModal
        isOpen={Boolean(qrModalEvent)}
        onClose={() => setQrModalEvent(null)}
        event={qrModalEvent}
        mode="display"
      />
    </div>
  );
};

export default TeacherDashboard;
