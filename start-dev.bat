@echo off
REM Quarterback Development Server Startup Script
REM This script sets up the PATH and starts the dev server on a fixed port

echo Starting Quarterback Development Server...
echo.

REM Set Node.js PATH
set PATH=C:\Users\DennisSimon\nodejs\node-v20.11.0-win-x64;%PATH%

REM Kill any existing Node.js processes to free up ports
echo Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1

REM Wait a moment for processes to close
timeout /t 2 /nobreak >nul

REM Start the development server on port 3000
echo Starting server on http://localhost:3000...
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause