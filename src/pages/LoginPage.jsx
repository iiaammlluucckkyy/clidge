import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export const LoginPage = () => {
  const { login, provisionTeacher } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Query param to preselect portal: /login?portal=teacher
  const searchParams = new URLSearchParams(location.search);
  const initialPortal = searchParams.get('portal') === 'teacher' ? 'teacher' : 'student';

  const [portal, setPortal] = useState(initialPortal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Admin Teacher Provisioning Modal
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [provisionData, setProvisionData] = useState({
    name: '',
    email: '',
    password: '',
    registrationNumber: '',
    department: 'Computer Science and Engineering',
    designation: 'Associate Professor',
    adminSecret: ''
  });
  const [provisionStatus, setProvisionStatus] = useState({ loading: false, error: '', success: '' });

  // Clear errors when switching portals & support demo param
  useEffect(() => {
    setErrorMessage('');
  }, [portal]);

  useEffect(() => {
    const demoParam = searchParams.get('demo');
    if (demoParam === 'teacher') {
      setPortal('teacher');
      setEmail('meenakshi.cse@muthayammal.edu.in');
      setPassword('Password@123');
    } else if (demoParam === 'student') {
      setPortal('student');
      setEmail('rajesh.731622csr045@muthayammal.edu.in');
      setPassword('Student@123');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({
        email: email.trim(),
        password,
        requiredRole: portal
      });

      // Redirect to appropriate dashboard based on role
      if (user.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (type) => {
    if (type === 'teacher') {
      setPortal('teacher');
      setEmail('meenakshi.cse@muthayammal.edu.in');
      setPassword('Password@123');
    } else {
      setPortal('student');
      setEmail('rajesh.731622csr045@muthayammal.edu.in');
      setPassword('Student@123');
    }
    setErrorMessage('');
  };

  const handleProvisionTeacher = async (e) => {
    e.preventDefault();
    setProvisionStatus({ loading: true, error: '', success: '' });

    try {
      await provisionTeacher(provisionData);
      setProvisionStatus({
        loading: false,
        error: '',
        success: `Teacher account for ${provisionData.name} provisioned successfully! You can now log in.`
      });
      // Pre-fill login
      setEmail(provisionData.email);
      setPassword(provisionData.password);
      setPortal('teacher');
      setTimeout(() => {
        setProvisionModalOpen(false);
      }, 1500);
    } catch (err) {
      setProvisionStatus({
        loading: false,
        error: err.message || 'Failed to provision teacher account.',
        success: ''
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-sm overflow-hidden">
            <img src="/logo.png" alt="CLidge Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-navy-950">CLIDGE</span>
            <span className="block text-[9px] font-bold text-cyan-600 uppercase tracking-widest">
              Smart Campus Auth
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 hidden sm:inline">New student?</span>
          <Link
            to="/register"
            className="font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 px-3 py-1.5 rounded-xl border border-cyan-200 transition-colors"
          >
            Create Student Account
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          {/* Portal Selection / Header Banner */}
          {portal === 'teacher' ? (
            <div className="mb-6 p-3 rounded-2xl bg-navy-950 text-white text-xs font-bold flex items-center justify-between border border-cyan-500/30 shadow-sm">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Faculty & Coordinator Portal</span>
              </span>
              <button
                type="button"
                onClick={() => { setPortal('student'); navigate('/login?portal=student'); }}
                className="text-[11px] text-cyan-300 hover:underline font-semibold"
              >
                Student Portal →
              </button>
            </div>
          ) : (
            <div className="mb-6 p-3 rounded-2xl bg-slate-100 text-navy-950 text-xs font-bold flex items-center justify-between border border-slate-200">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-600" />
                <span>Student Attendance Portal</span>
              </span>
              <button
                type="button"
                onClick={() => { setPortal('teacher'); navigate('/login?portal=teacher'); }}
                className="text-[11px] text-cyan-700 hover:underline font-semibold"
              >
                Faculty Portal →
              </button>
            </div>
          )}

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950">
              {portal === 'student' ? 'Student Sign In' : 'Faculty Coordinator Sign In'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {portal === 'student'
                ? 'Sign in to join campus events and share voluntary GPS.'
                : 'Authorized faculty portal for geofence and student monitoring.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder={portal === 'student' ? 'student.reg@muthayammal.edu.in' : 'faculty@muthayammal.edu.in'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
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
              variant={portal === 'student' ? 'cyan' : 'primary'}
              size="lg"
              className="w-full mt-2"
              disabled={isSubmitting}
              icon={ArrowRight}
              iconPosition="right"
            >
              {isSubmitting ? 'Authenticating...' : `Sign In to ${portal === 'student' ? 'Student' : 'Faculty'} Portal`}
            </Button>
          </form>

          {/* Quick Demo & Admin Helpers */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> One-Click Fill:
              </span>
              <div className="flex items-center gap-2">
                {portal === 'teacher' ? (
                  <button
                    type="button"
                    onClick={() => handleQuickFill('teacher')}
                    className="px-3 py-1 bg-navy-50 hover:bg-navy-100 text-navy-900 border border-navy-200 rounded-lg font-bold text-[11px] transition-colors"
                  >
                    Fill Faculty Credentials
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleQuickFill('student')}
                    className="px-3 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-lg font-bold text-[11px] transition-colors"
                  >
                    Fill Student Credentials
                  </button>
                )}
              </div>
            </div>

            {portal === 'teacher' && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setProvisionModalOpen(true)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-navy-900 transition-colors inline-flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3 text-cyan-600" />
                  <span>Admin Faculty Provisioning</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        CLIDGE Campus Authentication • Firebase Auth & Firestore Protected
      </footer>

      {/* Modal: Administrative Teacher Account Provisioning */}
      <Modal
        isOpen={provisionModalOpen}
        onClose={() => setProvisionModalOpen(false)}
        title="Admin: Provision Authorized Teacher Account"
        subtitle="Trusted administrative process. Public registration cannot create teacher roles."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleProvisionTeacher} className="space-y-3.5 text-xs">
          {provisionStatus.error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {provisionStatus.error}
            </div>
          )}
          {provisionStatus.success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{provisionStatus.success}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-navy-900 mb-1 uppercase text-[10px]">
              Faculty Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. S. Meenakshi"
              value={provisionData.name}
              onChange={(e) => setProvisionData({ ...provisionData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-navy-900 mb-1 uppercase text-[10px]">
              Faculty Email *
            </label>
            <input
              type="email"
              required
              placeholder="faculty@muthayammal.edu.in"
              value={provisionData.email}
              onChange={(e) => setProvisionData({ ...provisionData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-navy-900 mb-1 uppercase text-[10px]">
                Faculty ID / Reg *
              </label>
              <input
                type="text"
                required
                placeholder="FAC-CSE-108"
                value={provisionData.registrationNumber}
                onChange={(e) => setProvisionData({ ...provisionData, registrationNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-navy-900 mb-1 uppercase text-[10px]">
                Department
              </label>
              <input
                type="text"
                required
                value={provisionData.department}
                onChange={(e) => setProvisionData({ ...provisionData, department: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-navy-900 mb-1 uppercase text-[10px]">
              Initial Password * (Min 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Set strong faculty password"
              value={provisionData.password}
              onChange={(e) => setProvisionData({ ...provisionData, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <label className="block font-bold text-amber-900 mb-1 uppercase text-[10px]">
              Administrative Authorization Secret Key *
            </label>
            <input
              type="password"
              required
              placeholder="Enter VITE_ADMIN_PROVISION_SECRET"
              value={provisionData.adminSecret}
              onChange={(e) => setProvisionData({ ...provisionData, adminSecret: e.target.value })}
              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono"
            />
            <p className="text-[10px] text-amber-700 mt-1">
              Default demo secret in .env: <code className="font-bold">MEC-CSE-ADMIN-SECURE-2026</code>
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setProvisionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={provisionStatus.loading}
            >
              {provisionStatus.loading ? 'Provisioning...' : 'Provision Teacher Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;
