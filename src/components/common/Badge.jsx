import React from 'react';

const BADGE_STYLES = {
  // Event Statuses
  Ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  Upcoming: 'bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-500/20',
  Completed: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20',

  // Geofence & Location Statuses
  'Inside Venue': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  'Outside Bounds': 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
  'Outdated / Idle': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  Offline: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20',

  // Check-In Statuses
  'Checked In': 'bg-cyan-50 text-cyan-800 border-cyan-200 ring-cyan-500/20',
  'Not Registered': 'bg-slate-50 text-slate-500 border-slate-200 ring-slate-500/10',

  // Department Badges
  Navy: 'bg-navy-50 text-navy-800 border-navy-200 ring-navy-500/20',
  Default: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10'
};

export const Badge = ({ children, variant, showDot = true, className = '', size = 'md' }) => {
  const style = BADGE_STYLES[variant] || BADGE_STYLES.Default;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size] || 'text-xs px-2.5 py-1';

  const dotColors = {
    Ongoing: 'bg-emerald-500 animate-pulse',
    'Inside Venue': 'bg-emerald-500 animate-pulse',
    'Outside Bounds': 'bg-rose-500 animate-ping',
    'Outdated / Idle': 'bg-amber-500',
    Upcoming: 'bg-cyan-500',
    Completed: 'bg-slate-400',
    Offline: 'bg-slate-400'
  };

  const dotColor = dotColors[variant] || 'bg-cyan-500';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm transition-colors ${style} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {variant === 'Inside Venue' || variant === 'Ongoing' ? (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          ) : null}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
        </span>
      )}
      {children || variant}
    </span>
  );
};

export default Badge;
