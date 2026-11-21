# CLIDGE Core GPS Tracking & Attendance API Backend

Python Flask backend service for the **CLIDGE** Smart Student Location Tracking and Campus Event Participation Monitoring System.

## Architecture & Technology
- **Flask**: Application framework with Blueprint routing.
- **Firebase Admin SDK**: Validates Firebase Authentication ID tokens server-side.
- **Firestore Database**: Stores real-time GPS location records per event and student in `eventLocations` and attendance in `attendanceRecords`.
- **Haversine Geofencing Engine**: Calculates great-circle boundary adherence in meters.
- **Attendance & QR Engine**: Cryptographically secure QR tokens, duplicate prevention, and CSV export.

---

## API Endpoints

### 1. GPS Tracking Endpoints
- `POST /api/locations` - Ingests authenticated student GPS coordinates.
- `GET /api/events/<event_id>/locations` - Retrieves location roster and staleness calculation for an event.
- `GET /api/health` - Service heartbeat and telemetry status.

### 2. QR Attendance & Reporting Endpoints
- `POST /api/events/<event_id>/attendance/generate-qr` - Teacher generates cryptographic QR code.
- `GET /api/events/<event_id>/attendance/qr-token` - Retrieves current active QR token for projection.
- `POST /api/attendance/check-in` - Student checks in with verified QR token.
- `POST /api/attendance/check-out` - Student checks out with verified QR token.
- `POST /api/attendance/sync` - Batch syncs queued offline attendance items.
- `GET /api/events/<event_id>/attendance` - Generates event attendance report.
- `GET /api/events/<event_id>/attendance/export-csv` - Downloads formatted RFC 4180 CSV report.
- `GET /api/attendance/my-history` - Student personal participation history.

---

## Running the Backend

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Flask server**:
   ```bash
   python run.py
   ```
   Runs locally on `http://127.0.0.1:5000`.

3. **Run Production Server (Render / Gunicorn)**:
   ```bash
   gunicorn run:app --bind 0.0.0.0:$PORT
   ```

---

## Running the Automated Test Suite

Run pytest across all backend test suites:
```bash
python -m pytest tests/ -v
```
All 31 tests pass with 100% success rate.
