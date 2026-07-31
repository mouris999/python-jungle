@echo off
chcp 65001 >nul 2>&1
cd /d "C:\Users\zack1\Downloads\python\python-jungle"

echo ========================================
echo   PYTHON JUNGLE - Gamified Learning
echo ========================================
echo.
echo Server running at http://localhost:8090
echo Open your browser to that address.
echo Press Ctrl+C to stop the server.
echo.
timeout /t 2 >nul

python -m http.server 8090 --bind 127.0.0.1