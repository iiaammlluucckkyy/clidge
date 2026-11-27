import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarCheck2,
  MapPin,
  X,
  LogOut,
  Compass,
  UserCheck,
  Navigation,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const MobileNav = ({ isOpen, onClose }) => {
  const { currentRole, currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onClose();
  };

  const navLinks = currentRole === 'teacher' ? [
    { to: '/teacher-dashboard', label: 'Live Map & Sessions', icon: Compass },
    { to: '/teacher-dashboard?tab=events', label: 'College Events', icon: CalendarCheck2 },
    { to: '/teacher-dashboard?tab=zones', label: 'Campus Zones', icon: MapPin },
    { to: '/profile', label: 'Faculty Profile', icon: UserCheck }
  ] : [
    { to: '/student-dashboard', label: 'My Location', icon: Navigation },
    { to: '/student-dashboard?tab=events', label: 'College Events', icon: CalendarCheck2 },
    { to: '/profile', label: 'My Profile', icon: UserCheck }
  ];

  const isLinkActive = (to) => {
    const fullPath = location.pathname + location.search;
    if (to.includes('?')) return fullPath === to;
    return location.pathname === to && !location.search;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-navy-950 text-white shadow-2xl flex flex-col z-10 border-r border-navy-800">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
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

          <div className="pt-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full py-2.5 px-3.5 rounded-xl bg-navy-900 border border-navy-800 text-xs font-semibold text-slate-200 flex items-center justify-between"
            >
              <span>Theme Mode</span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                {isDark ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Account
          </div>
          <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-800 text-xs">
            <p className="font-bold text-white truncate">{currentUser?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser?.collegeName}</p>
            <p className="text-[11px] text-cyan-400 font-mono mt-1">
              Code: {currentUser?.collegeCode} • {currentRole === 'teacher' ? 'Faculty' : 'Student'}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-navy-800">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
