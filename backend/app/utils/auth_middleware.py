from functools import wraps
from flask import request, jsonify, g
from app.firebase_admin_client import verify_firebase_token

def require_auth(f):
    """
    Middleware decorator enforcing Firebase Authentication ID token verification.
    Extracts Bearer token from Authorization header and verifies it via Firebase Admin SDK.
    Stores verified claims in Flask g.current_user.
    Never accepts an arbitrary student ID as proof of identity from the request body.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header:
            return jsonify({
                "success": False,
                "error": "Authorization header missing. Please provide a valid Firebase ID token."
            }), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({
                "success": False,
                "error": "Invalid Authorization header format. Expected 'Bearer <token>'."
            }), 401

        token = parts[1]
        try:
            claims = verify_firebase_token(token)
            g.current_user = claims
            g.user_id = claims.get('uid') or claims.get('user_id')
        except ValueError as val_err:
            return jsonify({
                "success": False,
                "error": str(val_err)
            }), 401
        except Exception as err:
            return jsonify({
                "success": False,
                "error": f"Authentication failed: {str(err)}"
            }), 401

        return f(*args, **kwargs)
    return decorated_function
