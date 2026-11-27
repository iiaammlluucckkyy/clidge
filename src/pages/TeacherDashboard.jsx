import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  CalendarCheck2,
  MapPin,
  PlusCircle,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useLocation } from '../context/LocationContext';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import TeacherLiveMap from '../components/monitoring/TeacherLiveMap';
import FacultyZonesManager from '../components/monitoring/FacultyZonesManager';
import Button from '../components/common/Button';

export const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const { events, createEvent, deleteEvent, isLoading } = useEvents();
  const { collegeZones } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab');
  const activeTab = rawTab === 'events' ? 'events' : rawTab === 'zones' ? 'zones' : 'tracking';

  // Faculty Event Creation Form State (Title, Place, Date & Time, Description)
  const [eventForm, setEventForm] = useState({
    title: '',
    venue: '',
    date: '',
    time: '',
    description: ''
  });
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventError, setEventError] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleZonePresetPick = (e) => {
    const selectedName = e.target.value;
    if (!selectedName) return;
    setEventForm(prev => ({ ...prev, venue: selectedName }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setEventError('');
    setEventSuccess('');

    if (!eventForm.title.trim()) return setEventError('Event title is required.');
    if (!eventForm.venue.trim()) return setEventError('Event place is required.');
    if (!eventForm.date.trim()) return setEventError('Event date is required.');
    if (!eventForm.time.trim()) return setEventError('Event time is required.');
    if (!eventForm.description.trim()) return setEventError('Event description is required.');

    const matchedZone = collegeZones.find(z => z.name === eventForm.venue.trim());

    setCreatingEvent(true);
    try {
      await createEvent({
        title: eventForm.title,
        venue: eventForm.venue,
        date: eventForm.date,
        startTime: eventForm.time,
        endTime: '',
        description: eventForm.description,
        latitude: matchedZone?.latitude ?? 0,
        longitude: matchedZone?.longitude ?? 0,
        radius: matchedZone?.radius ?? 65
      });
      setEventForm({ title: '', venue: '', date: '', time: '', description: '' });
      setEventSuccess('Event published to your college.');
    } catch (err) {
      setEventError(err.message);
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleDeleteEvent = async (evtId) => {
    setEventError('');
    try {
      await deleteEvent(evtId);
    } catch (err) {
      setEventError(err.message);
    }
  };

  const TABS = [
    { id: 'tracking', label: 'Live Map', icon: Compass },
    { id: 'events', label: 'Events', icon: CalendarCheck2, count: events.length },
    { id: 'zones', label: 'Zones', icon: MapPin, count: collegeZones.length }
  ];

  return (
    <div className="space-y-6">
      <WelcomeBanner user={currentUser} role="teacher" />

      {/* Three Clean Faculty Tabs: Live Map | Events | Zones */}
      <div className="bg-white dark:bg-navy-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm inline-flex items-center gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-navy-950 dark:bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-200">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SCREEN 1: LIVE MAP & SESSIONS */}
      {activeTab === 'tracking' && <TeacherLiveMap />}

      {/* SCREEN 2: COLLEGE EVENTS (CREATE, LIST, DELETE) */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Create Event Form */}
          <form
            onSubmit={handleCreateEvent}
            className="lg:col-span-5 bg-white dark:bg-navy-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-navy-800 shadow-card space-y-4 text-xs"
          >
            <div>
              <h2 className="text-base font-extrabold text-navy-950 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-600" /> Post a College Event
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Visible only to students registered under college code <strong>{currentUser?.collegeCode}</strong>.
              </p>
            </div>

            {eventError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{eventError}</span>
              </div>
            )}

            {eventSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{eventSuccess}</span>
              </div>
            )}

            <div>
              <label className="block font-bold uppercase text-[10px] text-navy-900 dark:text-slate-300 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AI Seminar / Sports Meet / Hackathon"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold uppercase text-[10px] text-navy-900 dark:text-slate-300">
                  Place *
                </label>
                {collegeZones.length > 0 && (
                  <select
                    onChange={handleZonePresetPick}
                    defaultValue=""
                    className="text-[11px] bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg px-2 py-0.5"
                  >
                    <option value="">Pick saved zone...</option>
                    {collegeZones.map((z) => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Main Auditorium / Room 302"
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase text-[10px] text-navy-900 dark:text-slate-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2.5 text-xs text-navy-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-navy-900 dark:text-slate-300 mb-1">
                  Time *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:00 AM"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2.5 text-xs text-navy-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase text-[10px] text-navy-900 dark:text-slate-300 mb-1">
                Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Write event instructions or details for students..."
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 dark:text-white"
              />
            </div>

            <Button type="submit" variant="cyan" size="md" className="w-full" disabled={creatingEvent}>
              {creatingEvent ? 'Publishing...' : 'Publish Event'}
            </Button>
          </form>

          {/* Right: College Events List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-navy-950 dark:text-white">
              Posted Events ({events.length})
            </h3>

            {isLoading ? (
              <div className="p-8 text-center bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 text-xs text-slate-500">
                Loading college events...
              </div>
            ) : events.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-navy-900 rounded-3xl border border-dashed border-slate-300 dark:border-navy-700 space-y-2">
                <CalendarCheck2 className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-navy-950 dark:text-white">No events yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Use the form on the left to post your college's first event.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((evt) => (
                  <div
                    key={evt.id || evt.eventId}
                    className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-card flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded-md">
                          {evt.date}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {evt.startTime}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-navy-950 dark:text-white">{evt.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{evt.description}</p>
                      <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-1 pt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" /> {evt.venue}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(evt.id || evt.eventId)}
                      className="self-start px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCREEN 3: CAMPUS ZONES BUILDER */}
      {activeTab === 'zones' && <FacultyZonesManager />}
    </div>
  );
};

export default TeacherDashboard;
