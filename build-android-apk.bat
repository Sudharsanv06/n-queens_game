@echo off
title N-Queens Android APK Builder
echo ========================================
echo     N-Queens Android APK Builder
echo ========================================
echo.

cd /d "%~dp0\client"

echo Step 1: Checking prerequisites...
echo.

echo Checking Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js 16+ first.
    pause
    exit /b 1
) else (
    echo [OK] Node.js found: 
    node --version
)

echo.
echo Checking Java JDK...
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java JDK not found. Please install JDK 11+ first.
    pause
    exit /b 1
) else (
    echo [OK] Java JDK found:
    java -version 2>&1 | findstr "version"
)

echo.
echo Checking Android environment...
if "%ANDROID_HOME%"=="" (
    echo [WARNING] ANDROID_HOME not set. Trying default location...
    set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
)

if not exist "%ANDROID_HOME%" (
    echo [ERROR] Android SDK not found at: %ANDROID_HOME%
    echo Please run auto-install-android.bat first to install Android Studio.
    pause
    exit /b 1
) else (
    echo [OK] Android SDK found at: %ANDROID_HOME%
)

echo.
echo Step 2: Building web assets...
echo.
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Web build failed!
    pause
    exit /b 1
)
echo [OK] Web build completed!

echo.
echo Step 3: Syncing to Android project...
echo.
npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Capacitor sync failed!
    pause
    exit /b 1
)
echo [OK] Capacitor sync completed!

echo.
echo Step 4: Building Android APK...
echo.
cd android
echo Building debug APK...
gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] APK build failed!
    echo Make sure Android Studio and Gradle are properly installed.
    pause
    exit /b 1
)

echo.
echo ========================================
echo     APK BUILD SUCCESSFUL! 🎉
echo ========================================
echo.
echo Debug APK location:
echo %CD%\app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on device:
echo 1. Enable USB debugging on your Android device
echo 2. Connect device via USB
echo 3. Run: adb install -r app\build\outputs\apk\debug\app-debug.apk
echo.
echo Or use Android Studio:
echo 1. Run: npx cap open android
echo 2. Click Run button in Android Studio
echo.
pause

echo.
echo Would you like to open Android Studio now? (y/n)
set /p choice=
if /i "%choice%"=="y" (
    cd ..
    npx cap open android
)

echo.
echo Build process completed!
pause