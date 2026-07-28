@echo off
echo ========================================================
echo   Launching KUDUCHEE 2.0 (Django Backend + Vite Frontend)
echo ========================================================
echo.

start "Kuduchee Backend (Django)" cmd /k "cd /d %~dp0backend && python manage.py runserver 8000"
start "Kuduchee Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers started in separate terminal windows!
echo Backend URL : http://127.0.0.1:8000/api/
echo Frontend URL: http://localhost:5173/
echo.
