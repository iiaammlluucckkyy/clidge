import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'clidge-secret-key-geofence-2026')
    PORT = int(os.getenv('PORT', 5000))
    
    # Configurable location update interval (Default: ~2 minutes = 120 seconds)
    UPDATE_INTERVAL_SECONDS = int(os.getenv('LOCATION_UPDATE_INTERVAL_SECONDS', 120))
    
    # Staleness threshold for Last Known Location (Default: 300 seconds = 5 minutes)
    STALE_THRESHOLD_SECONDS = int(os.getenv('LOCATION_STALE_THRESHOLD_SECONDS', 300))
    
    # Allowed Frontend Origins for CORS
    CORS_ORIGINS = [
        origin.strip() for origin in os.getenv(
            'CORS_ORIGINS',
            'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,https://clidge.vercel.app'
        ).split(',') if origin.strip()
    ]

    # Firebase Admin Configuration
    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID', 'clidge-demo')
    FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', None)
    FIREBASE_SERVICE_ACCOUNT_JSON = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON', None)
    
    # Test / Demo mode toggle
    TESTING = os.getenv('TESTING', 'False').lower() in ('true', '1')
