@echo off
title Force Racing // Pit Wall Operations
color 0c
echo ========================================================
echo        FORCE RACING // TEAM OPERATIONS PIT WALL
echo               KITS WARANGAL (FLASK + SQLITE)
echo ========================================================
echo.
echo Launching Force Racing Operations on http://localhost:5000 ...
echo Press Ctrl+C in this terminal window to stop the server.
echo.

set "APP_DIR="
if exist "%~dp0forceracing-app\app.py" (
    set "APP_DIR=%~dp0forceracing-app"
) else if exist "%~dp0app.py" (
    set "APP_DIR=%~dp0"
) else if exist "C:\Users\ijk11\forceracing-app\app.py" (
    set "APP_DIR=C:\Users\ijk11\forceracing-app"
) else if exist "C:\Users\ijk11\Desktop\forceracing-app\app.py" (
    set "APP_DIR=C:\Users\ijk11\Desktop\forceracing-app"
)

if "%APP_DIR%"=="" (
    echo [ERROR] Could not locate forceracing-app directory containing app.py.
    echo Searched:
    echo   - %~dp0forceracing-app
    echo   - %~dp0
    echo   - C:\Users\ijk11\forceracing-app
    echo   - C:\Users\ijk11\Desktop\forceracing-app
    pause
    exit /b 1
)

cd /d "%APP_DIR%"

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not available in the system PATH.
    echo Please install Python 3.10+ and add it to your system PATH.
    pause
    exit /b 1
)

start http://localhost:5000
python app.py
pause
