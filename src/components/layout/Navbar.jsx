import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  Shield,
  User,
  LogOut,
  ChevronDown,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import Badge from '../common/Badge';

export const Navbar = ({ onMobileMenuToggle }) => {
  const { currentRole, currentUser, logout, isAuthenticated } = useAuth();
  const { geofenceStatus, isSharing } = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Title/Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Campus Institution Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-navy-900">Campus Event Portal</span>
            <span className="text-slate-300">/</span>
            <span className="text-cyan-600 font-medium">GNSS Geofence Active</span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events, seminar halls, student registers..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions, Role Badge, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Student Status Badge */}
          {currentRole === 'student' && (
            <div className="hidden sm:flex items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Attendance Active
              </span>
            </div>
          )}

          {/* VERIFIED ROLE BADGE */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 text-cyan-900 text-xs font-semibold shadow-sm">
            {currentRole === 'teacher' ? (
              <Shield className="w-3.5 h-3.5 text-cyan-600" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />
            )}
            <span className="capitalize font-bold text-navy-900">
              {currentRole === 'teacher' ? 'Faculty Portal' : 'Student Portal'}
            </span>
          </div>

          {/* Notifications Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in-50">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">Campus Alerts</span>
                  <span className="text-[10px] font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">3 New</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto text-xs">
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-800">Geofence Active: Main Auditorium</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">National Level Workshop attendance monitoring has started.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-800">Attendance Logged</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Your voluntary GPS coordinate matched Hall 302 perimeter.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-800">Upcoming Session Reminder</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Campus Hackathon 2026 starts Nov 18 at Tech Park Lab 4.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Yesterday</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-navy-900 to-navy-700 text-cyan-300 font-bold flex items-center justify-center text-xs shadow-sm">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-xs font-bold text-navy-900 leading-tight truncate max-w-[120px]">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{currentRole || 'User'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-navy-900 truncate">{currentUser?.name}</p>
                  <p className="text-[11px] font-mono text-cyan-700 truncate">{currentUser?.registrationNumber || currentUser?.regNumber}</p>
                  <span className="inline-block text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                    Role: {currentRole}
                  </span>
                </div>
                <div className="py-1 text-xs">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-cyan-600 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile & Settings</span>
                  </Link>
                  <Link
                    to={currentRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-cyan-600 transition-colors"
                  >
                    <Navigation className="w-4 h-4 text-slate-400" />
                    <span>{currentRole === 'teacher' ? 'Faculty Dashboard' : 'Student Dashboard'}</span>
                  </Link>
                </div>
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
