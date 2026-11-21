import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  CheckCircle2,
  ShieldCheck,
  Camera,
  Sparkles,
  RefreshCw,
  Clock,
  MapPin,
  AlertCircle,
  LogOut,
  LogIn,
  Key,
  WifiOff,
  FileSpreadsheet
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Badge from './Badge';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { useLocation } from '../../context/LocationContext';

export const QRScannerModal = ({ isOpen, onClose, event, mode = 'scan', onOpenReport }) => {
  const { currentUser } = useAuth();
  const {
    isOnline,
    generateEventQr,
    getEventQr,
    checkIn,
    checkOut
  } = useAttendance();
  const { geofenceStatus, coordinates } = useLocation();

  // Teacher QR generation state
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [activeToken, setActiveToken] = useState('');
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(3600);

  // Student Scan / Attendance Action state
  const [actionType, setActionType] = useState('check-in'); // 'check-in' or 'check-out'
  const [manualToken, setManualToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // Load / generate QR code for teacher
  useEffect(() => {
    let timer = null;
    if (isOpen && event && mode === 'display') {
      const loadQr = async () => {
        setIsGenerating(true);
        setErrorMessage(null);
        try {
          const eventId = event.id || event.eventId;
          // First check active token or generate new
          let tokenMeta = await getEventQr(eventId);
          if (!tokenMeta || !tokenMeta.qr_token) {
            tokenMeta = await generateEventQr(eventId, 60);
          }

          const tokenStr = tokenMeta.qr_token;
          setActiveToken(tokenStr);
          setTokenExpiresAt(tokenMeta.expires_at);

          // Generate authentic crisp 2D QR Code image via QRCode library
          const url = await QRCode.toDataURL(tokenStr, {
            width: 320,
            margin: 2,
            color: {
              dark: '#061727', // Deep navy
              light: '#ffffff'
            }
          });
          setQrDataUrl(url);

          // Calculate remaining seconds
          if (tokenMeta.expires_at) {
            const exp = new Date(tokenMeta.expires_at).getTime();
            const now = Date.now();
            setRemainingSeconds(Math.max(0, Math.floor((exp - now) / 1000)));
          }
        } catch (err) {
          console.error('Error generating QR:', err);
          setErrorMessage(err.message || 'Failed to render event QR code');
        } finally {
          setIsGenerating(false);
        }
      };
      loadQr();

      // Expiry countdown timer
      timer = setInterval(() => {
        setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, event, mode]);

  // When opening student scanner, prepopulate with event's token for quick 1-click testing
  useEffect(() => {
    if (isOpen && event && mode === 'scan') {
      const eventId = event.id || event.eventId;
      getEventQr(eventId).then(res => {
        if (res?.qr_token) {
          setManualToken(res.qr_token);
        } else {
          setManualToken(`clidge_qr_${eventId}_initial`);
        }
      });
      setErrorMessage(null);
      setSuccessResult(null);
    }
  }, [isOpen, event, mode]);

  if (!event) return null;

  const eventId = event.id || event.eventId;

  const handleRegenerateQr = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await generateEventQr(eventId, 60);
      setActiveToken(res.qr_token);
      setTokenExpiresAt(res.expires_at);
      const url = await QRCode.toDataURL(res.qr_token, {
        width: 320,
        margin: 2,
        color: { dark: '#061727', light: '#ffffff' }
      });
      setQrDataUrl(url);
      setRemainingSeconds(3600);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStudentAttendanceSubmit = async (selectedAction) => {
    const act = selectedAction || actionType;
    const tokenToUse = manualToken.trim() || activeToken || `clidge_qr_${eventId}_initial`;

    if (!tokenToUse) {
      setErrorMessage('Please scan a QR code or enter the session QR token.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (act === 'check-in') {
        const res = await checkIn({
          eventId,
          eventTitle: event.title,
          qrToken: tokenToUse
        });
        setSuccessResult({
          action: 'Check-In',
          message: res.offlineQueued
            ? 'Check-In safely saved to local IndexedDB (Offline). Server will verify when reconnected.'
            : 'Check-In verified and logged by campus server!',
          offline: res.offlineQueued,
          timestamp: res.attendance_record?.checkInTime || new Date().toISOString()
        });
      } else {
        const res = await checkOut({
          eventId,
          eventTitle: event.title,
          qrToken: tokenToUse
        });
        setSuccessResult({
          action: 'Check-Out',
          message: res.offlineQueued
            ? 'Check-Out safely saved to local IndexedDB (Offline). Server will verify when reconnected.'
            : 'Check-Out verified and logged by campus server!',
          offline: res.offlineQueued,
          timestamp: res.attendance_record?.checkOutTime || new Date().toISOString()
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Attendance transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setSuccessResult(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'scan' ? 'Event QR Attendance Check-In / Out' : 'Campus Event QR Attendance Code'}
      subtitle={event.title}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center">
        {mode === 'display' ? (
          // ================= TEACHER PROJECTION VIEW =================
          <div className="w-full flex flex-col items-center py-2">
            {/* Header info */}
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mb-4 text-xs flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-cyan-600" /> {event.venue}
              </span>
              <span className="font-mono text-cyan-800 font-bold bg-cyan-100/70 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Clock className="w-3 h-3" /> Expires: {formatCountdown(remainingSeconds)}
              </span>
            </div>

            {/* Real 2D QR Code Canvas/Image */}
            <div className="p-3 bg-white border-2 border-dashed border-cyan-400 rounded-3xl shadow-glow-cyan mb-4 flex flex-col items-center">
              {isGenerating ? (
                <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-cyan-600 mb-2" />
                  <p className="text-xs font-medium">Generating cryptographic token...</p>
                </div>
              ) : qrDataUrl ? (
                <div className="relative group">
                  <img
                    src={qrDataUrl}
                    alt="Event Attendance QR Code"
                    className="w-64 h-64 rounded-2xl shadow-inner"
                  />
                  <div className="absolute inset-0 bg-navy-950/5 pointer-events-none rounded-2xl"></div>
                </div>
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-xs text-slate-400">
                  QR unavailable
                </div>
              )}
            </div>

            {/* Token string pill */}
            <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 mb-3 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-sans text-[11px]">Active Token:</span>
              <span className="text-slate-800 font-bold select-all truncate max-w-[200px]">
                {activeToken || 'clidge_token'}
              </span>
            </div>

            {/* Teacher instructions */}
            <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed">
              Project this high-contrast code onto the hall screen. Students scan with their mobile devices to record authenticated check-in and check-out.
            </p>

            {/* Action buttons */}
            <div className="w-full flex items-center gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleRegenerateQr}
                disabled={isGenerating}
                icon={RefreshCw}
              >
                Regenerate Token
              </Button>
              {onOpenReport && (
                <Button
                  variant="cyan"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    handleClose();
                    onOpenReport(event);
                  }}
                  icon={FileSpreadsheet}
                >
                  View Attendance Report
                </Button>
              )}
            </div>
          </div>
        ) : (
          // ================= STUDENT SCAN & VERIFICATION VIEW =================
          <div className="w-full flex flex-col items-center py-1">
            {!successResult ? (
              <>
                {/* Event verification pill */}
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 text-left text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Event Venue:</span>
                    <span className="font-semibold text-navy-900 truncate max-w-[200px]">
                      {event.venue}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Venue Geofence:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {geofenceStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">GNSS Coordinates:</span>
                    <span className="font-mono text-slate-700">
                      {coordinates?.lat ? `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}` : 'Campus Lock'}
                    </span>
                  </div>
                </div>

                {/* Animated Scanner Viewfinder */}
                <div className="relative w-full max-w-[240px] h-48 bg-navy-950 rounded-3xl overflow-hidden border-2 border-cyan-500 shadow-glow-cyan flex flex-col items-center justify-center mb-4">
                  {/* Viewfinder crosshairs */}
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400"></div>
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400"></div>

                  {/* Laser line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-[0_0_15px_#22d3ee]"></div>

                  <Camera className="w-10 h-10 text-cyan-400/80 mb-2 animate-pulse" />
                  <p className="text-[11px] text-cyan-200 font-medium">
                    Point camera at projected hall QR
                  </p>
                </div>

                {/* Action Selector: Check-In vs Check-Out */}
                <div className="w-full grid grid-cols-2 gap-2 mb-3 bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setActionType('check-in')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      actionType === 'check-in'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" /> Check-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('check-out')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      actionType === 'check-out'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Check-Out
                  </button>
                </div>

                {/* Quick Token Input (Enables 1-click test simulation without requiring phone camera) */}
                <div className="w-full mb-3 text-left">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    <Key className="w-3 h-3 text-cyan-600" /> Scanned Token Verification
                  </label>
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="clidge_qr_evt-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>

                {/* Offline Warning Notice */}
                {!isOnline && (
                  <div className="w-full mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2 text-left">
                    <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      <strong>Offline Mode:</strong> Attendance scan will be saved to IndexedDB and automatically verified once your internet reconnects.
                    </span>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="w-full mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}

                {/* Submit Action Buttons */}
                <div className="w-full space-y-2">
                  <Button
                    variant={actionType === 'check-in' ? 'emerald' : 'cyan'}
                    className="w-full"
                    onClick={() => handleStudentAttendanceSubmit(actionType)}
                    disabled={isProcessing}
                    icon={actionType === 'check-in' ? LogIn : LogOut}
                  >
                    {isProcessing
                      ? 'Verifying Token with Server...'
                      : `Confirm ${actionType === 'check-in' ? 'Check-In' : 'Check-Out'}`}
                  </Button>
                </div>
              </>
            ) : (
              // ================= SUCCESS CONFIRMATION =================
              <div className="py-6 flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-8 ${
                    successResult.offline
                      ? 'bg-amber-100 text-amber-600 ring-amber-50'
                      : 'bg-emerald-100 text-emerald-600 ring-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-navy-950 mb-1">
                  {successResult.action} {successResult.offline ? 'Queued (Offline)' : 'Confirmed!'}
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mb-3">
                  {successResult.message}
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[11px] font-mono text-slate-600 mb-6">
                  Timestamp: {new Date(successResult.timestamp).toLocaleTimeString()} · Status: {successResult.offline ? 'Queued in IndexedDB' : 'Server Verified'}
                </div>
                <Button variant="primary" className="w-full" onClick={handleClose}>
                  Done
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QRScannerModal;
