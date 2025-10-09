@echo off
REM Metaldragon 프로젝트 관리 스크립트
REM 유지보수를 쉽게 하기 위한 통합 관리 도구

setlocal enabledelayedexpansion

if "%1"=="" goto :usage

if /i "%1"=="start" goto :start
if /i "%1"=="stop" goto :stop
if /i "%1"=="restart" goto :restart
if /i "%1"=="status" goto :status
if /i "%1"=="logs" goto :logs
if /i "%1"=="build" goto :build
if /i "%1"=="clean" goto :clean
goto :usage

:usage
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   Metaldragon 프로젝트 관리 도구                        ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 사용법: manage.bat [command]
echo.
echo 명령어:
echo   start     - 모든 서비스 시작
echo   stop      - 모든 서비스 중지
echo   restart   - 모든 서비스 재시작
echo   status    - 서비스 상태 확인
echo   logs      - 실시간 로그 보기
echo   build     - 이미지 재빌드 및 시작
echo   clean     - 모든 컨테이너, 볼륨 제거
echo.
echo 예제:
echo   manage.bat start
echo   manage.bat status
echo   manage.bat logs app
echo.
goto :eof

:start
echo.
echo [시작] 모든 서비스를 시작합니다...
echo.
cd /d "%~dp0"
docker-compose up -d
if %errorlevel% equ 0 (
    echo.
    echo ✓ 서비스가 성공적으로 시작되었습니다.
    echo.
    echo 접속 정보:
    echo   - Next.js App: http://localhost:3000
    echo   - Grafana:     http://localhost:3001
    echo.
) else (
    echo.
    echo ✗ 서비스 시작 실패
    echo Docker Desktop이 실행 중인지 확인하세요.
    echo.
)
goto :eof

:stop
echo.
echo [중지] 모든 서비스를 중지합니다...
echo.
cd /d "%~dp0"
docker-compose down
if %errorlevel% equ 0 (
    echo.
    echo ✓ 서비스가 중지되었습니다.
    echo.
) else (
    echo.
    echo ✗ 서비스 중지 실패
    echo.
)
goto :eof

:restart
echo.
echo [재시작] 모든 서비스를 재시작합니다...
echo.
cd /d "%~dp0"
docker-compose restart
if %errorlevel% equ 0 (
    echo.
    echo ✓ 서비스가 재시작되었습니다.
    echo.
) else (
    echo.
    echo ✗ 서비스 재시작 실패
    echo.
)
goto :eof

:status
echo.
echo [상태] 서비스 상태를 확인합니다...
echo.
cd /d "%~dp0"
docker-compose ps
echo.
goto :eof

:logs
echo.
if "%2"=="" (
    echo [로그] 모든 서비스의 로그를 표시합니다...
    echo Ctrl+C를 눌러 종료하세요.
    echo.
    cd /d "%~dp0"
    docker-compose logs -f
) else (
    echo [로그] %2 서비스의 로그를 표시합니다...
    echo Ctrl+C를 눌러 종료하세요.
    echo.
    cd /d "%~dp0"
    docker-compose logs -f %2
)
goto :eof

:build
echo.
echo [빌드] 이미지를 재빌드하고 시작합니다...
echo.
cd /d "%~dp0"
docker-compose up -d --build
if %errorlevel% equ 0 (
    echo.
    echo ✓ 빌드 및 시작 완료
    echo.
) else (
    echo.
    echo ✗ 빌드 실패
    echo.
)
goto :eof

:clean
echo.
echo [경고] 모든 컨테이너와 볼륨을 삭제합니다!
echo 데이터가 모두 삭제됩니다. 계속하시겠습니까? (Y/N)
set /p confirm=
if /i not "%confirm%"=="Y" (
    echo 취소되었습니다.
    goto :eof
)
echo.
echo 정리 중...
cd /d "%~dp0"
docker-compose down -v
if %errorlevel% equ 0 (
    echo.
    echo ✓ 정리 완료
    echo.
) else (
    echo.
    echo ✗ 정리 실패
    echo.
)
goto :eof

:eof
endlocal
