@echo off
title Android Studio Direct Download & Install
echo ========================================
echo   Android Studio Direct Download
echo ========================================
echo.

echo This script will help you download and install Android Studio manually.
echo.
echo Step 1: Opening Android Studio download page...
start https://developer.android.com/studio

echo.
echo Step 2: Download Instructions:
echo 1. Click "Download Android Studio"
echo 2. Accept the terms and conditions
echo 3. Download will start automatically
echo 4. Run the installer when download completes
echo.
echo Step 3: Installation Instructions:
echo 1. Run the downloaded installer
echo 2. Choose "Standard" installation
echo 3. Accept all default settings
echo 4. Let it download SDK components
echo.

echo Please complete the installation and then press any key to continue...
pause

echo.
echo Step 4: Setting up environment variables...
echo.
echo Opening System Properties to set ANDROID_HOME...
rundll32 sysdm.cpl,EditEnvironmentVariables

echo.
echo Please set these environment variables:
echo.
echo 1. ANDROID_HOME = C:\Users\%USERNAME%\AppData\Local\Android\Sdk
echo    (or wherever Android SDK is installed)
echo.
echo 2. Add to PATH:
echo    %%ANDROID_HOME%%\platform-tools
echo    %%ANDROID_HOME%%\tools
echo    %%ANDROID_HOME%%\cmdline-tools\latest\bin
echo.

echo After setting environment variables, please restart your computer.
echo.
echo Then run: build-android-apk.bat
echo.
pause