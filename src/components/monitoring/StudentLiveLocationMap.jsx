import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Navigation,
  Power,
  QrCode,
  Crosshair,
  AlertCircle,
  Clock,
  MapPin,
  Radio,
  CheckCircle2,
  Camera,
  X,
  WifiOff,
  Loader2
} from 'lucide-react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { WorldTileLayers, MapStyleSwitcher } from '../map/WorldMapLayerSwitcher';
import Button from '../common/Button';
import Modal from '../common/Modal';

const WORLD_CENTER = [20, 0];

const MapFollower = ({ center, zoom }) => {
  const map = useMap();
  const lastKeyRef = useRef('');
  useEffect(() => {
    if (!center || center.length < 2) return;
    const key = `${center[0].toFixed(4)},${center[1].toFixed(4)},${zoom}`;
    if (lastKeyRef.current !== key) {
      lastKeyRef.current = key;
      map.flyTo(center, zoom, { duration: 1.0 });
    }
  }, [center, zoom, map]);
  return null;
};

const createZoneMarkerIcon = (zone) =>
  L.divIcon({
    className: 'custom-college-zone',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
        <div style="background:#0f172a;color:${zone.color || '#38bdf8'};border:1.5px solid ${zone.color || '#38bdf8'};padding:2px 7px;border-radius:8px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.45);">
          📍 ${zone.name}
        </div>
        <div style="width:8px;height:8px;background:${zone.color || '#38bdf8'};border:1.5px solid white;border-radius:50%;margin-top:2px;"></div>
      </div>
    `,
    iconSize: [0, 0]
  });

const createMyLocationIcon = (name, isSharing, waiting) => {
  const color = !isSharing ? '#64748b' : waiting ? '#f59e0b' : '#10b981';
  const initial = (name || 'U').charAt(0).toUpperCase();
  const tag = !isSharing ? 'MY GPS' : waiting ? 'ACQUIRING' : 'SHARING LIVE';
  return L.divIcon({
    className: 'custom-student-dot',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:42px;height:42px;transform:translate(-50%,-50%);">
        ${isSharing ? `<div style="position:absolute;width:42px;height:42px;border-radius:50%;background:${color};opacity:0.35;animation:ping 1.5s infinite;"></div>` : ''}
        <div style="position:relative;width:28px;height:28px;border-radius:50%;background:#061727;border:3px solid ${color};color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
          ${initial}
        </div>
        <div style="position:absolute;bottom:-10px;padding:1px 6px;border-radius:6px;background:${color};color:white;font-size:8px;font-weight:800;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.35);">
          ${tag}
        </div>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
};

// Extract 6-char session code whether scanned from full URL or typed raw
const extractSessionCode = (raw) => {
  if (!raw) return '';
  const trimmed = raw.trim();
  try {
    if (trimmed.includes('session=')) {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://example.com/${trimmed}`);
      return (url.searchParams.get('session') || '').trim().toUpperCase();
    }
  } catch {}
  return trimmed.toUpperCase();
};

