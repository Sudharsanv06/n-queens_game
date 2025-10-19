# N-Queens Game - Automated Production Deployment Script
# This script helps automate the deployment process

param(
    [string]$Platform = "railway",
    [string]$MongoURI = "",
    [string]$FrontendDomain = "",
    [string]$BackendDomain = ""
)

Write-Host "🚀 N-Queens Game - Production Deployment Automation" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Validate we're in the right directory
if (-not (Test-Path "server\package.json") -or -not (Test-Path "client\package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Expected structure: project-root/server/ and project-root/client/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Project structure validated" -ForegroundColor Green

# Step 1: Check dependencies
Write-Host ""
Write-Host "🔍 Step 1: Checking deployment dependencies..." -ForegroundColor Yellow

$missingTools = @()

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    $missingTools += "Node.js"
}

# Check for npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    $missingTools += "npm"
}

# Check for git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    $missingTools += "Git"
}

if ($missingTools.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Missing required tools: $($missingTools -join ', ')" -ForegroundColor Red
    Write-Host "Please install missing tools and try again." -ForegroundColor Yellow
    exit 1
}

# Step 2: Environment Configuration
Write-Host ""
Write-Host "🔧 Step 2: Environment Configuration" -ForegroundColor Yellow

$secrets = @{}

# Read generated secrets if available
if (Test-Path "server\.env.production.generated") {
    Write-Host "✅ Found generated production secrets" -ForegroundColor Green
    $envContent = Get-Content "server\.env.production.generated" -Raw
    if ($envContent -match 'JWT_SECRET=([^\r\n]+)') {
        $secrets['JWT_SECRET'] = $matches[1]
    }
    if ($envContent -match 'SESSION_SECRET=([^\r\n]+)') {
        $secrets['SESSION_SECRET'] = $matches[1]
    }
} else {
    Write-Host "⚠️  No generated secrets found. Running secret generator..." -ForegroundColor Yellow
    Set-Location server
    node generate-secrets.js
    Set-Location ..
}

# Get MongoDB URI
if (-not $MongoURI) {
    Write-Host ""
    Write-Host "📋 MongoDB Atlas Setup Required:" -ForegroundColor Cyan
    Write-Host "1. Go to https://cloud.mongodb.com/"
    Write-Host "2. Create a free cluster"
    Write-Host "3. Create a database user"
    Write-Host "4. Whitelist IP addresses (0.0.0.0/0 for now)"
    Write-Host "5. Get your connection string"
    Write-Host ""
    $MongoURI = Read-Host "Enter your MongoDB Atlas connection string"
}

# Step 3: Frontend Deployment Preparation
Write-Host ""
Write-Host "🎨 Step 3: Preparing Frontend for Deployment" -ForegroundColor Yellow

# Create frontend production environment
$frontendEnv = @"
# Frontend Production Environment
VITE_APP_NAME=N-Queens Game
VITE_ENABLE_PWA=true
VITE_APP_VERSION=1.0.0
"@

if ($BackendDomain) {
    $frontendEnv += "`nVITE_API_URL=https://$BackendDomain"
    $frontendEnv += "`nVITE_SOCKET_URL=https://$BackendDomain"
}

$frontendEnv | Out-File -FilePath "client\.env.production" -Encoding utf8
Write-Host "✅ Created client/.env.production" -ForegroundColor Green

# Step 4: Backend Environment Setup
Write-Host ""
Write-Host "🚀 Step 4: Preparing Backend Environment" -ForegroundColor Yellow

$backendEnv = @"
# Backend Production Environment
NODE_ENV=production
PORT=5000

# Generated Secrets
JWT_SECRET=$($secrets['JWT_SECRET'])
SESSION_SECRET=$($secrets['SESSION_SECRET'])

# Database
MONGO_URI=$MongoURI

# Security
TRUST_PROXY=true
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=strict

# Performance
COMPRESSION_LEVEL=6
DB_MAX_CONNECTIONS=10

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50
"@

if ($FrontendDomain) {
    $backendEnv += "`nCLIENT_ORIGIN=https://$FrontendDomain,capacitor://localhost"
}

$backendEnv | Out-File -FilePath "server\.env.production.deploy" -Encoding utf8
Write-Host "✅ Created server/.env.production.deploy" -ForegroundColor Green

# Step 5: Platform-specific deployment
Write-Host ""
Write-Host "🌐 Step 5: Platform-specific Deployment Instructions" -ForegroundColor Yellow

