@echo off
chcp 65001 > nul
echo.
echo =====================================
echo   Metaldragon Docker Start
echo =====================================
echo.

REM Step 1: Docker Desktop 확인
echo [1/4] Checking Docker Desktop...
docker info > nul 2>&1
if errorlevel 1 (
    echo   [ERROR] Docker Desktop is not running
    echo   Please start Docker Desktop manually
    echo.
    pause
    exit /b 1
)
echo   [OK] Docker Desktop is running
echo.

REM Step 2: 포트 3000 정리
echo [2/4] Cleaning port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo   Killing process %%a...
    taskkill /F /PID %%a > nul 2>&1
)
echo   [OK] Port 3000 is ready
echo.

REM Step 3: 기존 컨테이너 정리
echo [3/4] Stopping containers...
cd /d "%~dp0"
docker-compose down > nul 2>&1
echo   [OK] Containers stopped
echo.

REM Step 4: Docker Compose 시작
echo [4/4] Starting Docker Compose...
docker-compose up -d

if errorlevel 1 (
    echo.
    echo =====================================
    echo   [FAILED] Deployment failed
    echo =====================================
    echo.
    echo Troubleshooting:
    echo   1. Restart Docker Desktop
    echo   2. Run: docker-compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo =====================================
echo   [SUCCESS] Deployment complete!
echo =====================================
echo.
echo Access:
echo   - Next.js App: http://localhost:3000
echo   - Grafana:     Internal network only
echo.
echo Check status:
echo   docker-compose ps
echo.
echo View logs:
echo   docker-compose logs -f app
echo.
pause
