@echo off
title MyHealthChain Dev Server
echo ===================================================
echo Starting MyHealthChain Development Environment...
echo ===================================================

cd /d "%~dp0"

echo [1/2] Starting Backend (Spring Boot)...
start "MyHealthChain Backend" cmd /k "cd backend && mvnw.cmd spring-boot:run"

echo [2/2] Starting Frontend (Vite/React)...
start "MyHealthChain Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers have been launched in separate windows!
echo Press any key to close this launcher...
pause >nul