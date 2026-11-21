from flask import Blueprint, jsonify
from app.config import Config

health_bp = Blueprint('health', __name__, url_prefix='/api')

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for CLIDGE GPS Tracking API.
    """
    return jsonify({
        "status": "online",
        "service": "CLIDGE Core GPS Tracking API",
        "version": "1.0.0",
        "update_interval_seconds": Config.UPDATE_INTERVAL_SECONDS,
        "stale_threshold_seconds": Config.STALE_THRESHOLD_SECONDS,
        "environment": Config.FLASK_ENV
    }), 200
