#!/bin/bash
echo "========================================================"
echo "  Launching KUDUCHEE 2.0 (Django Backend + Vite Frontend)"
echo "========================================================"
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "Starting Backend (Port 8000)..."
(cd "$DIR/backend" && python manage.py runserver 8000) &

echo "Starting Frontend (Port 5173)..."
(cd "$DIR/frontend" && npm run dev) &

echo ""
echo "Both servers starting!"
echo "Backend : http://127.0.0.1:8000/api/"
echo "Frontend: http://localhost:5173/"
echo ""
