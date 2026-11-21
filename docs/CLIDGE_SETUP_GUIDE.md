# CLIDGE Local Installation & Execution Manual

> **Document Version:** 1.0.0  
> **Target Audience:** Developers, Evaluators, and College Faculty  
> **Supported Operating Systems:** Windows 10/11, macOS, Linux  

---

## 1. System Requirements

Ensure the following runtimes are installed on your workstation:
- **Node.js**: v18.0.0 or higher (v22.14.0 recommended)
- **Python**: v3.10.0 or higher (v3.11.9 recommended)
- **Git**
- **Modern Web Browser**: Google Chrome, Mozilla Firefox, or Microsoft Edge (with Geolocation support)

---

## 2. Step-by-Step Backend Setup (Flask API)

### Step 2.1: Open Terminal & Navigate to Backend
```powershell
# Open terminal or PowerShell in project root
cd c:\Users\LAKSHMANARAJARAMARAJ\Documents\Clidge\backend
```

### Step 2.2: Create and Activate Virtual Environment
```powershell
# On Windows:
python -m venv venv
.\venv\Scripts\activate

# On Linux or macOS:
python3 -m venv venv
source venv/bin/activate
```

### Step 2.3: Install Python Dependencies
```powershell
pip install -r requirements.txt
```
*Dependencies installed:* `flask`, `flask-cors`, `firebase-admin`, `python-dotenv`, `pytest`, `requests`, `gunicorn`.

### Step 2.4: Configure Environment Variables
Copy the template configuration:
```powershell
copy .env.example .env
```
Ensure your `.env` contains:
```env
FLASK_ENV=development
SECRET_KEY=clidge-local-dev-secret-geofencing-key-2026
PORT=5000
LOCATION_UPDATE_INTERVAL_SECONDS=120
LOCATION_STALE_THRESHOLD_SECONDS=300
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000
FIREBASE_PROJECT_ID=clidge-smart-campus
ALLOW_DEV_TOKENS=True
```

### Step 2.5: Start the Flask Backend Server
```powershell
python run.py
```
You should see:
```
==================================================
CLIDGE Core GPS Tracking API Backend
Running on http://127.0.0.1:5000
Location update interval: 120s
Stale threshold: 300s
==================================================
```

---

## 3. Step-by-Step Frontend Setup (React.js + Vite)

### Step 3.1: Open a Second Terminal & Navigate to Project Root
```powershell
cd c:\Users\LAKSHMANARAJARAMARAJ\Documents\Clidge
```

### Step 3.2: Install NPM Dependencies
```powershell
npm install
```
*Dependencies installed:* `react`, `react-dom`, `react-router-dom`, `leaflet`, `react-leaflet`, `qrcode`, `lucide-react`, `tailwindcss`.

### Step 3.3: Configure Environment Variables
Copy the frontend template:
```powershell
copy .env.example .env
```
Ensure `.env` contains:
```env
VITE_FIREBASE_API_KEY=AIzaSy_CLIDGE_DEMO_KEY_MUTHAYAMMAL
VITE_FIREBASE_AUTH_DOMAIN=clidge-campus.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=clidge-campus
VITE_FIREBASE_STORAGE_BUCKET=clidge-campus.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=731622849102
VITE_FIREBASE_APP_ID=1:731622849102:web:clidge9201837461
VITE_FLASK_API_URL=http://localhost:5000/api
VITE_ADMIN_PROVISION_SECRET=MEC-CSE-ADMIN-SECURE-2026
```

### Step 3.4: Launch the Development Server
```powershell
npm run dev -- --host
```
Open your browser and navigate to `http://localhost:5173`.

---

## 4. Running the Complete Verification Test Suites

To verify all components locally without launching a browser:

```powershell
# 1. Run the Authentication Test Suite (14 tests)
node testAuth.js

# 2. Run the Event Management Lifecycle Test Suite (30 tests)
node scripts/testEventManagement.js

# 3. Run the Comprehensive 21-Item Full Application Suite (44 assertions)
node scripts/testFinalComprehensive.js

# 4. Run the Full Backend Pytest Suite (31 tests)
python -m pytest backend/tests/ -v

# 5. Verify the Production Vite Bundle
npm run build
```
All suites should report 100% PASS with 0 errors.

---

## 5. Demonstration Accounts

For viva and evaluation demonstrations, pre-configured accounts are available:

### Faculty Account (Teacher Portal)
- **Email:** `meenakshi.cse@muthayammal.edu.in`
- **Password:** `Password@123`
- **Identity:** Dr. S. Meenakshi, Associate Professor & Event Coordinator
- **Portal URL:** `http://localhost:5173/login` $\rightarrow$ Select **Teacher Portal** tab

### Student 1 Account (Student Portal)
- **Email:** `karthik.731622csr088@muthayammal.edu.in`
- **Password:** `SecurePassword@123`
- **Identity:** Karthik Subramanian (Roll: `731622CSR088`)
- **Portal URL:** `http://localhost:5173/login` $\rightarrow$ Select **Student Portal** tab

### Student 2 Account (Student Portal)
- **Email:** `rajesh.731622csr045@muthayammal.edu.in`
- **Password:** `Password@123`
- **Identity:** Rajesh Kumar M. (Roll: `731622CSR045`)
