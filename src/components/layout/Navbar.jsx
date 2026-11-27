import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  Shield,
  User,
  LogOut,
  ChevronDown,
  GraduationCap,
  Sun,
  Moon,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = ({ onMobileMenuToggle }) => {
  const { currentRole, currentUser, logout } = useAuth();
  const { events } = useEvents();
  const { isDark, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-navy-800 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 focus:outline-none"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
            <span className="font-bold text-navy-900 dark:text-white truncate">
              {currentUser?.collegeName || 'Campus Portal'}
            </span>
            <span className="text-slate-300 dark:text-navy-700">/</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
              {currentRole === 'teacher' ? 'Faculty Dashboard' : 'Student Dashboard'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200/70 dark:border-navy-700 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Verified Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50/70 dark:bg-cyan-950/50 text-cyan-900 dark:text-cyan-200 text-xs font-semibold">
            {currentRole === 'teacher' ? (
              <Shield className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            )}
            <span className="font-bold">{currentRole === 'teacher' ? 'Faculty' : 'Student'}</span>
          </div>

          {/* Real Events Notifications (Zero fake notifications!) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {events.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-white dark:ring-navy-900"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-navy-900 rounded-2xl shadow-xl border border-slate-100 dark:border-navy-800 py-3 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider">College Updates</span>
                  <span className="text-[10px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded-full">
                    {events.length} Events
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-navy-800 max-h-60 overflow-y-auto text-xs">
                  {events.length > 0 ? (
                    events.slice(0, 4).map(evt => (
                      <div key={evt.id} className="p-3 hover:bg-slate-50 dark:hover:bg-navy-800/60">
                        <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span className="truncate">{evt.title}</span>
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                          {evt.venue} • {evt.date} ({evt.startTime})
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-5 text-center text-slate-500 dark:text-slate-400 text-xs">
                      No alerts yet. Events created by your college faculty will show here.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-navy-900 to-cyan-700 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-navy-900 dark:text-white leading-tight truncate max-w-[120px]">
                  {currentUser?.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {currentUser?.collegeCode}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 rounded-2xl shadow-xl border border-slate-100 dark:border-navy-800 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-800">
                  <p className="text-xs font-bold text-navy-900 dark:text-white truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                  <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                    College: {currentUser?.collegeCode} • {currentRole === 'teacher' ? 'Faculty' : 'Student'}
                  </p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800"
                >
                  <User className="w-3.5 h-3.5" /> Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
