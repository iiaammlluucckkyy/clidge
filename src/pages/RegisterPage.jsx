import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Lock,
  User,
  Hash,
  Building,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Cyber Security',
  'Biomedical Engineering'
];

const YEARS = [
  'I Year / B.E.',
  'II Year / B.E.',
  'III Year / B.E.',
  'IV Year / B.E.'
];

export const RegisterPage = () => {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    registrationNumber: '',
    department: DEPARTMENTS[0],
    year: YEARS[2] // Default III Year
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    if (!formData.name.trim()) return 'Full name is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      return 'Please enter a valid college email address.';
    }
    if (!formData.registrationNumber.trim()) {
      return 'Registration number is required (e.g., 731622CSR045).';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match. Please re-enter carefully.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const error = validate();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setIsSubmitting(true);
    try {
      // Calls AuthContext which guarantees role: 'student'
      await registerStudent({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        registrationNumber: formData.registrationNumber,
        department: formData.department,
        year: formData.year
      });

      // Redirect immediately to the student dashboard
      navigate('/student-dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-sm overflow-hidden">
            <img src="/logo.png" alt="CLidge Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-navy-950">CLIDGE</span>
            <span className="block text-[9px] font-bold text-cyan-600 uppercase tracking-widest">
              Student Registration
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 hidden sm:inline">Already registered?</span>
          <Link
            to="/login"
            className="font-bold text-navy-900 hover:text-cyan-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Registration Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-100">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>Student Enrollment</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950">
              Create Student Account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Register with your institutional email to access event geofencing.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1.5 text-[11px]">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar M."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Email & Registration Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1.5 text-[11px]">
                  Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name.reg@college.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1.5 text-[11px]">
                  Registration Number *
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="731622CSR045"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Department & Year of Study */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1.5 text-[11px]">
                  Academic Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1.5 text-[11px]">
                  Year of Study *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                >
                  {YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1.5 text-[11px]">
                  Password * (Min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1.5 text-[11px]">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-cyan-50/70 border border-cyan-100 rounded-2xl text-[11px] text-cyan-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
              <span>
                By registering, your account receives the verified <strong>Student Role</strong>. Teacher accounts cannot be self-assigned and must be provisioned through the administrative faculty portal.
              </span>
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
              {isSubmitting ? 'Creating Student Profile...' : 'Complete Registration'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-cyan-700 hover:underline">
              Sign In to Clidge
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        CLIDGE Campus Authentication • Department of Computer Science & Engineering
      </footer>
    </div>
  );
};

export default RegisterPage;
