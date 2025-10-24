@echo off
echo ========================================
echo Adding tracks to all albums...
echo ========================================
echo.

:loop
echo Running iteration...
node scripts/add-album-tracks.js
if errorlevel 1 goto error

echo.
echo Press Ctrl+C to stop, or any key to continue...
pause > nul
goto loop

:error
echo.
echo Error occurred! Check the log above.
pause
