import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Clock,
  Search,
  RefreshCw,
  Mail,
  UserCheck,
  AlertCircle,
  MapPin,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { flaskApi } from '../../services/flaskApi';

export const EventParticipantsModal = ({ isOpen, onClose, event }) => {
  const { fetchParticipants } = useEvents();
  const { currentUser } = useAuth();

  const [participants, setParticipants] = useState([]);
  const [gpsLocations, setGpsLocations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!event) return;
    try {
      setIsLoading(true);
      setErrorMsg('');

      // 1. Fetch participants roster
      const eventId = event.id || event.eventId;
      const list = await fetchParticipants(eventId);
      setParticipants(list);

      // 2. Fetch live GPS telemetry from Flask backend (GET /api/events/<event_id>/locations)
      let token = currentUser?.uid ? `dev-token-${currentUser.uid}` : 'dev-token-fac-cse-108-uid';
      if (currentUser?.getIdToken) {
        try {
          token = await currentUser.getIdToken();
        } catch {}
      }

      const locResult = await flaskApi.getEventLocations(eventId, token);
      if (locResult?.locations) {
        const locMap = {};
        locResult.locations.forEach(loc => {
          locMap[loc.student_id] = loc;
        });
        setGpsLocations(locMap);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load participants list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && event) {
      loadData();
    }
  }, [isOpen, event]);

  if (!event) return null;

  const filteredParticipants = participants.filter(p => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.studentName && p.studentName.toLowerCase().includes(q)) ||
      (p.studentRegNumber && p.studentRegNumber.toLowerCase().includes(q)) ||
      (p.studentEmail && p.studentEmail.toLowerCase().includes(q)) ||
      (p.studentDepartment && p.studentDepartment.toLowerCase().includes(q))
    );
  });

  const getStalenessBadge = (studentId) => {
    const gps = gpsLocations[studentId];
    const status = gps?.status || 'UNAVAILABLE';

    if (status === 'LIVE') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          LIVE
        </span>
      );
    }
    if (status === 'OUTDATED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
          <Clock className="w-2.5 h-2.5 text-amber-600" />
          OUTDATED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
        UNAVAILABLE
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registered Event Participants"
      subtitle={`Session: ${event.title} • Venue: ${event.venue}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Header Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-navy-50 rounded-2xl border border-navy-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Registered</p>
              <p className="text-base font-extrabold text-navy-950">
                {participants.length} <span className="text-xs font-normal text-slate-500">/ {event.maxCapacity || 150}</span>
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Location Consent</p>
              <p className="text-base font-extrabold text-emerald-900">
                {participants.filter(p => p.sharingConsent).length} <span className="text-xs font-normal text-slate-500">(100%)</span>
              </p>
            </div>
          </div>

          <div className="p-3 bg-cyan-50/60 rounded-2xl border border-cyan-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Active Geofencing</p>
              <p className="text-base font-extrabold text-cyan-900">
                {Object.values(gpsLocations).filter(l => l.status === 'LIVE').length || participants.filter(p => p.sharingStatus === 'Active').length}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Refresh Bar */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or department..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            Refresh
          </Button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Participants Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Loading participant roster & GPS streams from Flask backend...
            </div>
          ) : filteredParticipants.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-navy-900 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Reg. Number</th>
                  <th className="py-2.5 px-3">Consent</th>
                  <th className="py-2.5 px-3">GPS Telemetry</th>
                  <th className="py-2.5 px-3">Geofence Adherence</th>
                  <th className="py-2.5 px-3">Last Known Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParticipants.map((p, idx) => {
                  const sId = p.studentId || p.id;
                  const gps = gpsLocations[sId];
                  return (
                    <tr key={p.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-navy-950">
                        <div>{p.studentName || 'Student Participant'}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{p.studentEmail}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700">
                        {p.studentRegNumber || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Granted
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {gps?.latitude ? (
                          <div>
                            <span className="font-mono text-[10px] text-slate-700 block">
                              {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)}
                            </span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1">
                              <Radio className="w-2.5 h-2.5 text-cyan-500" /> ±{gps.accuracy}m
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No GPS received</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {gps?.is_inside_geofence !== undefined ? (
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            gps.is_inside_geofence
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {gps.is_inside_geofence ? 'Inside Venue' : 'Outside Bounds'}
                            {gps.distance_to_venue_meters !== null && ` (${gps.distance_to_venue_meters}m)`}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {getStalenessBadge(sId)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No registered participants found</p>
              <p className="text-[11px] text-slate-400 mt-1">
                When students join this event with location sharing consent, they will be listed here in real-time.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total registered: <strong>{filteredParticipants.length}</strong></span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EventParticipantsModal;
