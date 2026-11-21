/**
 * CLIDGE Flask API Integration Service
 * 
 * Direct HTTP client connecting the React frontend to the Python Flask backend.
 * Endpoints:
 * - POST /api/locations
 * - GET  /api/events/<event_id>/locations
 * - GET  /api/health
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
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2500)
      });
      const data = await response.json();
      this.isBackendConnected = response.ok;
      return { ok: response.ok, data };
    } catch {
      this.isBackendConnected = false;
      return { ok: false, error: 'Flask backend is offline' };
    }
  }

  /**
   * Submit student GPS coordinates to Flask backend.
   * Endpoint: POST /api/locations
   * Header: Authorization: Bearer <firebase_id_token>
   * 
   * Security:
   * - Student identity is extracted strictly from verified token server-side.
   * - Never sends arbitrary student_id as proof of identity.
   */
  async submitLocation({ eventId, latitude, longitude, accuracy, timestamp, token }) {
    if (!navigator.onLine) {
      throw new Error('Internet disconnected: Cannot transmit location coordinates.');
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/locations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event_id: eventId,
          latitude: Number(latitude),
          longitude: Number(longitude),
          accuracy: Number(accuracy) || 5.0,
          timestamp: timestamp || new Date().toISOString()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      return data;
    } catch (err) {
      // If Flask backend is unreachable (e.g. dev mode without server running), return structured offline warning
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        return {
          success: true,
          mock: true,
          warning: 'Flask backend unreachable; coordinate cached locally.',
          location: {
            event_id: eventId,
            latitude,
            longitude,
            accuracy,
            status: 'LIVE',
            client_timestamp: timestamp || new Date().toISOString(),
            server_timestamp: new Date().toISOString(),
            is_inside_geofence: true
          }
        };
      }
      throw err;
    }
  }

  /**
   * Fetch active and last known student locations for an event.
   * Endpoint: GET /api/events/<event_id>/locations
   * Header: Authorization: Bearer <firebase_id_token>
   */
  async getEventLocations(eventId, token) {
    if (!navigator.onLine) {
      throw new Error('Internet disconnected: Cannot fetch live student locations.');
    }

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/locations`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        return null; // Return null so callers fall back to sample or cached data
      }
      throw err;
    }
  }

  /**
   * Create an event helper stub
   */
  async createEvent(eventPayload) {
    return { success: true, event: eventPayload };
  }

  /**
   * Teacher generates a cryptographically secure, time-bounded QR code token.
   * Endpoint: POST /api/events/<event_id>/attendance/generate-qr
   */
  async generateEventQr(eventId, token, validityMinutes = 60) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/attendance/generate-qr`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ validity_minutes: validityMinutes })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate QR code');
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        // Fallback for development if Flask backend is not yet started
        const tokenVal = `clidge_qr_${eventId}_${Math.random().toString(36).substring(2, 10)}`;
        return {
          success: true,
          mock: true,
          event_id: eventId,
          qr_token: tokenVal,
          issued_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + validityMinutes * 60000).toISOString(),
          validity_minutes: validityMinutes
        };
      }
      throw err;
    }
  }

  /**
   * Retrieves active event QR code metadata.
   * Endpoint: GET /api/events/<event_id>/attendance/qr-token
   */
  async getEventQr(eventId, token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/attendance/qr-token`, {
        method: 'GET',
        headers
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No active QR code');
      return data;
    } catch (err) {
      return null;
    }
  }

  /**
   * Student check-in via QR scan.
   * Endpoint: POST /api/attendance/check-in
   */
  async studentCheckIn({ eventId, qrToken, offlineTimestamp, syncId, token }) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const body = {
      event_id: eventId,
      qr_token: qrToken,
      offline_timestamp: offlineTimestamp,
      sync_id: syncId
    };

    try {
      const response = await fetch(`${this.baseUrl}/attendance/check-in`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Check-in failed');
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        // Return structured offline flag so UI queues it in IndexedDB
        return {
          success: false,
          offline: true,
          error: 'Backend currently offline. Record saved to local queue.'
        };
      }
      throw err;
    }
  }

  /**
   * Student check-out via QR scan.
   * Endpoint: POST /api/attendance/check-out
   */
  async studentCheckOut({ eventId, qrToken, offlineTimestamp, syncId, token }) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const body = {
      event_id: eventId,
      qr_token: qrToken,
      offline_timestamp: offlineTimestamp,
      sync_id: syncId
    };

    try {
      const response = await fetch(`${this.baseUrl}/attendance/check-out`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Check-out failed');
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        return {
          success: false,
          offline: true,
          error: 'Backend currently offline. Record saved to local queue.'
        };
      }
      throw err;
    }
  }

  /**
   * Batch synchronizes queued offline attendance records.
   * Endpoint: POST /api/attendance/sync
   */
  async syncOfflineAttendance({ items, token }) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.baseUrl}/attendance/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ items })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Offline sync failed');
      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Retrieves full attendance report for an event.
   * Endpoint: GET /api/events/<event_id>/attendance
   */
  async getEventAttendanceReport(eventId, token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/attendance`, {
        method: 'GET',
        headers
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch attendance report');
      return data;
    } catch (err) {
      return null;
    }
  }

  /**
   * Retrieves personal attendance history for authenticated student.
   * Endpoint: GET /api/attendance/my-history
   */
  async getStudentAttendanceHistory(token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.baseUrl}/attendance/my-history`, {
        method: 'GET',
        headers
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch history');
      return data;
    } catch (err) {
      return null;
    }
  }

  /**
   * Downloads CSV attendance report.
   * Endpoint: GET /api/events/<event_id>/attendance/export-csv
   */
  async exportAttendanceCsv(eventId, token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/attendance/export-csv`, {
        method: 'GET',
        headers
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      return blob;
    } catch (err) {
      return null;
    }
  }
}

export const flaskApi = new FlaskApiService();
