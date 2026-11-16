# CLIDGE - Smart Student Location Tracking & Campus Event Participation Monitoring System

A responsive web application engineered for college campus event monitoring, GNSS geofenced attendance verification, and voluntary student location tracking.

Built with **React.js**, **Vite**, **Tailwind CSS**, **React Router**, and **Lucide React Icons**.

---

## 🏛️ Project Demonstration Overview

- **Project Title:** Smart Student Location Tracking and Campus Event Participation Monitoring System
- **Institution:** Muthayammal Engineering College (Autonomous), Rasipuram
- **Primary Domain:** Web Development, GNSS Geolocation, Geofencing, Event Attendance & Analytics
- **Target Users:** College Students, Class In-charges, Faculty Event Coordinators, Department HODs

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18.0.0 or higher) and npm installed.

### Steps to Run
1. Open your terminal in the project directory:
   ```bash
   cd c:\Users\LAKSHMANARAJARAMARAJ\Documents\Clidge
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   - **Local:** `http://localhost:5173`
   - **Mobile (on same WiFi):** `http://<your-local-ip>:5173`

---

## 🌟 Key Pages & Features

### 1. Landing Page (`/`)
- **Branding:** Clidge logo, project title, and institution context.
- **Hero & Actions:** "Get Started", "Student Login", and "Teacher Login" buttons.
- **System Highlights:** Voluntary session-bound GPS tracking, high-precision GNSS geofencing (±4.2m), dual QR code verification, and zero battery drain design.
- **Viva Demo Portal Switcher:** Quick one-click links to launch the Student or Teacher view.

### 2. Student Dashboard (`/student-dashboard`)
- **Welcome Banner:** Personalized student greeting (Rajesh Kumar M. - `731622CSR045`).
- **Summary Metrics:** Overall attendance percentage (94.2%), total events attended, hours monitored, and live GPS signal status.
- **Voluntary Location Sharing Widget:**
  - Toggle voluntary sharing ON/OFF.
  - Displays current geofenced zone (`Main Auditorium - Zone A1`).
  - GNSS coordinates, accuracy (±4.2m), battery level, and synced heartbeat timer.
  - **Viva Demonstration Simulator:** Buttons to simulate "Inside Auditorium" vs. "Move to Cafeteria (Out of Bounds)".
- **Joined Campus Events:** Cards showing registered events with "Scan QR" and "Check-in" buttons.
- **Attendance Analytics Ring:** Circular SVG compliance gauge with category breakdown.
- **Recent Activity Feed:** Real-time log of geofence check-ins, pings, and tokens.

### 3. Teacher / Faculty Dashboard (`/teacher-dashboard`)
- **Faculty Greeting:** Dr. S. Meenakshi, Associate Professor & Campus Event Coordinator.
- **KPI Stat Cards:** Total Students Monitored (142), Campus Events (5), Active Live Sessions (2), and Overall Compliance (91.4%).
- **Interactive Geofence Radar Map:**
  - Animated radar sweep overlay.
  - Designated campus zones: Main Auditorium (65m), CSE Hall 302 (45m), Tech Park Lab (55m), and Out-of-Bounds Canteen.
  - Real-time student dots with status indicators (Cyan/Emerald = Inside, Red = Breached, Amber = Outdated).
- **Student Attendance & Location Roster:**
  - Searchable by student name, register number, and zone.
  - Status filters (All, Inside, Outside Bounds, Outdated/Idle).
  - "Ping Alert" button and "Export CSV Report" feature.
- **Supervised Events Directory:** Project QR code token for classroom projection.

### 4. Event Management Page (`/events`)
- **Status Filter:** Tabs for `All`, `Ongoing`, `Upcoming`, and `Completed`.
- **Search Bar:** Real-time search across event titles, departments, and venues.
- **Create Event Modal:** Exclusive teacher capability to define event title, category, department, campus venue, geofence radius (in meters), schedule, and student capacity.
- **Event Details Modal:** In-depth view with session agenda, coordinator contact, and registration action.

### 5. Profile Page (`/profile`)
- **Institutional Profile:** Full personal, contact, and academic credentials.
- **Location & Privacy Permissions:** Documentation explaining voluntary GPS tracking, session-only polling, and off-campus privacy safeguards.
- **Digital College ID Card:** Rendered institutional badge with registration number and geofence compliance seal.
- **Viva Mode Switcher:** One-click role switch between Student and Teacher perspectives.

