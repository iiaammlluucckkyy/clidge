import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'cyan', // 'cyan' | 'navy' | 'emerald' | 'amber'
  className = ''
}) => {
  const schemeStyles = {
    cyan: {
      border: 'hover:border-cyan-400 group-hover:shadow-glow-cyan',
      iconBg: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
      badge: 'bg-cyan-50 text-cyan-700'
    },
    navy: {
      border: 'hover:border-navy-400 group-hover:shadow-glow-navy',
      iconBg: 'bg-navy-50 text-navy-800 border border-navy-100',
      badge: 'bg-navy-50 text-navy-800'
    },
    emerald: {
      border: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badge: 'bg-emerald-50 text-emerald-700'
    },
    amber: {
      border: 'hover:border-amber-400',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      badge: 'bg-amber-50 text-amber-700'
    }
  }[colorScheme] || {
    border: 'hover:border-cyan-400',
    iconBg: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
    badge: 'bg-cyan-50 text-cyan-700'
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${schemeStyles.border} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-navy-900 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${schemeStyles.iconBg}`}>
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">{subtitle}</span>
          {trend && (
            <span className={`px-2 py-0.5 rounded-md font-semibold ${schemeStyles.badge}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
