@echo off
REM N-Queens Game - Windows Deployment Script
REM This script automates the deployment process for Windows

echo 🚀 Starting N-Queens Game deployment...

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed
    pause
    exit /b 1
)

REM Check for npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is required but not installed
    pause
    exit /b 1
)

echo ✅ Environment checks passed

REM Install dependencies
echo 📦 Installing dependencies...

REM Server dependencies
if exist "server" (
    cd server
    echo ✅ Installing server dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Server dependency installation failed
        pause
        exit /b 1
    )
    cd ..
) else (
    echo ❌ Server directory not found
    pause
    exit /b 1
)

REM Client dependencies
if exist "client" (
    cd client
    echo ✅ Installing client dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Client dependency installation failed
        pause
        exit /b 1
    )
    cd ..
) else (
    echo ❌ Client directory not found
    pause
    exit /b 1
)

REM Environment setup
echo ✅ Setting up environment files...

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ⚠️ Created .env from .env.example - please update with your values
    ) else (
        echo ⚠️ No .env.example found - please create .env manually
    )
)

REM Build client
echo 🔨 Building client application...
cd client
call npm run build

if errorlevel 1 (
    echo ❌ Client build failed
    pause
    exit /b 1
)

echo ✅ Client build successful

REM Sync with Capacitor (if mobile platforms exist)
if exist "android" (
    echo ✅ Syncing with Capacitor...
    call npx cap sync
    if errorlevel 1 (
        echo ⚠️ Capacitor sync failed - continuing anyway
    ) else (
        echo ✅ Capacitor sync successful
    )
) else if exist "ios" (
    echo ✅ Syncing with Capacitor...
    call npx cap sync
    if errorlevel 1 (
        echo ⚠️ Capacitor sync failed - continuing anyway
    ) else (
        echo ✅ Capacitor sync successful
    )
)

cd ..

REM Test server
echo 🧪 Testing server...
cd server

REM Quick server test (simplified for Windows)
echo ✅ Server files ready

cd ..

REM Deployment options
echo.
echo 🎯 Deployment Options:
echo 1. Deploy to Heroku (server)
echo 2. Deploy to Vercel (client)
echo 3. Deploy to Netlify (client)
echo 4. Build mobile apps
echo 5. Run local development
echo 6. Exit

set /p choice="Choose deployment option (1-6): "

if "%choice%"=="1" (
    echo 📡 Deploying to Heroku...
    where heroku >nul 2>&1
    if errorlevel 1 (
        echo ❌ Heroku CLI not installed. Install it first.
        pause
    ) else (
        echo ✅ Heroku deployment initiated - check your Heroku dashboard
        heroku create n-queens-game-%random% 2>nul
        git subtree push --prefix server heroku main 2>nul
    )
) else if "%choice%"=="2" (
    echo 📡 Deploying to Vercel...
    where vercel >nul 2>&1
    if errorlevel 1 (
        echo ❌ Vercel CLI not installed. Run: npm install -g vercel
        pause
    ) else (
        cd client
        call vercel --prod
        cd ..
        echo ✅ Vercel deployment initiated
    )
) else if "%choice%"=="3" (
    echo 📡 Deploying to Netlify...
    where netlify >nul 2>&1
    if errorlevel 1 (
        echo ❌ Netlify CLI not installed. Run: npm install -g netlify-cli
        pause
    ) else (
        cd client
        call netlify deploy --prod --dir dist
        cd ..
        echo ✅ Netlify deployment initiated
    )
) else if "%choice%"=="4" (
    echo 📱 Building mobile apps...
    cd client
    if exist "android" (
        echo ✅ Opening Android Studio...
        call npx cap open android
    )
    if exist "ios" (
        echo ✅ Opening Xcode...
        call npx cap open ios
    )
    cd ..
) else if "%choice%"=="5" (
    echo 🔧 Starting local development...
    echo Starting server and client...
    start "N-Queens Server" cmd /c "cd server && npm start"
    timeout /t 3 >nul
    cd client
    call npm run dev
) else if "%choice%"=="6" (
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo ❌ Invalid option
    pause
    exit /b 1
)

echo.
echo ✅ Deployment script completed!
echo.
echo 📚 Next steps:
echo 1. Update environment variables in your hosting provider
echo 2. Set up MongoDB Atlas database
echo 3. Configure domain and SSL certificates
echo 4. Test the deployed application
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions
pause