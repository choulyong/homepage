@echo off
REM Setup Automated Backup Schedule
REM Creates Windows Task Scheduler task for automatic backups

echo =====================================
echo   Setup Automated Backup Schedule
echo =====================================
echo.
echo This will create a scheduled task to run backups:
echo   - Daily at 2:00 AM
echo   - Includes database and files
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/2] Creating daily backup task...
schtasks /create /tn "MetalDragon-DailyBackup" /tr "C:\Vibe Coding\Homepage\metaldragon\scripts\backup-full.bat" /sc daily /st 02:00 /ru "%USERNAME%" /rl highest /f
if errorlevel 1 (
    echo [ERROR] Failed to create backup task
    pause
    exit /b 1
)
echo   [OK] Daily backup task created

echo.
echo [2/2] Creating weekly full backup task...
schtasks /create /tn "MetalDragon-WeeklyBackup" /tr "C:\Vibe Coding\Homepage\metaldragon\scripts\backup-full.bat" /sc weekly /d SUN /st 03:00 /ru "%USERNAME%" /rl highest /f
if errorlevel 1 (
    echo [ERROR] Failed to create weekly backup task
    pause
    exit /b 1
)
echo   [OK] Weekly backup task created

echo.
echo =====================================
echo   Backup Schedule Setup Complete!
echo =====================================
echo.
echo Scheduled Tasks:
echo   - MetalDragon-DailyBackup: Every day at 2:00 AM
echo   - MetalDragon-WeeklyBackup: Every Sunday at 3:00 AM
echo.
echo To view/manage tasks:
echo   - Open Task Scheduler (taskschd.msc)
echo   - Look for "MetalDragon-DailyBackup" and "MetalDragon-WeeklyBackup"
echo.
echo To remove backup schedule:
echo   - Run: scripts\remove-backup-schedule.bat
echo.
pause