### 6. Responsive Navigation
- **Desktop Sidebar:** Sticky navy sidebar with navigation links, live GPS telemetry widget, and perspective switcher.
- **Top Header (`Navbar`):** Campus status pill, global search, live role switcher, notifications popover, and profile dropdown.
- **Mobile Navigation:** Slide-over drawer and fixed bottom navigation dock for mobile devices.

---

## 📁 Clean Folder Structure

```
Clidge/
├── public/
│   ├── logo.jpeg             # Project branding asset
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── index.css     # Tailwind utilities, radar animations, custom scrollbars
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx     # Status badge with animated radar dots
│   │   │   ├── Button.jsx    # Navy & cyan gradient buttons
│   │   │   ├── Modal.jsx     # Accessible backdrop modal
│   │   │   ├── QRScannerModal.jsx # Dual-mode QR Scanner & Projection card
│   │   │   └── StatCard.jsx  # Metric cards with glowing borders
│   │   ├── dashboard/
│   │   │   ├── AttendanceRing.jsx # SVG circular percentage gauge
│   │   │   ├── LocationSharingWidget.jsx # Voluntary GPS toggle & telemetry
│   │   │   ├── RecentActivity.jsx # Timeline activity feed
│   │   │   └── WelcomeBanner.jsx  # Role-specific greeting banner
│   │   ├── events/
│   │   │   ├── CreateEventModal.jsx # Teacher event creation modal
│   │   │   ├── EventCard.jsx      # Event listing card with capacity bar
│   │   │   └── EventDetailsModal.jsx # Detailed event agenda & venue info
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx      # Top viva banner, sidebar & main container
│   │   │   ├── MobileNav.jsx      # Mobile drawer & bottom dock
│   │   │   ├── Navbar.jsx         # Sticky header with quick role switcher
│   │   │   └── Sidebar.jsx        # Desktop sidebar with navy background
│   │   └── monitoring/
│   │       ├── GeofenceMap.jsx    # SVG interactive campus radar
│   │       └── StudentRoster.jsx  # Real-time student tracking table
│   ├── context/
│   │   ├── AuthContext.jsx        # Demo role switcher (Student / Teacher)
│   │   ├── EventContext.jsx       # Event state (Join, Leave, Create, Check-in)
│   │   └── LocationContext.jsx    # GPS simulation & geofence boundary state
│   ├── data/
│   │   ├── campusZones.js         # Geofence zones with lat/lng & radius
│   │   ├── sampleEvents.js        # Realistic college events dataset
│   │   └── sampleStudents.js      # Student roster & telemetry data
│   ├── services/
│   │   ├── api.js                 # Unified API gateway
│   │   ├── firebaseConfig.js      # Firebase & Firestore schema guide
│   │   └── flaskApi.js            # Python Flask backend client endpoints
│   ├── pages/
│   │   ├── EventManagementPage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── TeacherDashboard.jsx
│   ├── App.jsx                    # React Router configuration
│   └── main.jsx                   # Application entry point
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 🔌 Connecting Python Flask & Firebase

The application includes dedicated service integrations:

### 1. Python Flask Backend (`src/services/flaskApi.js`)
When you run your Flask server (e.g. `python app.py` on port 5000), set:
```env
VITE_FLASK_API_URL=http://localhost:5000/api
```
Supported endpoints ready for your Flask backend:
- `POST /api/location/heartbeat` - Receives student GPS coordinates & updates geofence state.
- `POST /api/attendance/check-in` - Validates geofence coordinates and QR token.
- `GET /api/monitoring/students?event_id=...` - Returns real-time student location telemetry.
- `POST /api/events/create` - Saves new campus events to database.

### 2. Firebase & Firestore (`src/services/firebaseConfig.js`)
To connect your Firebase project, add to your `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🎨 Color Palette & Design
- **Primary Navy:** `#060f1c`, `#0b1d33`, `#102a43`
- **Subtle Cyan Accents:** `#06b6d4`, `#22d3ee`, `#38bdf8`, `#ecfeff`
- **Neutrals:** White `#ffffff`, Slate `#f8fafc`, Border `#e2e8f0`
- **Typography:** Plus Jakarta Sans & Inter
