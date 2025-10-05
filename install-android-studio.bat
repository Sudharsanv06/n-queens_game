@echo off
echo ========================================
echo   Android Studio Installation Script
echo ========================================
echo.

echo Step 1: Downloading Android Studio...
echo Please download Android Studio manually from:
echo https://developer.android.com/studio
echo.
echo After downloading, install it and continue with this script.
echo.

pause
echo.

echo Step 2: Setting up environment variables...
echo.
echo Please set the following environment variables:
echo.
echo 1. ANDROID_HOME: Point to your Android SDK location
echo    Default: C:\Users\%USERNAME%\AppData\Local\Android\Sdk
echo.
echo 2. Add to PATH:
echo    %ANDROID_HOME%\platform-tools
echo    %ANDROID_HOME%\tools
echo    %ANDROID_HOME%\build-tools\[version]
echo.

echo Step 3: Opening System Environment Variables...
echo Press any key to open System Properties...
pause
rundll32 sysdm.cpl,EditEnvironmentVariables

echo.
echo Step 4: Restart required after setting environment variables
echo Please restart your computer after setting the environment variables.
echo.

echo ========================================
echo Installation script completed!
echo ========================================
pause