# Phase 0 Baseline Report: CLIDGE Smart Campus Platform

**Date:** November 26, 2026  
**Status:** Frozen & Verified  
**Active Workspaces:**
- Primary: `C:\Users\LAKSHMANARAJARAMARAJ\Documents\Clidge`
- Mirror: `C:\project\Clidge`
- Git Branch: `main` (commit `17aa411`)

---

## 1. Project Architecture & Structure Overview

CLIDGE is a full-stack campus tracking and attendance platform comprising:
- **Frontend SPA:** React 18, Vite 6, Tailwind CSS, Lucide icons, Leaflet / OpenStreetMap mapping.
- **Backend API Gateway:** Python 3.11, Flask, Gunicorn, Geodesic distance calculation, REST API endpoints.
- **Data & Auth Layer:** Dual-mode architecture (Production Google Cloud Firebase Auth & Firestore / Offline resilient LocalStorage & IndexedDB replication).
- **Deployment Targets:**
  - Frontend: Vercel (`https://clidge.vercel.app`) with static SPA rewrite rules in `vercel.json`.
  - Backend: Render (`https://clidge-api.onrender.com` / `render.yaml`) using Gunicorn worker.

### Directory Structure
```
Clidge/
├── backend/
│   ├── app/
│   │   ├── routes/              # health, locations, attendance endpoints
│   │   ├── services/            # geofencing, location, attendance business logic
│   │   ├── utils/               # auth_middleware
│   │   ├── config.py            # Flask configuration
│   │   └── firebase_admin_client.py
│   ├── tests/                   # Pytest test suite (31 tests)
│   ├── Procfile                 # Deployment process spec
│   ├── requirements.txt         # Flask, gunicorn, firebase-admin, etc.
│   └── run.py                   # Development entrypoint (:5000)
├── docs/                        # Architecture, API, Deployment, Testing documentation
├── scripts/                     # Automated event & comprehensive integration test scripts
├── src/
│   ├── components/              # Layout, dashboard, events, maps, modals, UI elements
│   ├── context/                 # AuthContext, EventContext, LocationContext, ToastContext
│   ├── data/                    # Sample fallback records & campus zones
│   ├── pages/                   # LandingPage, LoginPage, RegisterPage, Dashboard, ProfilePage
│   ├── services/                # authService, eventService, locationService, offlineSync
│   └── App.jsx
├── testAuth.js                  # Frontend auth & role RBAC test runner
├── vercel.json                  # Vercel deployment & caching headers config
├── render.yaml                  # Render infrastructure as code
└── package.json                 # Node dependencies & npm scripts
```

---

## 2. Environment Variables Baseline (Sanitized)

All secrets are sanitized in accordance with Rule 3:

| Variable | Description | Configured Status | Example / Placeholder |
|---|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key | Configured | `AIzaSy_PLACEHOLDER_KEY` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Configured | `clidge-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | GCP Project ID | Configured | `clidge-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage Bucket Domain | Configured | `clidge-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging ID | Configured | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | Configured | `1:123456789:web:abcdef` |
| `VITE_FLASK_API_URL` | Backend REST Endpoint | Configured | `http://localhost:5000/api` |
| `VITE_ADMIN_PROVISION_SECRET` | Secret for Faculty Provisioning | Configured | `CLIDGE-ADMIN-SECURE-2026` |

---

## 3. Test Suites Baseline Verification

All test suites were executed on the baseline repository and are **100% green (119 passed, 0 failed)**:

### A. Backend Pytest Suite
- **Command:** `python -m pytest backend/tests`
- **Results:** **31 / 31 PASSED (100%)**
  - `test_attendance_and_offline.py` — 11 passed
  - `test_final_security_and_demonstration.py` — 6 passed
  - `test_gps_tracking.py` — 12 passed
  - `test_two_students_live_map.py` — 2 passed

### B. Frontend Authentication & RBAC Suite
- **Command:** `node testAuth.js`
- **Results:** **14 / 14 PASSED (100%)**
  - Student Registration & Validation
  - Role-based Access Control (Students blocked from Teacher portal)
  - Invalid credential handling
  - Admin Teacher Account Provisioning security

### C. Event Management Lifecycle Suite
- **Command:** `node scripts/testEventManagement.js`
- **Results:** **30 / 30 PASSED (100%)**
  - Event Creation, Field Validation (10 required fields)
  - Student security barrier on event manipulation
  - Voluntary GPS consent enforcement & duplicate join prevention
  - Participant roster hydration
  - Automatic participant sharing status termination on event end/cancel

### D. Final Comprehensive Application Suite
- **Command:** `node scripts/testFinalComprehensive.js`
- **Results:** **44 / 44 PASSED (100%)**
  - Unbranded universal campus branding
  - Geofence calculation & boundary enforcement (65m radius)
  - Server-authoritative QR check-in & check-out timestamps
  - Attendance compliance reporting & CSV export
  - IndexedDB offline queuing & duplicate sync prevention

---

## 4. Local Execution Verification

1. **Frontend Production Build:**
   - **Command:** `npm run build`
   - **Status:** Succeeded in 8.42s (Vite v6.4.6, 1735 modules transformed, 0 errors).
2. **Backend Health Endpoint:**
   - **Endpoint:** `/api/health`
   - **Response:** HTTP 200 OK
   ```json
   {
     "environment": "development",
     "service": "CLIDGE Core GPS Tracking API",
     "stale_threshold_seconds": 300,
     "status": "online",
     "update_interval_seconds": 120,
     "version": "1.0.0"
   }
   ```

---

## 5. Deployment Targets & Sync State

- **GitHub Repository:** `https://github.com/iiaammlluucckkyy/clidge`
- **Branch:** `main` (clean working tree on both `Documents\Clidge` and `C:\project\Clidge`)
- **Vercel Frontend:** Auto-deploys from GitHub `main` (`https://clidge.vercel.app`)
- **Render Backend:** Configured via `render.yaml`
