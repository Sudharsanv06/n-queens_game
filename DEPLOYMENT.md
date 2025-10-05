# N-Queens Game - Mobile Deployment Guide

## 🚀 Complete Deployment Instructions

### 1. Server Deployment

#### Option A: Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new Heroku app
heroku create your-nqueens-app-name

# Set environment variables
heroku config:set MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/n-queens-game"
heroku config:set JWT_SECRET="your-production-jwt-secret"
heroku config:set NODE_ENV="production"
heroku config:set CLIENT_ORIGIN="https://your-domain.com,capacitor://localhost"

# Deploy
git subtree push --prefix server heroku main
```

#### Option B: Railway Deployment
1. Go to railway.app
2. Connect your GitHub repository
3. Select the `server` folder as root
4. Add environment variables from `.env.production`
5. Deploy automatically

#### Option C: DigitalOcean App Platform
1. Go to DigitalOcean App Platform
2. Create new app from GitHub
3. Set build command: `npm install && npm run build`
4. Set run command: `npm start`
5. Add environment variables

### 2. Database Setup

#### MongoDB Atlas (Recommended)
```bash
# 1. Go to mongodb.com/atlas
# 2. Create free cluster
# 3. Create database user
# 4. Whitelist IP addresses (0.0.0.0/0 for production)
# 5. Get connection string
# 6. Update MONGO_URI in environment variables
```

### 3. Frontend Deployment

#### Web Version (Vercel)
```bash
cd client

# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_API_URL=https://your-server-url.com/api
# VITE_SOCKET_URL=https://your-server-url.com
```

#### Web Version (Netlify)
```bash
cd client

# Build the project
npm run build

# Upload dist folder to netlify.com
# Or connect GitHub repository for auto-deploy
```

### 4. Mobile App Deployment

#### Android Deployment
```bash
cd client

# Build production version
npm run build

# Sync with Capacitor
npx cap sync android

# Open Android Studio
npx cap open android

# In Android Studio:
# 1. Build > Generate Signed Bundle/APK
# 2. Create keystore or use existing
# 3. Build release APK
# 4. Upload to Google Play Console
```

#### iOS Deployment
```bash
cd client

# Build production version
npm run build

# Sync with Capacitor
npx cap sync ios

# Open Xcode
npx cap open ios

# In Xcode:
# 1. Select your team/developer account
# 2. Set app bundle identifier
# 3. Archive the app
# 4. Upload to App Store Connect
```

### 5. Environment Configuration

#### Production API Endpoints
Create `client/.env.production`:
```env
VITE_API_URL=https://your-production-server.com/api
VITE_SOCKET_URL=https://your-production-server.com
VITE_APP_NAME=N-Queens Game
VITE_APP_VERSION=1.0.0
```

#### Mobile-Specific Configuration
Update `client/capacitor.config.ts`:
```javascript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.nqueensgame',
  appName: 'N-Queens Game',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Remove localhost URLs for production
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
```

### 6. App Store Preparation

#### Android (Google Play)
1. Create Google Play Developer account ($25 one-time fee)
2. Prepare store listing:
   - App name: "N-Queens Game"
   - Short description: "Strategic chess-based puzzle game with multiplayer"
   - Full description: Include features, gameplay, multiplayer
   - Screenshots: Different board sizes, multiplayer, daily challenges
   - Feature graphic: 1024x500px
3. Set content rating and pricing
4. Upload signed APK/Bundle
5. Submit for review

#### iOS (App Store)
1. Create Apple Developer account ($99/year)
2. Prepare App Store listing:
   - App name: "N-Queens Game"
   - Subtitle: "Chess Puzzle Strategy Game"
   - Description: Include features and gameplay
   - Keywords: chess, puzzle, strategy, multiplayer, queens
   - Screenshots: iPhone and iPad screenshots
   - App icon: 1024x1024px
3. Set pricing and availability
4. Upload via Xcode or Transporter
5. Submit for review

### 7. Push Notifications Setup

#### Firebase Configuration
```bash
# 1. Go to console.firebase.google.com
# 2. Create new project
# 3. Add Android/iOS app
# 4. Download google-services.json / GoogleService-Info.plist
# 5. Place in respective platform folders
# 6. Get server key for backend
```

#### Server Integration
Add to `server/.env`:
```env
FIREBASE_SERVER_KEY=your-server-key-here
FIREBASE_PROJECT_ID=your-project-id
```

### 8. Testing & Quality Assurance

#### Pre-deployment Checklist
- [ ] Server runs without errors
- [ ] Database connection successful
- [ ] API endpoints working
- [ ] WebSocket multiplayer functional
- [ ] Mobile app builds successfully
- [ ] Push notifications working
- [ ] App icons and splash screens configured
- [ ] Store listings prepared
- [ ] Privacy policy and terms created

#### Performance Testing
```bash
# Load test server
npm install -g artillery
artillery quick --count 100 --num 10 https://your-server.com/health

# Mobile performance
# Test on actual devices
# Check memory usage
# Verify touch responsiveness
```

### 9. Monitoring & Analytics

#### Server Monitoring
```bash
# Add to package.json dependencies
npm install winston express-winston

# Health check endpoint available at /health
# Monitor logs in production
```

#### Mobile Analytics
Add Firebase Analytics:
```bash
npm install @capacitor-community/firebase-analytics
npx cap sync
```

### 10. Maintenance & Updates

#### Backend Updates
```bash
# Deploy updates
git push heroku main

# Database migrations
# Run scripts if needed

# Monitor server health
curl https://your-server.com/health
```

#### Mobile App Updates
```bash
# Update version in package.json and capacitor.config.ts
# Build and deploy new version
# Submit updates to app stores
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Update CLIENT_ORIGIN in server environment
2. **Database Connection**: Check MONGO_URI and network access
3. **Mobile Build Fails**: Ensure all Capacitor plugins installed
4. **Push Notifications Not Working**: Verify Firebase configuration
5. **App Store Rejection**: Check guidelines and fix issues

### Support Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [MongoDB Atlas Support](https://docs.atlas.mongodb.com)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect)

## 🎯 Success Metrics

- Server uptime > 99.5%
- Response time < 200ms
- Mobile app rating > 4.0
- Daily active users
- Multiplayer session success rate
- App store ranking

Your N-Queens Game is now ready for production deployment! 🎉
