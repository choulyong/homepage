@echo off
REM Files Backup Script
REM Backs up uploaded files and images

setlocal EnableDelayedExpansion

REM Configuration
set SOURCE_DIR=C:\Vibe Coding\Homepage\metaldragon\public\uploads
set BACKUP_DIR=C:\Vibe Coding\Homepage\metaldragon\backups\files
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FOLDER=%BACKUP_DIR%\uploads_%TIMESTAMP%

echo =====================================
echo   Files Backup
echo =====================================
echo.
echo Source: %SOURCE_DIR%
echo Destination: %BACKUP_FOLDER%
echo.

REM 백업 디렉토리 생성
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [1/3] Checking source directory...
if not exist "%SOURCE_DIR%" (
    echo [ERROR] Source directory does not exist!
    pause
    exit /b 1
)

REM 파일 개수 확인
set FILE_COUNT=0
for /r "%SOURCE_DIR%" %%f in (*) do set /a FILE_COUNT+=1
echo   Found %FILE_COUNT% files
echo.

echo [2/3] Creating backup...
xcopy "%SOURCE_DIR%" "%BACKUP_FOLDER%" /E /I /H /Y >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Backup failed!
    pause
    exit /b 1
)
echo   [OK] Files backed up
echo.

echo [3/3] Cleaning old backups (30+ days)...
forfiles /p "%BACKUP_DIR%" /d -30 /c "cmd /c if @isdir==TRUE rmdir /s /q @path" 2>nul
if errorlevel 1 (
    echo   No old backups to delete
) else (
    echo   Old backups deleted
)
echo.

REM 백업 크기 확인
echo Backup Details:
echo   Location: %BACKUP_FOLDER%
for /f "tokens=3" %%a in ('dir "%BACKUP_FOLDER%" ^| find "File(s)"') do echo   Files: %%a
echo.

echo =====================================
echo   Backup Complete!
echo =====================================
echo.
pause
