@echo off
echo 📱 N-Queens Game - Mobile Setup Assistant
echo ========================================

REM Get computer's IP address
echo 🔍 Finding your computer's IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP: =!
    goto :found_ip
)

:found_ip
echo ✅ Your computer's IP address: %IP%

echo.
echo 🚀 Starting N-Queens Game servers...
echo.

REM Start the backend server
echo 📡 Starting backend server...
start "N-Queens Backend" cmd /c "cd server && npm start"

REM Wait a moment for server to start
timeout /t 3 >nul

REM Start the frontend with network access
echo 🎮 Starting frontend with mobile access...
start "N-Queens Frontend" cmd /c "cd client && npx vite --host 0.0.0.0"

REM Wait for frontend to start
timeout /t 5 >nul

echo.
echo 🎉 Setup Complete!
echo ================

echo.
echo 📱 TO ACCESS ON YOUR MOBILE DEVICE:
echo ====================================
echo.
echo 1️⃣ Make sure your phone is on the SAME WiFi as this computer
echo.
echo 2️⃣ Open your mobile browser (Chrome/Safari)
echo.
echo 3️⃣ Go to: http://%IP%:5173
echo.
echo 4️⃣ Enjoy playing N-Queens Game on your phone! 🎮
echo.

echo 📋 ADDITIONAL OPTIONS:
echo ======================
echo.
echo 🌐 Web Access: http://%IP%:5173
echo 🖥️  Local Access: http://localhost:5173
echo 📡 API Server: http://%IP%:5000
echo.

echo 📱 TO BUILD NATIVE APP:
echo =======================
echo 1. Run: cd client
echo 2. Run: npm run build
echo 3. Run: npx cap sync android
echo 4. Run: npx cap open android
echo 5. In Android Studio: Build → Build APK
echo.

echo 💡 TIP: Add to your phone's home screen for app-like experience!
echo.
echo Press any key to open the game in your browser...
pause >nul

REM Open the game in default browser
start http://localhost:5173

echo.
echo ✅ Game opened in browser!
echo 📱 Now access http://%IP%:5173 on your mobile device
echo.
pause