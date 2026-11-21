# CLIDGE REST API Reference & Integration Guide

> **Base URL (Local):** `http://localhost:5000/api`  
> **Base URL (Production):** `https://clidge-api.onrender.com/api`  
> **Protocol:** HTTPS (Production) / HTTP (Local Development)  
> **Authentication Standard:** Bearer Token via Firebase Authentication (JWT)  
> **Document Version:** 1.0.0  

---

## 1. Authentication & Headers

All protected endpoints enforce authentication through the `@require_auth` decorator in `backend/app/utils/auth_middleware.py`.

### Required Header Format
```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

### Identity Resolution Protocol
1. The backend extracts the token from the `Authorization` header.
2. The Firebase Admin SDK verifies token validity, signature, and expiration (`verify_firebase_token`).
3. User identity (`g.user_id`) and claims (`g.current_user`) are populated in Flask's application context.
4. **Security Enforcement:** Arbitrary student IDs provided in request JSON bodies are **strictly forbidden** from overriding the authenticated identity. If a body attempts to submit an ID different from `g.user_id`, the API immediately aborts with HTTP `403 Forbidden`.

---

## 2. API Endpoints Overview

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Service heartbeat and interval telemetry |
| `POST` | `/locations` | Authenticated Student | Ingests real-time GPS telemetry |
| `GET` | `/events/<event_id>/locations` | Teacher / Enrolled Student | Retrieves event location roster and staleness |
| `POST` | `/events/<event_id>/attendance/generate-qr` | Owning Faculty | Generates cryptographically secure QR token |
| `GET` | `/events/<event_id>/attendance/qr-token` | Faculty | Retrieves active QR token for projection |
| `POST` | `/attendance/check-in` | Authenticated Student | Validates QR code and logs check-in |
| `POST` | `/attendance/check-out` | Authenticated Student | Validates prior check-in and logs departure |
| `POST` | `/attendance/sync` | Authenticated Student | Batch synchronizes queued offline attendance |
| `GET` | `/events/<event_id>/attendance` | Teacher / Enrolled Student | Compiles attendance and GPS quality report |
| `GET` | `/events/<event_id>/attendance/export-csv` | Teacher | Generates downloadable RFC 4180 CSV report |
| `GET` | `/attendance/my-history` | Authenticated Student | Retrieves student personal attendance history |

---

## 3. Detailed Endpoint Specifications

### 3.1. Service Health Check
`GET /api/health`

- **Purpose**: System monitoring and operational heartbeat.
- **Authentication**: None (Public).
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "service": "clidge-core-gps-backend",
    "version": "1.0.0",
    "update_interval_seconds": 120,
    "stale_threshold_seconds": 300,
    "server_time_utc": "2026-11-20T09:00:00.000Z"
  }
  ```

---

### 3.2. Submit GPS Location
`POST /api/locations`

