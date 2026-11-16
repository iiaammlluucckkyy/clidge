import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { Info, Sparkles } from 'lucide-react';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Engineering Project Demonstration Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white text-xs px-4 py-2 border-b border-navy-800/80 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-bold text-cyan-300">CLIDGE:</span>
          <span className="text-slate-200 hidden sm:inline">Smart Student Location Tracking & Campus Event Participation Monitoring System</span>
          <span className="text-slate-400 text-[11px]">(Demonstration Mode with Realistic College Data)</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-cyan-200/90 font-mono">
          <span className="hidden md:inline">Muthayammal Engineering College</span>
          <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded font-sans font-semibold">
            v1.0 Live Demo
          </span>
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
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              © 2026 <strong>CLIDGE</strong> • Department of Computer Science & Engineering. Built with React.js & Vite.
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
