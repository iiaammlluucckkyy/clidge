import React, { useState } from 'react';
import {
  Compass,
  Radio,
  Layers,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Maximize2,
  Users
} from 'lucide-react';
import { CAMPUS_ZONES, CAMPUS_METRICS } from '../../data/campusZones';
import { MONITORED_STUDENTS } from '../../data/sampleStudents';

export const GeofenceMap = ({ onSelectStudent }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'INSIDE' | 'OUTSIDE'

  const filteredStudents = MONITORED_STUDENTS.filter(s => {
    if (activeFilter === 'INSIDE') return s.status === 'Inside Venue';
    if (activeFilter === 'OUTSIDE') return s.status === 'Outside Bounds' || s.status === 'Outdated / Idle';
    return true;
  });

  return (
    <div className="bg-navy-950 rounded-3xl p-6 text-white border border-navy-800 shadow-glow-navy relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" /> Live Campus Geofence Radar
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {CAMPUS_METRICS.institution} • {CAMPUS_METRICS.geofencePrecision}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-navy-900/90 p-1 rounded-2xl border border-navy-800 text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              activeFilter === 'ALL' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Students ({MONITORED_STUDENTS.length})
          </button>
          <button
            onClick={() => setActiveFilter('INSIDE')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              activeFilter === 'INSIDE' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inside Venue (6)
          </button>
          <button
            onClick={() => setActiveFilter('OUTSIDE')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              activeFilter === 'OUTSIDE' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Out of Bounds (2)
          </button>
        </div>
      </div>

      {/* SVG Interactive Map Area */}
      <div className="relative w-full h-80 sm:h-96 bg-navy-900/60 rounded-2xl border border-navy-800/80 overflow-hidden flex items-center justify-center">
        {/* Animated Radar Sweep Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-96 h-96 rounded-full border border-cyan-500/20 relative animate-radar radar-sweep"></div>
        </div>

        {/* Radar Concentric Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-28 h-28 rounded-full border border-cyan-500/15"></div>
          <div className="w-56 h-56 rounded-full border border-cyan-500/15"></div>
          <div className="w-80 h-80 rounded-full border border-cyan-500/10"></div>
          <div className="w-full h-full border-t border-b border-l border-r border-cyan-500/10"></div>
        </div>

        {/* Geofenced Campus Zones (Simulated layout) */}
        {/* Zone 1: Main Auditorium */}
        <div
          onClick={() => setSelectedZone(CAMPUS_ZONES[0])}
          className="absolute left-[40%] top-[35%] w-36 h-36 rounded-full border-2 border-dashed border-cyan-400/60 bg-cyan-500/10 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-500/20 transition-all p-2 text-center"
        >
          <span className="text-[10px] font-bold text-cyan-300 tracking-wider">ZONE A1</span>
          <span className="text-[9px] text-slate-300 truncate max-w-[110px]">Main Auditorium</span>
          <span className="text-[8px] text-cyan-400 font-mono">r = 65m</span>
        </div>

        {/* Zone 2: CSE Seminar Hall */}
        <div
          onClick={() => setSelectedZone(CAMPUS_ZONES[1])}
          className="absolute left-[62%] top-[18%] w-28 h-28 rounded-full border-2 border-dashed border-blue-400/60 bg-blue-500/10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-500/20 transition-all p-2 text-center"
        >
          <span className="text-[10px] font-bold text-blue-300 tracking-wider">ZONE C2</span>
          <span className="text-[9px] text-slate-300 truncate max-w-[90px]">CSE Hall 302</span>
          <span className="text-[8px] text-blue-300 font-mono">r = 45m</span>
        </div>

        {/* Zone 3: Tech Park */}
        <div
          onClick={() => setSelectedZone(CAMPUS_ZONES[2])}
          className="absolute left-[70%] top-[55%] w-32 h-32 rounded-full border-2 border-dashed border-emerald-400/60 bg-emerald-500/10 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-500/20 transition-all p-2 text-center"
        >
          <span className="text-[10px] font-bold text-emerald-300 tracking-wider">ZONE T3</span>
          <span className="text-[9px] text-slate-300 truncate max-w-[90px]">Tech Park Lab</span>
          <span className="text-[8px] text-emerald-300 font-mono">r = 55m</span>
        </div>

        {/* Out-of-Bounds Zone: Campus Cafeteria */}
        <div className="absolute left-[15%] top-[70%] w-24 h-24 rounded-2xl border border-rose-500/40 bg-rose-500/10 flex flex-col items-center justify-center text-center p-1.5">
          <span className="text-[9px] font-bold text-rose-300 uppercase">Canteen</span>
          <span className="text-[8px] text-rose-400">Non-Session Area</span>
        </div>

        {/* Student Markers plotted on the radar */}
        {filteredStudents.map((std) => {
          const isInside = std.status === 'Inside Venue';
          const isBreached = std.status === 'Outside Bounds';
          const isOutdated = std.status === 'Outdated / Idle';

          return (
            <div
              key={std.id}
              onClick={() => onSelectStudent && onSelectStudent(std)}
              style={{ left: `${std.coordinates.xPercent}%`, top: `${std.coordinates.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            >
              <div className="relative flex items-center justify-center">
                {/* Ping animation for live students */}
                {isInside && (
                  <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-cyan-400 opacity-75"></span>
                )}
                {isBreached && (
                  <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-rose-500 opacity-90"></span>
                )}

                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-150 ${
                    isInside
                      ? 'bg-cyan-400'
                      : isBreached
                      ? 'bg-rose-500'
                      : isOutdated
                      ? 'bg-amber-400'
                      : 'bg-slate-400'
                  }`}
                />
              </div>

              {/* Hover Tooltip Card */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-navy-900/95 backdrop-blur border border-navy-700 text-white p-2.5 rounded-xl text-left shadow-2xl z-30 pointer-events-none">
                <p className="text-xs font-bold text-white truncate">{std.name}</p>
                <p className="text-[10px] font-mono text-cyan-300">{std.regNumber}</p>
                <div className="mt-1 pt-1 border-t border-navy-800 text-[10px] space-y-0.5">
                  <p className="text-slate-300 truncate">Zone: {std.zone}</p>
                  <p className={isInside ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {std.status} ({std.lastPing})
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Legend & Metrics */}
      <div className="mt-4 pt-4 border-t border-navy-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Inside Geofenced Venue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Outside Bounds (Alert)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Outdated / Stationary</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span>Signal Inactive</span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-cyan-300">
          Last GNSS Ping: Every 15s • Geofence Latency: 420ms
        </div>
      </div>
    </div>
  );
};

export default GeofenceMap;
