from flask import Blueprint, request, jsonify, g, Response
from app.utils.auth_middleware import require_auth
from app.services.attendance_service import (
    generate_event_qr_token,
    get_active_qr_token,
    student_check_in,
    student_check_out,
    sync_offline_attendance,
    get_event_attendance_report,
    get_student_attendance_history,
    generate_attendance_csv
)

attendance_bp = Blueprint('attendance', __name__, url_prefix='/api')


@attendance_bp.route('/events/<event_id>/attendance/generate-qr', methods=['POST'])
@require_auth
def generate_qr(event_id):
    """
    POST /api/events/<event_id>/attendance/generate-qr
    Teacher generates a cryptographically secure, time-bounded QR code for an event.
    """
    caller_uid = g.user_id
    caller_role = g.current_user.get('role', 'teacher')

    data = request.get_json(silent=True) or {}
    validity_minutes = int(data.get('validity_minutes', 60))

    success, result, status_code = generate_event_qr_token(
        event_id=event_id,
        caller_uid=caller_uid,
        caller_role=caller_role,
        validity_minutes=validity_minutes
    )

    return jsonify({
        "success": success,
        **result
    }), status_code


@attendance_bp.route('/events/<event_id>/attendance/qr-token', methods=['GET'])
@require_auth
def get_qr_token(event_id):
    """
    GET /api/events/<event_id>/attendance/qr-token
    Retrieves current active QR token for projection or verification.
    """
    active_token = get_active_qr_token(event_id)
    if not active_token:
        return jsonify({
            "success": False,
            "error": "No active QR code generated for this event yet."
        }), 404

    return jsonify({
        "success": True,
        **active_token
    }), 200


@attendance_bp.route('/attendance/check-in', methods=['POST'])
@require_auth
def check_in():
    """
    POST /api/attendance/check-in
    Student scans event QR code and submits check-in.
    
    Security:
    - Verified Firebase ID Token supplies student identity (g.user_id).
    - Verifies event participation.
    - Validates QR token on backend.
    - Prevents duplicate check-ins.
    - Server sets official attendance timestamp (never trusts client timestamp).
    """
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Request body must be a valid JSON object"
        }), 400

    event_id = data.get('event_id') or data.get('eventId')
    qr_token = data.get('qr_token') or data.get('qrToken')

    if not event_id:
        return jsonify({"success": False, "error": "Missing required field: 'event_id'"}), 400
    if not qr_token:
        return jsonify({"success": False, "error": "Missing required field: 'qr_token'"}), 400

    verified_student_id = g.user_id
    client_timestamp = data.get('client_timestamp') or data.get('offline_timestamp')
    sync_id = data.get('sync_id') or data.get('syncId')

    # Security check: Bar spoofing student ID in request body
    body_student_id = data.get('student_id') or data.get('studentId')
    if body_student_id and body_student_id != verified_student_id:
        return jsonify({
            "success": False,
            "error": "Forbidden: Request body student ID does not match authenticated token identity."
        }), 403

    success, result, status_code = student_check_in(
        event_id=event_id,
        student_id=verified_student_id,
        qr_token=qr_token,
        student_meta=g.current_user,
        client_timestamp=client_timestamp,
        sync_id=sync_id
    )

    return jsonify({
        "success": success,
        **result
    }), status_code


@attendance_bp.route('/attendance/check-out', methods=['POST'])
@require_auth
def check_out():
    """
    POST /api/attendance/check-out
    Student scans event QR code and submits check-out.
    
    Security:
    - Verified Firebase ID Token supplies student identity.
    - Verifies student has already checked in.
    - Prevents duplicate check-outs.
    - Server sets official check-out timestamp.
    """
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Request body must be a valid JSON object"
        }), 400

    event_id = data.get('event_id') or data.get('eventId')
    if not event_id:
        return jsonify({"success": False, "error": "Missing required field: 'event_id'"}), 400

    qr_token = data.get('qr_token') or data.get('qrToken')
    verified_student_id = g.user_id
    client_timestamp = data.get('client_timestamp') or data.get('offline_timestamp')
    sync_id = data.get('sync_id') or data.get('syncId')

    body_student_id = data.get('student_id') or data.get('studentId')
    if body_student_id and body_student_id != verified_student_id:
        return jsonify({
            "success": False,
            "error": "Forbidden: Request body student ID does not match authenticated token identity."
        }), 403

    success, result, status_code = student_check_out(
        event_id=event_id,
        student_id=verified_student_id,
        qr_token=qr_token,
        student_meta=g.current_user,
        client_timestamp=client_timestamp,
        sync_id=sync_id
    )

    return jsonify({
        "success": success,
        **result
    }), status_code


@attendance_bp.route('/attendance/sync', methods=['POST'])
@require_auth
def sync_offline():
    """
    POST /api/attendance/sync
    Synchronises queued offline attendance records when device regains connectivity.
    
    Security & Verification:
    - Never bypasses server verification.
    - Idempotent: Prevents duplicate synchronization using sync_id.
    - Sets verified server timestamp while preserving offline_queued_at.
    """
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Request body must be a valid JSON object"
        }), 400

    items = data.get('items', [])
    verified_student_id = g.user_id

    success, result, status_code = sync_offline_attendance(
        student_id=verified_student_id,
        items=items,
        student_meta=g.current_user
    )

    return jsonify({
        "success": success,
        **result
    }), status_code


@attendance_bp.route('/events/<event_id>/attendance', methods=['GET'])
@require_auth
def get_attendance_report(event_id):
    """
    GET /api/events/<event_id>/attendance
    Teacher or authorized participant views the event attendance report.
    Keeps attendance records separate from GPS records.
    """
    caller_uid = g.user_id
    caller_role = g.current_user.get('role', 'student')

    success, result, status_code = get_event_attendance_report(
        event_id=event_id,
        caller_uid=caller_uid,
        caller_role=caller_role
    )

    return jsonify({
        "success": success,
        **result
    }), status_code


@attendance_bp.route('/events/<event_id>/attendance/export-csv', methods=['GET'])
@require_auth
def export_csv(event_id):
    """
    GET /api/events/<event_id>/attendance/export-csv
    Downloads formatted CSV attendance report.
    """
    caller_uid = g.user_id
    caller_role = g.current_user.get('role', 'teacher')

    success, csv_data, status_code = generate_attendance_csv(
        event_id=event_id,
        caller_uid=caller_uid,
        caller_role=caller_role
    )

    if not success:
        return jsonify({"success": False, "error": csv_data}), status_code

    filename = f"attendance_report_{event_id}.csv"
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@attendance_bp.route('/attendance/my-history', methods=['GET'])
@require_auth
def get_my_history():
    """
    GET /api/attendance/my-history
    Student retrieves their personal participation and attendance history.
    """
    student_id = g.user_id
    success, result, status_code = get_student_attendance_history(student_id)

    return jsonify({
        "success": success,
        **result
    }), status_code
