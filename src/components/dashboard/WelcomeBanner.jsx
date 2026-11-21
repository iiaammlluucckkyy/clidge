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
    <div className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 rounded-3xl p-6 sm:p-7 text-white shadow-glow-navy border border-navy-800/80 mb-6">
      {/* Subtle Cyan Ambient Accents */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {role === 'student' ? 'Student Portal' : 'Faculty Portal'}
            </span>
            <Badge variant="Inside Venue" size="sm">
              Live Session
            </Badge>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-100">{user?.name}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 pt-1 font-medium">
            {role === 'student' ? (
              <>
                <span className="truncate max-w-xs">{user?.department || 'Computer Science and Engineering'}</span>
                <span className="text-cyan-400 font-mono">Reg: {user?.registrationNumber || user?.regNumber || 'REG-PENDING'}</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Geofence Sync Active
                </span>
              </>
            ) : (
              <>
                <span>{user?.designation || 'Faculty Coordinator'}</span>
                <span className="text-slate-400">•</span>
                <span className="truncate max-w-xs">{user?.department || 'Computer Science and Engineering'}</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Muthayammal Engg. College
                </span>
              </>
            )}
          </div>
        </div>

        {actionLabel && (
          <div className="flex-shrink-0 pt-1 md:pt-0">
            <Button
              variant="cyan"
              size="md"
              icon={ActionIcon || Sparkles}
              onClick={onActionClick}
              className="w-full sm:w-auto shadow-glow-cyan font-bold"
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
