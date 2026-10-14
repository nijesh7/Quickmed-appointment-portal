@echo off
title QuickMed Appointment Portal - Launcher
color 0B

:: Ensure working directory is always this script's directory (handles drag-and-drop & double-click)
cd /d "%~dp0"

echo ========================================================
echo         QUICKMED APPOINTMENT SYSTEM (FIREBASE)
echo ========================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in your PATH!
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js detected:
node -v
echo.

:: 2. Check and navigate to backend directory
if not exist "backend\server.js" (
    color 0C
    echo [ERROR] Cannot find backend\server.js.
    echo Please make sure start.bat is in the root QuickMed project folder.
    echo.
    pause
    exit /b 1
)

cd backend

:: 3. Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [!] Dependencies not found. Installing packages...
    call npm install
    echo.
)

:: 4. Automatically open browser to application after server starts
echo [*] Launching QuickMed in your default web browser...
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5000"

:: 5. Start Backend Server
echo [*] Starting QuickMed Backend Server on port 5000...
echo [*] Serving frontend at http://localhost:5000
echo.
echo ========================================================
echo   Press Ctrl + C in this window to stop the server
echo ========================================================
echo.

node server.js

:: If server stops, pause so window does not disappear
echo.
echo Server has stopped.
pause
