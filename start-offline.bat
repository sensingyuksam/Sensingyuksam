@echo off
rem Double-click on Windows to run Sensing Yuksam without internet.
cd /d "%~dp0"
echo Sensing Yuksam is running at http://localhost:8000
echo Leave this window open. Close it to stop.
start /b cmd /c "timeout /t 2 >nul & start http://localhost:8000"
python -m http.server 8000 || py -m http.server 8000
