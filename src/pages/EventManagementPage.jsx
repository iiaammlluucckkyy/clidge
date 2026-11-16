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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/events/EventCard';
import EventDetailsModal from '../components/events/EventDetailsModal';
import CreateEventModal from '../components/events/CreateEventModal';
import QRScannerModal from '../components/common/QRScannerModal';
import Button from '../components/common/Button';

export const EventManagementPage = () => {
  const { currentRole } = useAuth();
  const {
    filteredEvents,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    selectedEvent,
    setSelectedEventId
  } = useEvents();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [qrModalEvent, setQrModalEvent] = useState(null);
  const [qrModalMode, setQrModalMode] = useState('scan');

  const handleOpenDetails = (eventId) => {
    setSelectedEventId(eventId);
    setDetailsModalOpen(true);
  };

  const handleOpenQR = (event, mode = 'scan') => {
    setQrModalEvent(event);
    setQrModalMode(mode);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white border border-navy-800 shadow-glow-navy flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>Campus Event Directory & Geofence Scheduler</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Campus Events & Special Classes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Browse, register, and monitor academic symposiums, technical guest lectures, and laboratory workshops with automatic GNSS attendance check-ins.
          </p>
        </div>

        {currentRole === 'teacher' ? (
          <Button
            variant="cyan"
            size="lg"
            icon={PlusCircle}
            onClick={() => setCreateModalOpen(true)}
            className="flex-shrink-0 shadow-glow-cyan"
          >
            Create Campus Event
          </Button>
        ) : (
          <div className="bg-navy-900/80 p-4 rounded-2xl border border-navy-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-cyan-300 block">Student Participation:</span>
            <span>Join any event below to enable voluntary session geofencing.</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, department, or campus hall..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Ongoing', 'Upcoming', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus.toLowerCase() === status.toLowerCase()
                  ? 'bg-navy-900 text-white shadow-sm'
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
              key={event.id}
              event={event}
              onSelect={handleOpenDetails}
              onScanQR={(evt) => handleOpenQR(evt, 'scan')}
              onShowQR={(evt) => handleOpenQR(evt, 'display')}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <CalendarCheck2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900">No events matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search terms or filter selection.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setFilterStatus('All'); }}>
            Reset Filters
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EventDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        event={selectedEvent}
        onScanQR={(evt) => handleOpenQR(evt, 'scan')}
        onShowQR={(evt) => handleOpenQR(evt, 'display')}
      />

      <QRScannerModal
        isOpen={Boolean(qrModalEvent)}
        onClose={() => setQrModalEvent(null)}
        event={qrModalEvent}
        mode={qrModalMode}
      />
    </div>
  );
};

export default EventManagementPage;
