import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarCheck2,
  MapPin,
  LogOut,
  Compass,
  UserCheck,
  Navigation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';

export const Sidebar = () => {
  const { currentRole, currentUser, logout } = useAuth();
  const { events } = useEvents();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = currentRole === 'teacher' ? [
    {
      to: '/teacher-dashboard',
      label: 'Live Map & Sessions',
      icon: Compass,
      badge: 'Live'
    },
    {
      to: '/teacher-dashboard?tab=events',
      label: 'College Events',
      icon: CalendarCheck2,
      badge: events.length > 0 ? String(events.length) : null
    },
    {
      to: '/teacher-dashboard?tab=zones',
      label: 'Campus Zones',
      icon: MapPin
    },
    {
      to: '/profile',
      label: 'Faculty Profile',
      icon: UserCheck
    }
  ] : [
    {
      to: '/student-dashboard',
      label: 'My Location',
      icon: Navigation,
      badge: 'GPS'
    },
    {
      to: '/student-dashboard?tab=events',
      label: 'College Events',
      icon: CalendarCheck2,
      badge: events.length > 0 ? String(events.length) : null
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: UserCheck
    }
  ];

  const isLinkActive = (to) => {
    const fullPath = location.pathname + location.search;
    if (to.includes('?')) {
      return fullPath === to;
    }
    return location.pathname === to && (!location.search || location.search === '?tab=tracking' || location.search === '?tab=location');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-navy-950 text-white min-h-screen border-r border-navy-800/80 sticky top-0 h-screen select-none z-40">
      {/* Brand Header */}
      <div className="p-6 border-b border-navy-800/80 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-glow-cyan overflow-hidden border border-cyan-500/30">
            <img
              src="/logo.png"
              alt="Clidge Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-wider text-white">CLIDGE</span>
            </div>
            <p className="text-[10px] font-medium text-cyan-400 tracking-wider uppercase">Campus Location</p>
          </div>
        </Link>
      </div>

      {/* College Pill */}
      <div className="px-5 py-3 bg-navy-900/60 border-b border-navy-800/60">
        <p className="text-[11px] font-bold text-slate-200 truncate">
          {currentUser?.collegeName || 'Campus Network'}
        </p>
        <p className="text-[10px] text-cyan-300 font-mono mt-0.5">
          Code: {currentUser?.collegeCode || '—'}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          {currentRole === 'teacher' ? 'Faculty Controls' : 'Student Portal'}
        </div>

        {navLinks.map((item) => {
          const active = isLinkActive(item.to);
          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                active
                  ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sign Out */}
      <div className="p-4 border-t border-navy-800/80">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
