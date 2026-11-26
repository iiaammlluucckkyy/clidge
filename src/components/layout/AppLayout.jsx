import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import OfflineSyncBanner from '../common/OfflineSyncBanner';
import { Info, Sparkles } from 'lucide-react';
import BRANDING from '../../config/branding';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Official Institution Header Bar */}
      <div className="bg-navy-950 text-white text-xs px-4 sm:px-6 py-2 border-b border-navy-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cyan-400">{BRANDING.platformName} Smart Campus Network</span>
          <span className="text-slate-400 hidden sm:inline">• {BRANDING.institutionName} • Automated Location & Event Verification</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{BRANDING.geofenceLabel}</span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Navigation Drawer & Bottom Bar */}
        <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-10 max-w-7xl w-full mx-auto">
            <OfflineSyncBanner />
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              © 2026 <strong>{BRANDING.platformName}</strong> • {BRANDING.department} ({BRANDING.institutionCode}). Built with React.js & Vite.
            </p>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> GNSS Geofencing Active
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-cyan-700 font-medium">Voluntary Privacy Protected</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
