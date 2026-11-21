@echo off
echo ========================================================
echo Starting CLIDGE Core GPS Tracking API Backend (Flask)...
echo Base URL: http://127.0.0.1:5000
echo ========================================================
cd /d "%~dp0backend"
python run.py
if errorlevel 1 (
    echo.
    echo [ERROR] Flask server failed to start.
    echo Trying with direct Python path...
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" run.py
)
pause
