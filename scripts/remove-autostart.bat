@echo off
echo =====================================
echo   Remove Windows Auto-Start
echo =====================================
echo.
echo This will remove auto-start tasks for:
echo   - Cloudflared Tunnel
echo   - Next.js Server
echo.
pause

echo.
echo [1/2] Removing Cloudflared task...
schtasks /delete /tn "MetalDragon-Cloudflared" /f >nul 2>&1
echo   [OK] Cloudflared task removed

echo.
echo [2/2] Removing Next.js task...
schtasks /delete /tn "MetalDragon-NextJS" /f >nul 2>&1
echo   [OK] Next.js task removed

echo.
echo =====================================
echo   Auto-start Removed
echo =====================================
echo.
pause
