import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  UserCheck,
  X,
  MapPin,
  Shield,
  ArrowRightLeft,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = ({ isOpen, onClose }) => {
  const { currentRole, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleToggle = () => {
    const nextRole = currentRole === 'student' ? 'teacher' : 'student';
    switchRole(nextRole);
    navigate(nextRole === 'student' ? '/student-dashboard' : '/teacher-dashboard');
    onClose();
  };

  return (
    <>
      {/* Slide-over Drawer for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-navy-950 text-white shadow-2xl flex flex-col z-10 border-r border-navy-800">
            {/* Header */}
            <div className="p-5 border-b border-navy-800 flex items-center justify-between">
              <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center p-0.5">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-wider text-white">CLIDGE</span>
                  <span className="block text-[9px] uppercase tracking-wider text-cyan-400">Smart Campus</span>
                </div>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-900"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 p-4 space-y-1 overflow-y-auto text-xs font-semibold">
              <NavLink
                to="/"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-navy-900"
              >
                <Home className="w-4 h-4 text-cyan-400" />
                <span>Project Landing Page</span>
              </NavLink>

              <NavLink
                to={currentRole === 'student' ? '/student-dashboard' : '/teacher-dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>{currentRole === 'student' ? 'Student Dashboard' : 'Faculty Dashboard'}</span>
              </NavLink>

              <NavLink
                to="/events"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`
                }
              >
                <CalendarCheck2 className="w-4 h-4 text-cyan-400" />
                <span>Campus Events (5)</span>
              </NavLink>

              <NavLink
                to="/teacher-dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`
                }
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Student Location Tracking</span>
              </NavLink>

              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`
                }
              >
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Profile & Permissions</span>
              </NavLink>

              <div className="pt-4 mt-4 border-t border-navy-800">
                <button
                  onClick={handleRoleToggle}
                  className="w-full py-2.5 px-3 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Switch to {currentRole === 'student' ? 'Teacher' : 'Student'} View</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Navigation Dock (Phones & Small Tablets) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] font-medium py-1 ${
              isActive ? 'text-cyan-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to={currentRole === 'student' ? '/student-dashboard' : '/teacher-dashboard'}
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] font-medium py-1 ${
              isActive ? 'text-cyan-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/events"
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] font-medium py-1 ${
              isActive ? 'text-cyan-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <CalendarCheck2 className="w-5 h-5 mb-0.5" />
          <span>Events</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] font-medium py-1 ${
              isActive ? 'text-cyan-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </>
  );
};

export default MobileNav;
