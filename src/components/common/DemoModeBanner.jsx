import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Cloud, ExternalLink } from 'lucide-react';
import { isFirebaseConfigured } from '../../services/firebaseConfig';
import Modal from './Modal';
import Button from './Button';

const FIRESTORE_RULES_SNIPPET = `// Paste the full rules from firestore.rules in this repository into:
// Firebase Console -> Firestore Database -> Rules -> Publish`;

export const DemoModeBanner = () => {
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  if (isFirebaseConfigured()) {
    return null;
  }

  return (
    <>
      <div className="bg-amber-50 dark:bg-amber-950/70 border-b border-amber-200 dark:border-amber-800 px-4 sm:px-6 py-2 text-xs text-amber-950 dark:text-amber-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Demo Mode Active:</strong> Firebase keys are empty, so accounts, events, zones, and locations stay on this device only.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSetupModalOpen(true)}
          className="font-bold underline text-amber-900 dark:text-cyan-300 hover:opacity-80 flex items-center gap-1"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>How to Connect Real Phones (Firebase Setup)</span>
        </button>
      </div>

      <Modal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        title="Connect Firebase for Real-Time Multi-Phone Sync"
        subtitle="Takes 3 minutes — no coding needed, free Spark plan"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <ol className="space-y-2.5 list-decimal pl-5">
            <li>
              Open{' '}
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 dark:text-cyan-400 font-bold underline inline-flex items-center gap-0.5"
              >
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and click <strong>Add project</strong>.
            </li>
            <li>
              Enable <strong>Authentication → Sign-in method → Email/Password</strong>.
            </li>
            <li>
              Enable <strong>Firestore Database → Create database</strong> (Production or Test mode).
            </li>
            <li>
              Go to <strong>Firestore Database → Rules</strong>, paste the contents of <code>firestore.rules</code>, and click <strong>Publish</strong>.
            </li>
            <li>
              Go to <strong>Project Settings → Your apps → Web (&lt;/&gt;)</strong>, copy your 6 Firebase config values, and paste them into <code>PASTED_FIREBASE_CONFIG</code> at the top of <code>src/services/firebaseConfig.js</code> (or add them as <code>VITE_FIREBASE_*</code> Environment Variables in Vercel/Netlify and redeploy).
            </li>
          </ol>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2 text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Once connected, faculty create a 6-character college code, and students anywhere in the world join and stream live GPS straight to the faculty satellite map!
            </span>
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="cyan" size="sm" onClick={() => setSetupModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DemoModeBanner;
