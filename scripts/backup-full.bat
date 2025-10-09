@echo off
REM Full Backup Script
REM Runs both database and files backup

echo =====================================
echo   MetalDragon Full Backup
echo =====================================
echo.
echo This will backup:
echo   1. Database (Supabase)
echo   2. Uploaded Files
echo.
pause

echo.
echo [1/2] Running Database Backup...
call "%~dp0backup-database.bat"

echo.
echo [2/2] Running Files Backup...
call "%~dp0backup-files.bat"

echo.
echo =====================================
echo   Full Backup Complete!
echo =====================================
echo.
echo Backup Location: C:\Vibe Coding\Homepage\metaldragon\backups
echo.
pause
