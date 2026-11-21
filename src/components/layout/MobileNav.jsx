import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  UserCheck,
  X,
  MapPin,
  Shield,
  Home,
  LogOut,
  GraduationCap,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = ({ isOpen, onClose }) => {
  const { currentRole, currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onClose();
  };

  const navLinks = currentRole === 'teacher' ? [
    { to: '/teacher-dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { to: '/teacher-dashboard?tab=tracking', label: 'Live Student Tracking', icon: Compass },
    { to: '/teacher-dashboard?tab=events', label: 'Event Management', icon: CalendarCheck2 },
    { to: '/teacher-dashboard?tab=reports', label: 'Attendance & Reports', icon: FileSpreadsheet },
    { to: '/teacher-dashboard?tab=students', label: 'Student Information', icon: Users },
    { to: '/profile', label: 'Faculty Profile', icon: UserCheck }
  ] : [
    { to: '/student-dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/student-dashboard?tab=attendance', label: 'My Attendance', icon: Award },
    { to: '/events', label: 'Campus Events', icon: CalendarCheck2 },
    { to: '/student-dashboard?tab=history', label: 'My Participation', icon: CheckCircle2 },
    { to: '/profile', label: 'Student Profile & ID', icon: UserCheck }
  ];

  const isLinkActive = (to) => {
    const fullPath = location.pathname + location.search;
    if (to.includes('?')) {
      return fullPath === to;
    }
    return location.pathname === to && (!location.search || location.search === '?tab=overview');
  };

  return (
    <>
      {/* Slide-over Drawer for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-navy-950 text-white shadow-2xl flex flex-col z-10 border-r border-navy-800">
            {/* Header */}
            <div className="p-5 border-b border-navy-800 flex items-center justify-between">
              <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-wider text-white">CLIDGE</span>
                  <span className="block text-[9px] uppercase tracking-wider text-cyan-400">Smart Campus</span>
                </div>
              </Link>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
              <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {currentRole === 'teacher' ? 'Faculty Menu' : 'Student Menu'}
              </div>

              {navLinks.map((item) => {
                const active = isLinkActive(item.to);
                return (
                  <Link
                    key={item.to + item.label}
                    to={item.to}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-300 border-l-4 border-cyan-400'
                        : 'text-slate-300 hover:text-white hover:bg-navy-900'
                    }`}
                  >
                    <item.icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* User Info */}
              <div className="pt-6 px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Signed In User
              </div>
              <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-800 text-xs">
                <p className="font-bold text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-cyan-400 font-mono">{currentUser?.registrationNumber || currentUser?.regNumber}</p>
                <p className="text-[10px] text-slate-400 capitalize mt-1">Role: {currentRole}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-navy-800 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
