import React, { useState } from 'react';
import {
  CalendarCheck2,
  PlusCircle,
  Search,
  Filter,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  History,
  BookmarkCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/events/EventCard';
import EventDetailsModal from '../components/events/EventDetailsModal';
import CreateEventModal from '../components/events/CreateEventModal';
import EditEventModal from '../components/events/EditEventModal';
import EventParticipantsModal from '../components/events/EventParticipantsModal';
import QRScannerModal from '../components/common/QRScannerModal';
import AttendanceReportModal from '../components/attendance/AttendanceReportModal';
import Button from '../components/common/Button';

export const EventManagementPage = () => {
  const { currentUser } = useAuth();
  const {
    filteredEvents,
    filterStatus,
    setFilterStatus,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedEvent,
    setSelectedEventId,
    teacherCreatedEvents,
    studentJoinedEvents,
    upcomingEvents,
    eventHistory,
    errorNotification,
    successNotification
  } = useEvents();

  const isTeacher = currentUser?.role === 'teacher';

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalEvent, setEditModalEvent] = useState(null);
  const [participantsModalEvent, setParticipantsModalEvent] = useState(null);
  const [qrModalEvent, setQrModalEvent] = useState(null);
  const [qrModalMode, setQrModalMode] = useState('scan');
  const [reportModalEvent, setReportModalEvent] = useState(null);

  const handleOpenDetails = (eventId) => {
    setSelectedEventId(eventId);
    setDetailsModalOpen(true);
  };

  const handleOpenQR = (event, mode = 'scan') => {
    setQrModalEvent(event);
    setQrModalMode(mode);
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

  // Define tabs based on role
  const teacherTabs = [
    { id: 'all', label: 'All Campus Events' },
    { id: 'created', label: `My Created Events (${teacherCreatedEvents.length})` },
    { id: 'upcoming', label: 'Upcoming & Live' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const studentTabs = [
    { id: 'all', label: 'All Events' },
    { id: 'upcoming', label: 'Upcoming Events' },
    { id: 'joined', label: `My Joined Events (${studentJoinedEvents.length})` },
    { id: 'history', label: 'Event History' }
  ];

  const currentTabs = isTeacher ? teacherTabs : studentTabs;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Toast Notifications */}
      {successNotification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successNotification}</span>
        </div>
      )}
      {errorNotification && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span className="font-semibold">{errorNotification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-900 rounded-3xl p-6 sm:p-7 text-white border border-navy-800 shadow-glow-navy flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>Campus Event Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
            Campus Events & Geofenced Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {isTeacher
              ? 'Create campus sessions, set venue geofence boundaries, and supervise student attendance.'
              : 'Browse scheduled academic symposiums, join sessions with geofencing, and track attendance.'}
          </p>
        </div>

        {isTeacher ? (
          <Button
            variant="cyan"
            size="md"
            icon={PlusCircle}
            onClick={() => setCreateModalOpen(true)}
            className="flex-shrink-0 shadow-glow-cyan font-bold"
          >
            Create Event
          </Button>
        ) : (
          <div className="bg-navy-900/80 px-3.5 py-2.5 rounded-2xl border border-navy-800 text-xs text-slate-300">
            <span className="font-bold text-cyan-300 block">Student Participation:</span>
            <span>Join any session below to mark attendance.</span>
          </div>
        )}
      </div>

      {/* Role Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {currentTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setFilterStatus('All');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-navy-900 text-white shadow-md'
                : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, department, or campus venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Ongoing', 'Upcoming', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus.toLowerCase() === status.toLowerCase()
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-navy-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id || event.eventId}
              event={event}
              onSelect={handleOpenDetails}
              onScanQR={(evt) => handleOpenQR(evt, 'scan')}
              onShowQR={(evt) => handleOpenQR(evt, 'display')}
              onOpenReport={handleOpenReport}
              onOpenEdit={handleOpenEdit}
              onOpenParticipants={handleOpenParticipants}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <CalendarCheck2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900">No events found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {activeTab === 'created'
              ? "You haven't created any events yet. Click 'Create Campus Event' above to publish your first session."
              : activeTab === 'joined'
              ? "You haven't registered for any events yet. Check out 'Upcoming Events' to register."
              : 'Try adjusting your search query or status filter.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('All');
              setActiveTab('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* 1. Modal: Create Event */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* 2. Modal: Edit Event */}
      <EditEventModal
        isOpen={Boolean(editModalEvent)}
        onClose={() => setEditModalEvent(null)}
        event={editModalEvent}
      />

      {/* 3. Modal: View Participants */}
      <EventParticipantsModal
        isOpen={Boolean(participantsModalEvent)}
        onClose={() => setParticipantsModalEvent(null)}
        event={participantsModalEvent}
      />

      {/* 4. Modal: Event Details */}
      <EventDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        event={selectedEvent}
        onScanQR={(evt) => handleOpenQR(evt, 'scan')}
        onShowQR={(evt) => handleOpenQR(evt, 'display')}
        onOpenReport={handleOpenReport}
        onOpenEdit={handleOpenEdit}
        onOpenParticipants={handleOpenParticipants}
      />

      {/* 5. Modal: QR Scanner / Display */}
      <QRScannerModal
        isOpen={Boolean(qrModalEvent)}
        onClose={() => setQrModalEvent(null)}
        event={qrModalEvent}
        mode={qrModalMode}
        onOpenReport={handleOpenReport}
      />

      {/* 6. Modal: Attendance Report */}
      <AttendanceReportModal
        isOpen={Boolean(reportModalEvent)}
        onClose={() => setReportModalEvent(null)}
        event={reportModalEvent}
      />
    </div>
  );
};

export default EventManagementPage;
