import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.firebase_admin_client import init_firebase_admin

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configure institutional logging
    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )

    # Initialize Firebase Admin SDK
    init_firebase_admin()

    # Enable CORS only for intended frontend origins
    CORS(app, resources={
        r"/api/*": {
            "origins": Config.CORS_ORIGINS,
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Security Headers Hook
    @app.after_request
    def set_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response

    # Root route for cloud uptime monitoring pingers (e.g. Render / Cron / Statuspage)
    @app.route('/')
    def root_ping():
        return jsonify({
            "service": "CLIDGE Smart Campus Presence Platform",
            "status": "online",
            "health": "/api/health",
            "environment": Config.FLASK_ENV
        }), 200

    # Register blueprints
    from app.routes.locations import locations_bp
    from app.routes.attendance import attendance_bp
    from app.routes.health import health_bp

    app.register_blueprint(locations_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(health_bp)

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "Resource not found"
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

    return app
