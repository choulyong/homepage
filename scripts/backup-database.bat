@echo off
REM Database Backup Script for Supabase
REM Backs up database using pg_dump

setlocal EnableDelayedExpansion

REM Configuration
set BACKUP_DIR=C:\Vibe Coding\Homepage\metaldragon\backups\database
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\backup_%TIMESTAMP%.sql

REM Supabase 연결 정보 (.env.local에서 가져오기)
REM 주의: 실제 사용 시 환경변수 또는 .env 파일에서 읽어오도록 수정 필요
set SUPABASE_HOST=db.xhzqhvjkkfpeavdphoit.supabase.co
set SUPABASE_PORT=5432
set SUPABASE_DB=postgres
set SUPABASE_USER=postgres
REM SUPABASE_PASSWORD는 환경변수나 별도 파일에서 읽어야 함

echo =====================================
echo   Database Backup
echo =====================================
echo.
echo Backup Directory: %BACKUP_DIR%
echo Backup File: %BACKUP_FILE%
echo.

REM 백업 디렉토리 생성
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [1/3] Connecting to Supabase...
echo.

REM pg_dump 명령어 (PostgreSQL 클라이언트 필요)
echo [2/3] Creating backup...
REM 실제 사용 시 아래 명령어의 주석을 해제하고 PGPASSWORD 설정 필요
REM set PGPASSWORD=your_password_here
REM pg_dump -h %SUPABASE_HOST% -p %SUPABASE_PORT% -U %SUPABASE_USER% -d %SUPABASE_DB% -F c -b -v -f "%BACKUP_FILE%"

echo.
echo ⚠️ 실제 백업을 위해서는:
echo 1. PostgreSQL 클라이언트 (pg_dump) 설치 필요
echo 2. Supabase 데이터베이스 비밀번호 설정 필요
echo 3. 스크립트에서 PGPASSWORD 환경변수 설정 필요
echo.

REM 대안: Supabase API를 통한 백업
echo [Alternative] Using Supabase API backup...
echo.
echo You can also use Supabase Dashboard:
echo 1. Go to: https://supabase.com/dashboard/project/xhzqhvjkkfpeavdphoit
echo 2. Database ^> Backups
echo 3. Create backup manually
echo.

REM 오래된 백업 삭제 (30일 이상)
echo [3/3] Cleaning old backups (30+ days)...
forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -30 /c "cmd /c del @path" 2>nul
if errorlevel 1 (
    echo   No old backups to delete
) else (
    echo   Old backups deleted
)
echo.

echo =====================================
echo   Backup Process Complete
echo =====================================
echo.
echo Note: For production use, configure:
echo   - PostgreSQL client (pg_dump)
echo   - Supabase password
echo   - Scheduled task (daily/weekly)
echo.
pause
