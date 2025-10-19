# Android Environment Setup Script
# Run this as Administrator in PowerShell

Write-Host "========================================" -ForegroundColor Green
Write-Host "   Android Environment Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERROR] This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please right-click PowerShell and 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Setting up Android environment variables..." -ForegroundColor Yellow

# Set ANDROID_HOME
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
Write-Host "Setting ANDROID_HOME to: $androidHome" -ForegroundColor Cyan

try {
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "Machine")
    Write-Host "[OK] ANDROID_HOME set successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to set ANDROID_HOME: $_" -ForegroundColor Red
}

# Add Android tools to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$androidPaths = @(
    "$androidHome\platform-tools",
    "$androidHome\tools",
    "$androidHome\cmdline-tools\latest\bin",
    "$androidHome\build-tools"
)

Write-Host "Adding Android tools to PATH..." -ForegroundColor Cyan

foreach ($path in $androidPaths) {
    if ($currentPath -notlike "*$path*") {
        $currentPath += ";$path"
        Write-Host "Added: $path" -ForegroundColor Green
    } else {
        Write-Host "Already in PATH: $path" -ForegroundColor Yellow
    }
}

try {
    [Environment]::SetEnvironmentVariable("PATH", $currentPath, "Machine")
    Write-Host "[OK] PATH updated successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to update PATH: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Please restart your computer for changes to take effect." -ForegroundColor Yellow
Write-Host ""
Write-Host "After restart, run: build-android-apk.bat" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"