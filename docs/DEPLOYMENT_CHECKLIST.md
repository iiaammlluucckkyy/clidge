# CLIDGE Production Deployment Pre-Flight Checklist

Use this checklist before taking CLIDGE live for student and faculty use.

---

## 1. Firebase Cloud Setup (Authentication & Firestore)

- [ ] Create a project in [Firebase Console](https://console.firebase.google.com/) named `clidge-campus` (or your institution's name).
- [ ] In **Authentication** -> **Sign-in method**, enable **Email/Password**.
- [ ] In **Firestore Database**, create database in **Production Mode** in your regional multi-region (e.g. `asia-south1` for India).
- [ ] Deploy the enclosed Firestore security rules:
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] In **Project Settings** -> **General** -> **Your apps**, register a Web app (`</>`) and copy the 6 config parameters.

---

## 2. Frontend Deployment (Vercel)

- [ ] Connect your GitHub repository to [Vercel](https://vercel.com).
- [ ] Configure the build settings:
  - Framework Preset: **Vite**
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add the following Environment Variables in Vercel Project Settings:
  | Variable | Required? | Example Value |
  |---|---|---|
  | `VITE_FIREBASE_API_KEY` | Yes | `AIzaSy...` |
  | `VITE_FIREBASE_AUTH_DOMAIN` | Yes | `clidge-campus.firebaseapp.com` |
  | `VITE_FIREBASE_PROJECT_ID` | Yes | `clidge-campus` |
  | `VITE_FIREBASE_STORAGE_BUCKET` | Yes | `clidge-campus.appspot.com` |
  | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | `123456789012` |
  | `VITE_FIREBASE_APP_ID` | Yes | `1:123456789012:web:abcdef...` |
  | `VITE_FLASK_API_URL` | Optional | `https://clidge-backend.onrender.com/api` |
  | `VITE_ADMIN_PROVISION_SECRET` | Yes | `CLIDGE-ADMIN-SECURE-2026` |
- [ ] Trigger deployment. Verify `https://your-app.vercel.app` loads cleanly and displays HTTP 200.

---

## 3. Backend REST API Deployment (Render)

- [ ] Sign in to [Render](https://dashboard.render.com).
- [ ] Select **New Blueprint Instance** and connect your GitHub repository (uses `render.yaml`).
- [ ] Alternatively, create a **Web Service**:
  - Name: `clidge-backend`
  - Runtime: `Python`
  - Build Command: `pip install -r backend/requirements.txt`
  - Start Command: `gunicorn --chdir backend app:app --bind 0.0.0.0:$PORT`
- [ ] Environment Variables on Render:
  - `PYTHON_VERSION`: `3.11.9`
  - `FLASK_ENV`: `production`
  - `SECRET_KEY`: `<Generate a 32+ character random secret>`
  - `CORS_ORIGINS`: `https://your-app.vercel.app,http://localhost:5173`
  - `FIREBASE_PROJECT_ID`: `clidge-campus`
  - `FIREBASE_SERVICE_ACCOUNT_JSON`: `<Paste raw service account JSON>`
- [ ] Verify endpoint: `GET https://your-render-url.onrender.com/api/health` returns `{"status": "online"}`.

---

## 4. Post-Deployment Verification

- [ ] Log in with teacher credentials at `/login?portal=teacher`.
- [ ] Create a test event and verify it appears in the catalog.
- [ ] Open incognito tab and register a test student at `/register`.
- [ ] Join the event with voluntary location consent.
- [ ] Project event QR code and confirm test check-in.
- [ ] Download the CSV attendance report and verify correct roll numbers and timestamps.
