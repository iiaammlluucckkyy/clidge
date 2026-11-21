# CLIDGE Production Deployment Guide

> **Target Platforms:** Vercel (Frontend SPA) & Render (Flask Backend)  
> **Database & Auth:** Google Cloud Firebase  
> **Document Version:** 1.0.0  

---

## 1. Deployment Architecture

```mermaid
graph LR
    User["Mobile / Desktop Browser"]
    Vercel["Vercel Edge Network (React 18 SPA)"]
    Render["Render Web Service (Gunicorn + Flask API)"]
    Firebase["Google Firebase (Auth + Firestore)"]

    User -->|HTTPS GET /| Vercel
    User -->|HTTPS API Requests /api/*| Render
    Render -->|Firebase Admin SDK| Firebase
    Vercel -->|Client SDK (Auth & ID Token)| Firebase
```

---

## 2. Frontend Deployment on Vercel

### Step 2.1: Verify `vercel.json`
CLIDGE includes a configured `vercel.json` in the root directory ensuring Single Page Application (SPA) routing is preserved:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Step 2.2: Push Code to GitHub
Ensure all changes are committed to your GitHub repository:
```bash
git add .
git commit -m "feat: complete CLIDGE production deployment"
git push origin main
```

### Step 2.3: Import Repository to Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your `Clidge` repository.
3. Keep default settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 2.4: Set Production Environment Variables on Vercel
In the **Environment Variables** panel, add the following:

| Variable Name | Value Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Your Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<your-project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `<your-project-id>` |
| `VITE_FIREBASE_STORAGE_BUCKET`| `<your-project-id>.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase Web App ID |
| `VITE_FLASK_API_URL` | Your Render Backend URL: `https://clidge-api.onrender.com/api` |
| `VITE_ADMIN_PROVISION_SECRET` | Secret key for faculty creation |

4. Click **Deploy**. Vercel will build and assign an HTTPS URL (e.g., `https://clidge.vercel.app`).

---

## 3. Backend Deployment on Render

### Step 3.1: Verify Render Files
CLIDGE provides two deployment files in the repository:
1. `backend/Procfile`:
   ```
   web: gunicorn run:app --bind 0.0.0.0:$PORT
   ```
2. `render.yaml`:
   ```yaml
   services:
     - type: web
       name: clidge-api
       env: python
       rootDir: backend
       buildCommand: pip install -r requirements.txt
       startCommand: gunicorn run:app --bind 0.0.0.0:$PORT
       envVars:
         - key: FLASK_ENV
           value: production
         - key: PORT
           value: 10000
         - key: CORS_ORIGINS
           value: "https://clidge.vercel.app,http://localhost:5173"
         - key: FIREBASE_PROJECT_ID
           value: "clidge-campus"
         - key: ALLOW_DEV_TOKENS
           value: "False"
   ```

### Step 3.2: Create Render Web Service
1. Log in to [Render](https://render.com) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your `Clidge` GitHub repository.
3. Configure the service:
   - **Name:** `clidge-api`
   - **Root Directory:** `backend`
   - **Environment:** `Python`
   - **Region:** Choose the region closest to your institution (e.g., Singapore / Frankfurt)
   - **Branch:** `main`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn run:app --bind 0.0.0.0:$PORT`
   - **Plan:** Free or Starter

### Step 3.3: Set Environment Variables on Render
Under **Environment**, add the following key-value pairs:

| Variable Name | Recommended Value |
| :--- | :--- |
| `FLASK_ENV` | `production` |
| `PORT` | `10000` |
| `SECRET_KEY` | `<Generate a random 32-character hex secret>` |
| `LOCATION_UPDATE_INTERVAL_SECONDS` | `120` |
| `LOCATION_STALE_THRESHOLD_SECONDS` | `300` |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app,http://localhost:5173` |
| `FIREBASE_PROJECT_ID` | `your-firebase-project-id` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `<Paste entire JSON content from serviceAccountKey.json>` |
| `ALLOW_DEV_TOKENS` | `False` |

4. Click **Create Web Service**. Render will install requirements, start Gunicorn, and provide an HTTPS API URL (e.g. `https://clidge-api.onrender.com`).

---

## 4. Deploying Firestore Security Rules

To ensure your cloud Firestore database rejects unauthorized queries in production:

1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize:
   ```bash
   firebase login
   firebase use <your-firebase-project-id>
   ```
3. Deploy the verified `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 5. Production Health Verification

Once both frontend and backend are live:
1. Verify Backend Heartbeat:
   ```bash
   curl -i https://clidge-api.onrender.com/api/health
   ```
   Should return HTTP `200 OK` with JSON `{"status": "healthy"}`.
2. Verify CORS Preflight:
   ```bash
   curl -I -X OPTIONS https://clidge-api.onrender.com/api/locations \
     -H "Origin: https://clidge.vercel.app" \
     -H "Access-Control-Request-Method: POST"
   ```
   Should return `Access-Control-Allow-Origin: https://clidge.vercel.app`.
3. Open `https://clidge.vercel.app` in your mobile browser, log in, join an event, and verify live markers on the teacher map.
