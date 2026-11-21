import pytest
import datetime
from app import create_app
from app.config import Config
from app.services.location_service import (
    _in_memory_locations,
    _in_memory_participants,
    _in_memory_events
)

@pytest.fixture
def app():
    Config.TESTING = True
    app = create_app()
    return app

@pytest.fixture
def client(app):
    return app.test_client()

# Sample verified tokens for testing
TOKEN_STUDENT_1 = "dev-token-std-731622csr045"
TOKEN_STUDENT_2 = "dev-token-std-731622csr099"
TOKEN_UNREGISTERED = "dev-token-std-unregistered-user"
TOKEN_NO_CONSENT = "dev-token-std-no-consent"
TOKEN_TEACHER = "dev-token-fac-cse-108-uid"
TOKEN_UNRELATED_USER = "dev-token-std-random-outsider"

def test_health_check(client):
    """Verifies health check endpoint and interval configuration."""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'online'
    assert data['update_interval_seconds'] == 120
    assert data['stale_threshold_seconds'] == 300

# =====================================================================
# STUDENT 1 & STUDENT 2 LOCATION SUBMISSIONS (TWO DIFFERENT STUDENTS)
# =====================================================================

def test_student_1_submits_location(client):
    """Test 1: Student 1 (Rajesh) submits valid coordinates to active event."""
    payload = {
        "event_id": "evt-2026-001",
        "latitude": 11.49824,
        "longitude": 78.16345,
        "accuracy": 4.2,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    headers = {"Authorization": f"Bearer {TOKEN_STUDENT_1}"}
    response = client.post('/api/locations', json=payload, headers=headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    loc = data['location']
    assert loc['student_id'] == 'std-731622csr045'
    assert loc['is_inside_geofence'] is True
    assert loc['status'] == 'LIVE'
    assert loc['server_timestamp'] is not None

def test_student_2_submits_location(client):
    """Test 2: Student 2 (Ananya) submits valid coordinates to active event."""
    payload = {
        "event_id": "evt-2026-001",
        "latitude": 11.49830,
        "longitude": 78.16350,
        "accuracy": 5.1,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    headers = {"Authorization": f"Bearer {TOKEN_STUDENT_2}"}
    response = client.post('/api/locations', json=payload, headers=headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    loc = data['location']
    assert loc['student_id'] == 'std-731622csr099'
    assert loc['is_inside_geofence'] is True
    assert loc['status'] == 'LIVE'

# =====================================================================
# SECURITY & IDENTITY SPOOFING PREVENTIONS (RULE 8)
# =====================================================================

def test_spoofing_arbitrary_student_id_rejected(client):
    """
    Test 3: Rule 8 - Never accept arbitrary student ID as proof of identity.
    Student 1 attempts to pass Student 2's ID in body. Must be rejected.
    """
    payload = {
        "event_id": "evt-2026-001",
        "student_id": "std-731622csr099",  # Trying to spoof student 2
        "latitude": 11.49824,
        "longitude": 78.16345,
        "accuracy": 4.2
    }
    headers = {"Authorization": f"Bearer {TOKEN_STUDENT_1}"}  # Authenticated as student 1
    response = client.post('/api/locations', json=payload, headers=headers)
    assert response.status_code == 403
    data = response.get_json()
    assert "does not match authenticated token" in data['error']

def test_missing_auth_token_rejected(client):
    """Test 4: Missing Authorization header is rejected."""
    payload = {
        "event_id": "evt-2026-001",
        "latitude": 11.49824,
        "longitude": 78.16345,
        "accuracy": 4.2
    }
    response = client.post('/api/locations', json=payload)
    assert response.status_code == 401
    data = response.get_json()
    assert "Authorization header missing" in data['error']

def test_invalid_auth_token_rejected(client):
    """Test 5: Malformed or invalid token is rejected."""
    payload = {
        "event_id": "evt-2026-001",
        "latitude": 11.49824,
        "longitude": 78.16345,
        "accuracy": 4.2
    }
    headers = {"Authorization": "Bearer invalid.corrupted.token"}
    response = client.post('/api/locations', json=payload, headers=headers)
    assert response.status_code == 401

# =====================================================================
# ERROR HANDLING: INVALID COORDINATES, EXPIRED EVENT, NO CONSENT
# =====================================================================

def test_invalid_coordinates_rejected(client):
    """Test 6: Invalid coordinates (e.g. lat > 90) are rejected with 400 Bad Request."""
    payload = {
        "event_id": "evt-2026-001",
        "latitude": 98.7654,  # Out of range (>90)
        "longitude": 78.1634,
        "accuracy": 4.0
    }
    headers = {"Authorization": f"Bearer {TOKEN_STUDENT_1}"}
    response = client.post('/api/locations', json=payload, headers=headers)
    assert response.status_code == 400
    data = response.get_json()
    assert "Latitude must be between -90.0 and 90.0" in data['error']

def test_expired_or_cancelled_event_rejected(client):
    """Test 7: Location submission to a cancelled or completed event is rejected."""
    payload = {
        "event_id": "evt-2026-cancelled",
        "latitude": 11.4982,
        "longitude": 78.1634,
        "accuracy": 4.0
    }
    headers = {"Authorization": f"Bearer {TOKEN_STUDENT_1}"}
    response = client.post('/api/locations', json=payload, headers=headers)
    assert response.status_code == 403
    data = response.get_json()
    assert "no longer active" in data['error']

def test_unauthorized_student_rejected(client):
    """Test 8: Student not registered for the event cannot submit location."""
    payload = {
        "event_id": "evt-2026-001",
        "latitude": 11.4982,
        "longitude": 78.1634,
        "accuracy": 4.0
    }
    headers = {"Authorization": f"Bearer {TOKEN_UNREGISTERED}"}
    response = client.post('/api/locations', json=payload, headers=headers)
    assert response.status_code == 403
    data = response.get_json()
    assert "not registered" in data['error']

def test_student_without_consent_rejected(client):
    """Test 9: Student who did not grant sharing consent is blocked."""
    payload = {
        "event_id": "evt-2026-001",
        "latitude": 11.4982,
        "longitude": 78.1634,
        "accuracy": 4.0
    }
    headers = {"Authorization": f"Bearer {TOKEN_NO_CONSENT}"}
    response = client.post('/api/locations', json=payload, headers=headers)
    assert response.status_code == 403
    data = response.get_json()
    assert "not granted voluntary location sharing consent" in data['error']

# =====================================================================
# LAST KNOWN LOCATION & STALENESS VERIFICATION (LIVE / OUTDATED / UNAVAILABLE)
# =====================================================================

def test_get_event_locations_and_staleness(client):
    """
    Test 10: GET /api/events/<event_id>/locations
    Verifies Last Known Location behavior:
    - Active location marked LIVE
    - Stale location marked OUTDATED (with actual timestamp preserved)
    - Never marked LIVE when old
    - Unshared student marked UNAVAILABLE
    """
    # 1. Update student 1 with fresh timestamp
    fresh_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
    client.post(
        '/api/locations',
        json={
            "event_id": "evt-2026-001",
            "latitude": 11.49824,
            "longitude": 78.16345,
            "accuracy": 3.5,
            "timestamp": fresh_time
        },
        headers={"Authorization": f"Bearer {TOKEN_STUDENT_1}"}
    )

    # 2. Simulate Student 2 having sent location 10 minutes ago (> 300s threshold)
    stale_time = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=10)).isoformat()
    _in_memory_locations['evt-2026-001_std-731622csr099'] = {
        "event_id": "evt-2026-001",
        "student_id": "std-731622csr099",
        "student_name": "Ananya Ramesh",
        "student_reg_number": "731622CSR099",
        "latitude": 11.49810,
        "longitude": 78.16320,
        "accuracy": 6.0,
        "client_timestamp": stale_time,
        "server_timestamp": stale_time,
        "status": "LIVE",
        "is_inside_geofence": True,
        "distance_to_venue_meters": 22.0
    }

    # 3. Fetch locations as Teacher
    headers = {"Authorization": f"Bearer {TOKEN_TEACHER}"}
    response = client.get('/api/events/evt-2026-001/locations', headers=headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    locations = data['locations']

    s1_entry = next((loc for loc in locations if loc['student_id'] == 'std-731622csr045'), None)
    s2_entry = next((loc for loc in locations if loc['student_id'] == 'std-731622csr099'), None)
    s3_entry = next((loc for loc in locations if loc['student_id'] == 'std-no-consent'), None)

    assert s1_entry is not None, "Student 1 location entry should be present"
    assert s1_entry['status'] == 'LIVE', "Fresh update must be labelled LIVE"

    assert s2_entry is not None, "Student 2 location entry should be present"
    assert s2_entry['status'] == 'OUTDATED', "Stale update (>5m) must be labelled OUTDATED"
    assert s2_entry['latitude'] == 11.49810, "Last known latitude must be preserved"
    assert s2_entry['timestamp'] == stale_time, "Actual last known timestamp must be preserved"

    assert s3_entry is not None, "Participant who never shared must be listed"
    assert s3_entry['status'] == 'UNAVAILABLE', "Student with no received pings must be UNAVAILABLE"
    assert s3_entry['latitude'] is None

def test_privacy_unrelated_caller_blocked(client):
    """Test 11: Privacy protection - Unrelated user cannot view event locations."""
    headers = {"Authorization": f"Bearer {TOKEN_UNRELATED_USER}"}
    response = client.get('/api/events/evt-2026-001/locations', headers=headers)
    assert response.status_code == 403
    data = response.get_json()
    assert "Access Denied" in data['error']
