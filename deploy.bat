@echo off
echo.
echo =====================================
echo   Metaldragon Docker Start
echo =====================================
echo.

echo [1/4] Checking Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] Docker Desktop is not running
    echo   Please start Docker Desktop manually
    echo.
    pause
    exit /b 1
)
echo   [OK] Docker Desktop is running
echo.

echo [2/4] Cleaning port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo   Killing process %%a...
    taskkill /F /PID %%a >nul 2>&1
)
echo   [OK] Port 3000 is ready
echo.

echo [3/4] Stopping containers...
docker-compose down >nul 2>&1
echo   [OK] Containers stopped
echo.

echo [4/4] Starting Docker Compose...
docker-compose up -d

if errorlevel 1 (
    echo.
    echo =====================================
    echo   [FAILED] Deployment failed
    echo =====================================
    echo.
    echo Run: docker-compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo =====================================
echo   [SUCCESS] Deployment complete!
echo =====================================
echo.
echo Access: http://localhost:3000
echo.
echo Check status: docker-compose ps
echo View logs: docker-compose logs -f app
echo.
pause
