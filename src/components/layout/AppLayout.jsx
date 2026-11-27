import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import DemoModeBanner from '../common/DemoModeBanner';
import OfflineSyncBanner from '../common/OfflineSyncBanner';
import { useAuth } from '../../context/AuthContext';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* Demo Mode Warning (only visible if Firebase config is empty) */}
      <DemoModeBanner />

      {/* Top Campus Bar */}
      <div className="bg-navy-950 dark:bg-black text-white text-xs px-4 sm:px-6 py-2 border-b border-navy-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-cyan-400">CLIDGE</span>
          <span className="text-slate-400 hidden sm:inline truncate">
            • {currentUser?.collegeName || 'Smart Campus Location & Events'}
          </span>
        </div>
        {currentUser?.collegeCode && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>College Code: <strong className="font-mono text-cyan-300">{currentUser.collegeCode}</strong></span>
          </div>
        )}
      </div>

      <div className="flex-1 flex">
        <Sidebar />
        <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-10 max-w-7xl w-full mx-auto">
            <OfflineSyncBanner />
            <Outlet />
          </main>

          <footer className="border-t border-slate-200/80 dark:border-navy-800 bg-white/70 dark:bg-navy-900/60 backdrop-blur px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              © 2026 <strong>CLIDGE</strong> • Worldwide Smart Campus Location & Events
            </p>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Worldwide Satellite & GPS
              </span>
              <span>•</span>
              <span className="text-cyan-700 dark:text-cyan-400 font-medium">Consent-First Sharing</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
