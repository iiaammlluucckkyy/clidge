import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  Radio,
  Users,
  QrCode,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  GraduationCap,
  FileSpreadsheet,
  WifiOff,
  Crosshair,
  Compass,
  CalendarCheck2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export const LandingPage = () => {
  const { isAuthenticated, currentUser, currentRole } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = () => {
    if (isAuthenticated && currentRole === 'student') {
      navigate('/student-dashboard');
    } else {
      navigate('/login?portal=student');
    }
  };

  const handleTeacherLogin = () => {
    if (isAuthenticated && currentRole === 'teacher') {
      navigate('/teacher-dashboard');
    } else {
      navigate('/login?portal=teacher');
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(currentRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-500 selection:text-white">
      {/* ============================================================ */}
      {/* 1. TOP NAVIGATION BAR */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="CLidge Logo"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-navy-950">CLIDGE</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <p className="text-[10px] font-semibold text-cyan-600 tracking-wider uppercase">
                Smart Campus Presence System
              </p>
            </div>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/events"
              className="text-xs font-semibold text-slate-600 hover:text-navy-950 px-3 py-2 rounded-xl transition-colors hidden sm:block"
            >
              Campus Events
            </Link>

            {isAuthenticated ? (
              <Button
                variant="cyan"
                size="sm"
                onClick={() => navigate(currentRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard')}
                icon={ArrowRight}
                iconPosition="right"
              >
                Go to {currentRole === 'teacher' ? 'Faculty' : 'Student'} Dashboard
              </Button>
            ) : (
              <>
                <button
                  onClick={handleStudentLogin}
                  className="text-xs font-bold text-slate-700 hover:text-navy-950 px-3 py-2 rounded-xl transition-colors"
                >
                  Student Sign In
                </button>
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={handleTeacherLogin}
                  icon={Users}
                >
                  Faculty Portal
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION - Simple, Clean & Professional Institutional   */}
      {/* ============================================================ */}
      <section className="bg-navy-950 text-white pt-10 pb-16 px-4 sm:px-8 border-b border-navy-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Smart Campus Event & Location Monitoring Platform</span>
          </div>

          {/* Official Logo Showcase */}
          <div className="flex flex-col items-center justify-center pt-1">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2.5 shadow-xl border border-white/90 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="CLIDGE Official Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white">CLIDGE</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-medium">
                Campus Location & Attendance System
              </span>
            </div>
          </div>

          {/* Clear Executive Headline */}
          <div className="space-y-2 max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Smart Student Location Tracking & <span className="text-cyan-400">Campus Event Attendance</span>
            </h1>

            <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed font-normal">
              High-precision GNSS geofencing and dynamic QR code verification for institutional events, seminar halls, and academic sessions. Department of Computer Science & Engineering.
            </p>
          </div>

          {/* ============================================================ */}
          {/* TWO DIRECT INSTITUTIONAL PORTALS                             */}
          {/* ============================================================ */}
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto text-left">
            {/* Faculty / Coordinator Portal Card */}
            <div className="bg-navy-900 rounded-3xl p-6 sm:p-7 border-2 border-cyan-500/60 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <Users className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Faculty Portal
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Faculty & Event Coordinators
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  Create events, configure venue geofence perimeters, monitor student locations on live radar, and export attendance records.
                </p>

                <ul className="space-y-2 mb-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Real-time student geofence telemetry map</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Dynamic event QR code generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Official CSV attendance report export</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  variant="cyan"
                  size="md"
                  className="w-full justify-center shadow-glow-cyan font-bold"
                  onClick={handleTeacherLogin}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Enter Faculty Portal
                </Button>
              </div>
            </div>

            {/* Student Portal Card */}
            <div className="bg-navy-900 rounded-3xl p-6 sm:p-7 border border-navy-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Student Portal
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Students & Attendees
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  Join approved sessions, verify voluntary GPS presence inside event halls, view live coordinates, and scan attendance QR codes.
                </p>

                <ul className="space-y-2 mb-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Instant event registration & participation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Live GPS coordinates & venue perimeter status</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Session-only voluntary location sharing</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleStudentLogin}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Enter Student Portal</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>
                <div className="text-center">
                  <Link
                    to="/register"
                    className="text-xs text-cyan-300/80 hover:text-cyan-200 underline-offset-4 hover:underline transition-colors"
                  >
                    New student? Register here →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights Ribbon */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-800 text-left">
              <span className="text-lg font-extrabold text-cyan-400 block">±4.2m GNSS</span>
              <p className="text-[11px] text-slate-400">Hall-Level Boundary Precision</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-800 text-left">
              <span className="text-lg font-extrabold text-white block">Real-Time</span>
              <p className="text-[11px] text-slate-400">Faculty Telemetry Radar</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-800 text-left">
              <span className="text-lg font-extrabold text-cyan-400 block">Dual Verify</span>
              <p className="text-[11px] text-slate-400">GPS + Dynamic QR Token</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-800 text-left">
              <span className="text-lg font-extrabold text-emerald-400 block">100% Privacy</span>
              <p className="text-[11px] text-slate-400">Session-Bound Location Only</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. HOW IT WORKS (Understood in 3 Simple Steps)                */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
            Understood in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From event entry to verified attendance in seconds — designed for high accuracy and seamless student experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center">
                  <Crosshair className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xl font-black text-slate-300">01</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-navy-950 mb-1.5">Join & Geofence Check</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Student joins the session. The system verifies device coordinates fall inside the designated venue perimeter.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-cyan-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <span>±4.2m Boundary precision</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <Radio className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xl font-black text-slate-300">02</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-navy-950 mb-1.5">Live Session Presence</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Coordinates update strictly during active hours. Faculty monitors real-time participant markers on the live radar.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-blue-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Stops when session ends</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <QrCode className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xl font-black text-slate-300">03</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-navy-950 mb-1.5">Dynamic QR Attendance</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Students scan the rotating event QR code to confirm check-in and check-out, with instant CSV report generation.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Instant verified export</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. KEY CAPABILITIES & RELIABILITY PILLARS                     */}
      {/* ============================================================ */}
      <section className="bg-navy-900 text-white py-16 px-4 sm:px-8 border-y border-navy-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Engineered for Accuracy & Privacy
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Built for Real College Environments
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-navy-950/70 border border-navy-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Hall Geofencing</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Boundaries mapped to specific college seminar halls, auditoriums, and labs with automatic breach detection.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-950/70 border border-navy-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Privacy First</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Students opt-in voluntarily. GPS tracking is restricted strictly to active event hours and never tracks outside campus.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-950/70 border border-navy-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
                <WifiOff className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Offline Resilient</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                IndexedDB offline cache stores records locally during campus Wi-Fi drops and auto-synchronizes when back online.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-950/70 border border-navy-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">CSV Attendance Reports</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Faculty can export complete participation rosters with check-in, check-out, and duration metrics with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. CALL TO ACTION & FOOTER                                   */}
      {/* ============================================================ */}
      <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-tr from-cyan-50 via-white to-blue-50 rounded-3xl p-8 sm:p-12 border border-cyan-100 shadow-card">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-2 shadow-md border border-slate-200 mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="CLidge Logo" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-950 mb-3">
            Ready to Experience CLIDGE?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-6">
            Get started right now. Register as a student or log in as faculty coordinator to manage your campus event presence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="cyan"
              size="lg"
              onClick={handleStudentLogin}
              icon={ArrowRight}
              iconPosition="right"
              className="shadow-glow-cyan"
            >
              Enter Student Portal
            </Button>
            <button
              onClick={handleTeacherLogin}
              className="px-6 py-3.5 rounded-xl text-base font-semibold bg-navy-900 hover:bg-navy-800 text-white transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Enter Faculty Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* Clean Institutional Footer */}
      <footer className="py-8 px-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center">
              <img src="/logo.png" alt="CLidge" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-navy-950">CLIDGE</span>
            <span className="text-slate-400">• Smart Student Location Tracking & Campus Event Monitoring System</span>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <p>Smart Student Tracking & Campus Geofence System</p>
            <p>Collegiate Event Monitoring & Attendance Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
