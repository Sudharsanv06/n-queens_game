# 🚀 Complete Android APK Setup Guide

## Prerequisites Status ✅
- ✅ Node.js v22.17.0 (Excellent!)
- ✅ npm 10.9.2 (Latest!)  
- ✅ Java JDK 22.0.2 (Excellent!)
- ❌ Android Studio (Need to install)
- ❌ Android SDK (Need to install)

## 🎯 Two Installation Methods

### Method 1: Automated Installation (Recommended)
```bash
# Run this script to automatically install everything
./auto-install-android.bat
```

### Method 2: Manual Installation
1. Download Android Studio from: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio → More Actions → SDK Manager
4. Install Android SDK (latest version)
5. Set environment variables (see below)

## 🔧 Environment Variables Setup

### Windows PowerShell (Run as Administrator):
```powershell
# Set ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "Machine")

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$androidPaths = ";$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\tools;$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin"
[Environment]::SetEnvironmentVariable("PATH", "$currentPath$androidPaths", "Machine")
```

### Windows Command Prompt (Run as Administrator):
```cmd
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk" /M
setx PATH "%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools;%LOCALAPPDATA%\Android\Sdk\tools;%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin" /M
```

## 🏗️ Building Process

### Quick Build (One Command):
```bash
# After Android Studio is installed, run:
./build-android-apk.bat
```

### Manual Step-by-Step:
```bash
cd client

# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. In Android Studio: Build → Build APK(s)
```

## 📱 Installing APK on Device

### Method 1: Via Android Studio
1. Connect device via USB
2. Enable USB Debugging on device
3. Click Run ▶️ button in Android Studio

### Method 2: Via ADB
```bash
# Check device connection
adb devices

# Install APK
adb install -r client/android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 3: Direct Install
1. Copy APK file to device
2. Allow "Install from unknown sources"
3. Tap APK file to install

## 🎮 APK Locations

### Debug APK:
```
client/android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (if built):
```
client/android/app/build/outputs/apk/release/app-release.apk
```

## 🔍 Troubleshooting

### Common Issues:

1. **"adb not found"**
   - Add `%ANDROID_HOME%\platform-tools` to PATH
   - Restart terminal

2. **"ANDROID_HOME not set"**
   - Set environment variable to SDK location
   - Restart computer

3. **"Gradle build failed"**
   - Open Android Studio
   - Let it download dependencies
   - Try build again

4. **"Device not detected"**
   - Enable USB Debugging
   - Install device drivers
   - Use `adb devices` to verify

## ⚡ Quick Commands Reference

```bash
# Check prerequisites
node --version
npm --version  
java -version
echo $env:ANDROID_HOME    # PowerShell
echo %ANDROID_HOME%       # CMD

# Build and sync
npm run build
npx cap sync android
npx cap open android

# ADB commands
adb devices
adb install -r path/to/app.apk
adb uninstall com.nqueens.premium.game
```

## 🎯 Next Steps

1. **Install Android Studio**: Run `auto-install-android.bat`
2. **Restart Computer**: After installation
3. **Build APK**: Run `build-android-apk.bat`
4. **Install on Device**: Use Android Studio or ADB
5. **Play Game**: Launch N-Queens Premium! 🎮

---

**Need Help?** All scripts are ready to run. Start with `auto-install-android.bat` for automated setup!