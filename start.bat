@echo off
chcp 65001 >nul
title IMTEN setup
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -NoExit -File "%~dp0first-setup.ps1"
echo.
echo ========================================
echo Script finished. Press any key to close.
echo ========================================
pause >nul
