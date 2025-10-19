# N-Queens Game - Environment Secret Generator (PowerShell)
# Generates cryptographically secure secrets for production deployment

Write-Host "🔐 N-Queens Game - Secure Environment Generator" -ForegroundColor Cyan
Write-Host ""

# Function to generate secure random string
function New-SecureSecret {
    param([int]$Length = 64)
    
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    
    return [System.Convert]::ToHexString($bytes).ToLower()
}

# Function to generate base64 secret
function New-Base64Secret {
    param([int]$Length = 32)
    
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    
    return [System.Convert]::ToBase64String($bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=')
}

# Generate secrets
$jwtSecret = New-SecureSecret -Length 64
$sessionSecret = New-SecureSecret -Length 64
$vapidPrivateKey = New-Base64Secret -Length 32
$apiKey = New-SecureSecret -Length 32

Write-Host "✅ Generated secure secrets:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Host "JWT_SECRET=$($jwtSecret.Substring(0, 20))..." -ForegroundColor Yellow
Write-Host "SESSION_SECRET=$($sessionSecret.Substring(0, 20))..." -ForegroundColor Yellow
Write-Host "VAPID_PRIVATE_KEY=$($vapidPrivateKey.Substring(0, 20))..." -ForegroundColor Yellow
Write-Host "API_KEY=$($apiKey.Substring(0, 20))..." -ForegroundColor Yellow

Write-Host ""
Write-Host "📋 Copy these to your production environment:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White
Write-Host "SESSION_SECRET=$sessionSecret" -ForegroundColor White
Write-Host "VAPID_PRIVATE_KEY=$vapidPrivateKey" -ForegroundColor White
Write-Host "API_KEY=$apiKey" -ForegroundColor White

# Create production environment file
$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
$productionEnv = @"
# PRODUCTION ENVIRONMENT - Generated $timestamp
# WARNING: Keep these secrets secure and never commit to version control!

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/n-queens-game-prod?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=production

# Security Secrets (GENERATED - DO NOT CHANGE)
JWT_SECRET=$jwtSecret
SESSION_SECRET=$sessionSecret

# CORS Configuration (UPDATE WITH YOUR DOMAINS)
CLIENT_ORIGIN=https://your-domain.com,https://www.your-domain.com,capacitor://localhost

# Email Configuration (CONFIGURE AS NEEDED)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-nqueens-app@gmail.com
EMAIL_PASS=your-gmail-app-password

# Push Notifications (CONFIGURE AS NEEDED)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=$vapidPrivateKey
NOTIFICATION_EMAIL=notifications@your-domain.com

# Rate Limiting (Production Settings)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50

# Additional Security
TRUST_PROXY=true
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=strict

# Performance
COMPRESSION_LEVEL=6
DB_MAX_CONNECTIONS=10
"@

# Save to file
$envPath = Join-Path $PSScriptRoot ".env.production.generated"
$productionEnv | Out-File -FilePath $envPath -Encoding utf8

Write-Host ""
Write-Host "💾 Production environment saved to: $envPath" -ForegroundColor Green

Write-Host ""
Write-Host "🚨 SECURITY REMINDERS:" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "1. Never commit this file to version control" -ForegroundColor Yellow
Write-Host "2. Store secrets in your deployment platform securely" -ForegroundColor Yellow
Write-Host "3. Update MONGO_URI with your actual database connection" -ForegroundColor Yellow
Write-Host "4. Update CLIENT_ORIGIN with your production domains" -ForegroundColor Yellow
Write-Host "5. Configure email settings if using notifications" -ForegroundColor Yellow
Write-Host "6. Generate VAPID keys for push notifications if needed" -ForegroundColor Yellow

Write-Host ""
Write-Host "🔗 Useful Links:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "MongoDB Atlas: https://cloud.mongodb.com/"
Write-Host "VAPID Key Generator: https://web-push-codelab.glitch.me/"
Write-Host "Gmail App Passwords: https://support.google.com/accounts/answer/185833"

Write-Host ""
Write-Host "✅ Environment generation complete!" -ForegroundColor Green
Write-Host "🚀 Your N-Queens game is ready for secure production deployment!" -ForegroundColor Magenta

# Pause to allow user to copy secrets
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")