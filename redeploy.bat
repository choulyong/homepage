@echo off
echo.
echo =====================================
echo   MetalDragon Redeploy
echo =====================================
echo.

echo [1/3] Building production...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo.

echo [2/3] Stopping old server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo   Killing process %%a...
    taskkill /F /PID %%a >nul 2>&1
)
echo   [OK] Old server stopped
echo.

echo [3/3] Starting new server...
start /B npm start
timeout /t 3 >nul
echo   [OK] Server started
echo.

echo =====================================
echo   Deployment Complete!
echo =====================================
echo.
echo Server running at: http://localhost:3000
echo Public: http://www.metaldragon.co.kr
echo.
pause
