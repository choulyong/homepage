@echo off
REM Remove Automated Backup Schedule

echo =====================================
echo   Remove Backup Schedule
echo =====================================
echo.
echo This will remove automated backup tasks:
echo   - MetalDragon-DailyBackup
echo   - MetalDragon-WeeklyBackup
echo.
pause

echo.
echo [1/2] Removing daily backup task...
schtasks /delete /tn "MetalDragon-DailyBackup" /f >nul 2>&1
echo   [OK] Daily backup task removed

echo.
echo [2/2] Removing weekly backup task...
schtasks /delete /tn "MetalDragon-WeeklyBackup" /f >nul 2>&1
echo   [OK] Weekly backup task removed

echo.
echo =====================================
echo   Backup Schedule Removed
echo =====================================
echo.
pause
