import React from 'react';
import { Calendar, MapPin, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export const WelcomeBanner = ({
  user,
  role = 'student',
  actionLabel,
  actionIcon: ActionIcon,
  onActionClick
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 rounded-3xl p-6 sm:p-8 text-white shadow-glow-navy border border-navy-800/80 mb-8">
      {/* Subtle Cyan Ambient Accents */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {role === 'student' ? 'Student Portal' : 'Faculty Monitoring Portal'}
            </span>
            <Badge variant="Inside Venue" size="sm">
              Live Session Active
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-100">{user?.name}</span>!
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {role === 'student' ? (
              <>
                Department of <strong>{user?.department}</strong> • Reg: <span className="font-mono text-cyan-300">{user?.regNumber}</span>. Your voluntary location stream is synchronized with the college session geofence.
              </>
            ) : (
              <>
                {user?.designation} • Department of <strong>{user?.department}</strong>. Real-time geofence tracking and automated attendance records for campus sessions.
              </>
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Muthayammal Engineering College</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Academic Year 2024 - 2026</span>
            </span>
          </div>
        </div>

        {actionLabel && (
          <div className="flex-shrink-0">
            <Button
              variant="cyan"
              size="lg"
              icon={ActionIcon || Sparkles}
              onClick={onActionClick}
              className="w-full sm:w-auto shadow-glow-cyan"
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeBanner;
