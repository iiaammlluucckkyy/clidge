import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Hash,
  GraduationCap,
  Building,
  Shield,
  ShieldCheck,
  MapPin,
  LogOut,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export const ProfilePage = () => {
  const { currentRole, currentUser, logout, sendVerificationEmail } = useAuth();
  const { isSharing, toggleSharing } = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'privacy' | 'academic'
  const [verifyNotice, setVerifyNotice] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleVerifyEmail = async () => {
    setIsVerifying(true);
    try {
      const res = await sendVerificationEmail();
      setVerifyNotice(res.message);
    } catch (err) {
      setVerifyNotice(err.message || 'Failed to send verification email.');
    } finally {
      setIsVerifying(false);
    }
  };

  const regNo = currentUser?.registrationNumber || currentUser?.regNumber || 'REG-PENDING';

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-300">
      {/* Top Profile Card Banner */}
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 rounded-3xl p-6 sm:p-7 text-white border border-navy-800 shadow-glow-navy relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-glow-cyan border-2 border-white/20">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {currentUser?.name}
                </h1>
                <Badge variant={currentRole === 'student' ? 'Inside Venue' : 'Upcoming'} size="sm">
                  Verified {currentRole}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-cyan-300 font-mono">
                Reg No: {regNo}
              </p>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentUser?.department || 'Computer Science and Engineering'}</span>
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              className="w-full sm:w-auto text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          Institutional Profile
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'privacy'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          Location & Privacy Permissions
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'academic'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          Digital College ID Card
        </button>
      </div>

      {/* Tab 1: Profile Information Details */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-600" /> Personal & Account Credentials
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-bold text-navy-900">{currentUser?.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-slate-500">Official Email:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-cyan-700">{currentUser?.email}</span>
                  <button
                    onClick={handleVerifyEmail}
                    disabled={isVerifying}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold transition-colors"
                  >
                    {isVerifying ? 'Sending...' : 'Verify Email'}
                  </button>
                </div>
              </div>
              {verifyNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{verifyNotice}</span>
                </div>
              )}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-slate-500">Verified Role:</span>
                <span className="font-bold text-emerald-700 capitalize flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {currentUser?.role || currentRole}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-slate-500">Institution:</span>
                <span className="font-semibold text-navy-900">Campus Institution</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-600" /> Academic & Department Info
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-slate-500">Registration / ID:</span>
                <span className="font-mono font-bold text-cyan-800">{regNo}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-slate-500">Department:</span>
                <span className="font-bold text-navy-900">{currentUser?.department || 'Computer Science and Engineering'}</span>
              </div>
              {currentRole === 'student' ? (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-500">Year of Study:</span>
                  <span className="font-semibold text-slate-800">{currentUser?.year || 'III Year / B.E.'}</span>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <span className="text-slate-500">Designation:</span>
                  <span className="font-semibold text-slate-800">{currentUser?.designation || 'Associate Professor'}</span>
                </div>
              )}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-slate-500">Account Created:</span>
                <span className="font-mono text-slate-600">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Location & Privacy Settings */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Voluntary GPS & Geofence Policy
              </h3>
              <p className="text-xs text-slate-500">
                CLIDGE operates strictly under a voluntary, privacy-first collegiate charter
              </p>
            </div>
            <Badge variant={isSharing ? 'Inside Venue' : 'Offline'} size="sm">
              {isSharing ? 'Sharing Active' : 'Location Paused'}
            </Badge>
          </div>

          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy-900 block font-bold mb-1">Session-Bound Location Tracking Only</strong>
                Your smartphone location is only queried when you have joined an active college event or seminar. As soon as the faculty ends the event, GPS polling ceases automatically.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy-900 block font-bold mb-1">No Off-Campus Tracking</strong>
                Locations outside the college boundary are treated as "Out of Bounds" without logging off-campus streets, maintaining student personal privacy.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy-900 block font-bold mb-1">Battery-Efficient Heartbeat</strong>
                Location samples are collected at 15-second intervals via the browser Geolocation API, conserving battery life throughout college hours.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Master Voluntary Tracking Switch:</span>
            <Button
              variant={isSharing ? 'danger' : 'cyan'}
              size="sm"
              onClick={toggleSharing}
            >
              {isSharing ? 'Revoke Location Permission' : 'Enable Voluntary GPS'}
            </Button>
          </div>
        </div>
      )}

      {/* Tab 3: Digital College ID Card */}
      {activeTab === 'academic' && (
        <div className="flex justify-center py-4">
          <div className="w-full max-w-md bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-7 border-2 border-cyan-400/50 shadow-glow-cyan relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-slate-200 flex items-center justify-center">
                  <img src="/logo.png" alt="CLidge" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold tracking-wider text-white">COLLEGIATE CAMPUS ID</h4>
                  <p className="text-[9px] text-cyan-300 uppercase tracking-widest">Smart Student Tracking</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
                CLIDGE-ID
              </span>
            </div>

            {/* Middle Identity */}
            <div className="flex items-center gap-5 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white/20">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-white">{currentUser?.name}</h3>
                <p className="text-xs font-mono font-bold text-cyan-400">{regNo}</p>
                <p className="text-[11px] text-slate-300">{currentUser?.department}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">{currentUser?.role || currentRole}</p>
              </div>
            </div>

            {/* ID Footer */}
            <div className="pt-4 border-t border-navy-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>VALID: 2024 - 2026</span>
              <span className="text-cyan-400">GNSS GEOFENCE COMPLIANT</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
