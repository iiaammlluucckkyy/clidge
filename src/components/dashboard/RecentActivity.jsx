import React from 'react';
import { CheckCircle2, Radio, QrCode, Calendar, Shield, Clock } from 'lucide-react';
import { RECENT_ACTIVITIES } from '../../data/sampleStudents';

export const RecentActivity = ({ activities = RECENT_ACTIVITIES, title = 'Recent Activity & Geofence Logs' }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'check_in':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'gps_sync':
        return <Radio className="w-4 h-4 text-cyan-500" />;
      case 'qr_scan':
        return <QrCode className="w-4 h-4 text-blue-500" />;
      case 'event_join':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-navy-900">{title}</h3>
          <p className="text-xs text-slate-500">Chronological telemetry audit trail</p>
        </div>
        <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-100">
          Live Log Stream
        </span>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {activities.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-200 group-hover:border-cyan-500 flex items-center justify-center transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-cyan-500"></span>
            </div>

            <div className="bg-slate-50/70 group-hover:bg-cyan-50/30 p-3.5 rounded-2xl border border-slate-100 group-hover:border-cyan-100 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getIcon(item.type)}
                  <h4 className="text-xs font-bold text-navy-900">{item.title}</h4>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">{item.description}</p>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
