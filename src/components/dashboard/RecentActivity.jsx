import React from 'react';
import { CheckCircle2, Radio, QrCode, Calendar, Clock } from 'lucide-react';

export const RecentActivity = ({ activities = [], title = 'Recent Activity' }) => {
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
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-navy-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your session activity</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          No activity yet. Share your live location or join a college event to see updates here.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-navy-800">
          {activities.map((item) => (
            <div key={item.id} className="relative">
              <div className="bg-slate-50 dark:bg-navy-800/70 p-3.5 rounded-2xl border border-slate-100 dark:border-navy-700">
                <div className="flex items-center gap-2">
                  {getIcon(item.type)}
                  <h4 className="text-xs font-bold text-navy-900 dark:text-white">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.description}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
