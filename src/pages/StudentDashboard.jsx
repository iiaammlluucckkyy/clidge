import React, { useState } from 'react';
import {
  Calendar,
  CalendarCheck2,
  Clock,
  MapPin,
  QrCode,
  ShieldCheck,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useLocation } from '../context/LocationContext';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatCard from '../components/common/StatCard';
import AttendanceRing from '../components/dashboard/AttendanceRing';
import LocationSharingWidget from '../components/dashboard/LocationSharingWidget';
import RecentActivity from '../components/dashboard/RecentActivity';
import EventCard from '../components/events/EventCard';
import EventDetailsModal from '../components/events/EventDetailsModal';
import QRScannerModal from '../components/common/QRScannerModal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { events, selectedEvent, setSelectedEventId } = useEvents();
  const { geofenceStatus, isSharing } = useLocation();

  const [activeQRModalEvent, setActiveQRModalEvent] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Joined Events
  const joinedEvents = events.filter(e => e.isJoined);
  // Upcoming Events (not yet attended or in future)
  const upcomingEvents = events.filter(e => e.status === 'Upcoming' || e.status === 'Ongoing');

  const handleOpenDetails = (eventId) => {
    setSelectedEventId(eventId);
    setDetailsModalOpen(true);
  };

  const handleOpenQR = (event) => {
    setActiveQRModalEvent(event);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* 1. Welcome Section */}
      <WelcomeBanner
        user={currentUser}
        role="student"
        actionLabel="Scan Event QR Code"
        actionIcon={QrCode}
        onActionClick={() => {
          // Open QR scan for the first joined active event or sample event
          const activeEvent = joinedEvents.find(e => e.status === 'Ongoing') || events[0];
          handleOpenQR(activeEvent);
        }}
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Overall Attendance"
          value={`${currentUser?.attendanceStats?.overallPercentage || 94.2}%`}
          subtitle="Meets University >75% Criterion"
          trend="+2.4% this month"
          icon={Award}
          colorScheme="cyan"
        />
        <StatCard
          title="Sessions Attended"
          value={`${currentUser?.attendanceStats?.eventsAttended || 16} / ${currentUser?.attendanceStats?.totalRegistered || 17}`}
          subtitle="Workshops & Symposiums"
          icon={CalendarCheck2}
          colorScheme="navy"
        />
        <StatCard
          title="Hours Logged"
          value={`${currentUser?.attendanceStats?.hoursMonitored || 78.5} hrs`}
          subtitle="Continuous Geofenced Presence"
          icon={Clock}
          colorScheme="emerald"
        />
        <StatCard
          title="Voluntary GPS"
          value={isSharing ? 'Active' : 'Paused'}
          subtitle={geofenceStatus}
          trend="±4.2m GNSS"
          icon={Radio}
          colorScheme={isSharing ? 'cyan' : 'amber'}
        />
      </div>

      {/* 3. Location Sharing Status Widget */}
      <LocationSharingWidget />

      {/* 4. Active & Joined Events Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-navy-950">Joined Campus Events</h2>
            <p className="text-xs text-slate-500">
              Sessions you are currently registered for with automated geofence monitoring
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-cyan-50 text-cyan-800 rounded-full border border-cyan-200 self-start sm:self-auto">
            {joinedEvents.length} Sessions Registered
          </span>
        </div>

        {joinedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onSelect={handleOpenDetails}
                onScanQR={handleOpenQR}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No joined events yet</p>
            <p className="text-xs text-slate-400 mt-1">Browse the catalog to register for upcoming sessions.</p>
          </div>
        )}
      </div>

      {/* 5. Attendance Summary & Analytics */}
      <AttendanceRing
        percentage={currentUser?.attendanceStats?.overallPercentage}
        eventsAttended={currentUser?.attendanceStats?.eventsAttended}
        totalRegistered={currentUser?.attendanceStats?.totalRegistered}
        hoursMonitored={currentUser?.attendanceStats?.hoursMonitored}
        categories={currentUser?.attendanceStats?.categoryBreakdown}
      />

      {/* 6. Upcoming Events Catalog Preview & Recent Activity (Side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upcoming Events */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900">Recommended Upcoming Events</h3>
              <p className="text-xs text-slate-500">Register in advance to reserve your hall seat</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = '/events')}
              icon={ArrowRight}
              iconPosition="right"
            >
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {upcomingEvents.slice(0, 3).map((evt) => (
              <div
                key={evt.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={evt.status} size="sm">
                      {evt.status}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">{evt.category}</span>
                  </div>
                  <h4
                    onClick={() => handleOpenDetails(evt.id)}
                    className="text-sm font-bold text-navy-900 hover:text-cyan-600 transition-colors cursor-pointer"
                  >
                    {evt.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-600" /> {evt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600" /> {evt.venue}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetails(evt.id)}
                  >
                    Details
                  </Button>
                  {!evt.isJoined && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenDetails(evt.id)}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Activity Log */}
        <div className="lg:col-span-5">
          <RecentActivity />
        </div>
      </div>

      {/* Modals */}
      <EventDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        event={selectedEvent}
        onScanQR={handleOpenQR}
      />

      <QRScannerModal
        isOpen={Boolean(activeQRModalEvent)}
        onClose={() => setActiveQRModalEvent(null)}
        event={activeQRModalEvent}
        mode="scan"
      />
    </div>
  );
};

export default StudentDashboard;