- **Purpose**: Ingests high-precision GNSS positioning coordinates for an authorized event.
- **Authentication**: Required (`student` role).
- **Request Parameters**:
  ```json
  {
    "event_id": "evt-2026-001",
    "latitude": 11.4983012,
    "longitude": 78.1635489,
    "accuracy": 3.8,
    "timestamp": "2026-11-20T09:30:00.000Z"
  }
  ```
  - `event_id` (string, required): Associated campus event ID.
  - `latitude` (float, required): Latitude between $-90.0$ and $+90.0$.
  - `longitude` (float, required): Longitude between $-180.0$ and $+180.0$.
  - `accuracy` (float, optional): Horizontal accuracy estimate in meters ($> 0$, default: $5.0$).
  - `timestamp` (string, optional): Client device clock ISO timestamp.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Location updated successfully",
    "location": {
      "event_id": "evt-2026-001",
      "student_id": "std-731622csr088",
      "student_name": "Karthik Subramanian",
      "latitude": 11.4983012,
      "longitude": 78.1635489,
      "accuracy": 3.8,
      "status": "LIVE",
      "is_inside_geofence": true,
      "distance_to_venue_meters": 14.8,
      "venue": "Main Auditorium (Kamarajar Hall)",
      "client_timestamp": "2026-11-20T09:30:00.000Z",
      "server_timestamp": "2026-11-20T09:30:00.124Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid coordinates (e.g., latitude $> 90$) or missing required fields.
  - `401 Unauthorized`: Missing or expired ID token.
  - `403 Forbidden`: Student has not joined the event, sharing consent is `false`, event is `Cancelled` or `Completed`, or request attempts to spoof another `student_id`.
  - `404 Not Found`: Event ID does not exist.

---

### 3.3. Get Event Locations Roster
`GET /api/events/<event_id>/locations`

- **Purpose**: Teacher dashboard retrieves the latest locations and staleness classifications for all enrolled students.
- **Authentication**: Required (`teacher` or authorized participant).
- **URL Parameters**:
  - `event_id` (string): Unique event identifier.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "event_id": "evt-2026-001",
    "event_title": "Autonomous AI & Edge IoT Symposium 2026",
    "venue": "Main Auditorium (Kamarajar Hall)",
    "stale_threshold_seconds": 300,
    "update_interval_seconds": 120,
    "total_participants": 2,
    "locations": [
      {
        "student_id": "std-731622csr088",
        "student_name": "Karthik Subramanian",
        "student_reg_number": "731622CSR088",
        "latitude": 11.4983012,
        "longitude": 78.1635489,
        "accuracy": 3.8,
        "timestamp": "2026-11-20T09:30:00.000Z",
        "server_timestamp": "2026-11-20T09:30:00.124Z",
        "status": "LIVE",
        "age_seconds": 12.4,
        "is_inside_geofence": true,
        "distance_to_venue_meters": 14.8,
        "sharing_consent": true
      },
      {
        "student_id": "std-731622csr045",
        "student_name": "Rajesh Kumar M.",
        "student_reg_number": "731622CSR045",
        "latitude": 11.498412,
        "longitude": 78.163612,
        "accuracy": 4.2,
        "timestamp": "2026-11-20T09:22:00.000Z",
        "server_timestamp": "2026-11-20T09:22:00.210Z",
        "status": "OUTDATED",
        "age_seconds": 492.2,
        "is_inside_geofence": true,
        "distance_to_venue_meters": 32.1,
        "sharing_consent": true
      }
    ]
  }
  ```

---

### 3.4. Generate Event QR Attendance Code
`POST /api/events/<event_id>/attendance/generate-qr`

- **Purpose**: Teacher generates a cryptographically secure, time-bounded session QR code for auditorium projection.
- **Authentication**: Required (Owning Teacher or Faculty Admin).
- **Request Parameters**:
  ```json
  {
    "validity_minutes": 60
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "QR attendance token generated successfully.",
    "event_id": "evt-2026-001",
    "qr_token": "clidge_qr_evt-2026-001_8a9f2c",
    "issued_at": "2026-11-20T09:00:00.000Z",
    "expires_at": "2026-11-20T10:00:00.000Z",
    "validity_minutes": 60
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Event is cancelled or completed.
  - `403 Forbidden`: Non-owning faculty or student attempts generation.

---

### 3.5. Student Attendance Check-In
`POST /api/attendance/check-in`

- **Purpose**: Verifies student presence, validates QR token, and records official check-in timestamp.
- **Authentication**: Required (`student` role).
- **Request Parameters**:
  ```json
  {
    "event_id": "evt-2026-001",
    "qr_token": "clidge_qr_evt-2026-001_8a9f2c",
    "client_timestamp": "2026-11-20T09:15:00.000Z",
    "sync_id": null
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Attendance check-in verified and logged successfully.",
    "attendance_record": {
      "attendanceId": "att_evt-2026-001_std-731622csr088",
      "eventId": "evt-2026-001",
      "studentId": "std-731622csr088",
      "studentName": "Karthik Subramanian",
      "studentRegNumber": "731622CSR088",
      "status": "CHECKED_IN",
      "checkInTime": "2026-11-20T09:15:00.450Z",
      "checkOutTime": null,
      "offlineSynced": false
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Duplicate check-in, invalid token, or expired token.
  - `403 Forbidden`: Student not registered in event roster.

---

### 3.6. Student Attendance Check-Out
`POST /api/attendance/check-out`

- **Purpose**: Verifies student departure at the conclusion of an event session.
- **Authentication**: Required (`student` role).
- **Request Parameters**:
  ```json
  {
    "event_id": "evt-2026-001",
    "qr_token": "clidge_qr_evt-2026-001_8a9f2c"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Attendance check-out verified and logged successfully.",
    "attendance_record": {
      "attendanceId": "att_evt-2026-001_std-731622csr088",
      "status": "CHECKED_OUT",
      "checkInTime": "2026-11-20T09:15:00.450Z",
      "checkOutTime": "2026-11-20T16:30:12.180Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Student never checked in, or duplicate check-out.

---

### 3.7. Synchronize Offline Attendance Records
`POST /api/attendance/sync`

- **Purpose**: Batch synchronizes queued offline check-in and check-out transactions after device reconnection.
- **Authentication**: Required (`student` role).
- **Request Parameters**:
  ```json
  {
    "items": [
      {
        "sync_id": "sync_1700000000000_abc123",
        "event_id": "evt-2026-001",
        "action": "check-in",
        "qr_token": "clidge_qr_evt-2026-001_8a9f2c",
        "offline_timestamp": "2026-11-20T09:15:00.000Z"
      }
    ]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Synchronized 1 of 1 pending attendance records.",
    "success_count": 1,
    "total_items": 1,
    "results": [
      {
        "sync_id": "sync_1700000000000_abc123",
        "event_id": "evt-2026-001",
        "action": "check-in",
        "success": true,
        "status_code": 200
      }
    ]
  }
  ```

---

### 3.8. Event Attendance & Telemetry Report
`GET /api/events/<event_id>/attendance`

- **Purpose**: Comprehensive compliance report combining attendance status and GPS quality.
- **Authentication**: Required (`teacher` or authorized participant).
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "event_id": "evt-2026-001",
    "event_title": "Autonomous AI & Edge IoT Symposium 2026",
    "venue": "Main Auditorium (Kamarajar Hall)",
    "date": "2026-11-20",
    "total_registered": 2,
    "total_check_ins": 2,
    "total_check_outs": 1,
    "live_locations": 2,
    "outdated_locations": 0,
    "unavailable_locations": 0,
    "attendance_rate_percentage": 100.0,
    "disclaimer": "Geofencing calculations represent real-time device proximity and do not constitute official attendance proof.",
    "individual_records": [
      {
        "student_id": "std-731622csr088",
        "student_name": "Karthik Subramanian",
        "registration_number": "731622CSR088",
        "department": "Computer Science and Engineering",
        "attendance_status": "CHECKED_OUT",
        "check_in_time": "2026-11-20T09:15:00.450Z",
        "checkOutTime": "2026-11-20T16:30:12.180Z",
        "offline_synced": false,
        "location_status": "LIVE",
        "distance_meters": 14.8,
        "is_inside_geofence": true,
        "accuracy_meters": 3.8
      }
    ]
  }
  ```

---

### 3.9. Export Attendance CSV Report
`GET /api/events/<event_id>/attendance/export-csv`

- **Purpose**: Downloads an RFC 4180 compliant CSV spreadsheet formatted for faculty audit.
- **Authentication**: Required (`teacher` role).
- **Response Headers**:
  ```http
  Content-Type: text/csv
  Content-Disposition: attachment; filename="attendance_report_evt-2026-001.csv"
  ```
- **Response Payload Preview**:
  ```csv
  "CLIDGE CAMPUS ATTENDANCE REPORT"
  "Event Title:","Autonomous AI & Edge IoT Symposium 2026"
  "Venue:","Main Auditorium (Kamarajar Hall)"
  "Date:","2026-11-20"
  "Total Registered:","2"
  "Total Check-Ins:","2"
  "Total Check-Outs:","1"
  "Attendance Rate:","100.0%"
  ""
  "Student Name","Registration Number","Department","Attendance Status","Check-In Time","Check-Out Time","Offline Synced","Location Status","Distance (m)","Geofence Boundary"
  "Karthik Subramanian","731622CSR088","Computer Science and Engineering","CHECKED_OUT","2026-11-20T09:15:00.450Z","2026-11-20T16:30:12.180Z","No","LIVE","14.8","INSIDE"
  "Rajesh Kumar M.","731622CSR045","Computer Science and Engineering","CHECKED_IN","2026-11-20T09:20:10.120Z","—","No","LIVE","22.4","INSIDE"
  ""
  "DISCLAIMER: Geofencing calculations represent real-time device proximity and do not constitute official attendance proof."
  ```
