import React, { useState } from 'react';
import { Copy, Check, Building2, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

export const WelcomeBanner = ({
  user,
  role = 'student',
  actionLabel,
  actionIcon: ActionIcon,
  onActionClick
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCollegeCode = () => {
    if (!user?.collegeCode) return;
    navigator.clipboard?.writeText(user.collegeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 rounded-3xl p-5 sm:p-7 text-white shadow-glow-navy border border-navy-800/80 mb-6">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {role === 'teacher' ? 'Faculty Dashboard' : 'Student Dashboard'}
            </span>
            {user?.collegeName && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-300" />
                {user.collegeName}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-100">{user?.name}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
            {user?.collegeCode && (
              <button
                type="button"
                onClick={handleCopyCollegeCode}
                className="inline-flex items-center gap-2 bg-navy-950/80 hover:bg-navy-950 px-3 py-1.5 rounded-xl border border-cyan-500/40 text-xs transition-colors"
                title="Copy 6-character College Code to share with your students"
              >
                <span className="text-slate-400">College Code:</span>
                <strong className="font-mono text-cyan-300 text-sm tracking-widest">{user.collegeCode}</strong>
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            )}
            {role === 'student' && user?.registrationNumber && (
              <span className="font-mono text-cyan-300">Roll: {user.registrationNumber}</span>
            )}
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> College Isolated
            </span>
          </div>
        </div>

        {actionLabel && (
          <div className="flex-shrink-0">
            <Button
              variant="cyan"
              size="md"
              icon={ActionIcon}
              onClick={onActionClick}
              className="w-full sm:w-auto shadow-glow-cyan font-bold"
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeBanner;
