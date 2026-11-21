import os
from app import create_app
from app.config import Config

app = create_app()

if __name__ == '__main__':
    port = Config.PORT
    debug = Config.FLASK_ENV == 'development'
    print(f"==================================================")
    print(f"CLIDGE Core GPS Tracking API Backend")
    print(f"Running on http://127.0.0.1:{port}")
    print(f"Location update interval: {Config.UPDATE_INTERVAL_SECONDS}s")
    print(f"Stale threshold: {Config.STALE_THRESHOLD_SECONDS}s")
    print(f"==================================================")
    app.run(host='0.0.0.0', port=port, debug=debug)
