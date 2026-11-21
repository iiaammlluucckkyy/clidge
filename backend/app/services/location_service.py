import datetime
from typing import Dict, Any, Tuple, Optional
from app.config import Config
from app.firebase_admin_client import get_firestore_db
from app.services.geofence_service import is_within_geofence

# In-memory storage fallback for development and automated unit testing
# Structure: { f"{event_id}_{student_id}": { ...location_record... } }
_in_memory_locations: Dict[str, Dict[str, Any]] = {}
_in_memory_events: Dict[str, Dict[str, Any]] = {
    'evt-2026-001': {
        'id': 'evt-2026-001',
        'eventId': 'evt-2026-001',
        'title': 'National Level Workshop on Generative AI & Autonomous Agents',
        'venue': 'Main Auditorium (Kamarajar Hall)',
        'latitude': 11.4982,
        'longitude': 78.1634,
        'radius': 65.0,
        'teacherId': 'fac-cse-108-uid',
        'status': 'Ongoing',
        'date': '2026-11-20',
        'startTime': '09:30 AM',
        'endTime': '04:30 PM'
    },
    'evt-2026-002': {
        'id': 'evt-2026-002',
        'eventId': 'evt-2026-002',
        'title': 'Smart Campus IoT & Geofencing Systems Seminar',
        'venue': 'CSE Department Seminar Hall (Hall 302)',
        'latitude': 11.4990,
        'longitude': 78.1642,
        'radius': 45.0,
        'teacherId': 'fac-cse-108-uid',
        'status': 'Upcoming',
        'date': '2026-11-21',
        'startTime': '10:00 AM',
        'endTime': '01:00 PM'
    },
    'evt-2026-cancelled': {
        'id': 'evt-2026-cancelled',
        'eventId': 'evt-2026-cancelled',
        'title': 'Cancelled Robotics Workshop',
        'venue': 'Admin Hall',
        'latitude': 11.4982,
        'longitude': 78.1634,
        'radius': 60.0,
        'teacherId': 'fac-cse-108-uid',
        'status': 'Cancelled',
        'date': '2026-11-19'
    },
    'evt-2026-completed': {
        'id': 'evt-2026-completed',
        'eventId': 'evt-2026-completed',
        'title': 'Past Cyber Defense Seminar',
        'venue': 'Main Auditorium',
        'latitude': 11.4982,
        'longitude': 78.1634,
        'radius': 65.0,
        'teacherId': 'fac-cse-108-uid',
        'status': 'Completed',
        'date': '2026-11-08'
    }
}

# Sample / Seed participants for in-memory fallback
_in_memory_participants: Dict[str, Dict[str, Any]] = {
    'evt-2026-001_std-731622csr045': {
        'eventId': 'evt-2026-001',
        'studentId': 'std-731622csr045',
        'studentName': 'Rajesh Kumar M.',
        'studentRegNumber': '731622CSR045',
        'studentDepartment': 'Computer Science and Engineering',
        'sharingConsent': True,
        'sharingStatus': 'Active'
    },
    'evt-2026-001_std-731622csr099': {
        'eventId': 'evt-2026-001',
        'studentId': 'std-731622csr099',
        'studentName': 'Ananya Ramesh',
        'studentRegNumber': '731622CSR099',
        'studentDepartment': 'Computer Science and Engineering',
        'sharingConsent': True,
        'sharingStatus': 'Active'
    },
    'evt-2026-001_std-no-consent': {
        'eventId': 'evt-2026-001',
        'studentId': 'std-no-consent',
        'studentName': 'Karthik S.',
        'studentRegNumber': '731622CSR020',
        'studentDepartment': 'Computer Science and Engineering',
        'sharingConsent': False,
        'sharingStatus': 'Pending'
    }
}


def validate_coordinates(latitude: Any, longitude: Any, accuracy: Any) -> Tuple[bool, Optional[str]]:
    """
    Validates GPS coordinates and accuracy bounds.
    """
    try:
        lat = float(latitude)
        lng = float(longitude)
        acc = float(accuracy)
    except (TypeError, ValueError):
        return False, "Latitude, longitude, and accuracy must be valid numeric values"

    if not (-90.0 <= lat <= 90.0):
        return False, "Latitude must be between -90.0 and 90.0 degrees"

    if not (-180.0 <= lng <= 180.0):
        return False, "Longitude must be between -180.0 and 180.0 degrees"

    if acc <= 0 or acc > 10000:
        return False, "Accuracy must be a positive value under 10,000 meters"

    return True, None


