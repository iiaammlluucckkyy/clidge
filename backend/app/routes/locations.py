import datetime
from flask import Blueprint, request, jsonify, g
from app.utils.auth_middleware import require_auth
from app.services.location_service import record_student_location, get_event_locations

locations_bp = Blueprint('locations', __name__, url_prefix='/api')

@locations_bp.route('/locations', methods=['POST'])
@require_auth
def submit_location():
    """
    POST /api/locations
    Receives authenticated GPS location update from a participating student.
    
    Security & Verification:
    - Verified Firebase ID Token supplies student identity (g.user_id).
    - Rule 8: NEVER accepts arbitrary student ID from request body.
    - Validates latitude, longitude, and accuracy bounds.
    - Verifies student is registered with voluntary sharing consent.
    - Verifies event is active and approved.
    - Persists actual update timestamp.
    """
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Request body must be a valid JSON object"
        }), 400

    event_id = data.get('event_id') or data.get('eventId')
    if not event_id:
        return jsonify({
            "success": False,
            "error": "Missing required field: 'event_id'"
        }), 400

    latitude = data.get('latitude')
    longitude = data.get('longitude')
    accuracy = data.get('accuracy') or data.get('accuracy_meters', 5.0)

    if latitude is None or longitude is None:
        return jsonify({
            "success": False,
            "error": "Missing required GPS coordinates: 'latitude' and 'longitude' are required"
        }), 400

    # Timestamp handling: Use client timestamp or fallback to current UTC time
    client_timestamp = data.get('timestamp') or data.get('client_timestamp')
    if not client_timestamp:
        client_timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # CRITICAL SECURITY RULE: The student ID is strictly extracted from the verified auth token (g.user_id)
    # We do NOT trust any student_id passed in the JSON body.
    verified_student_id = g.user_id

    # If the request maliciously attempts to spoof another student ID, reject it
    body_student_id = data.get('student_id') or data.get('studentId')
    if body_student_id and body_student_id != verified_student_id:
        return jsonify({
            "success": False,
            "error": "Forbidden: Request body student ID does not match authenticated token identity."
        }), 403

    success, result, status_code = record_student_location(
        event_id=event_id,
        student_id=verified_student_id,
        latitude=latitude,
        longitude=longitude,
        accuracy=accuracy,
        client_timestamp=client_timestamp,
        student_meta=g.current_user
    )

    return jsonify({
        "success": success,
        **result
    }), status_code


@locations_bp.route('/events/<event_id>/locations', methods=['GET'])
@require_auth
def get_event_student_locations(event_id):
    """
    GET /api/events/<event_id>/locations
    Returns real-time and last known locations for all registered students in an event.
    
    Privacy & Access Control:
    - Only teachers owning the event, authorized faculty, or participants registered in this event can access.
    - Last Known Location evaluation:
      - 'LIVE': Location update received within stale threshold (e.g. 5 minutes).
      - 'OUTDATED': Updates stopped; retains last known location and timestamp. Never marked as LIVE.
      - 'UNAVAILABLE': No location has ever been received from the student.
    """
    caller_uid = g.user_id
    caller_role = g.current_user.get('role', 'student')

    success, result, status_code = get_event_locations(
        event_id=event_id,
        caller_uid=caller_uid,
        caller_role=caller_role
    )

    return jsonify({
        "success": success,
        **result
    }), status_code
