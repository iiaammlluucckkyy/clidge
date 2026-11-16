/**
 * CLIDGE Flask API Integration Service
 * 
 * Ready-to-connect endpoints for the Python Flask backend.
 * Default Flask Base URL: http://localhost:5000
 * In production or local dev, set VITE_FLASK_API_URL in your .env file.
 */

const BASE_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000/api';

class FlaskApiService {
  constructor() {
    this.baseUrl = BASE_URL;
    this.isBackendConnected = false;
  }

  /**
   * Check if the Flask server is online and responding.
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
      this.isBackendConnected = response.ok;
      return response.ok;
    } catch {
      this.isBackendConnected = false;
      return false;
    }
  }

  /**
   * One Common GPS API: Submits student GPS coordinates to Flask backend.
   * Endpoint: POST /api/location/heartbeat
   * Flask implementation handles authenticated student token and updates geofence state.
   */
  async sendLocationHeartbeat({ studentId, eventId, latitude, longitude, accuracy, batteryLevel }) {
    if (!this.isBackendConnected) {
      // In UI demo mode, return simulated response
      return {
        success: true,
        mock: true,
        message: 'Heartbeat received (Local UI Demo Mode)',
        timestamp: new Date().toISOString(),
        geofenceStatus: 'Inside Venue'
      };
    }

    const response = await fetch(`${this.baseUrl}/location/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        event_id: eventId,
        latitude,
        longitude,
        accuracy_meters: accuracy,
        battery_percentage: batteryLevel,
        client_timestamp: new Date().toISOString()
      })
    });
    return response.json();
  }

  /**
   * Geofenced Check-In for Student
   * Endpoint: POST /api/attendance/check-in
   */
  async markAttendanceCheckIn({ studentId, eventId, latitude, longitude, qrToken }) {
    if (!this.isBackendConnected) {
      return {
        success: true,
        mock: true,
        message: 'Attendance validated successfully via geofenced coordinates and QR token.',
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    const response = await fetch(`${this.baseUrl}/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        event_id: eventId,
        coordinates: { latitude, longitude },
        qr_token: qrToken,
        timestamp: new Date().toISOString()
      })
    });
    return response.json();
  }

  /**
   * Fetch active students for teacher monitoring dashboard
   * Endpoint: GET /api/monitoring/students?event_id=...
   */
  async getMonitoredStudents(eventId) {
    if (!this.isBackendConnected) {
      return null; // Signals caller to use UI sample data
    }

    const response = await fetch(`${this.baseUrl}/monitoring/students?event_id=${eventId}`);
    return response.json();
  }

  /**
   * Create an event (Teacher privilege)
   * Endpoint: POST /api/events/create
   */
  async createEvent(eventPayload) {
    if (!this.isBackendConnected) {
      return {
        success: true,
        mock: true,
        event: { ...eventPayload, id: `evt-${Date.now()}` }
      };
    }

    const response = await fetch(`${this.baseUrl}/events/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload)
    });
    return response.json();
  }
}

export const flaskApi = new FlaskApiService();
