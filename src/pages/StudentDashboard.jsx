import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation as useRouteLocation, Link } from 'react-router-dom';
import {
  Calendar,
  CalendarCheck2,
  Clock,
  MapPin,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Award,
  Bell,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useLocation } from '../context/LocationContext';
import { useAttendance } from '../context/AttendanceContext';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatCard from '../components/common/StatCard';
import AttendanceRing from '../components/dashboard/AttendanceRing';
import RecentActivity from '../components/dashboard/RecentActivity';
import StudentAttendanceHistory from '../components/attendance/StudentAttendanceHistory';
import EventCard from '../components/events/EventCard';
import EventDetailsModal from '../components/events/EventDetailsModal';
import QRScannerModal from '../components/common/QRScannerModal';
import LocationSharingWidget from '../components/dashboard/LocationSharingWidget';
import StudentLiveLocationMap from '../components/monitoring/StudentLiveLocationMap';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const {
    events,
    selectedEvent,
    setSelectedEventId,
    studentJoinedEvents,
    upcomingEvents,
    isStudentJoined
  } = useEvents();
  const {
    activeApprovedEvent,
    setActiveApprovedEvent,
    startBackgroundSharing,
    isSharing
  } = useLocation();
  const routeLocation = useRouteLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { studentHistory } = useAttendance();

  const [activeQRModalEvent, setActiveQRModalEvent] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Compute real dynamic attendance metrics for the current student
  const attendedSessionsCount = Array.isArray(studentHistory)
    ? studentHistory.filter(h => h.check_in_time || h.checkInTime).length
    : 0;
  const totalJoinedCount = studentJoinedEvents.length;
  const calculatedPercentage = totalJoinedCount > 0
    ? Math.round((attendedSessionsCount / totalJoinedCount) * 100)
    : (Number(currentUser?.attendanceStats?.overallPercentage) || 0);
  const hoursLogged = currentUser?.attendanceStats?.hoursMonitored !== undefined
    ? Number(currentUser.attendanceStats.hoursMonitored)
    : (attendedSessionsCount * 1.5);

  // Background Location Sharing:
  // Automatically runs location sharing silently in the background when joined to active sessions.
  // No live map, coordinates, or tracking controls are exposed to the student.
  useEffect(() => {
    if (studentJoinedEvents.length > 0) {
      const activeEvent = studentJoinedEvents.find(e => e.status === 'Ongoing') || studentJoinedEvents[0];
      if (activeEvent && (!activeApprovedEvent || activeApprovedEvent.id !== activeEvent.id)) {
        setActiveApprovedEvent(activeEvent);
      }
      if (startBackgroundSharing && !isSharing && activeEvent && activeEvent.status !== 'Completed' && activeEvent.status !== 'Cancelled') {
        startBackgroundSharing();
      }
    } else if (activeApprovedEvent !== null) {
      setActiveApprovedEvent(null);
    }
  }, [studentJoinedEvents, activeApprovedEvent, setActiveApprovedEvent, startBackgroundSharing, isSharing]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleOpenDetails = (eventId) => {
    setSelectedEventId(eventId);
    setDetailsModalOpen(true);
  };

  const handleOpenQR = (event) => {
    setActiveQRModalEvent(event);
  };

  const STUDENT_TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'location', label: 'My Location & Geofence', icon: MapPin },
    { id: 'attendance', label: 'My Attendance', icon: Award },
    { id: 'history', label: 'My Participation', icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Role Protection Security Banner */}
      {routeLocation.state?.unauthorizedAttempt && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-sm animate-in fade-in-50">
          <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <div>
            <strong className="font-bold">Faculty Portal Protected:</strong> Student accounts do not have access to faculty administrative tools.
          </div>
        </div>
      )}

      {/* 1. Student Profile & Welcome Banner */}
      <WelcomeBanner
        user={currentUser}
        role="student"
        actionLabel="Scan Event QR Code"
        actionIcon={QrCode}
        onActionClick={() => {
          const activeEvent = studentJoinedEvents.find(e => e.status === 'Ongoing') || studentJoinedEvents[0];
          if (activeEvent) {
            handleOpenQR(activeEvent);
          } else if (events && events.length > 0) {
            setSelectedEventId(events[0].id || events[0].eventId);
            setDetailsModalOpen(true);
          }
        }}
      />

      {/* 2. Navigation Tabs Bar */}
      <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-1 overflow-x-auto">
        {STUDENT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-navy-950 text-white shadow-sm ring-1 ring-cyan-500/30'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: OVERVIEW TAB                                                   */}
      {/* ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'attendance') && (
        <>
          {/* Top Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            <StatCard
              title="Overall Attendance"
              value={`${calculatedPercentage}%`}
              subtitle={totalJoinedCount > 0 ? (calculatedPercentage >= 75 ? "Compliance Met (≥ 75%)" : "Needs Attendance ( < 75%)") : "New Student (No events yet)"}
              trend={totalJoinedCount > 0 ? `${attendedSessionsCount}/${totalJoinedCount} sessions` : "Ready to Start"}
              icon={Award}
              colorScheme="cyan"
            />
            <StatCard
              title="Enrolled Events"
              value={totalJoinedCount}
              subtitle="Active campus sessions"
              icon={CalendarCheck2}
              colorScheme="navy"
            />
            <StatCard
              title="Hours Logged"
              value={`${hoursLogged.toFixed(1)} hrs`}
              subtitle="Verified presence"
              icon={Clock}
              colorScheme="emerald"
            />
            <StatCard
              title="Attendance Status"
              value={totalJoinedCount > 0 ? "Ready to Scan" : "Not Enrolled"}
              subtitle={totalJoinedCount > 0 ? "Dynamic QR Token" : "Join an event first"}
              trend={totalJoinedCount > 0 ? "Verification Ready" : "Standby"}
              icon={QrCode}
              colorScheme="cyan"
            />
          </div>

          {/* Live Student GPS Telemetry & Interactive Geofence Map */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyan-600" /> My Live Location & Campus Geofence
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time GPS coordinate telemetry and event venue perimeter verification
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTabChange('location')}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Full Geofence View
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5">
                  <LocationSharingWidget />
                </div>
                <div className="lg:col-span-7">
                  <StudentLiveLocationMap />
                </div>
              </div>
            </div>
          )}

          {/* Daily Student Notifications & Class Reminder */}
          {activeTab === 'overview' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-navy-950">
                      Class & Attendance Notifications
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                      Today
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {studentJoinedEvents.length > 0
                      ? `You have ${studentJoinedEvents.length} session${studentJoinedEvents.length > 1 ? 's' : ''} scheduled today. Scan the faculty QR code at the venue for check-in.`
                      : 'No active sessions joined today. Browse upcoming campus events to register.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => {
                    const activeEvent = studentJoinedEvents.find(e => e.status === 'Ongoing') || events[0];
                    if (activeEvent) handleOpenQR(activeEvent);
                  }}
                  icon={QrCode}
                >
                  Check-In Now
                </Button>
              </div>
            </div>
          )}

          {/* Today's Events & Classes */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-navy-950">Today's Events & Classes</h2>
                  <p className="text-xs text-slate-500">
                    Your registered campus sessions and attendance schedules
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-cyan-50 text-cyan-800 rounded-full border border-cyan-200 self-start sm:self-auto">
                  {studentJoinedEvents.length} Enrolled
                </span>
              </div>

              {studentJoinedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentJoinedEvents.map((evt) => (
                    <EventCard
                      key={evt.id || evt.eventId}
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
          )}

          {/* Attendance Summary & Analytics */}
          <AttendanceRing
            percentage={calculatedPercentage}
            eventsAttended={attendedSessionsCount}
            totalRegistered={totalJoinedCount}
            hoursMonitored={hoursLogged.toFixed(1)}
            categories={currentUser?.attendanceStats?.categoryBreakdown || []}
          />
        </>
      )}

      {/* ========================================================================= */}
      {/* SECTION: LIVE LOCATION & GEOFENCE TAB                                     */}
      {/* ========================================================================= */}
      {activeTab === 'location' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <LocationSharingWidget />
            </div>
            <div className="lg:col-span-7">
              <StudentLiveLocationMap />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION B: PARTICIPATION HISTORY (OR FULL OVERVIEW)                       */}
      {/* ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'history') && (
        <section>
          <StudentAttendanceHistory />
        </section>
      )}

      {/* Upcoming Catalog & Recent Activity (only in overview tab) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Upcoming Events */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-navy-900">Upcoming Events & Classes</h3>
                <p className="text-xs text-slate-500">Available campus sessions</p>
              </div>
              <Link to="/events">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingEvents.slice(0, 3).map((evt) => (
                <div
                  key={evt.id || evt.eventId}
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
                      onClick={() => handleOpenDetails(evt.id || evt.eventId)}
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
                      onClick={() => handleOpenDetails(evt.id || evt.eventId)}
                    >
                      Details
                    </Button>
                    {!isStudentJoined(evt.id || evt.eventId) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenDetails(evt.id || evt.eventId)}
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
      )}

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
