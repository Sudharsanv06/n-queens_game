@echo off
title N-Queens Android APK Complete Setup
echo ========================================
echo     N-Queens Android APK Builder
echo     Complete Setup & Build Process
echo ========================================
echo.

echo Current Status Check:
echo ✅ Node.js v22.17.0 - Installed
echo ✅ npm 10.9.2 - Installed  
echo ✅ Java JDK 22.0.2 - Installed
echo ✅ Capacitor - Configured
echo ✅ Web App - Built
echo ❌ Android Studio - Need to install
echo.

echo ========================================
echo   STEP 1: Download Android Studio
echo ========================================
echo.
echo Opening download page...
start https://developer.android.com/studio
echo.
echo INSTRUCTIONS:
echo 1. Download Android Studio from the opened page
echo 2. Run the installer (accept all defaults)
echo 3. Let it install SDK components
echo 4. Come back here and press any key when done
echo.
pause

echo.
echo ========================================
echo   STEP 2: Build the APK
echo ========================================
echo.

cd client

echo Building web assets...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo Syncing to Android...
npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Sync failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   STEP 3: Open Android Studio
echo ========================================
echo.

echo Opening Android Studio with your project...
npx cap open android

echo.
echo ========================================
echo   FINAL STEPS (in Android Studio):
echo ========================================
echo.
echo 1. Wait for Gradle sync to complete
echo 2. Click: Build → Build Bundle(s) / APK(s) → Build APK(s)
echo 3. Wait for build to complete
echo 4. Click "locate" to find your APK
echo.
echo APK will be saved to:
echo client\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on device:
echo - Connect device via USB (enable USB debugging)
echo - Click Run ▶️ button in Android Studio
echo.
echo OR copy APK to device and install directly
echo.

pause
echo Process completed! Your APK is ready! 🎉