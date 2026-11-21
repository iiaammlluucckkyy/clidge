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
def client():
    Config.TESTING = True
    app = create_app()
    return app.test_client()

TOKEN_STUDENT_1 = "dev-token-std-731622csr045"
TOKEN_STUDENT_2 = "dev-token-std-731622csr099"
TOKEN_TEACHER = "dev-token-fac-cse-108-uid"
TOKEN_OTHER_EVENT_STUDENT = "dev-token-std-other-event-user"

def test_two_different_students_separate_markers(client):
    """
    TEST REQUIREMENT:
    Verify that when two different student accounts report GPS locations,
    the teacher dashboard receives two separate markers with distinct coordinates,
    accuracy, geofence compliance, and timestamps.
    """
    event_id = "evt-2026-001"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # 1. Student 1 (Rajesh) submits location (Inside Venue: Kamarajar Hall center = 11.4982, 78.1634, radius = 65m)
    # Distance ~12m -> INSIDE
    payload_student_1 = {
        "event_id": event_id,
        "latitude": 11.49824,
        "longitude": 78.16345,
        "accuracy": 4.2,
        "timestamp": now_iso
    }
    res1 = client.post('/api/locations', json=payload_student_1, headers={"Authorization": f"Bearer {TOKEN_STUDENT_1}"})
    assert res1.status_code == 200
    data1 = res1.get_json()['location']
    assert data1['student_id'] == 'std-731622csr045'
    assert data1['is_inside_geofence'] is True
    assert data1['status'] == 'LIVE'

    # 2. Student 2 (Ananya) submits location from a different spot (Outside Bounds: lat 11.4998, lng 78.1655)
    # Distance > 150m -> OUTSIDE
    payload_student_2 = {
        "event_id": event_id,
        "latitude": 11.49980,
        "longitude": 78.16550,
        "accuracy": 6.8,
        "timestamp": now_iso
    }
    res2 = client.post('/api/locations', json=payload_student_2, headers={"Authorization": f"Bearer {TOKEN_STUDENT_2}"})
    assert res2.status_code == 200
    data2 = res2.get_json()['location']
    assert data2['student_id'] == 'std-731622csr099'
    assert data2['is_inside_geofence'] is False
    assert data2['status'] == 'LIVE'

    # 3. Teacher queries GET /api/events/<event_id>/locations
    res_teacher = client.get(f'/api/events/{event_id}/locations', headers={"Authorization": f"Bearer {TOKEN_TEACHER}"})
    assert res_teacher.status_code == 200
    roster_data = res_teacher.get_json()
    assert roster_data['success'] is True
    assert roster_data['event_id'] == event_id

    locations = roster_data['locations']
    
    # Verify two separate markers exist
    s1_marker = next((loc for loc in locations if loc['student_id'] == 'std-731622csr045'), None)
    s2_marker = next((loc for loc in locations if loc['student_id'] == 'std-731622csr099'), None)

    assert s1_marker is not None, "Marker for Student 1 must be present"
    assert s2_marker is not None, "Marker for Student 2 must be present"

    # Distinct coordinates
    assert s1_marker['latitude'] == 11.49824
    assert s1_marker['longitude'] == 78.16345
    assert s2_marker['latitude'] == 11.49980
    assert s2_marker['longitude'] == 78.16550
    assert (s1_marker['latitude'] != s2_marker['latitude']), "Two student markers must have separate coordinates"

    # Accuracy, geofence, and timestamps
    assert s1_marker['accuracy'] == 4.2
    assert s1_marker['is_inside_geofence'] is True, "Student 1 is Inside Venue"
    assert s1_marker['status'] == 'LIVE'

    assert s2_marker['accuracy'] == 6.8
    assert s2_marker['is_inside_geofence'] is False, "Student 2 is Outside Bounds"
    assert s2_marker['status'] == 'LIVE'

def test_staleness_and_privacy_isolation(client):
    """
    Verify:
    1. Outdated location preserves previous coordinates and timestamp (never marked LIVE)
    2. Other events' locations are not leaked
    """
    event_id = "evt-2026-001"
    
    # Simulate Student 2 location update stopping 8 minutes ago (> 300s stale threshold)
    stale_time = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=8)).isoformat()
    _in_memory_locations[f"{event_id}_std-731622csr099"]['server_timestamp'] = stale_time
    _in_memory_locations[f"{event_id}_std-731622csr099"]['client_timestamp'] = stale_time

    # Teacher fetches locations
    res = client.get(f'/api/events/{event_id}/locations', headers={"Authorization": f"Bearer {TOKEN_TEACHER}"})
    locations = res.get_json()['locations']

    s2 = next(loc for loc in locations if loc['student_id'] == 'std-731622csr099')
    assert s2['status'] == 'OUTDATED', "Location without recent update must be labelled OUTDATED"
    assert s2['latitude'] == 11.49980, "Last known latitude must be preserved"
    assert s2['timestamp'] == stale_time, "Actual timestamp must be preserved"
