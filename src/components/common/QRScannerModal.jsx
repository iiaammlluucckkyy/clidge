import React, { useState } from 'react';
import { QrCode, CheckCircle2, ShieldCheck, Camera, Sparkles } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { useEvents } from '../../context/EventContext';
import { useLocation } from '../../context/LocationContext';

export const QRScannerModal = ({ isOpen, onClose, event, mode = 'scan' }) => {
  const { checkInToEvent } = useEvents();
  const { geofenceStatus, coordinates } = useLocation();
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!event) return null;

  const handleSimulatedScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsSuccess(true);
      checkInToEvent(event.id, event.qrCodeKey);
    }, 1200);
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={mode === 'scan' ? 'Geofenced QR Attendance Check-In' : 'Campus Event QR Attendance Code'}
      subtitle={event.title}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center">
        {mode === 'display' ? (
          // Teacher View: Display QR code for projection
          <div className="w-full flex flex-col items-center py-4">
            <div className="p-4 bg-white border-2 border-dashed border-cyan-300 rounded-3xl shadow-glow-cyan mb-4">
              {/* SVG QR Code Simulation */}
              <div className="w-48 h-48 bg-slate-900 rounded-2xl p-3 flex flex-col items-center justify-between text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-navy-900/50"></div>
                <div className="flex justify-between w-full z-10">
                  <div className="w-10 h-10 border-4 border-cyan-400 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                  </div>
                  <div className="w-10 h-10 border-4 border-cyan-400 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                  </div>
                </div>
                <div className="z-10 flex flex-col items-center">
                  <QrCode className="w-12 h-12 text-cyan-300 animate-pulse-subtle" />
                  <span className="text-[10px] font-mono tracking-widest text-cyan-200 mt-1">CLIDGE-TOKEN</span>
                </div>
                <div className="flex justify-between w-full z-10">
                  <div className="w-10 h-10 border-4 border-cyan-400 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                  </div>
                  <div className="w-8 h-8 grid grid-cols-2 gap-1 p-1">
                    <div className="bg-cyan-400 rounded-sm"></div>
                    <div className="bg-white rounded-sm"></div>
                    <div className="bg-white rounded-sm"></div>
                    <div className="bg-cyan-400 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 mb-3">
              Token: {event.qrCodeKey || 'CLIDGE-2026-AUTONOMOUS'}
            </p>
            <p className="text-xs text-slate-500 max-w-xs">
              Project this dynamic code on the hall screen. Students must be within the geofenced perimeter ({event.geofenceRadius}m) to validate attendance.
            </p>
          </div>
        ) : (
          // Student View: Scan QR
          <div className="w-full flex flex-col items-center py-2">
            {!isSuccess ? (
              <>
                <div className="relative w-56 h-56 bg-navy-950 rounded-3xl overflow-hidden border-2 border-cyan-500 shadow-glow-cyan flex flex-col items-center justify-center mb-5">
                  {/* Viewfinder corners */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400"></div>
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400"></div>

                  {/* Animated Laser Scanning Line */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-[0_0_15px_#22d3ee]"></div>
                  )}

                  <Camera className="w-12 h-12 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">
                    {isScanning ? 'Verifying coordinates...' : 'Point camera at session QR'}
                  </p>
                </div>

                {/* Geofence verification status note */}
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-5 text-left text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Venue Geofence:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {geofenceStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Live GNSS Lock:</span>
                    <span className="font-mono text-slate-700">{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
                  </div>
                </div>

                <Button
                  variant="cyan"
                  className="w-full"
                  onClick={handleSimulatedScan}
                  disabled={isScanning}
                  icon={Sparkles}
                >
                  {isScanning ? 'Validating Token & GPS...' : 'Simulate Scanning QR Code'}
                </Button>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-navy-900 mb-1">Attendance Verified!</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Your attendance for <strong>{event.title}</strong> has been logged inside <strong>{event.venue}</strong>.
                </p>
                <Button variant="primary" className="w-full" onClick={handleReset}>
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
