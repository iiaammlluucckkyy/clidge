import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  Radio,
  Users,
  CalendarCheck2,
  QrCode,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronRight,
  Award,
  BatteryCharging,
  WifiOff,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export const LandingPage = () => {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = () => {
    loginAs('student');
    navigate('/student-dashboard');
  };

  const handleTeacherLogin = () => {
    loginAs('teacher');
    navigate('/teacher-dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-navy-900 flex items-center justify-center shadow-glow-cyan p-0.5 overflow-hidden">
              <img
                src="/logo.jpeg"
                alt="Clidge Logo"
                className="w-full h-full object-cover rounded-[14px]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-wider text-navy-950">CLIDGE</span>
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] font-semibold text-cyan-600 tracking-wider uppercase">Smart Campus System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleStudentLogin}
              className="text-xs font-bold text-navy-900 hover:text-cyan-600 px-3 py-2 rounded-xl transition-colors hidden sm:block"
            >
              Student Login
            </button>
            <button
              onClick={handleTeacherLogin}
              className="text-xs font-bold text-navy-900 hover:text-cyan-600 px-3 py-2 rounded-xl transition-colors hidden sm:block"
            >
              Teacher Login
            </button>
            <Button
              variant="cyan"
              size="sm"
              onClick={handleStudentLogin}
              icon={ArrowRight}
              iconPosition="right"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-16 pb-24 px-4 sm:px-8">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold shadow-sm mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Engineering Ideation Project Demonstration • Muthayammal Engineering College</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Smart Student Location Tracking & Campus Event Participation Monitoring System
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            A real-time, privacy-conscious collegiate platform enabling voluntary GNSS location updates, GPS geofencing, and automated attendance verification for campus seminars, technical workshops, and academic classes.
          </p>

          {/* Core Call to Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <Button
              variant="cyan"
              size="lg"
              onClick={handleStudentLogin}
              icon={ArrowRight}
              iconPosition="right"
              className="shadow-glow-cyan"
            >
              Student Login (Demo)
            </Button>

            <button
              onClick={handleTeacherLogin}
              className="px-6 py-3.5 rounded-xl text-base font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Teacher / Coordinator Login</span>
            </button>

            <Link
              to="/events"
              className="px-6 py-3.5 rounded-xl text-base font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <CalendarCheck2 className="w-4 h-4 text-slate-400" />
              <span>Browse Events</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-navy-800 text-left">
              <span className="text-2xl font-extrabold text-cyan-400">100%</span>
              <p className="text-xs text-slate-400 mt-0.5">Voluntary Session Sharing</p>
            </div>
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-navy-800 text-left">
              <span className="text-2xl font-extrabold text-white">±4.2m</span>
              <p className="text-xs text-slate-400 mt-0.5">High-Precision Geofence</p>
            </div>
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-navy-800 text-left">
              <span className="text-2xl font-extrabold text-cyan-400">1 API</span>
              <p className="text-xs text-slate-400 mt-0.5">Multi-Student GPS Ingestion</p>
            </div>
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-navy-800 text-left">
              <span className="text-2xl font-extrabold text-white">&lt;15s</span>
              <p className="text-xs text-slate-400 mt-0.5">Automated Sync Interval</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
            System Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 mt-3">
            Engineered for Modern College Campus Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Solving the continuous attendance challenge during large workshops, guest lectures, and laboratory symposiums.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mb-5">
              <Radio className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">Real-Time Geofencing</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Geofenced perimeters configured per venue (Auditorium, Seminar Hall 302, Tech Park). The system verifies continuous presence inside the hall without manual faculty checks.
            </p>
            <span className="text-xs font-semibold text-cyan-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" /> Automatic breach detection
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-800 border border-navy-100 flex items-center justify-center mb-5">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">Privacy-First Voluntary GPS</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Students voluntarily opt-in per event or class. Location sharing is restricted strictly to scheduled event hours and terminates immediately upon session completion.
            </p>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Session-bound lifecycle
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mb-5">
              <QrCode className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">Dual QR & GNSS Verification</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Combines cryptographic QR code scans with browser Geolocation API coordinates, preventing buddy punching or check-ins outside the hall boundary.
            </p>
            <span className="text-xs font-semibold text-cyan-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" /> Anti-proxy attendance
            </span>
          </div>
        </div>
      </section>

      {/* Architecture & College Information Banner */}
      <section className="bg-navy-900 text-white py-16 px-4 sm:px-8 border-y border-navy-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Layers className="w-4 h-4" /> Full-Stack Technical Stack
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Built Ready for Python Flask & Cloud Firebase
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              The frontend is crafted in React.js with Vite, React Router, and Lucide Icons. Structured service abstractions in <code className="text-cyan-300 bg-navy-950 px-2 py-0.5 rounded font-mono">src/services/flaskApi.js</code> and <code className="text-cyan-300 bg-navy-950 px-2 py-0.5 rounded font-mono">firebaseConfig.js</code> connect directly to your Python Flask backend (<code className="text-cyan-300 bg-navy-950 px-2 py-0.5 rounded font-mono">app.py</code>) and Firestore collections.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
                <span className="font-bold text-cyan-300 block">Frontend:</span>
                <span className="text-slate-400">React.js, Vite, Tailwind CSS</span>
              </div>
              <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
                <span className="font-bold text-cyan-300 block">Backend Architecture:</span>
                <span className="text-slate-400">Python Flask REST API</span>
              </div>
              <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
                <span className="font-bold text-cyan-300 block">Database / Auth:</span>
                <span className="text-slate-400">Firebase Firestore & Auth</span>
              </div>
              <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
                <span className="font-bold text-cyan-300 block">Location Engine:</span>
                <span className="text-slate-400">HTML5 Geolocation API & GNSS</span>
              </div>
            </div>
          </div>

          {/* Interactive Role Selector for Viva Demo */}
          <div className="bg-navy-950 rounded-3xl p-7 border border-navy-800 shadow-xl space-y-5">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" /> Start Demonstration
            </h4>
            <p className="text-xs text-slate-400">
              Select a portal perspective to begin testing with realistic engineering college sample data:
            </p>

            <div className="space-y-3">
              <button
                onClick={handleStudentLogin}
                className="w-full text-left p-4 rounded-2xl bg-navy-900/80 hover:bg-navy-800/80 border border-navy-700 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-sm text-cyan-300 group-hover:text-cyan-200 flex items-center gap-2">
                    Student Portal <ChevronRight className="w-4 h-4 text-cyan-400" />
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Rajesh Kumar M. (731622CSR045) • View events, voluntary GPS toggle, QR scan.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Enter
                </span>
              </button>

              <button
                onClick={handleTeacherLogin}
                className="w-full text-left p-4 rounded-2xl bg-navy-900/80 hover:bg-navy-800/80 border border-navy-700 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-sm text-cyan-300 group-hover:text-cyan-200 flex items-center gap-2">
                    Teacher & Faculty Portal <ChevronRight className="w-4 h-4 text-cyan-400" />
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Dr. S. Meenakshi, Assoc. Prof • Live student geofence map, attendance rosters, create event.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Enter
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-xs text-slate-500 border-t border-slate-200">
        <p>CLIDGE • Smart Student Location Tracking & Campus Event Participation Monitoring System</p>
        <p className="text-[11px] text-slate-400 mt-1">Muthayammal Engineering College (Autonomous), Rasipuram</p>
      </footer>
    </div>
  );
};

export default LandingPage;
