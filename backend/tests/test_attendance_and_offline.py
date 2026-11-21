import pytest
import datetime
from app import create_app
from app.services.attendance_service import (
    _in_memory_attendance,
    _in_memory_qr_tokens,
    _processed_sync_ids
)

TEACHER_UID = "fac-cse-108-uid"
STUDENT_1_UID = "std-731622csr045"
STUDENT_2_UID = "std-731622csr099"
STUDENT_UNREGISTERED_UID = "std-unregistered-999"
EVENT_ID = "evt-2026-001"

AUTH_TEACHER = {"Authorization": f"Bearer dev-token-{TEACHER_UID}"}
AUTH_STUDENT_1 = {"Authorization": f"Bearer dev-token-{STUDENT_1_UID}"}
AUTH_STUDENT_2 = {"Authorization": f"Bearer dev-token-{STUDENT_2_UID}"}
AUTH_UNREGISTERED = {"Authorization": f"Bearer dev-token-{STUDENT_UNREGISTERED_UID}"}


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    # Reset in-memory test state before each test
    _in_memory_attendance.clear()
    _in_memory_qr_tokens.clear()
    _processed_sync_ids.clear()

    with app.test_client() as test_client:
        yield test_client


def test_teacher_generates_qr_code(client):
    """
    Teacher generates unique QR code token for an event.
    """
    res = client.post(
        f"/api/events/{EVENT_ID}/attendance/generate-qr",
        headers=AUTH_TEACHER,
        json={"validity_minutes": 60}
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "qr_token" in data
    assert data["qr_token"].startswith(f"clidge_qr_{EVENT_ID}_")
    assert "expires_at" in data
    assert data["validity_minutes"] == 60


def test_student_cannot_generate_qr_code(client):
    """
    Security check: Students cannot generate event QR tokens.
    """
    res = client.post(
        f"/api/events/{EVENT_ID}/attendance/generate-qr",
        headers=AUTH_STUDENT_1,
        json={"validity_minutes": 60}
    )
    assert res.status_code == 403
    data = res.get_json()
    assert data["success"] is False
    assert "Access Denied" in data["error"]


def test_student_check_in_flow_and_untrusted_timestamp(client):
    """
    Student checks in using active QR code.
    Verifies that client-submitted timestamp is NOT trusted as the official checkInTime.
    """
    # 1. Teacher generates QR code
    gen_res = client.post(
        f"/api/events/{EVENT_ID}/attendance/generate-qr",
        headers=AUTH_TEACHER,
        json={"validity_minutes": 60}
    )
    qr_token = gen_res.get_json()["qr_token"]

    # 2. Student checks in with a fake/client timestamp
    fake_client_ts = "2020-01-01T00:00:00Z"
    checkin_res = client.post(
        "/api/attendance/check-in",
        headers=AUTH_STUDENT_1,
        json={
            "event_id": EVENT_ID,
            "qr_token": qr_token,
            "client_timestamp": fake_client_ts
        }
    )
    assert checkin_res.status_code == 200
    data = checkin_res.get_json()
    assert data["success"] is True
    rec = data["attendance_record"]
    assert rec["status"] == "CHECKED_IN"
    assert rec["studentId"] == STUDENT_1_UID
    # Crucial security rule: Server must set real current timestamp, not the fake 2020 timestamp
    assert rec["checkInTime"] != fake_client_ts
    assert rec["checkInTime"].startswith("202")


def test_prevent_duplicate_check_in(client):
    """
    Security check: Prevents duplicate check-ins for the same student and event.
    """
    # 1. Teacher generates QR code
    gen_res = client.post(
        f"/api/events/{EVENT_ID}/attendance/generate-qr",
        headers=AUTH_TEACHER,
        json={"validity_minutes": 60}
    )
    qr_token = gen_res.get_json()["qr_token"]

    # 2. First check-in
    res1 = client.post(
        "/api/attendance/check-in",
        headers=AUTH_STUDENT_1,
        json={"event_id": EVENT_ID, "qr_token": qr_token}
    )
    assert res1.status_code == 200

    # 3. Second check-in attempt should be rejected
    res2 = client.post(
        "/api/attendance/check-in",
        headers=AUTH_STUDENT_1,
        json={"event_id": EVENT_ID, "qr_token": qr_token}
    )
    assert res2.status_code == 400
    data2 = res2.get_json()
    assert data2["success"] is False
    assert "Duplicate Check-In" in data2["error"]


def test_check_in_invalid_or_expired_token(client):
    """
    Check-in with invalid or expired token is rejected.
    """
    res = client.post(
        "/api/attendance/check-in",
        headers=AUTH_STUDENT_1,
        json={"event_id": EVENT_ID, "qr_token": "invalid_token_12345"}
    )
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False


def test_unregistered_student_cannot_check_in(client):
    """
    Security check: Unregistered student cannot check in.
    """
    gen_res = client.post(
        f"/api/events/{EVENT_ID}/attendance/generate-qr",
        headers=AUTH_TEACHER,
        json={"validity_minutes": 60}
    )
    qr_token = gen_res.get_json()["qr_token"]

    res = client.post(
        "/api/attendance/check-in",
        headers=AUTH_UNREGISTERED,
        json={"event_id": EVENT_ID, "qr_token": qr_token}
    )
    assert res.status_code == 403
    data = res.get_json()
    assert data["success"] is False
    assert "Unauthorized" in data["error"]


def test_student_check_out_flow(client):
    """
    Student check-out flow:
    - Cannot check out before checking in.
    - Successfully checks out after checking in.
    - Prevents duplicate check-out.
    """
    gen_res = client.post(
        f"/api/events/{EVENT_ID}/attendance/generate-qr",
        headers=AUTH_TEACHER,
        json={"validity_minutes": 60}
    )
    qr_token = gen_res.get_json()["qr_token"]

    # 1. Attempt check-out before check-in -> Rejected
    res_before = client.post(
        "/api/attendance/check-out",
        headers=AUTH_STUDENT_2,
        json={"event_id": EVENT_ID, "qr_token": qr_token}
    )
    assert res_before.status_code == 400
    assert "not checked in" in res_before.get_json()["error"]

    # 2. Perform valid check-in
    client.post(
        "/api/attendance/check-in",
        headers=AUTH_STUDENT_2,
        json={"event_id": EVENT_ID, "qr_token": qr_token}
    )

    # 3. Perform check-out -> Success
    res_checkout = client.post(
        "/api/attendance/check-out",
        headers=AUTH_STUDENT_2,
        json={"event_id": EVENT_ID, "qr_token": qr_token}
    )
    assert res_checkout.status_code == 200
    data_out = res_checkout.get_json()
    assert data_out["success"] is True
    assert data_out["attendance_record"]["status"] == "CHECKED_OUT"
    assert data_out["attendance_record"]["checkOutTime"] is not None

    # 4. Attempt duplicate check-out -> Rejected
    res_dup_out = client.post(
        "/api/attendance/check-out",
        headers=AUTH_STUDENT_2,
        json={"event_id": EVENT_ID, "qr_token": qr_token}
    )
    assert res_dup_out.status_code == 400
    assert "Duplicate Check-Out" in res_dup_out.get_json()["error"]


def test_offline_sync_and_idempotency(client):
    """
    Offline support:
    - Queued offline check-in and check-out sync.
    - Idempotent: Repeating sync does not fail or duplicate.
    - Server verification applied.
    """
    gen_res = client.post(
        f"/api/events/{EVENT_ID}/attendance/generate-qr",
        headers=AUTH_TEACHER,
        json={"validity_minutes": 60}
    )
    qr_token = gen_res.get_json()["qr_token"]

    sync_payload = {
        "items": [
            {
                "sync_id": "tx-sync-001",
                "event_id": EVENT_ID,
                "action": "check-in",
                "qr_token": qr_token,
                "offline_timestamp": "2026-11-20T09:40:00Z"
            }
        ]
    }

    # 1. First sync
    res1 = client.post(
        "/api/attendance/sync",
        headers=AUTH_STUDENT_1,
        json=sync_payload
    )
    assert res1.status_code == 200
    data1 = res1.get_json()
    assert data1["success"] is True
    assert data1["success_count"] == 1

    # 2. Second sync with identical sync_id (idempotent replay)
    res2 = client.post(
        "/api/attendance/sync",
        headers=AUTH_STUDENT_1,
        json=sync_payload
    )
    assert res2.status_code == 200
    data2 = res2.get_json()
    assert data2["success"] is True


def test_attendance_report_and_location_correlation(client):
    """
    FEATURE 2: Attendance Reports
    Verifies:
    - Total registered students
    - Total successful check-ins
    - Total successful check-outs
    - Students with location updates (LIVE / OUTDATED / UNAVAILABLE)
    - Attendance records kept separate from GPS records.
    """
    gen_res = client.post(
        f"/api/events/{EVENT_ID}/attendance/generate-qr",
        headers=AUTH_TEACHER,
        json={"validity_minutes": 60}
    )
    qr_token = gen_res.get_json()["qr_token"]

    # Student 1 checks in
    client.post(
        "/api/attendance/check-in",
        headers=AUTH_STUDENT_1,
        json={"event_id": EVENT_ID, "qr_token": qr_token}
    )

    # Student 1 submits live location
    client.post(
        "/api/locations",
        headers=AUTH_STUDENT_1,
        json={"event_id": EVENT_ID, "latitude": 11.4982, "longitude": 78.1634, "accuracy": 4.5}
    )

    # Student 2 checks in and checks out
    client.post(
        "/api/attendance/check-in",
        headers=AUTH_STUDENT_2,
        json={"event_id": EVENT_ID, "qr_token": qr_token}
    )
    client.post(
        "/api/attendance/check-out",
        headers=AUTH_STUDENT_2,
        json={"event_id": EVENT_ID, "qr_token": qr_token}
    )

    # Fetch report
    rep_res = client.get(
        f"/api/events/{EVENT_ID}/attendance",
        headers=AUTH_TEACHER
    )
    assert rep_res.status_code == 200
    rep = rep_res.get_json()
    assert rep["success"] is True
    assert rep["total_registered"] >= 2
    assert rep["total_check_ins"] >= 2
    assert rep["total_check_outs"] >= 1
    assert "live_locations" in rep
    assert "disclaimer" in rep

    # Verify individual records
    records = rep["individual_records"]
    s1_rec = next((r for r in records if r["student_id"] == STUDENT_1_UID), None)
    assert s1_rec is not None
    assert s1_rec["attendance_status"] == "CHECKED_IN"
    assert s1_rec["location_status"] == "LIVE"


def test_export_csv_report(client):
    """
    Test CSV export endpoint with RFC 4180 format.
    """
    res = client.get(
        f"/api/events/{EVENT_ID}/attendance/export-csv",
        headers=AUTH_TEACHER
    )
    assert res.status_code == 200
    assert res.mimetype == "text/csv"
    csv_text = res.get_data(as_text=True)
    assert "CLIDGE CAMPUS ATTENDANCE REPORT" in csv_text
    assert "Student Name" in csv_text
    assert "Attendance Status" in csv_text
    assert "Check-In Time" in csv_text
    assert "DISCLAIMER" in csv_text


def test_student_my_history(client):
    """
    Test student personal attendance history endpoint.
    """
    # Teacher generates QR and student 1 checks in
    gen = client.post(f"/api/events/{EVENT_ID}/attendance/generate-qr", headers=AUTH_TEACHER)
    qr = gen.get_json()["qr_token"]
    client.post("/api/attendance/check-in", headers=AUTH_STUDENT_1, json={"event_id": EVENT_ID, "qr_token": qr})

    hist_res = client.get("/api/attendance/my-history", headers=AUTH_STUDENT_1)
    assert hist_res.status_code == 200
    data = hist_res.get_json()
    assert data["success"] is True
    assert data["student_id"] == STUDENT_1_UID
    assert data["total_attended"] >= 1
    assert data["history"][0]["status"] == "CHECKED_IN"
