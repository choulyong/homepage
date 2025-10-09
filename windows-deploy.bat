@echo off
echo.
echo =====================================
echo   Windows Server Deployment
echo =====================================
echo.

REM Check administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Run as Administrator!
    pause
    exit /b 1
)

echo [1/5] Installing PM2...
call npm install -g pm2
call npm install -g pm2-windows-startup
call pm2-startup install
echo.

echo [2/5] Building for production...
cd /d "%~dp0"
call npm run build
echo.

echo [3/5] Starting PM2...
call pm2 delete metaldragon 2>nul
call pm2 start npm --name "metaldragon" -- start
call pm2 save
echo.

echo [4/5] Configuring Firewall...
netsh advfirewall firewall delete rule name="MetalDragon HTTP" 2>nul
netsh advfirewall firewall add rule name="MetalDragon HTTP" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall delete rule name="Next.js 3000" 2>nul
netsh advfirewall firewall add rule name="Next.js 3000" dir=in action=allow protocol=TCP localport=3000
echo.

echo [5/5] Checking status...
call pm2 status
echo.

echo =====================================
echo   Deployment Complete!
echo =====================================
echo.
echo Local: http://localhost:3000
echo Public IP: http://121.167.6.99 (after port forwarding)
echo Domain: http://www.metaldragon.co.kr (after DNS setup)
echo.
echo Next steps:
echo 1. Configure port forwarding on your router (80 -> 80)
echo 2. Set DNS A record: www.metaldragon.co.kr -> 121.167.6.99
echo 3. Install Nginx for reverse proxy (optional)
echo.
pause
