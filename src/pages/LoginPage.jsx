import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DemoModeBanner from '../components/common/DemoModeBanner';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export const LoginPage = () => {
  const { login, requestPasswordReset } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const sessionParam = searchParams.get('session');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot Password
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ loading: false, error: '', success: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Unified sign-in: automatically loads your real role (Student or Faculty)
      const user = await login({
        email: email.trim(),
        password
      });

      const sessionSuffix = sessionParam ? `?session=${encodeURIComponent(sessionParam)}` : '';
      if (user.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate(`/student-dashboard${sessionSuffix}`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Sign in failed. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetStatus({ loading: true, error: '', success: '' });
    try {
      const res = await requestPasswordReset(resetEmail);
      setResetStatus({ loading: false, error: '', success: res.message });
    } catch (err) {
      setResetStatus({ loading: false, error: err.message, success: '' });
    }
  };

  const signupPath = sessionParam ? `/register?session=${encodeURIComponent(sessionParam)}` : '/register';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-between font-sans transition-colors">
      <DemoModeBanner />

      <header className="bg-white dark:bg-navy-900 border-b border-slate-200/80 dark:border-navy-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="CLidge Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-navy-950 dark:text-white">CLIDGE</span>
            <span className="block text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              Campus Sign In
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-navy-800"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to={signupPath}
            className="text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-200 dark:border-cyan-800"
          >
            Create Account
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-card">
          {/* Quick Auth Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 dark:bg-navy-950 p-1 rounded-2xl mb-6 text-xs font-bold">
            <div className="py-2 text-center rounded-xl bg-white dark:bg-navy-800 text-navy-950 dark:text-white shadow-sm">
              Sign In
            </div>
            <Link
              to={signupPath}
              className="py-2 text-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white"
            >
              Sign Up (New User)
            </Link>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white">
              Sign In to Clidge
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your email and password (works for both Students & Faculty)
            </p>
          </div>

          {sessionParam && (
            <div className="mb-4 p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 text-center">
              Session Code from QR: <strong className="font-mono">{sessionParam}</strong>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <div>{errorMessage}</div>
                <div className="mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-800/60">
                  <Link to={signupPath} className="font-bold underline">
                    New user? Create an account first →
                  </Link>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com or college email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-navy-900 dark:text-slate-200 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || '');
                    setResetStatus({ loading: false, error: '', success: '' });
                    setForgotModalOpen(true);
                  }}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="cyan"
              size="lg"
              className="w-full mt-2"
              disabled={isSubmitting}
              icon={ArrowRight}
              iconPosition="right"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
            First time opening Clidge?{' '}
            <Link to={signupPath} className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
              Create your account →
            </Link>
          </p>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-slate-400">
        CLIDGE • Smart Campus Location & Events
      </footer>

      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Account Password"
      >
        <form onSubmit={handlePasswordReset} className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Enter your registered email address to receive password reset instructions.
          </p>
          {resetStatus.error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200">
              {resetStatus.error}
            </div>
          )}
          {resetStatus.success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resetStatus.success}</span>
            </div>
          )}
          <input
            type="email"
            required
            placeholder="yourname@gmail.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setForgotModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm" disabled={resetStatus.loading}>
              {resetStatus.loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;
