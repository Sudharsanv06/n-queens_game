@echo off
title Android Command Line Tools Setup
echo ========================================
echo   Android Command Line Tools Setup
echo ========================================
echo.

set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin"

echo Creating Android SDK directory...
mkdir "%ANDROID_HOME%" 2>nul

echo Downloading Android Command Line Tools...
echo.
echo Please download manually from:
echo https://developer.android.com/studio#cmdline-tools
echo.
echo Instructions:
echo 1. Download "Command line tools only"
echo 2. Extract to: %ANDROID_HOME%\cmdline-tools\latest\
echo 3. Run this script again
echo.

if not exist "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" (
    echo Command line tools not found. Please install them first.
    pause
    exit /b 1
)

echo Installing Android SDK packages...
echo.

echo Installing platform-tools...
"%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "platform-tools"

echo Installing build-tools...
"%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "build-tools;34.0.0"

echo Installing Android platform...
"%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "platforms;android-34"

echo.
echo ========================================
echo Android SDK setup completed!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your computer
echo 2. Run: build-android-apk.bat
echo.
pause