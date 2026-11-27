import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  QrCode,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Users,
  Globe,
  Sun,
  Moon,
  Navigation,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DemoModeBanner from '../components/common/DemoModeBanner';
import Button from '../components/common/Button';

export const LandingPage = () => {
  const { isAuthenticated, currentRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const sessionCode = searchParams.get('session');
  const sessionSuffix = sessionCode ? `?session=${encodeURIComponent(sessionCode)}` : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <DemoModeBanner />

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-navy-800 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-sm overflow-hidden">
              <img
                src="/logo.png"
                alt="CLidge Logo"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-navy-950 dark:text-white">CLIDGE</span>
              <p className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase">
                Smart Campus Location & Events
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200/80 dark:border-navy-700 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Button
                variant="cyan"
                size="sm"
                onClick={() => navigate((currentRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard') + sessionSuffix)}
                icon={ArrowRight}
                iconPosition="right"
              >
                Open Dashboard
              </Button>
            ) : (
              <>
                <Link
                  to={`/login${sessionSuffix}`}
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-cyan-600 px-3 py-2 rounded-xl whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Button
                  variant="cyan"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => navigate(`/register${sessionSuffix}`)}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-navy-950 text-white pt-10 pb-16 px-4 sm:px-8 border-b border-navy-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Works for Any College Worldwide • Satellite & Real-Time GPS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-3xl mx-auto">
            Accurate Worldwide Campus <span className="text-cyan-400">Location & Events</span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Faculty start a live session QR code, define real campus zones on satellite imagery, and see every participating student's exact place and GPS live across phones.
          </p>

          {sessionCode && (
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-xs text-cyan-200">
              Session Code detected from QR link: <strong className="font-mono text-white text-sm">{sessionCode}</strong> — Sign in or Sign up below to share your location!
            </div>
          )}

          {/* Equal, clear action cards */}
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto text-left">
            {/* Student Card */}
            <div className="bg-navy-900 rounded-3xl p-6 sm:p-7 border border-cyan-500/40 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
                    Students
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Student Portal</h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-4">
                  Sign up using your faculty's 6-character College Code, scan a session QR code, and tap Start Sharing when ready.
                </p>

                <ul className="space-y-2 mb-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Enter session code or scan QR link</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Voluntary Start Sharing / Stop Sharing buttons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>View events posted by your college faculty</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="cyan" size="md" onClick={() => navigate(`/register?role=student${sessionCode ? `&session=${sessionCode}` : ''}`)}>
                  Student Sign Up
                </Button>
                <Button variant="dark-outline" size="md" onClick={() => navigate(`/login${sessionSuffix}`)}>
                  Sign In
                </Button>
              </div>
            </div>

            {/* Faculty Card */}
            <div className="bg-navy-900 rounded-3xl p-6 sm:p-7 border border-navy-700 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                    Faculty
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Faculty Portal</h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-4">
                  Create your college workspace (generates a 6-char code), mark real buildings on Satellite view, and start live sessions.
                </p>

                <ul className="space-y-2 mb-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Live Satellite map + QR session generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Tap Satellite map to mark Hostels, Canteen, Labs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Create & manage college events</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="emerald" size="md" onClick={() => navigate('/register?role=teacher')}>
                  Faculty Sign Up
                </Button>
                <Button variant="dark-outline" size="md" onClick={() => navigate(`/login${sessionSuffix}`)}>
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-card space-y-2">
          <Navigation className="w-6 h-6 text-cyan-600" />
          <h3 className="font-bold text-sm text-navy-950 dark:text-white">High-Precision GPS Filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Uses continuous high-accuracy GNSS, draws true accuracy circles, rejects &gt;150m coarse fixes, and reverse-geocodes exact street addresses worldwide.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-card space-y-2">
          <QrCode className="w-6 h-6 text-emerald-600" />
          <h3 className="font-bold text-sm text-navy-950 dark:text-white">QR Link + Session Code</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Every faculty session creates a short code and scannable QR link. College isolation guarantees students can only join their own college's sessions.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-card space-y-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-sm text-navy-950 dark:text-white">Zero Sample Clutter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Every new college starts clean with zero fake events or fake zones. Faculty can toggle 4 preview DEMO students safely without saving them.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
