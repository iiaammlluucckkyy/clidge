import time
from datetime import datetime, timezone
from flask import Blueprint, jsonify
from app.config import Config

_SERVER_START_TIME = time.time()

health_bp = Blueprint('health', __name__, url_prefix='/api')

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for CLIDGE GPS Tracking API.
    Provides service status, telemetry parameters, uptime, and server timestamp.
    """
    return jsonify({
        "status": "online",
        "service": "CLIDGE Core GPS Tracking API",
        "version": "1.0.0",
        "update_interval_seconds": Config.UPDATE_INTERVAL_SECONDS,
        "stale_threshold_seconds": Config.STALE_THRESHOLD_SECONDS,
        "environment": Config.FLASK_ENV,
        "uptime_seconds": round(time.time() - _SERVER_START_TIME, 2),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 200
