@echo off
title Force Racing // Pit Wall 32-bit (x86)
cd /d "%~dp0"

if exist "%~dp0ForceRacing-PC-x86.exe" (
    start "" "%~dp0ForceRacing-PC-x86.exe" %*
) else if exist "%~dp0ForceRacing-x86.exe" (
    start "" "%~dp0ForceRacing-x86.exe" %*
) else if exist "%~dp0python\python.exe" (
    "%~dp0python\python.exe" desktop_launcher.py %*
) else (
    where python >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        python desktop_launcher.py %*
    ) else (
        echo [ERROR] No 32-bit launcher binary or Python runtime detected.
        echo Please ensure ForceRacing-PC-x86.exe or python\python.exe exists.
        pause
    )
)
