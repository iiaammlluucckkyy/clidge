import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Navigation,
  Building2,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StudentLiveLocationMap from '../components/monitoring/StudentLiveLocationMap';

export const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { events, isLoading } = useEvents();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab');
  const activeTab = rawTab === 'events' ? 'events' : 'location';

  const handleTabChange = (tabId) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tabId);
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <WelcomeBanner user={currentUser} role="student" />

      {/* Two Clear Student Screens: 1. My Location  2. Events */}
      <div className="bg-white dark:bg-navy-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleTabChange('location')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'location'
              ? 'bg-navy-950 dark:bg-cyan-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>My Location</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-navy-950 dark:bg-cyan-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events</span>
          {events.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-200">
              {events.length}
            </span>
          )}
        </button>
      </div>

      {/* Screen 1: My Location */}
      {activeTab === 'location' && <StudentLiveLocationMap />}

      {/* Screen 2: Events posted ONLY by this college's faculty */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-navy-950 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-600" />
                College Events
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing events posted by faculty of {currentUser?.collegeName || 'your college'} ({currentUser?.collegeCode})
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-10 text-center bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 text-xs text-slate-500">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-3xl border border-dashed border-slate-300 dark:border-navy-700 space-y-2">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-extrabold text-navy-950 dark:text-white">No events yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Your college faculty has not posted any events yet. When they post an event, it will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((evt) => (
                <div
                  key={evt.id || evt.eventId}
                  className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-card flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        {evt.status || 'Upcoming'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{evt.date}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-navy-950 dark:text-white">{evt.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{evt.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>{evt.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>{evt.startTime}{evt.endTime ? ` - ${evt.endTime}` : ''}</span>
                    </div>
                    {evt.teacherName && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span>Posted by {evt.teacherName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
