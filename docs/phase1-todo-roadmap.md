# Phase 1 To-Do Roadmap: Missing Pieces & Upcoming Work

This document tracks items identified during Phase 1 for implementation in subsequent phases.

---

## 1. Authentication & Account Self-Service (Scheduled for Phase 2)
- [ ] **Password Reset / "Forgot Password" Flow**: Provide a modal/form on the login page for users to submit their email and trigger a password reset (Firebase `sendPasswordResetEmail` / local fallback instructions).
- [ ] **Email Verification Flow**: Support initiating email verification upon registration and notifying the user if their email is unverified.
- [ ] **Enhanced Role Guard UI**: Ensure direct URL navigation to unauthorized routes (e.g., student navigating to `/teacher-dashboard`) renders a polished, friendly "Access Restricted: Faculty Privileges Required" card rather than an abrupt redirect.
- [ ] **Profile Page Sign-Out & Details**: Enhance `ProfilePage.jsx` to prominently display user role, session security level, institutional email, and a one-click safe sign-out.

---

## 2. Backend Cloud Deployment (Render)
- [ ] **Render Blueprint Deployment**: `render.yaml` and `backend/Procfile` are verified and production-ready. Once connected to Render (`dashboard.render.com/blueprint/new`), the backend REST API will deploy at `https://clidge-backend.onrender.com`.
- [ ] **CORS Verification**: `CORS_ORIGINS` in `backend/app/config.py` and `backend/.env.example` already include `https://clidge.vercel.app`.

---

## 3. Product Polish & Navigation (Scheduled for Phase 3)
- [ ] **Event QR Expiry / Dynamic Token**: Implement client and backend validation for expiring tokens.
- [ ] **One-Click Event Roster Navigation**: Ensure teachers can reach live map, participant list, QR display, and reports in $\le 3$ clicks from the dashboard.
- [ ] **Clean Terminology Sync**: Verify consistent naming across all headers, cards, and tooltips ("Faculty Portal" and "Student Portal").
