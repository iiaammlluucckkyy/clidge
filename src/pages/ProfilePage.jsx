import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import Button from '../components/common/Button';

export const ProfilePage = () => {
  const { currentRole, currentUser, logout } = useAuth();
  const { isSharing, stopSharing } = useLocation();
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCopyCode = () => {
    if (!currentUser?.collegeCode) return;
    navigator.clipboard?.writeText(currentUser.collegeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 rounded-3xl p-6 sm:p-7 text-white border border-navy-800 shadow-glow-navy flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-glow-cyan">
            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{currentUser?.name}</h1>
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentUser?.collegeName || 'College Workspace'}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 capitalize">
                {currentRole === 'teacher' ? 'Faculty' : 'Student'}
              </span>
              {currentUser?.collegeCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-navy-950 text-cyan-300 border border-cyan-500/40 inline-flex items-center gap-1"
                >
                  Code: {currentUser.collegeCode}
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={LogOut}
          onClick={handleLogout}
          className="text-rose-400 border-rose-500/40 hover:bg-rose-950/50"
        >
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-card space-y-3 text-xs">
          <h3 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-600" /> Account Details
          </h3>
          <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl flex justify-between">
            <span className="text-slate-500">Full Name:</span>
            <span className="font-bold text-navy-900 dark:text-white">{currentUser?.name}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl flex justify-between">
            <span className="text-slate-500">Email:</span>
            <span className="font-semibold text-cyan-700 dark:text-cyan-400">{currentUser?.email}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl flex justify-between">
            <span className="text-slate-500">College Name:</span>
            <span className="font-bold text-navy-900 dark:text-white">{currentUser?.collegeName}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl flex justify-between">
            <span className="text-slate-500">College Code:</span>
            <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">{currentUser?.collegeCode}</span>
          </div>
          {currentUser?.registrationNumber && (
            <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl flex justify-between">
              <span className="text-slate-500">Roll / ID:</span>
              <span className="font-mono font-bold text-navy-900 dark:text-white">{currentUser.registrationNumber}</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-card space-y-4 text-xs">
          <h3 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Privacy & Consent Controls
          </h3>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Your GPS location is only read and transmitted when you enter your college's session code and explicitly tap <strong>Start sharing</strong>.
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
              All events, zones, and location sessions are strictly isolated to your college code (<strong>{currentUser?.collegeCode}</strong>).
            </span>
          </div>
          {currentRole === 'student' && isSharing && (
            <Button variant="danger" size="sm" onClick={() => stopSharing()}>
              Stop Active Location Sharing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
