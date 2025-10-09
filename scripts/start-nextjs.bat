@echo off
REM Next.js Server Auto-Start Script
REM This script starts the Next.js production server on system boot

echo [%date% %time%] Starting Next.js Server... >> C:\nextjs-startup.log

REM Wait for system to stabilize
timeout /t 15 /nobreak >nul

REM Navigate to project directory
cd "C:\Vibe Coding\Homepage\metaldragon"

REM Kill any existing process on port 3000
npx kill-port 3000 >nul 2>&1

REM Start Next.js in production mode
call npm start

echo [%date% %time%] Next.js Server started >> C:\nextjs-startup.log
