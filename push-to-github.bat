@echo off
echo ========================================
echo GitHub Repository Push Script
echo ========================================
echo.

REM Add remote origin
git remote add origin https://github.com/choulyong/metaldragon.git 2>nul

REM Check if remote was added
git remote -v | findstr origin >nul
if %errorlevel% neq 0 (
    echo Error: Failed to add remote origin
    pause
    exit /b 1
)

echo Remote origin configured:
git remote -v
echo.

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin master

if %errorlevel% eq 0 (
    echo.
    echo ========================================
    echo Success! Code pushed to GitHub
    echo Repository: https://github.com/choulyong/metaldragon
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Push failed. Please check your credentials.
    echo ========================================
)

echo.
pause
