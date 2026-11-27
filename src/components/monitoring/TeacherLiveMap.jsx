import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import QRCode from 'qrcode';
import {
  Compass,
  QrCode,
  Play,
  Square,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Radio,
  MapPin,
  Users,
  Crosshair,
  AlertCircle,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import {
  startLocationSession,
  endLocationSession,
  subscribeCollegeSessions,
  subscribeSessionStudentLocations
} from '../../services/sessionService';
import { WorldTileLayers, MapStyleSwitcher } from '../map/WorldMapLayerSwitcher';
import Button from '../common/Button';

const WORLD_CENTER = [20, 0];
const LIVE_WINDOW_MS = 60 * 1000; // 60s -> LIVE vs Stale tag

const MapController = ({ target }) => {
  const map = useMap();
  const lastRef = useRef('');
  useEffect(() => {
    if (!target) return;
    const key = `${target.lat.toFixed(4)},${target.lng.toFixed(4)},${target.zoom}`;
    if (lastRef.current !== key) {
      lastRef.current = key;
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.0 });
    }
  }, [target, map]);
  return null;
};

const createZoneIcon = (zone) =>
  L.divIcon({
    className: 'custom-zone-label',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
        <div style="background:#0f172a;color:${zone.color || '#38bdf8'};border:1.5px solid ${zone.color || '#38bdf8'};padding:2px 6px;border-radius:8px;font-size:9px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4);">
          📍 ${zone.name}
        </div>
        <div style="width:7px;height:7px;background:${zone.color || '#38bdf8'};border:1.5px solid white;border-radius:50%;margin-top:1px;"></div>
      </div>
    `,
    iconSize: [0, 0]
  });

const createStudentPinIcon = (student, isSelected) => {
  const isDemo = Boolean(student.isDemo);
  const tag = isDemo ? 'DEMO' : student.computedStatus;
  const color = isDemo
    ? '#8b5cf6'
    : student.computedStatus === 'LIVE'
    ? '#10b981'
    : '#f59e0b';
  const initial = (student.name || 'S').charAt(0).toUpperCase();

  return L.divIcon({
    className: 'custom-live-student',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:38px;height:38px;transform:translate(-50%,-50%);cursor:pointer;">
        ${student.computedStatus === 'LIVE' && !isDemo ? `<div style="position:absolute;width:38px;height:38px;border-radius:50%;background:${color};opacity:0.35;animation:ping 1.5s infinite;"></div>` : ''}
        <div style="position:relative;width:28px;height:28px;border-radius:50%;background:#061727;border:2.5px solid ${isSelected ? '#38bdf8' : color};color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;box-shadow:0 3px 10px rgba(0,0,0,0.5);${isSelected ? 'transform:scale(1.2);' : ''}">
          ${initial}
        </div>
        <div style="position:absolute;bottom:-9px;padding:1px 5px;border-radius:5px;background:${color};color:white;font-size:8px;font-weight:800;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.35);">
          ${tag}
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
};

const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Unknown';
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Generates 4 transient DEMO students ONLY in component memory for previewing.
 * Never written to Firestore or localStorage and never mixed into real records.
 */
const buildTransientDemoStudents = (anchorLat, anchorLng) => {
  const baseLat = anchorLat ?? 11.4450;
  const baseLng = anchorLng ?? 78.2264;
  const nowIso = new Date().toISOString();

  return [
    {
      id: 'demo-preview-1',
      studentUid: 'demo-preview-1',
      name: 'Demo Student 1 (Aarav)',
      regNumber: 'DEMO-01',
      latitude: baseLat + 0.00045,
      longitude: baseLng + 0.00035,
      accuracy: 8,
      placeName: 'Preview Near Main Block (DEMO)',
      isSharing: true,
      updatedAt: nowIso,
      isDemo: true
    },
    {
      id: 'demo-preview-2',
      studentUid: 'demo-preview-2',
      name: 'Demo Student 2 (Priya)',
      regNumber: 'DEMO-02',
      latitude: baseLat - 0.00038,
      longitude: baseLng + 0.00055,
      accuracy: 12,
      placeName: 'Preview Near Canteen Area (DEMO)',
      isSharing: true,
      updatedAt: nowIso,
      isDemo: true
    },
    {
      id: 'demo-preview-3',
      studentUid: 'demo-preview-3',
      name: 'Demo Student 3 (Karthik)',
      regNumber: 'DEMO-03',
      latitude: baseLat + 0.00062,
      longitude: baseLng - 0.00042,
      accuracy: 15,
      placeName: 'Preview Near Hostel Road (DEMO)',
      isSharing: true,
      updatedAt: nowIso,
      isDemo: true
    },
    {
      id: 'demo-preview-4',
      studentUid: 'demo-preview-4',
      name: 'Demo Student 4 (Divya)',
      regNumber: 'DEMO-04',
      latitude: baseLat - 0.00072,
      longitude: baseLng - 0.00050,
      accuracy: 28,
      placeName: 'Preview Campus Gate (DEMO)',
      isSharing: true,
      updatedAt: new Date(Date.now() - 95 * 1000).toISOString(),
      isDemo: true
    }
  ];
};

export const TeacherLiveMap = () => {
  const { currentUser } = useAuth();
  const { collegeZones, previewCoordinates, centerOnMyGps } = useLocation();

  const [sessionTitle, setSessionTitle] = useState('Campus Location Check');
  const [activeSessions, setActiveSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const [realStudents, setRealStudents] = useState([]);
  const [showDemoStudents, setShowDemoStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapStyle, setMapStyle] = useState('satellite-labels');
  const [flyTarget, setFlyTarget] = useState(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [, setTick] = useState(0); // forces 10s timestamp re-evaluation (LIVE vs STALE)

  // Re-evaluate relative timestamps every 10 seconds
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  // Subscribe to this college's active sessions
  useEffect(() => {
    if (!currentUser?.collegeCode) return;
    const unsub = subscribeCollegeSessions(currentUser.collegeCode, (list) => {
      setActiveSessions(list);
      setCurrentSession((prev) => {
        if (prev && list.some(s => s.sessionCode === prev.sessionCode)) {
          return list.find(s => s.sessionCode === prev.sessionCode);
        }
        return list[0] || null;
      });
    });
    return () => unsub && unsub();
  }, [currentUser?.collegeCode]);

  // Generate QR code whenever active session changes
  const sessionJoinUrl = useMemo(() => {
    if (!currentSession?.sessionCode) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://clidge.vercel.app';
    return `${origin}/student-dashboard?session=${encodeURIComponent(currentSession.sessionCode)}`;
  }, [currentSession?.sessionCode]);

  useEffect(() => {
    if (!sessionJoinUrl) {
      setQrDataUrl('');
      return;
    }
    QRCode.toDataURL(sessionJoinUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#061727', light: '#ffffff' }
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [sessionJoinUrl]);

  // Subscribe to real students sharing into the active session
  useEffect(() => {
    if (!currentSession?.sessionCode) {
      setRealStudents([]);
      return;
    }
    const unsub = subscribeSessionStudentLocations(currentSession.sessionCode, (list) => {
      setRealStudents(list);
    });
    return () => unsub && unsub();
  }, [currentSession?.sessionCode]);

  const handleStartSession = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setIsCreating(true);
    try {
      const created = await startLocationSession({
        facultyUser: currentUser,
        title: sessionTitle
      });
      setCurrentSession(created);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEndSession = async () => {
    if (!currentSession?.sessionCode) return;
    setErrorMsg('');
    try {
      await endLocationSession({
        sessionCode: currentSession.sessionCode,
        facultyUser: currentUser
      });
      setRealStudents([]);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Compute demo anchor around real GPS, college zone, or sample coordinates
  const demoAnchor = useMemo(() => {
    if (previewCoordinates) return previewCoordinates;
    if (collegeZones.length > 0) {
      return { lat: Number(collegeZones[0].latitude), lng: Number(collegeZones[0].longitude) };
    }
    const firstReal = realStudents.find(s => s.latitude && s.longitude);
    if (firstReal) return { lat: Number(firstReal.latitude), lng: Number(firstReal.longitude) };
    return { lat: 11.4450, lng: 78.2264 };
  }, [previewCoordinates, collegeZones, realStudents]);

  // Compute normalized student entries with strict LIVE / STALE tag
  const processedReal = useMemo(() => {
    return realStudents
      .filter(s => s.latitude !== undefined && s.longitude !== undefined)
      .map(s => {
        const ageMs = s.updatedAt ? Date.now() - new Date(s.updatedAt).getTime() : Infinity;
        const isLive = Boolean(s.isSharing) && ageMs <= LIVE_WINDOW_MS;
        return {
          ...s,
          id: s.studentUid || s.id,
          computedStatus: isLive ? 'LIVE' : 'STALE'
        };
      });
  }, [realStudents]);

  const demoList = useMemo(() => {
    if (!showDemoStudents) return [];
    return buildTransientDemoStudents(demoAnchor.lat, demoAnchor.lng).map(s => ({
      ...s,
      computedStatus: Date.now() - new Date(s.updatedAt).getTime() <= LIVE_WINDOW_MS ? 'LIVE' : 'STALE'
    }));
  }, [showDemoStudents, demoAnchor]);

  const combinedStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return [...processedReal, ...demoList].filter(s => {
      if (!term) return true;
      return (
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.placeName && s.placeName.toLowerCase().includes(term)) ||
        (s.regNumber && s.regNumber.toLowerCase().includes(term))
      );
    });
  }, [processedReal, demoList, searchTerm]);

  // Auto fly when Demo students checked or first real student appears
  useEffect(() => {
    if (showDemoStudents && demoAnchor) {
      setFlyTarget({ lat: demoAnchor.lat, lng: demoAnchor.lng, zoom: 17 });
    }
  }, [showDemoStudents]);

  useEffect(() => {
    if (processedReal.length > 0 && !flyTarget) {
      setFlyTarget({
        lat: Number(processedReal[0].latitude),
        lng: Number(processedReal[0].longitude),
        zoom: 17
      });
    }
  }, [processedReal, flyTarget]);

  const defaultCenter = previewCoordinates
    ? [previewCoordinates.lat, previewCoordinates.lng]
    : collegeZones.length > 0
    ? [Number(collegeZones[0].latitude), Number(collegeZones[0].longitude)]
    : processedReal.length > 0
    ? [Number(processedReal[0].latitude), Number(processedReal[0].longitude)]
    : WORLD_CENTER;

  const defaultZoom =
    previewCoordinates || collegeZones.length > 0 || processedReal.length > 0 ? 17 : 2;

  const handleCopyCode = () => {
    if (!currentSession?.sessionCode) return;
    navigator.clipboard?.writeText(currentSession.sessionCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!sessionJoinUrl) return;
    navigator.clipboard?.writeText(sessionJoinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* 1. Location Session Generator / Active QR Card */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-navy-800 shadow-card">
        {!currentSession ? (
          <form onSubmit={handleStartSession} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-extrabold text-navy-950 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-600" /> Start a Live Location Session
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Creates a 6-character code and QR link for students of <strong>{currentUser?.collegeName}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                type="text"
                placeholder="Session name (e.g. Lab Attendance)"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="min-w-[210px] bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 dark:text-white"
              />
              <Button type="submit" variant="cyan" size="md" icon={Play} disabled={isCreating}>
                {isCreating ? 'Starting...' : 'Start location session'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {qrDataUrl && (
                <div className="bg-white p-2 rounded-2xl border-2 border-cyan-500/40 shadow-sm w-32 h-32 shrink-0 mx-auto sm:mx-0">
                  <img src={qrDataUrl} alt="Session QR Code" className="w-full h-full object-contain" />
                </div>
              )}

              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Session Active
                  </span>
                  <span className="text-xs font-bold text-navy-950 dark:text-white">{currentSession.title}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Session Code:</span>
                  <span className="font-mono text-lg font-extrabold tracking-widest text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950 px-3 py-1 rounded-xl border border-cyan-200 dark:border-cyan-800">
                    {currentSession.sessionCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <QrCode className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied' : 'Copy QR Link'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Students open the QR link or enter code <strong>{currentSession.sessionCode}</strong> and tap Start Sharing.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <Button variant="danger" size="md" icon={Square} onClick={handleEndSession}>
                End session
              </Button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 2. Live Map & Controls */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Show Demo Students Checkbox (never saved, never mixed with real DB) */}
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-xs font-bold text-violet-900 dark:text-violet-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDemoStudents}
                onChange={(e) => setShowDemoStudents(e.target.checked)}
                className="w-4 h-4 accent-violet-600 rounded"
              />
              <span>Show demo students (4 preview)</span>
            </label>

            <button
              type="button"
              onClick={() =>
                centerOnMyGps()
                  .then(c => setFlyTarget({ lat: c.lat, lng: c.lng, zoom: 17 }))
                  .catch(() => {})
              }
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-cyan-50 text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-600" /> Center GPS
            </button>
          </div>

          <MapStyleSwitcher mapStyle={mapStyle} setMapStyle={setMapStyle} />
        </div>

        {/* Main Split View: Map + Live Student List */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 h-[420px] sm:h-[500px] relative">
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              maxZoom={21}
              scrollWheelZoom={true}
              className="h-full w-full z-0"
            >
              <MapController target={flyTarget} />
              <WorldTileLayers mapStyle={mapStyle} />

              {/* College Custom Zones */}
              {collegeZones.map((zone) => (
                <React.Fragment key={zone.id}>
                  <Circle
                    center={[Number(zone.latitude), Number(zone.longitude)]}
                    radius={Number(zone.radius) || 60}
                    pathOptions={{
                      color: zone.color || '#06b6d4',
                      fillColor: zone.color || '#06b6d4',
                      fillOpacity: 0.12,
                      weight: 2,
                      dashArray: '4, 4'
                    }}
                  />
                  <Marker
                    position={[Number(zone.latitude), Number(zone.longitude)]}
                    icon={createZoneIcon(zone)}
                  />
                </React.Fragment>
              ))}

              {/* Student Pins + True Accuracy Circles */}
              {combinedStudents.map((std) => (
                <React.Fragment key={std.id}>
                  {Number(std.accuracy) > 0 && (
                    <Circle
                      center={[Number(std.latitude), Number(std.longitude)]}
                      radius={Number(std.accuracy)}
                      pathOptions={{
                        color: std.isDemo ? '#8b5cf6' : std.computedStatus === 'LIVE' ? '#10b981' : '#f59e0b',
                        fillColor: std.isDemo ? '#8b5cf6' : std.computedStatus === 'LIVE' ? '#10b981' : '#f59e0b',
                        fillOpacity: 0.14,
                        weight: 1.2
                      }}
                    />
                  )}
                  <Marker
                    position={[Number(std.latitude), Number(std.longitude)]}
                    icon={createStudentPinIcon(std, selectedStudentId === std.id)}
                    eventHandlers={{
                      click: () => {
                        setSelectedStudentId(std.id);
                        setFlyTarget({ lat: Number(std.latitude), lng: Number(std.longitude), zoom: 18 });
                      }
                    }}
                  >
                    <Popup>
                      <div className="p-3 text-xs text-navy-950 space-y-1.5 min-w-[200px]">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-sm">{std.name}</strong>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              std.isDemo
                                ? 'bg-violet-100 text-violet-800'
                                : std.computedStatus === 'LIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {std.isDemo ? 'DEMO' : std.computedStatus}
                          </span>
                        </div>
                        <p className="text-cyan-700 font-semibold">{std.placeName}</p>
                        <p className="font-mono text-[10px] text-slate-600">
                          {Number(std.latitude).toFixed(6)}, {Number(std.longitude).toFixed(6)}
                        </p>
                        <p className="text-slate-500">
                          Accuracy: ±{std.accuracy}m • {formatRelativeTime(std.updatedAt)}
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${Number(std.latitude)},${Number(std.longitude)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-700 font-bold underline pt-1"
                        >
                          Open in maps <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}
            </MapContainer>
          </div>

          {/* Right Panel: Live Student List */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-navy-800 p-4 flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800 mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy-950 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-600" />
                Sharing Students ({processedReal.length})
              </h3>
              {showDemoStudents && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  +4 DEMO
                </span>
              )}
            </div>

            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or place..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-navy-950 dark:text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {combinedStudents.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <Users className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                  <p className="font-bold text-navy-900 dark:text-slate-200">No students sharing yet</p>
                  <p className="text-[11px]">
                    {currentSession
                      ? 'Share the QR code or session code above with students.'
                      : 'Click "Start location session" or toggle "Show demo students" to preview.'}
                  </p>
                </div>
              ) : (
                combinedStudents.map((std) => (
                  <div
                    key={std.id}
                    onClick={() => {
                      setSelectedStudentId(std.id);
                      setFlyTarget({ lat: Number(std.latitude), lng: Number(std.longitude), zoom: 18 });
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                      selectedStudentId === std.id
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30'
                        : 'border-slate-200 dark:border-navy-800 bg-slate-50/60 dark:bg-navy-950/60 hover:border-cyan-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-navy-950 dark:text-white">{std.name}</p>
                        {std.regNumber && (
                          <p className="font-mono text-[10px] text-slate-500">{std.regNumber}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          std.isDemo
                            ? 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300'
                            : std.computedStatus === 'LIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {std.isDemo ? 'DEMO' : std.computedStatus}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{std.placeName || 'Locating...'}</span>
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-navy-800">
                      <span className="flex items-center gap-1">
                        <Radio className="w-3 h-3 text-cyan-500" /> ±{std.accuracy}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatRelativeTime(std.updatedAt)}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${Number(std.latitude)},${Number(std.longitude)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        Open in maps <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLiveMap;
