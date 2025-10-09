@echo off
echo =====================================
echo   Windows Auto-Start Setup
echo =====================================
echo.
echo This script will register Cloudflared and Next.js
echo to start automatically on system boot.
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/2] Creating Windows Task for Cloudflared...
schtasks /create /tn "MetalDragon-Cloudflared" /tr "C:\Vibe Coding\Homepage\metaldragon\scripts\start-cloudflared.bat" /sc onstart /ru "%USERNAME%" /rl highest /f
if errorlevel 1 (
    echo [ERROR] Failed to create Cloudflared task
    pause
    exit /b 1
)
echo   [OK] Cloudflared task created

echo.
echo [2/2] Creating Windows Task for Next.js...
schtasks /create /tn "MetalDragon-NextJS" /tr "C:\Vibe Coding\Homepage\metaldragon\scripts\start-nextjs.bat" /sc onstart /ru "%USERNAME%" /rl highest /f
if errorlevel 1 (
    echo [ERROR] Failed to create Next.js task
    pause
    exit /b 1
)
echo   [OK] Next.js task created

echo.
echo =====================================
echo   Setup Complete!
echo =====================================
echo.
echo Both services will now start automatically on system boot.
echo.
echo To view/manage tasks:
echo   - Open Task Scheduler (taskschd.msc)
echo   - Look for "MetalDragon-Cloudflared" and "MetalDragon-NextJS"
echo.
echo To remove auto-start:
echo   - Run: scripts\remove-autostart.bat
echo.
pause
