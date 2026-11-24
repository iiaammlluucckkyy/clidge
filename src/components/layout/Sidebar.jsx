import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  UserCheck,
  MapPin,
  Shield,
  LogOut,
  GraduationCap,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { currentRole, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Dedicated navigation links separated strictly by role
  const navLinks = currentRole === 'teacher' ? [
    {
      to: '/teacher-dashboard',
      label: 'Faculty Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/teacher-dashboard?tab=tracking',
      label: 'Live Student Tracking',
      icon: Compass,
      badge: 'Live'
    },
    {
      to: '/teacher-dashboard?tab=events',
      label: 'Event Management',
      icon: CalendarCheck2
    },
    {
      to: '/teacher-dashboard?tab=reports',
      label: 'Attendance & Reports',
      icon: FileSpreadsheet
    },
    {
      to: '/teacher-dashboard?tab=students',
      label: 'Student Information',
      icon: Users
    },
    {
      to: '/profile',
      label: 'Faculty Profile',
      icon: UserCheck
    }
  ] : [
    {
      to: '/student-dashboard',
      label: 'Student Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/student-dashboard?tab=location',
      label: 'My Live Location',
      icon: Compass,
      badge: 'GPS'
    },
    {
      to: '/student-dashboard?tab=attendance',
      label: 'My Attendance',
      icon: Award
    },
    {
      to: '/events',
      label: 'Campus Events',
      icon: CalendarCheck2,
      badge: '5 Active'
    },
    {
      to: '/student-dashboard?tab=history',
      label: 'My Participation',
      icon: CheckCircle2
    },
    {
      to: '/profile',
      label: 'My Profile & ID',
      icon: UserCheck
    }
  ];

  // Helper to determine if link is active including query params
  const isLinkActive = (to) => {
    const fullPath = location.pathname + location.search;
    if (to.includes('?')) {
      return fullPath === to;
    }
    return location.pathname === to && (!location.search || location.search === '?tab=overview');
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
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            </div>
            <p className="text-[10px] font-medium text-cyan-400 tracking-wider uppercase">Smart Campus System</p>
          </div>
        </Link>
      </div>

      {/* Campus Info Pill */}
      <div className="px-5 py-3 bg-navy-900/60 border-b border-navy-800/60">
        <p className="text-[11px] font-bold text-slate-200 truncate">CLIDGE Campus Network</p>
        <p className="text-[10px] text-cyan-300/80 truncate">Smart Student Tracking</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          {currentRole === 'teacher' ? 'Faculty Management' : 'Student Portal'}
        </div>

        {navLinks.map((item) => {
          const active = isLinkActive(item.to);
          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 text-cyan-300 border-l-4 border-cyan-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900/80'
              }`}
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
            </Link>
          );
        })}

        {/* User Role Card */}
        <div className="pt-6 px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Session Identity
        </div>

        <div className="p-3.5 rounded-2xl bg-navy-900/90 border border-navy-800 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-white truncate text-[11px]">{currentUser?.name}</p>
              <p className="font-mono text-[10px] text-cyan-400 truncate">{currentUser?.registrationNumber || currentUser?.regNumber}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-navy-800 text-[10px]">
            <span className="text-slate-400">Role:</span>
            <span className="capitalize font-bold text-cyan-300 flex items-center gap-1">
              {currentRole === 'teacher' ? <Shield className="w-3 h-3 text-cyan-400" /> : <GraduationCap className="w-3 h-3 text-cyan-400" />}
              {currentRole}
            </span>
          </div>
        </div>

        {/* Student Attendance Standing Card */}
        {currentRole === 'student' && (
          <div className="mt-3 p-3.5 rounded-2xl bg-navy-900/50 border border-navy-800/80 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Attendance:</span>
              <span className="font-semibold text-emerald-400">
                {currentUser?.attendanceStats?.overallPercentage || '94.2%'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-cyan-300">
                Ready to Scan
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Sign Out */}
      <div className="p-4 border-t border-navy-800/80 space-y-2 text-center">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
        <p className="text-[10px] text-slate-500">CLIDGE Campus Auth v2.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
