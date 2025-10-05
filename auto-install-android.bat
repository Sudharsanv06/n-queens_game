@echo off
echo ========================================
echo   Automated Android Studio Installation
echo   Using Chocolatey Package Manager
echo ========================================
echo.

echo Checking if Chocolatey is installed...
choco --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installing Chocolatey...
    @powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    echo Please restart this script after Chocolatey installation completes.
    pause
    exit /b
)

echo Chocolatey found! Installing Android Studio and dependencies...
echo.

echo Step 1: Installing Android Studio...
choco install androidstudio -y

echo Step 2: Installing Android SDK Command-line tools...
choco install android-sdk -y

echo Step 3: Setting up environment variables automatically...
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk" /M
setx PATH "%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools;%LOCALAPPDATA%\Android\Sdk\tools;%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin" /M

echo.
echo ========================================
echo Installation completed!
echo Please restart your computer to apply environment variable changes.
echo ========================================
echo.
echo After restart, run: build-android-apk.bat
echo.
pause