export const StudentLiveLocationMap = () => {
  const { currentUser } = useAuth();
  const routerLocation = useRouterLocation();
  const {
    activeSession,
    sessionError,
    setSessionError,
    joinSessionCode,
    isSharing,
    coordinates,
    previewCoordinates,
    accuracy,
    currentPlace,
    matchedZoneName,
    lastUpdatedAt,
    waitingForBetterFix,
    lowAccuracyValue,
    gpsError,
    isOnline,
    collegeZones,
    startSharing,
    stopSharing,
    centerOnMyGps
  } = useLocation();

  const [codeInput, setCodeInput] = useState('');
  const [mapStyle, setMapStyle] = useState('satellite-labels');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [connectingSession, setConnectingSession] = useState(false);

  const html5QrRef = useRef(null);

  // Check ?session=CODE in URL on load (from scanning Faculty's QR link!)
  // IMPORTANT: Validates and populates the session ONLY — never starts sharing automatically!
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const urlSession = params.get('session');
    if (urlSession) {
      const clean = extractSessionCode(urlSession);
      setCodeInput(clean);
      joinSessionCode(clean).catch((err) => {
        setSessionError(err.message);
      });
    }
  }, [routerLocation.search, joinSessionCode, setSessionError]);

  // Manage real camera QR scanner lifecycle
  useEffect(() => {
    if (!scannerOpen) {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {}).finally(() => {
          html5QrRef.current = null;
        });
      }
      return;
    }

    setScannerError('');
    const regionId = 'clidge-student-qr-reader';
    const timer = setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(regionId);
        html5QrRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            const parsed = extractSessionCode(decodedText);
            if (parsed) {
              setCodeInput(parsed);
              setScannerOpen(false);
              try {
                await joinSessionCode(parsed);
              } catch (err) {
                setSessionError(err.message);
              }
            }
          },
          () => {}
        );
      } catch (err) {
        setScannerError(
          'Could not access phone camera. You can still type the 6-character Session Code manually or scan the QR with your phone camera app.'
        );
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {}).finally(() => {
          html5QrRef.current = null;
        });
      }
    };
  }, [scannerOpen, joinSessionCode, setSessionError]);

  const handleConnectCode = async (e) => {
    e.preventDefault();
    const cleaned = extractSessionCode(codeInput);
    if (!cleaned) {
      setSessionError('Enter the 6-character session code shown by your faculty.');
      return;
    }
    setConnectingSession(true);
    try {
      await joinSessionCode(cleaned);
    } catch (err) {
      setSessionError(err.message);
    } finally {
      setConnectingSession(false);
    }
  };

  const handleStartClick = () => {
    const code = activeSession?.sessionCode || extractSessionCode(codeInput);
    startSharing(code);
  };

  // Determine map center: Live GPS > Preview GPS > First college zone > World view
  const activePoint = coordinates || previewCoordinates;
  const mapCenter = activePoint
    ? [activePoint.lat, activePoint.lng]
    : collegeZones.length > 0
    ? [Number(collegeZones[0].latitude), Number(collegeZones[0].longitude)]
    : WORLD_CENTER;
  const mapZoom = activePoint ? 18 : collegeZones.length > 0 ? 17 : 2;

  return (
    <div className="space-y-5">
      {!isOnline && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-100 flex items-center gap-2.5">
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Internet connection lost. Reconnect to send live GPS updates to your faculty.</span>
        </div>
      )}

      {/* Step 1: Enter Session Code or Scan QR + Start/Stop Sharing Controls */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-navy-800 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-navy-950 dark:text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-600" /> My Location Sharing
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your faculty's session code (or scan their QR), then tap <strong>Start sharing</strong>.
            </p>
          </div>

          <span
            className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isSharing && !waitingForBetterFix
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                : isSharing && waitingForBetterFix
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-navy-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSharing && !waitingForBetterFix
                  ? 'bg-emerald-500 animate-pulse'
                  : isSharing
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-slate-400'
              }`}
            ></span>
            {isSharing ? (waitingForBetterFix ? 'Waiting for Better Fix' : 'Sharing LIVE') : 'Sharing Off'}
          </span>
        </div>

        {/* Session Code Form */}
        <form onSubmit={handleConnectCode} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 relative">
            <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Session code (e.g. A1B2C3)"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono uppercase text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="outline"
              size="md"
              disabled={connectingSession}
            >
              {connectingSession ? 'Checking...' : 'Load Session'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={Camera}
              onClick={() => setScannerOpen(true)}
            >
              Scan QR
            </Button>
          </div>
        </form>

        {/* Active Session Badge */}
        {activeSession && (
          <div className="p-3 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-navy-950 dark:text-white">{activeSession.title || 'Location Session'}</span>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                Faculty: {activeSession.facultyName} • Code: <strong className="font-mono text-cyan-700 dark:text-cyan-300">{activeSession.sessionCode}</strong>
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${activeSession.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-rose-100 text-rose-800'}`}>
              {activeSession.active ? 'Session Active' : 'Session Ended'}
            </span>
          </div>
        )}

        {/* Friendly Errors & Warnings */}
        {sessionError && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{sessionError}</span>
          </div>
        )}

        {gpsError && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{gpsError}</span>
          </div>
        )}

        {waitingForBetterFix && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            <span>
              Waiting for a better GPS fix... (Current signal accuracy is ±{lowAccuracyValue}m; signals worse than 150m are ignored. Move near a window or outdoors.)
            </span>
          </div>
        )}

        {/* Explicit Start Sharing / Stop Sharing Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            variant="emerald"
            size="lg"
            icon={Power}
            disabled={isSharing}
            onClick={handleStartClick}
            className="w-full justify-center"
          >
            Start sharing
          </Button>
          <Button
            type="button"
            variant="danger"
            size="lg"
            icon={X}
            disabled={!isSharing}
            onClick={() => stopSharing()}
            className="w-full justify-center"
          >
            Stop sharing
          </Button>
        </div>
      </div>

      {/* Live Telemetry Readout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-2xl border border-slate-200 dark:border-navy-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Place</span>
          <span className="font-bold text-navy-950 dark:text-white mt-0.5 block truncate" title={currentPlace}>
            {matchedZoneName ? `📍 ${matchedZoneName}` : currentPlace || 'Not acquired yet'}
          </span>
        </div>

        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-2xl border border-slate-200 dark:border-navy-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Lat / Long</span>
          <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300 mt-0.5 block">
            {activePoint ? `${activePoint.lat.toFixed(6)}, ${activePoint.lng.toFixed(6)}` : '—'}
          </span>
        </div>

        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-2xl border border-slate-200 dark:border-navy-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">GPS Accuracy</span>
          <span className="font-bold text-navy-950 dark:text-white mt-0.5 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-cyan-500" />
            {accuracy !== null ? `±${accuracy} m` : 'Pending'}
          </span>
        </div>

        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-2xl border border-slate-200 dark:border-navy-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Last Updated</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Idle'}
          </span>
        </div>
      </div>

      {/* Worldwide Satellite Map */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-card overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-600" /> Live Worldwide Map
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => centerOnMyGps().catch(() => {})}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-cyan-50 text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-600" /> Center on my GPS
            </button>
            <MapStyleSwitcher mapStyle={mapStyle} setMapStyle={setMapStyle} />
          </div>
        </div>

        <div className="h-[380px] sm:h-[440px] w-full relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            maxZoom={21}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
          >
            <MapFollower center={mapCenter} zoom={mapZoom} />
            <WorldTileLayers mapStyle={mapStyle} />

            {/* College Zones (Hostel, Canteen, Library, etc.) */}
            {collegeZones.map((zone) => (
              <React.Fragment key={zone.id}>
                <Circle
                  center={[Number(zone.latitude), Number(zone.longitude)]}
                  radius={Number(zone.radius) || 60}
                  pathOptions={{
                    color: zone.color || '#06b6d4',
                    fillColor: zone.color || '#06b6d4',
                    fillOpacity: 0.14,
                    weight: 2,
                    dashArray: '4, 4'
                  }}
                />
                <Marker
                  position={[Number(zone.latitude), Number(zone.longitude)]}
                  icon={createZoneMarkerIcon(zone)}
                >
                  <Popup>
                    <div className="p-2 text-xs text-navy-950">
                      <p className="font-bold">{zone.name}</p>
                      <p className="text-slate-500">Radius: {zone.radius}m</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

            {/* Student Real Position & True Accuracy Circle */}
            {activePoint && (
              <>
                {(accuracy || activePoint.accuracy) > 0 && (
                  <Circle
                    center={[activePoint.lat, activePoint.lng]}
                    radius={accuracy || activePoint.accuracy}
                    pathOptions={{
                      color: isSharing ? '#10b981' : '#06b6d4',
                      fillColor: isSharing ? '#10b981' : '#06b6d4',
                      fillOpacity: 0.16,
                      weight: 1.5
                    }}
                  />
                )}
                <Marker
                  position={[activePoint.lat, activePoint.lng]}
                  icon={createMyLocationIcon(currentUser?.name, isSharing, waitingForBetterFix)}
                >
                  <Popup>
                    <div className="p-2.5 text-xs text-navy-950 space-y-1 min-w-[180px]">
                      <p className="font-bold">{currentUser?.name}</p>
                      <p className="text-cyan-700 font-semibold">{currentPlace || 'Current GPS Position'}</p>
                      <p className="font-mono text-[11px]">
                        {activePoint.lat.toFixed(6)}, {activePoint.lng.toFixed(6)}
                      </p>
                      <p className="text-slate-500">Accuracy: ±{accuracy ?? activePoint.accuracy ?? '?'} m</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Camera QR Scanner Modal */}
      <Modal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Scan Faculty Session QR Code"
        subtitle="Point your camera at the QR code shown by your faculty"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-xs">
          {scannerError ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
              {scannerError}
            </div>
          ) : (
            <div id="clidge-student-qr-reader" className="w-full rounded-2xl overflow-hidden bg-black min-h-[260px]" />
          )}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentLiveLocationMap;
