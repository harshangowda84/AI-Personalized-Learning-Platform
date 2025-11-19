@echo off
echo ========================================
echo   AI Personalized Learning Platform
echo ========================================
echo.
echo Starting Backend and Frontend...
echo.

REM Start Backend in a new window
start "Backend Server" cmd /k "cd backend && .\\humanaize\\Scripts\\activate && flask run --host=127.0.0.1 --port=5000"

REM Wait for backend to initialize
timeout /t 3 /nobreak >nul

REM Start Frontend in current window
echo Starting Frontend...
npm start

pause
