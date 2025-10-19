#!/bin/bash

# N-Queens Game - Quick Deployment Script
# This script automates the deployment process

echo "🚀 Starting N-Queens Game deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check for required commands
command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed."; exit 1; }

print_status "Environment checks passed"

# Install dependencies
echo "📦 Installing dependencies..."

# Server dependencies
if [ -d "server" ]; then
    cd server
    print_status "Installing server dependencies..."
    npm install
    cd ..
else
    print_error "Server directory not found"
    exit 1
fi

# Client dependencies
if [ -d "client" ]; then
    cd client
    print_status "Installing client dependencies..."
    npm install
    cd ..
else
    print_error "Client directory not found"
    exit 1
fi

# Environment setup
print_status "Setting up environment files..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Created .env from .env.example - please update with your values"
    else
        print_warning "No .env.example found - please create .env manually"
    fi
fi

# Build client
echo "🔨 Building client application..."
cd client
npm run build

if [ $? -eq 0 ]; then
    print_status "Client build successful"
else
    print_error "Client build failed"
    exit 1
fi

# Sync with Capacitor (if mobile platforms exist)
if [ -d "android" ] || [ -d "ios" ]; then
    print_status "Syncing with Capacitor..."
    npx cap sync
    
    if [ $? -eq 0 ]; then
        print_status "Capacitor sync successful"
    else
        print_warning "Capacitor sync failed - continuing anyway"
    fi
fi

cd ..

# Test server
echo "🧪 Testing server..."
cd server

# Start server in background for testing
npm start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is responding
if curl -s http://localhost:5000/health > /dev/null; then
    print_status "Server is responding"
    kill $SERVER_PID
else
    print_warning "Server health check failed"
    kill $SERVER_PID 2>/dev/null
fi

cd ..

# Deployment options
echo ""
echo "🎯 Deployment Options:"
echo "1. Deploy to Heroku (server)"
echo "2. Deploy to Vercel (client)"
echo "3. Deploy to Netlify (client)"
echo "4. Build mobile apps"
echo "5. Run local development"
echo "6. Exit"

read -p "Choose deployment option (1-6): " choice

case $choice in
    1)
        echo "📡 Deploying to Heroku..."
        if command -v heroku >/dev/null 2>&1; then
            heroku create n-queens-game-$(date +%s) 2>/dev/null || true
            git subtree push --prefix server heroku main 2>/dev/null || git push heroku `git subtree split --prefix server main`:main --force
            print_status "Heroku deployment initiated"
        else
            print_error "Heroku CLI not installed. Install it first."
        fi
        ;;
    2)
        echo "📡 Deploying to Vercel..."
        if command -v vercel >/dev/null 2>&1; then
            cd client
            vercel --prod
            cd ..
            print_status "Vercel deployment initiated"
        else
            print_error "Vercel CLI not installed. Run: npm install -g vercel"
        fi
        ;;
    3)
        echo "📡 Deploying to Netlify..."
        if command -v netlify >/dev/null 2>&1; then
            cd client
            netlify deploy --prod --dir dist
            cd ..
            print_status "Netlify deployment initiated"
        else
            print_error "Netlify CLI not installed. Run: npm install -g netlify-cli"
        fi
        ;;
    4)
        echo "📱 Building mobile apps..."
        cd client
        if [ -d "android" ]; then
            print_status "Opening Android Studio..."
            npx cap open android
        fi
        if [ -d "ios" ]; then
            print_status "Opening Xcode..."
            npx cap open ios
        fi
        cd ..
        ;;
    5)
        echo "🔧 Starting local development..."
        echo "Starting server in background..."
        cd server && npm start &
        echo "Starting client..."
        cd ../client && npm run dev
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
print_status "Deployment script completed!"
echo ""
echo "📚 Next steps:"
echo "1. Update environment variables in your hosting provider"
echo "2. Set up MongoDB Atlas database"
echo "3. Configure domain and SSL certificates"
echo "4. Test the deployed application"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"