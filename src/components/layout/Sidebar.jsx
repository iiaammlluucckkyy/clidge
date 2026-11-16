import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  UserCheck,
  MapPin,
  Shield,
  Layers,
  ArrowRightLeft,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

export const Sidebar = () => {
  const { currentRole, switchRole } = useAuth();
  const { isSharing, geofenceStatus } = useLocation();

  const navLinks = [
    {
      to: currentRole === 'student' ? '/student-dashboard' : '/teacher-dashboard',
      label: currentRole === 'student' ? 'Student Dashboard' : 'Faculty Dashboard',
      icon: LayoutDashboard,
      highlight: true
    },
    {
      to: '/events',
      label: 'Campus Events',
      icon: CalendarCheck2,
      badge: '5 Active'
    },
    {
      to: '/teacher-dashboard',
      label: 'Live Student Tracking',
      icon: Users,
      badge: currentRole === 'teacher' ? 'Live' : null,
      teacherOnly: false
    },
    {
      to: '/profile',
      label: 'Profile & Credentials',
      icon: UserCheck
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-navy-950 text-white min-h-screen border-r border-navy-800/80 sticky top-0 h-screen select-none z-40">
      {/* Brand Header */}
      <div className="p-6 border-b border-navy-800/80 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan p-0.5 overflow-hidden">
            {/* Logo image if exists, else branded icon */}
            <img
              src="/logo.jpeg"
              alt="Clidge Logo"
              className="w-full h-full object-cover rounded-[10px]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-wider text-white">CLIDGE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            </div>
            <p className="text-[10px] font-medium text-cyan-400 tracking-wider uppercase">Smart Campus System</p>
          </div>
        </Link>
      </div>

      {/* College Info Pill */}
      <div className="px-5 py-3 bg-navy-900/60 border-b border-navy-800/60">
        <p className="text-[11px] font-bold text-slate-200 truncate">Muthayammal Engg. College</p>
        <p className="text-[10px] text-cyan-300/80 truncate">Autonomous • Rasipuram</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Navigation Menu
        </div>

        {navLinks.map((item) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 text-cyan-300 border-l-4 border-cyan-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900/80'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        <div className="pt-6 px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Demonstration Perspective
        </div>

        {/* Perspective Quick Switch Card */}
        <div className="p-3.5 rounded-2xl bg-navy-900/90 border border-navy-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Current Role:</span>
            <span className="capitalize font-bold text-cyan-300 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> {currentRole}
            </span>
          </div>

          <button
            onClick={() => switchRole(currentRole === 'student' ? 'teacher' : 'student')}
            className="w-full mt-1 py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Switch to {currentRole === 'student' ? 'Teacher' : 'Student'}</span>
          </button>
        </div>

        {/* Live GPS Health Card */}
        <div className="mt-3 p-3.5 rounded-2xl bg-navy-900/50 border border-navy-800/80 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Voluntary GPS:</span>
            <span className={`font-semibold ${isSharing ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isSharing ? 'Active (Live)' : 'Paused'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Geofence Status:</span>
            <span className="font-semibold text-cyan-300 truncate max-w-[110px] text-right">
              {geofenceStatus}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>GNSS Accuracy:</span>
            <span className="font-mono text-slate-300">±4.2m</span>
          </div>
        </div>
      </div>

      {/* Footer / Tech Spec Info */}
      <div className="p-4 border-t border-navy-800/80 text-center">
        <Link
          to="/"
          className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Landing & Architecture</span>
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </Link>
        <p className="text-[10px] text-slate-400 mt-1">Clidge Autonomous Campus v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
