# N-Queens Game - Quick Production Setup Script
# Run this script to quickly configure your production environment

Write-Host "🎮 N-Queens Game - Production Setup Wizard" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the server directory" -ForegroundColor Red
    Write-Host "   cd server" -ForegroundColor Yellow
    Write-Host "   .\setup-production.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Setting up production environment for N-Queens Game..." -ForegroundColor Green
Write-Host ""

# Step 1: Generate secrets
Write-Host "🔐 Step 1: Generating secure secrets..." -ForegroundColor Yellow
if (Test-Path "generate-secrets.ps1") {
    & .\generate-secrets.ps1
} else {
    Write-Host "❌ Secret generator not found. Skipping..." -ForegroundColor Red
}

# Step 2: Environment checklist
Write-Host ""
Write-Host "📋 Step 2: Production Deployment Checklist" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

$checklist = @(
    "Set up MongoDB Atlas cluster",
    "Configure production domains in CLIENT_ORIGIN",
    "Set up email service (Gmail/SendGrid)",
    "Generate VAPID keys for push notifications",
    "Choose deployment platform (Heroku/Railway/Vercel)",
    "Set up SSL certificates",
    "Configure domain names"
)

Write-Host ""
foreach ($item in $checklist) {
    Write-Host "   ☐ $item" -ForegroundColor White
}

# Step 3: Platform selection
Write-Host ""
Write-Host "🚀 Step 3: Choose your deployment platform" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Heroku (Easy, free tier available)"
Write-Host "2. Railway (Modern, fast deployment)"
Write-Host "3. Vercel (Frontend) + Railway/Heroku (Backend)"
Write-Host "4. DigitalOcean App Platform"
Write-Host "5. Manual setup"
Write-Host ""

do {
    $choice = Read-Host "Enter your choice (1-5)"
} while ($choice -notmatch '^[1-5]$')

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔥 Heroku Deployment Commands:" -ForegroundColor Green
        Write-Host "==============================" -ForegroundColor Green
        Write-Host ""
        Write-Host "# Install Heroku CLI from: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Cyan
        Write-Host "heroku login" -ForegroundColor White
        Write-Host "heroku create your-nqueens-app-name" -ForegroundColor White
        Write-Host ""
        Write-Host "# Set environment variables (use the generated secrets above)" -ForegroundColor Cyan
        Write-Host 'heroku config:set NODE_ENV=production' -ForegroundColor White
        Write-Host 'heroku config:set JWT_SECRET="your-generated-jwt-secret"' -ForegroundColor White
        Write-Host 'heroku config:set SESSION_SECRET="your-generated-session-secret"' -ForegroundColor White
        Write-Host 'heroku config:set MONGO_URI="your-mongodb-atlas-uri"' -ForegroundColor White
        Write-Host 'heroku config:set CLIENT_ORIGIN="https://your-domain.com"' -ForegroundColor White
        Write-Host ""
        Write-Host "# Deploy" -ForegroundColor Cyan
        Write-Host "git subtree push --prefix server heroku main" -ForegroundColor White
    }
    "2" {
        Write-Host ""
        Write-Host "🚂 Railway Deployment:" -ForegroundColor Green
        Write-Host "=====================" -ForegroundColor Green
        Write-Host ""
        Write-Host "1. Go to railway.app and sign up" -ForegroundColor Cyan
        Write-Host "2. Connect your GitHub repository" -ForegroundColor Cyan
        Write-Host "3. Select the 'server' folder as root directory" -ForegroundColor Cyan
        Write-Host "4. Add environment variables in Railway dashboard" -ForegroundColor Cyan
        Write-Host "5. Deploy automatically via Git push" -ForegroundColor Cyan
    }
    "3" {
        Write-Host ""
        Write-Host "⚡ Vercel + Railway Combo:" -ForegroundColor Green
        Write-Host "=========================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Frontend (Vercel):" -ForegroundColor Cyan
        Write-Host "cd ../client" -ForegroundColor White
        Write-Host "npm install -g vercel" -ForegroundColor White
        Write-Host "vercel --prod" -ForegroundColor White
        Write-Host ""
        Write-Host "Backend (Railway): Follow option 2 above" -ForegroundColor Cyan
    }
    "4" {
        Write-Host ""
        Write-Host "🌊 DigitalOcean App Platform:" -ForegroundColor Green
        Write-Host "=============================" -ForegroundColor Green
        Write-Host ""
        Write-Host "1. Go to cloud.digitalocean.com" -ForegroundColor Cyan
        Write-Host "2. Create new App" -ForegroundColor Cyan
        Write-Host "3. Connect GitHub repository" -ForegroundColor Cyan
        Write-Host "4. Configure build settings" -ForegroundColor Cyan
        Write-Host "5. Add environment variables" -ForegroundColor Cyan
    }
    "5" {
        Write-Host ""
        Write-Host "📖 Manual Setup:" -ForegroundColor Green
        Write-Host "================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Check the following files for detailed instructions:" -ForegroundColor Cyan
        Write-Host "- DEPLOYMENT.md" -ForegroundColor White
        Write-Host "- ENVIRONMENT_SECURITY_GUIDE.md" -ForegroundColor White
        Write-Host "- PRODUCTION_DEPLOYMENT_CHECKLIST.md" -ForegroundColor White
    }
}

# Step 4: Next actions
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Set up MongoDB Atlas: https://cloud.mongodb.com/" -ForegroundColor White
Write-Host "2. Update production environment variables" -ForegroundColor White
Write-Host "3. Deploy using your chosen platform" -ForegroundColor White
Write-Host "4. Test your deployment" -ForegroundColor White
Write-Host "5. Configure your domain name" -ForegroundColor White
Write-Host "6. Build and publish mobile apps" -ForegroundColor White
Write-Host ""

Write-Host "📚 Helpful Resources:" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host ""
Write-Host "MongoDB Atlas: https://cloud.mongodb.com/" -ForegroundColor Cyan
Write-Host "VAPID Generator: https://web-push-codelab.glitch.me/" -ForegroundColor Cyan
Write-Host "Gmail App Passwords: https://support.google.com/accounts/answer/185833" -ForegroundColor Cyan
Write-Host "SSL Checker: https://www.ssllabs.com/ssltest/" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Production setup wizard complete!" -ForegroundColor Green
Write-Host "🚀 Your N-Queens game is ready for deployment!" -ForegroundColor Magenta
Write-Host ""
Write-Host "💡 Tip: Keep your generated secrets secure and never commit them to Git!" -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")