switch ($Platform.ToLower()) {
    "railway" {
        Write-Host ""
        Write-Host "🚂 Railway Deployment Instructions:" -ForegroundColor Green
        Write-Host "===================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "1. Go to https://railway.app and sign up with GitHub" -ForegroundColor Cyan
        Write-Host "2. Click 'New Project' → 'Deploy from GitHub repo'" -ForegroundColor Cyan
        Write-Host "3. Select your repository and choose 'server' as root directory" -ForegroundColor Cyan
        Write-Host "4. Add these environment variables in Railway dashboard:" -ForegroundColor Cyan
        Write-Host ""
        
        # Display environment variables
        Get-Content "server\.env.production.deploy" | ForEach-Object {
            if ($_ -and -not $_.StartsWith('#')) {
                Write-Host "   $_" -ForegroundColor White
            }
        }
        
        Write-Host ""
        Write-Host "5. Railway will automatically deploy your backend" -ForegroundColor Cyan
        Write-Host "6. Copy your Railway URL (e.g., https://yourapp.railway.app)" -ForegroundColor Cyan
    }
    
    "heroku" {
        Write-Host ""
        Write-Host "🔥 Heroku Deployment Commands:" -ForegroundColor Green
        Write-Host "==============================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Run these commands:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "heroku login" -ForegroundColor White
        Write-Host "heroku create your-nqueens-backend" -ForegroundColor White
        Write-Host ""
        
        # Generate Heroku config commands
        Get-Content "server\.env.production.deploy" | ForEach-Object {
            if ($_ -and -not $_.StartsWith('#') -and $_.Contains('=')) {
                $key = $_.Split('=')[0]
                $value = $_.Substring($_.IndexOf('=') + 1)
                Write-Host "heroku config:set $key=`"$value`"" -ForegroundColor White
            }
        }
        
        Write-Host ""
        Write-Host "git subtree push --prefix server heroku main" -ForegroundColor White
    }
    
    "vercel" {
        Write-Host ""
        Write-Host "⚡ Vercel Deployment Commands:" -ForegroundColor Green
        Write-Host "=============================" -ForegroundColor Green
        Write-Host ""
        Write-Host "cd client" -ForegroundColor White
        Write-Host "npm install -g vercel" -ForegroundColor White
        Write-Host "vercel login" -ForegroundColor White
        Write-Host "vercel --prod" -ForegroundColor White
    }
}

# Step 6: Frontend Deployment
if ($Platform.ToLower() -ne "vercel") {
    Write-Host ""
    Write-Host "🎨 Frontend Deployment (Vercel):" -ForegroundColor Yellow
    Write-Host "=================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "cd client" -ForegroundColor White
    Write-Host "npm install -g vercel" -ForegroundColor White
    Write-Host "vercel login" -ForegroundColor White
    Write-Host "vercel --prod" -ForegroundColor White
    Write-Host ""
    Write-Host "Then add these environment variables in Vercel dashboard:" -ForegroundColor Cyan
    
    Get-Content "client\.env.production" | ForEach-Object {
        if ($_ -and -not $_.StartsWith('#')) {
            Write-Host "   $_" -ForegroundColor White
        }
    }
}

# Step 7: Testing checklist
Write-Host ""
Write-Host "🧪 Step 7: Post-Deployment Testing Checklist" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "After deployment, test these:" -ForegroundColor Cyan
Write-Host "1. Backend health check: curl https://your-backend-url/health" -ForegroundColor White
Write-Host "2. User registration: Test signup on frontend" -ForegroundColor White
Write-Host "3. User login: Test login functionality" -ForegroundColor White
Write-Host "4. Game functionality: Play a complete game" -ForegroundColor White
Write-Host "5. Database connection: Verify data persistence" -ForegroundColor White

# Step 8: Security verification
Write-Host ""
Write-Host "🔒 Step 8: Security Verification" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. SSL Certificate: Check https://www.ssllabs.com/ssltest/" -ForegroundColor White
Write-Host "2. CORS Configuration: Test cross-origin requests" -ForegroundColor White
Write-Host "3. Environment Variables: Ensure no secrets in frontend" -ForegroundColor White
Write-Host "4. Authentication: Test JWT token functionality" -ForegroundColor White

# Final instructions
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Deploy backend using the platform-specific instructions above" -ForegroundColor White
Write-Host "2. Note your backend URL" -ForegroundColor White
Write-Host "3. Update frontend environment with backend URL" -ForegroundColor White
Write-Host "4. Deploy frontend to Vercel" -ForegroundColor White
Write-Host "5. Update backend CORS with frontend URL" -ForegroundColor White
Write-Host "6. Test everything thoroughly" -ForegroundColor White
Write-Host "7. Set up custom domains (optional)" -ForegroundColor White

Write-Host ""
Write-Host "📁 Generated Files:" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host "✅ client/.env.production - Frontend environment" -ForegroundColor Green
Write-Host "✅ server/.env.production.deploy - Backend environment" -ForegroundColor Green
Write-Host "✅ Deployment instructions displayed above" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Your N-Queens game is ready for production deployment!" -ForegroundColor Magenta
Write-Host ""
Write-Host "⚠️  Remember:" -ForegroundColor Red
Write-Host "   - Never commit .env files to version control" -ForegroundColor Yellow
Write-Host "   - Store secrets securely in deployment platforms" -ForegroundColor Yellow
Write-Host "   - Test thoroughly before announcing launch" -ForegroundColor Yellow

Write-Host ""
Write-Host "Need help? Check COMPLETE_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")