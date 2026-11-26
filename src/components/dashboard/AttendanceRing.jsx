import React from 'react';
import { CheckCircle2, TrendingUp, Award } from 'lucide-react';

export const AttendanceRing = ({
  percentage = 0,
  eventsAttended = 0,
  totalRegistered = 0,
  hoursMonitored = 0,
  categories = []
}) => {
  const safePercentage = Math.min(100, Math.max(0, Number(percentage) || 0));
  // SVG circular geometry
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-navy-900">Attendance Summary</h3>
          <p className="text-xs text-slate-500">Verified campus geofence presence</p>
        </div>
        {totalRegistered > 0 ? (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
            safePercentage >= 75
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> {safePercentage >= 75 ? 'High Compliance (≥ 75%)' : 'Needs Attendance ( < 75%)'}
          </span>
        ) : (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> New Student
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Circular Progress Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              {/* Background Ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="text-slate-100 stroke-current"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="text-cyan-500 stroke-current transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-navy-900 tracking-tight">
                {safePercentage}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Overall Rate
              </span>
            </div>
          </div>

          <div className="mt-3 text-center text-xs text-slate-500">
            <span className="font-semibold text-navy-900">{eventsAttended}</span> of <span className="font-semibold text-navy-900">{totalRegistered}</span> sessions attended ({hoursMonitored} hrs)
          </div>
        </div>

        {/* Breakdown by event category */}
        <div className="md:col-span-7 space-y-3.5">
          <p className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">Category Performance</p>
          
          {categories && categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{cat.name}</span>
                  <span className="text-navy-900 font-bold">{cat.pct}% ({cat.attended}/{cat.total})</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-navy-800 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-semibold text-slate-600">No session categories logged yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                When you attend technical workshops and seminars, your compliance breakdown by category will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceRing;
