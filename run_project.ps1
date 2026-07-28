# Kuduchee 2.0 Project Launcher for PowerShell
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "  Launching KUDUCHEE 2.0 (Django Backend + Vite Frontend)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host ""

$scriptDir = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\backend'; python manage.py runserver 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\frontend'; npm run dev"

Write-Host "Both servers launched!" -ForegroundColor Green
Write-Host "Backend API : http://127.0.0.1:8000/api/" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:5173/" -ForegroundColor Cyan
Write-Host ""
