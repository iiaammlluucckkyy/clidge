import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Hash,
  Building2,
  GraduationCap,
  Shield,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DemoModeBanner from '../components/common/DemoModeBanner';
import Button from '../components/common/Button';

export const RegisterPage = () => {
  const { registerAccount } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialRole = searchParams.get('role') === 'teacher' ? 'teacher' : 'student';
  const sessionParam = searchParams.get('session');

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    collegeCode: '',
    facultyAccessKey: '',
    registrationNumber: '',
    department: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (role === 'teacher' && !formData.collegeName.trim()) {
      setErrorMessage('Please enter your College / University name.');
      return;
    }
    if (role === 'teacher' && !formData.facultyAccessKey.trim()) {
      setErrorMessage('Faculty Access Key is required. Ask your app administrator for the key.');
      return;
    }
    if (role === 'student' && !formData.collegeCode.trim()) {
      setErrorMessage('Please enter the 6-character College Code given by your faculty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await registerAccount({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        collegeName: formData.collegeName,
        collegeCode: formData.collegeCode,
        facultyAccessKey: formData.facultyAccessKey,
        registrationNumber: formData.registrationNumber,
        department: formData.department || 'General'
      });

      const sessionSuffix = sessionParam ? `?session=${encodeURIComponent(sessionParam)}` : '';
      if (user.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate(`/student-dashboard${sessionSuffix}`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Sign up failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginPath = sessionParam ? `/login?session=${encodeURIComponent(sessionParam)}` : '/login';

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
              Create Account
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
            to={loginPath}
            className="text-xs font-bold text-navy-900 dark:text-white bg-slate-100 dark:bg-navy-800 px-3 py-1.5 rounded-xl"
          >
            Sign In
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-card">
          {/* Quick Auth Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 dark:bg-navy-950 p-1 rounded-2xl mb-6 text-xs font-bold">
            <Link
              to={loginPath}
              className="py-2 text-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white"
            >
              Sign In
            </Link>
            <div className="py-2 text-center rounded-xl bg-white dark:bg-navy-800 text-navy-950 dark:text-white shadow-sm">
              Sign Up
            </div>
          </div>

          <div className="text-center mb-5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white">
              Create Your Clidge Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Works for any college worldwide — students connect using their college code
            </p>
          </div>

          {/* Role Toggle: Student vs Faculty */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => { setRole('student'); setErrorMessage(''); }}
              className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 ${
                role === 'student'
                  ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/50 text-navy-950 dark:text-white'
                  : 'border-slate-200 dark:border-navy-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              <GraduationCap className={`w-5 h-5 shrink-0 ${role === 'student' ? 'text-cyan-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-extrabold">Student</p>
                <p className="text-[10px] opacity-80">Join with College Code</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setRole('teacher'); setErrorMessage(''); }}
              className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 ${
                role === 'teacher'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 text-navy-950 dark:text-white'
                  : 'border-slate-200 dark:border-navy-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Shield className={`w-5 h-5 shrink-0 ${role === 'teacher' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-extrabold">Faculty</p>
                <p className="text-[10px] opacity-80">Create College Code</p>
              </div>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-navy-900 dark:text-slate-200 uppercase mb-1 text-[11px]">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-navy-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-900 dark:text-slate-200 uppercase mb-1 text-[11px]">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-navy-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Role-specific College Fields */}
            {role === 'teacher' ? (
              <div className="space-y-3.5 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80">
                <div>
                  <label className="block font-bold text-navy-900 dark:text-emerald-200 uppercase mb-1 text-[11px]">
                    College / Institution Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muthayammal Engineering College"
                      value={formData.collegeName}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      className="w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-navy-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Signing up generates a unique 6-character College Code for your students.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-amber-900 dark:text-amber-300 uppercase mb-1 text-[11px]">
                    Faculty Access Key *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Enter owner's secret Faculty Access Key"
                      value={formData.facultyAccessKey}
                      onChange={(e) => setFormData({ ...formData, facultyAccessKey: e.target.value })}
                      className="w-full bg-white dark:bg-navy-950 border border-amber-300 dark:border-amber-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-navy-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/80">
                <div>
                  <label className="block font-bold text-navy-900 dark:text-cyan-200 uppercase mb-1 text-[11px]">
                    6-Character College Code *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-cyan-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={8}
                      placeholder="e.g. X7K9P2"
                      value={formData.collegeCode}
                      onChange={(e) => setFormData({ ...formData, collegeCode: e.target.value.toUpperCase() })}
                      className="w-full bg-white dark:bg-navy-950 border border-cyan-300 dark:border-cyan-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-navy-900 dark:text-white font-mono uppercase tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-navy-900 dark:text-slate-200 uppercase mb-1 text-[11px]">
                    Roll / Reg Number
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Optional (e.g. 731622CSR045)"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      className="w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-navy-900 dark:text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-navy-900 dark:text-slate-200 uppercase mb-1 text-[11px]">
                  Password * (Min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-9 pr-9 py-2.5 text-xs text-navy-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-900 dark:text-slate-200 uppercase mb-1 text-[11px]">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-navy-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant={role === 'teacher' ? 'emerald' : 'cyan'}
              size="lg"
              className="w-full mt-2"
              disabled={isSubmitting}
              icon={ArrowRight}
              iconPosition="right"
            >
              {isSubmitting
                ? 'Creating Account...'
                : role === 'teacher'
                ? 'Create Faculty & College Account'
                : 'Create Student Account'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to={loginPath} className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
              Sign In →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
