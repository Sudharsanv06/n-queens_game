@echo off
echo Starting MongoDB for N-Queens Game...

REM Try to start MongoDB service
net start MongoDB 2>nul
if %errorlevel% == 0 (
    echo MongoDB service started successfully!
    goto :start_server
)

REM If service start fails, try to run mongod directly
echo MongoDB service not available, trying to start mongod directly...

REM Check if mongod is in PATH
where mongod >nul 2>&1
if %errorlevel% == 0 (
    echo Starting mongod...
    start "MongoDB" mongod --dbpath "C:\data\db" --port 27017
    timeout /t 3 /nobreak >nul
    goto :start_server
) else (
    echo mongod not found in PATH. Please ensure MongoDB is installed.
    echo You can download MongoDB from: https://www.mongodb.com/try/download/community
    echo.
    echo Alternative: Create a data directory and run:
    echo mkdir C:\data\db
    echo mongod --dbpath "C:\data\db"
    pause
    exit /b 1
)

:start_server
echo Starting N-Queens backend server...
cd /d "%~dp0"
npm start

pause