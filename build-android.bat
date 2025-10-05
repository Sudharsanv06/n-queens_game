@echo off
echo ====================================================
echo     Ultra Professional N-Queens Game Builder
echo     Method 2: Native Android APK Creation
echo ====================================================
echo.

echo 🚀 Setting up Android development environment...
echo.

REM Check if Android Studio is installed
if not exist "%LOCALAPPDATA%\Android\Sdk" (
    echo ❌ Android SDK not found!
    echo.
    echo Please install Android Studio first:
    echo https://developer.android.com/studio
    echo.
    echo After installation, set these environment variables:
    echo ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk
    echo ANDROID_SDK_ROOT = %LOCALAPPDATA%\Android\Sdk
    echo.
    echo Add to PATH:
    echo %LOCALAPPDATA%\Android\Sdk\platform-tools
    echo %LOCALAPPDATA%\Android\Sdk\tools
    echo.
    pause
    exit /b 1
)

echo ✅ Android SDK found at: %LOCALAPPDATA%\Android\Sdk
echo.

REM Set environment variables for current session
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools

echo 🔧 Building the web application...
cd client
call npm run build
if errorlevel 1 (
    echo ❌ Web build failed!
    pause
    exit /b 1
)

echo ✅ Web build completed successfully!
echo.

echo 🔄 Syncing Capacitor with Android...
call npx cap sync android
if errorlevel 1 (
    echo ❌ Capacitor sync failed!
    pause
    exit /b 1
)

echo ✅ Capacitor sync completed!
echo.

echo 📱 Attempting to build Android APK...
cd android
call gradlew assembleDebug
if errorlevel 1 (
    echo ❌ Android build failed!
    echo.
    echo Common solutions:
    echo 1. Install Android Studio and SDK
    echo 2. Set ANDROID_HOME environment variable
    echo 3. Accept SDK licenses: 
    echo    "%ANDROID_HOME%\tools\bin\sdkmanager" --licenses
    echo.
    echo Opening Android Studio for manual build...
    cd ..
    call npx cap open android
    pause
    exit /b 1
)

echo.
echo 🎉 SUCCESS! Android APK built successfully!
echo.
echo 📱 APK Location: 
echo %cd%\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 📋 Next Steps:
echo 1. Transfer APK to your Android device
echo 2. Enable "Unknown Sources" in device settings
echo 3. Install APK and enjoy your premium N-Queens game!
echo.
echo 🎮 Features in your native app:
echo ✨ Ultra-premium glass morphism UI
echo ✨ Neon glow animations and effects
echo ✨ Professional color scheme
echo ✨ Touch-optimized controls
echo ✨ Offline gameplay capability
echo ✨ Native Android performance
echo.

echo Opening file explorer to APK location...
explorer "%cd%\app\build\outputs\apk\debug"

pause
echo.
echo 🚀 Want to open Android Studio for advanced building?
choice /c YN /m "Open Android Studio (Y/N)"
if errorlevel 2 goto :end
if errorlevel 1 (
    cd ..
    call npx cap open android
)

:end
echo.
echo 👑 Thank you for using the Ultra Professional N-Queens Game Builder!
echo 🌟 Your native Android app is ready to dominate the chess world!
pause