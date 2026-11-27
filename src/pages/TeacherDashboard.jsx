import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck2,
  Radio,
  Award,
  PlusCircle,
  QrCode,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Edit,
  Users2,
  FileSpreadsheet,
  Compass,
  LayoutDashboard,
  CheckCircle2,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatCard from '../components/common/StatCard';
import TeacherLiveMap from '../components/monitoring/TeacherLiveMap';
import StudentRoster from '../components/monitoring/StudentRoster';
import AttendanceSummaryWidget from '../components/attendance/AttendanceSummaryWidget';
import CreateEventModal from '../components/events/CreateEventModal';
import EditEventModal from '../components/events/EditEventModal';
import EventParticipantsModal from '../components/events/EventParticipantsModal';
import EventDetailsModal from '../components/events/EventDetailsModal';
import QRScannerModal from '../components/common/QRScannerModal';
import AttendanceReportModal from '../components/attendance/AttendanceReportModal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const {
    events,
    selectedEvent,
    setSelectedEventId,
    teacherCreatedEvents,
    participantsList
  } = useEvents();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalEvent, setEditModalEvent] = useState(null);
  const [participantsModalEvent, setParticipantsModalEvent] = useState(null);
  const [qrModalEvent, setQrModalEvent] = useState(null);
  const [reportModalEvent, setReportModalEvent] = useState(null);
  const [eventFilter, setEventFilter] = useState('ALL');

  // Dynamic Roster & Event KPIs:
  // If this teacher has created events, calculate strictly from her sessions.
  // If the teacher has created no events yet (e.g. newly registered CA), KPIs start dynamically at 0.
  const myEvents = teacherCreatedEvents || [];
  const hasMyEvents = myEvents.length > 0;

  const isHodOrAdmin = currentUser?.designation?.toLowerCase().includes('head') ||
                       currentUser?.name?.toLowerCase().includes('kavita') ||
                       currentUser?.role === 'admin';

  const relevantEvents = (hasMyEvents || !isHodOrAdmin) ? myEvents : events;
  const relevantEventIds = new Set(relevantEvents.map(e => e.id || e.eventId));

  const relevantParticipants = Array.isArray(participantsList)
    ? participantsList.filter(p => relevantEventIds.has(p.eventId) && p.sharingStatus !== 'Left')
    : [];

  const totalStudents = relevantParticipants.length;
  const presentOnline = relevantParticipants.filter(
    p => p.sharingStatus === 'Active' || p.checkInStatus === 'CHECKED_IN'
  ).length;
  const absentOffline = totalStudents > presentOnline ? (totalStudents - presentOnline) : 0;
  const inEventStudents = presentOnline;

  const activeEvents = relevantEvents.filter(e => e.status === 'Ongoing');
  const activeEventsCount = activeEvents.length;
  const avgAttendance = totalStudents > 0
    ? Math.round((presentOnline / totalStudents) * 100)
    : 0;

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleOpenDetails = (eventId) => {
    setSelectedEventId(eventId);
    setDetailsModalOpen(true);
  };

  const handleShowQR = (event) => {
    setQrModalEvent(event);
  };

  const handleOpenReport = (event) => {
    setReportModalEvent(event);
  };

  const handleOpenEdit = (event) => {
    setEditModalEvent(event);
  };

  const handleOpenParticipants = (event) => {
    setParticipantsModalEvent(event);
  };

  // Filtered events for the Event Management tab
  const filteredEvents = events.filter(evt => {
    if (eventFilter === 'MY') return evt.teacherId === currentUser?.uid;
    if (eventFilter === 'ONGOING') return evt.status === 'Ongoing';
    if (eventFilter === 'UPCOMING') return evt.status === 'Upcoming';
    if (eventFilter === 'COMPLETED') return evt.status === 'Completed' || evt.status === 'Cancelled';
    return true;
  });

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tracking', label: 'Live Student Tracking', icon: Compass, badge: 'Live' },
    { id: 'events', label: 'Event Management', icon: CalendarCheck2 },
    { id: 'reports', label: 'Attendance & Reports', icon: FileSpreadsheet },
    { id: 'students', label: 'Student Information', icon: Users }
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 1. Faculty Welcome Section */}
      <WelcomeBanner
        user={currentUser}
        role="teacher"
        actionLabel="Create Campus Event"
        actionIcon={PlusCircle}
        onActionClick={() => setCreateModalOpen(true)}
      />

      {/* 2. Sleek Modern SaaS Navigation Tabs Bar */}
      <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-navy-950 text-white shadow-sm ring-1 ring-cyan-500/30'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB A: OVERVIEW                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Summary Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            <StatCard
              title="Total Students"
              value={totalStudents}
              subtitle="Enrolled across sessions"
              trend="College Roster"
              icon={Users}
              colorScheme="navy"
            />
            <StatCard
              title="Present or Online"
              value={presentOnline}
              subtitle="Inside venue bounds"
              trend="Verified Active"
              icon={ShieldCheck}
              colorScheme="emerald"
            />
            <StatCard
              title="Absent or Offline"
              value={absentOffline}
              subtitle="Outside or idle"
              trend="Needs Review"
              icon={ShieldAlert}
              colorScheme="amber"
            />
            <StatCard
              title="Active Events"
              value={activeEventsCount}
              subtitle="Live geofenced sessions"
              trend="Radar Active"
              icon={Radio}
              colorScheme="cyan"
            />
          </div>

          {/* Quick Snapshot Cockpit: Tracking Radar + Active Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Live Geofence Monitoring Snapshot */}
            <div className="lg:col-span-7 bg-navy-950 text-white p-5 sm:p-6 rounded-3xl border border-navy-800 shadow-glow-navy space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-cyan-400" /> Live Tracking Snapshot
                    </h3>
                    <p className="text-[11px] text-slate-400">Real-time GNSS telemetry & boundary compliance</p>
                  </div>
                </div>
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => handleTabChange('tracking')}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Open Live Map
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-navy-900 rounded-2xl border border-navy-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Inside Venue</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">{presentOnline}</span>
                  <span className="text-[10px] text-emerald-500/80 block font-medium">Verified in bounds</span>
                </div>
                <div className="p-3 bg-navy-900 rounded-2xl border border-navy-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Outside Bounds</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-rose-400">{absentOffline}</span>
                  <span className="text-[10px] text-rose-500/80 block font-medium">Perimeter breach</span>
                </div>
                <div className="p-3 bg-navy-900 rounded-2xl border border-navy-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Participating</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-cyan-400">{inEventStudents}</span>
                  <span className="text-[10px] text-cyan-500/80 block font-medium">In active sessions</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-navy-900/60 border border-navy-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Geofence Anchor:</span>
                <span className="text-cyan-300 font-semibold truncate max-w-[200px]">
                  {activeEvents.length > 0
                    ? `${activeEvents[0].venue} (${activeEvents[0].radius || 65}m)`
                    : (hasMyEvents ? 'No ongoing session' : 'Standby (Create event to anchor)')}
                </span>
              </div>
            </div>

            {/* Right: Quick Action Hub & Compliance */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-navy-950 flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-600" /> Attendance Compliance
                </h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  totalStudents > 0
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-slate-600 bg-slate-100 border-slate-200'
                }`}>
                  {totalStudents > 0 ? `${avgAttendance}% Avg` : 'Standby (0%)'}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Live sessions are actively verifying student physical presence with combined GPS geofencing and dynamic QR codes.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleTabChange('events')}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-navy-900 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CalendarCheck2 className="w-4 h-4 text-cyan-600" />
                    Manage Campus Events ({events.length})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => handleTabChange('reports')}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-navy-900 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
                    Download Attendance Reports (CSV)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => handleTabChange('students')}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-navy-900 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-600" />
                    View Student Directory ({totalStudents})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Events Quick Cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-navy-950">Active & Upcoming Sessions</h3>
                <p className="text-xs text-slate-500">Quick access to session QR codes and participant lists</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTabChange('events')}
                icon={ArrowRight}
                iconPosition="right"
              >
                View All Events
              </Button>
            </div>

            {relevantEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {relevantEvents.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id || evt.eventId}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant={evt.status} size="sm">
                          {evt.status}
                        </Badge>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {evt.category || 'Seminar'}
                        </span>
                      </div>

                      <h4
                        onClick={() => handleOpenDetails(evt.id || evt.eventId)}
                        className="text-sm font-bold text-navy-900 hover:text-cyan-600 transition-colors cursor-pointer line-clamp-1 mb-1"
                      >
                        {evt.title}
                      </h4>

                      <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-cyan-600" /> {evt.startTime} - {evt.endTime}
                        </p>
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 text-cyan-600" /> {evt.venue}
                        </p>
                      </div>

                      <div className="flex justify-between text-xs text-slate-500 mb-3">
                        <span>Registered: <strong className="text-navy-900">{evt.registeredCount || 0}</strong></span>
                        <span>Radius: <strong className="text-cyan-700">{evt.radius || 65}m</strong></span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetails(evt.id || evt.eventId)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="cyan"
                        size="sm"
                        onClick={() => handleShowQR(evt)}
                        icon={QrCode}
                      >
                        QR Code
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                <CalendarCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-navy-950">No events created yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Click "Create Campus Event" to schedule your first geofenced workshop, lecture, or laboratory session.
                </p>
                <Button variant="cyan" size="sm" onClick={() => setCreateModalOpen(true)} icon={PlusCircle}>
                  Create First Event
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB B: LIVE STUDENT TRACKING                                              */}
      {/* ========================================================================= */}
      {activeTab === 'tracking' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-600" /> Live Student Location Tracking
              </h2>
              <p className="text-xs text-slate-500">
                Interactive Leaflet campus map, geofence radius detection, and real-time student location statuses
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Geofence Telemetry
            </span>
          </div>

          {/* Integrated Leaflet Map & Searchable Student Side Panel */}
          <TeacherLiveMap />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB C: EVENT MANAGEMENT                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-cyan-600" /> Event Management
              </h2>
              <p className="text-xs text-slate-500">
                Create and manage sessions, view rosters, and project dynamic QR codes
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="cyan"
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                icon={PlusCircle}
              >
                Create New Event
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['ALL', 'MY', 'ONGOING', 'UPCOMING', 'COMPLETED'].map((f) => (
              <button
                key={f}
                onClick={() => setEventFilter(f)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  eventFilter === f
                    ? 'bg-navy-950 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-navy-950 border border-slate-200'
                }`}
              >
                {f === 'ALL'
                  ? `All Sessions (${events.length})`
                  : f === 'MY'
                  ? `My Sessions (${myEvents.length})`
                  : f}
              </button>
            ))}
          </div>

          {/* Events Grid or Clean Empty State */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((evt) => {
                const isOwner = evt.teacherId === currentUser?.uid;
                return (
                  <div
                    key={evt.id || evt.eventId}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant={evt.status} size="sm">
                          {evt.status}
                        </Badge>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {evt.category || 'Workshop'}
                        </span>
                      </div>

                      <h3
                        onClick={() => handleOpenDetails(evt.id || evt.eventId)}
                        className="text-base font-bold text-navy-900 hover:text-cyan-600 transition-colors cursor-pointer line-clamp-1 mb-1"
                      >
                        {evt.title}
                      </h3>
                      <p className="text-xs text-cyan-700 mb-3 truncate">{evt.teacherDepartment || evt.department}</p>

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

                      <div className="flex justify-between items-center text-xs font-semibold py-1">
                        <span className="text-slate-500">Registered Students:</span>
                        <span className="text-navy-900 font-bold">
                          {evt.registeredCount || 0} / {evt.maxCapacity || 150}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold py-1">
                        <span className="text-slate-500">Geofence Radius:</span>
                        <span className="text-cyan-700 font-bold">
                          {evt.radius || evt.geofenceRadius || 65} meters
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetails(evt.id || evt.eventId)}
                        >
                          Details
                        </Button>
                        <button
                          type="button"
                          title="View Participants Roster"
                          onClick={() => handleOpenParticipants(evt)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                        >
                          <Users2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Attendance Report"
                          onClick={() => handleOpenReport(evt)}
                          className="p-1.5 rounded-lg text-cyan-700 hover:text-navy-950 hover:bg-cyan-50 transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        {isOwner && (
                          <button
                            type="button"
                            title="Edit Event"
                            onClick={() => handleOpenEdit(evt)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <Button
                        variant="cyan"
                        size="sm"
                        onClick={() => handleShowQR(evt)}
                        icon={QrCode}
                      >
                        QR Code
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <CalendarCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-navy-950">No sessions match this filter</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {eventFilter === 'MY'
                  ? 'You have not created any campus events yet. Click below to create your first event!'
                  : 'No active or upcoming events found under this status.'}
              </p>
              {eventFilter === 'MY' && (
                <Button variant="cyan" size="sm" onClick={() => setCreateModalOpen(true)} icon={PlusCircle}>
                  Create Campus Event
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB D: ATTENDANCE & REPORTS                                               */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-600" /> Attendance & Participation Reports
              </h2>
              <p className="text-xs text-slate-500">
                Official check-in logs, geofence compliance verification, and CSV export
              </p>
            </div>
          </div>

          {/* Real-Time Attendance Summary Widget */}
          <AttendanceSummaryWidget
            events={events}
            onOpenQR={handleShowQR}
            onOpenReport={handleOpenReport}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB E: STUDENT INFORMATION                                                */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-600" /> Student Directory & Information
              </h2>
              <p className="text-xs text-slate-500">
                Searchable student manifest, live location status, and participation records
              </p>
            </div>
          </div>

          {/* Student Roster Table with Search, Filter & CSV Export */}
          <StudentRoster />
        </div>
      )}

      {/* Modals */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditEventModal
        isOpen={Boolean(editModalEvent)}
        onClose={() => setEditModalEvent(null)}
        event={editModalEvent}
      />

      <EventParticipantsModal
        isOpen={Boolean(participantsModalEvent)}
        onClose={() => setParticipantsModalEvent(null)}
        event={participantsModalEvent}
      />

      <EventDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        event={selectedEvent}
        onShowQR={handleShowQR}
        onOpenReport={handleOpenReport}
        onOpenEdit={handleOpenEdit}
        onOpenParticipants={handleOpenParticipants}
      />

      <QRScannerModal
        isOpen={Boolean(qrModalEvent)}
        onClose={() => setQrModalEvent(null)}
        event={qrModalEvent}
        mode="display"
        onOpenReport={handleOpenReport}
      />

      <AttendanceReportModal
        isOpen={Boolean(reportModalEvent)}
        onClose={() => setReportModalEvent(null)}
        event={reportModalEvent}
      />
    </div>
  );
};

export default TeacherDashboard;