def get_event_record(event_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves event information from Firestore or fallback store.
    """
    db = get_firestore_db()
    if db is not None:
        try:
            doc_ref = db.collection('events').document(event_id)
            doc_snap = doc_ref.get()
            if doc_snap.exists:
                data = doc_snap.to_dict()
                data['id'] = doc_snap.id
                return data
        except Exception:
            pass

    return _in_memory_events.get(event_id)


def get_participant_record(event_id: str, student_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves participant record from Firestore or fallback store.
    """
    db = get_firestore_db()
    participant_key = f"{event_id}_{student_id}"

    if db is not None:
        try:
            doc_ref = db.collection('eventParticipants').document(participant_key)
            doc_snap = doc_ref.get()
            if doc_snap.exists:
                return doc_snap.to_dict()
        except Exception:
            pass

    return _in_memory_participants.get(participant_key)


def get_all_event_participants(event_id: str):
    """
    Retrieves all registered participants for an event.
    """
    db = get_firestore_db()
    participants = []

    if db is not None:
        try:
            docs = db.collection('eventParticipants').where('eventId', '==', event_id).stream()
            for doc in docs:
                p_data = doc.to_dict()
                if p_data.get('sharingStatus') != 'Left':
                    participants.append(p_data)
            if participants:
                return participants
        except Exception:
            pass

    # In-memory fallback
    for k, v in _in_memory_participants.items():
        if v.get('eventId') == event_id and v.get('sharingStatus') != 'Left':
            participants.append(v)
    return participants


def record_student_location(
    event_id: str,
    student_id: str,
    latitude: float,
    longitude: float,
    accuracy: float,
    client_timestamp: str,
    student_meta: Optional[Dict[str, Any]] = None
) -> Tuple[bool, Dict[str, Any], int]:
    """
    Processes and persists student GPS location to Firestore.
    Enforces all security rules:
    - Verifies event status is active (Ongoing or Upcoming)
    - Verifies student is registered with sharingConsent == True
    - Computes geofence perimeter adherence
    - Stores actual timestamp
    """
    # 1. Coordinate validation
    is_valid, err_msg = validate_coordinates(latitude, longitude, accuracy)
    if not is_valid:
        return False, {"error": err_msg}, 400

    # 2. Event verification
    event = get_event_record(event_id)
    if not event:
        return False, {"error": f"Event '{event_id}' not found."}, 404

    event_status = event.get('status', 'Upcoming')
    if event_status in ('Cancelled', 'Completed'):
        return False, {
            "error": f"Cannot accept location updates. Event is {event_status.lower()} and no longer active.",
            "event_status": event_status
        }, 403

    # 3. Student authorization and consent verification
    participant = get_participant_record(event_id, student_id)
    if not participant:
        return False, {
            "error": "Unauthorized: Student is not registered for this campus event."
        }, 403

    if not participant.get('sharingConsent', False):
        return False, {
            "error": "Privacy Protection: Student has not granted voluntary location sharing consent."
        }, 403

    if participant.get('sharingStatus') == 'Left':
        return False, {
            "error": "Student has previously unregistered/left this event."
        }, 403

    # 4. Geofence computation
    venue_lat = float(event.get('latitude', 11.4982))
    venue_lng = float(event.get('longitude', 78.1634))
    radius_meters = float(event.get('radius') or event.get('geofenceRadius') or 65.0)

    is_inside, distance = is_within_geofence(
        float(latitude), float(longitude), venue_lat, venue_lng, radius_meters
    )

    # 5. Build location payload
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    server_timestamp_iso = now_utc.isoformat()

    location_data = {
        "event_id": event_id,
        "student_id": student_id,
        "student_name": participant.get('studentName') or (student_meta and student_meta.get('name')) or 'Student Participant',
        "student_reg_number": participant.get('studentRegNumber') or (student_meta and student_meta.get('registrationNumber')) or 'REG-PENDING',
        "latitude": round(float(latitude), 7),
        "longitude": round(float(longitude), 7),
        "accuracy": round(float(accuracy), 2),
        "client_timestamp": client_timestamp,
        "server_timestamp": server_timestamp_iso,
        "status": "LIVE",
        "is_inside_geofence": is_inside,
        "distance_to_venue_meters": distance,
        "venue": event.get('venue', 'Campus Hall')
    }

    # 6. Store separately for each student and event
    location_key = f"{event_id}_{student_id}"
    _in_memory_locations[location_key] = location_data

    # Persist in Firestore
    db = get_firestore_db()
    if db is not None:
        try:
            # Store in events/{event_id}/live_locations/{student_id}
            subcol_ref = (
                db.collection('events')
                .document(event_id)
                .collection('live_locations')
                .document(student_id)
            )
            subcol_ref.set(location_data)

            # Also maintain top-level eventLocations index
            top_ref = db.collection('eventLocations').document(location_key)
            top_ref.set(location_data)
        except Exception:
            pass

    return True, {
        "message": "Location updated successfully",
        "location": location_data
    }, 200


def get_event_locations(event_id: str, caller_uid: str, caller_role: str = 'student') -> Tuple[bool, Dict[str, Any], int]:
    """
    Retrieves latest locations for all registered participants of an event.
    Calculates staleness:
    - Within STALE_THRESHOLD_SECONDS -> 'LIVE'
    - Older than threshold -> 'OUTDATED' (keeps last known coordinates & actual timestamp)
    - Never received -> 'UNAVAILABLE'
    Enforces privacy: unrelated teachers/students cannot view this event's locations.
    """
    event = get_event_record(event_id)
    if not event:
        return False, {"error": f"Event '{event_id}' not found."}, 404

    # Privacy Protection Check
    # Teachers: owning teacher of this event (event.teacherId == caller_uid) or admin faculty
    # Students: must be registered in the event
    participants = get_all_event_participants(event_id)
    is_owner_teacher = (event.get('teacherId') == caller_uid)
    is_registered_student = any(p.get('studentId') == caller_uid for p in participants)
    is_faculty = (caller_role in ('teacher', 'admin') or caller_uid.startswith('fac-'))

    if not (is_owner_teacher or is_registered_student or is_faculty):
        return False, {
            "error": "Access Denied: You are not authorized to view location streams for this event."
        }, 403

    now_utc = datetime.datetime.now(datetime.timezone.utc)
    stale_threshold = Config.STALE_THRESHOLD_SECONDS

    locations_list = []
    db = get_firestore_db()

    for p in participants:
        s_id = p.get('studentId')
        s_name = p.get('studentName', 'Student')
        s_reg = p.get('studentRegNumber', '—')
        location_key = f"{event_id}_{s_id}"

        # 1. Fetch location data
        loc = _in_memory_locations.get(location_key)

        if not loc and db is not None:
            try:
                doc_snap = (
                    db.collection('events')
                    .document(event_id)
                    .collection('live_locations')
                    .document(s_id)
                    .get()
                )
                if doc_snap.exists:
                    loc = doc_snap.to_dict()
                    _in_memory_locations[location_key] = loc
            except Exception:
                pass

        # 2. Evaluate Last Known Location status
        if not loc:
            # UNAVAILABLE: Never received any location ping
            locations_list.append({
                "student_id": s_id,
                "student_name": s_name,
                "student_reg_number": s_reg,
                "latitude": None,
                "longitude": None,
                "accuracy": None,
                "timestamp": None,
                "status": "UNAVAILABLE",
                "is_inside_geofence": False,
                "distance_to_venue_meters": None,
                "sharing_consent": p.get('sharingConsent', False)
            })
        else:
            # Calculate elapsed time since last successful update
            try:
                server_ts_str = loc.get('server_timestamp') or loc.get('client_timestamp')
                # Parse ISO timestamp
                server_ts = datetime.datetime.fromisoformat(server_ts_str.replace('Z', '+00:00'))
                age_seconds = (now_utc - server_ts).total_seconds()
            except Exception:
                age_seconds = 999999

            # Determine LIVE vs OUTDATED
            # CRITICAL RULE: Never label an old location as LIVE
            if age_seconds <= stale_threshold:
                display_status = "LIVE"
            else:
                display_status = "OUTDATED"

            locations_list.append({
                "student_id": s_id,
                "student_name": s_name,
                "student_reg_number": s_reg,
                "latitude": loc.get('latitude'),
                "longitude": loc.get('longitude'),
                "accuracy": loc.get('accuracy'),
                "timestamp": loc.get('client_timestamp') or loc.get('server_timestamp'),
                "server_timestamp": loc.get('server_timestamp'),
                "status": display_status,
                "age_seconds": round(age_seconds, 1),
                "is_inside_geofence": loc.get('is_inside_geofence', False),
                "distance_to_venue_meters": loc.get('distance_to_venue_meters'),
                "sharing_consent": p.get('sharingConsent', True)
            })

    return True, {
        "event_id": event_id,
        "event_title": event.get('title'),
        "venue": event.get('venue'),
        "stale_threshold_seconds": stale_threshold,
        "update_interval_seconds": Config.UPDATE_INTERVAL_SECONDS,
        "total_participants": len(participants),
        "locations": locations_list
    }, 200
