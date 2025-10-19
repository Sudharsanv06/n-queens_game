# 🚀 N-Queens Game - Complete Production Deployment Guide

## 📋 Pre-Deployment Checklist

Before starting deployment, ensure you have:
- [x] Generated secure environment variables (completed ✅)
- [ ] MongoDB Atlas account
- [ ] GitHub repository with your code
- [ ] Domain name (optional but recommended)
- [ ] Email account for notifications (Gmail recommended)

---

## 🗄️ STEP 1: MongoDB Atlas Database Setup

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click "Try Free" and create an account
3. Verify your email address

### 1.2 Create Database Cluster
1. **Choose Deployment Type**: Select "Shared" (Free Tier)
2. **Cloud Provider**: Choose "AWS" (recommended)
3. **Region**: Select closest to your users (e.g., N. Virginia us-east-1)
4. **Cluster Name**: `nqueens-production`
5. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. **Authentication Method**: Password
4. **Username**: `nqueens-app`
5. **Password**: Generate secure password (save this!)
6. **Database User Privileges**: "Read and write to any database"
7. Click "Add User"

### 1.4 Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. **For testing**: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. **For production**: Add your server's specific IP addresses
5. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Clusters" and click "Connect" on your cluster
2. Choose "Connect your application"
3. **Driver**: Node.js, **Version**: 4.1 or later
4. Copy the connection string:
```
mongodb+srv://nqueens-app:<password>@nqueens-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. Replace `<password>` with your actual password
6. Add database name: `/n-queens-game-prod` before the `?`

**Final Connection String Example:**
```
mongodb+srv://nqueens-app:YourSecurePassword@nqueens-production.xxxxx.mongodb.net/n-queens-game-prod?retryWrites=true&w=majority
```

---

## 🎨 STEP 2: Frontend Deployment (Vercel)

### 2.1 Prepare Frontend for Deployment
```bash
# Navigate to client directory
cd client

# Install dependencies (if not already done)
npm install

# Create production environment file
```

Create `client/.env.production`:
```env
# Vercel Frontend Production Environment
VITE_API_URL=https://your-backend-url.railway.app
VITE_SOCKET_URL=https://your-backend-url.railway.app
VITE_APP_NAME=N-Queens Game
VITE_ENABLE_PWA=true
VITE_APP_VERSION=1.0.0
```

### 2.2 Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from client directory
cd client
vercel

# Follow prompts:
# ? Set up and deploy? [Y/n] y
# ? Which scope? Your account
# ? Link to existing project? [y/N] n
# ? What's your project's name? nqueens-game
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] n

# Deploy to production
vercel --prod
```

#### Option B: Vercel Web Dashboard
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. **Root Directory**: Select `client`
5. **Framework Preset**: Vite
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. Click "Deploy"

### 2.3 Configure Environment Variables in Vercel
1. Go to your project dashboard on Vercel
2. Click "Settings" → "Environment Variables"
3. Add these variables (we'll update the API URL after backend deployment):

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_APP_NAME` | `N-Queens Game` | Production |
| `VITE_ENABLE_PWA` | `true` | Production |
| `VITE_APP_VERSION` | `1.0.0` | Production |

**Note**: We'll add `VITE_API_URL` and `VITE_SOCKET_URL` after deploying the backend.

---

## 🚀 STEP 3: Backend Deployment (Railway)

### 3.1 Prepare Backend for Deployment

#### Option A: Railway (Recommended - Modern & Fast)

**3.1.1 Deploy via Railway Dashboard:**
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `n-queens_game` repository
4. **Root Directory**: Select `server`
5. Railway will auto-detect Node.js and deploy

**3.1.2 Configure Environment Variables:**
1. Go to your project dashboard
2. Click on your service → "Variables" tab
3. Add these environment variables:

```bash
# Required Variables
NODE_ENV=production
PORT=5000

# Your Generated Secrets (from earlier)
JWT_SECRET=dca38a8e0865f78e253f34bf6f5e2baaa2c8a1677ba931c830ea888e7f630ba1df181f67657b8ce3cebb02450c0c7809afb6ca9a8b65a94ccd3b676028f593e4
SESSION_SECRET=08771b14221f70e899815572b3b7ab6b9d31f82fcd87138478fdfe191e131b052250c6077a71f6b3ec1ace176403403ba94ba058e1308cc9306681c359d261d

# Database (update with your MongoDB Atlas connection string)
MONGO_URI=mongodb+srv://nqueens-app:YourPassword@nqueens-production.xxxxx.mongodb.net/n-queens-game-prod?retryWrites=true&w=majority

# CORS (update with your Vercel domain)
CLIENT_ORIGIN=https://your-vercel-app.vercel.app,capacitor://localhost

# Security Settings
TRUST_PROXY=true
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=strict

# Performance
COMPRESSION_LEVEL=6
DB_MAX_CONNECTIONS=10

# Rate Limiting (Production)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50
```

#### Option B: Heroku (Alternative)

**3.1.1 Install Heroku CLI:**
Download from: https://devcenter.heroku.com/articles/heroku-cli

**3.1.2 Deploy to Heroku:**
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-nqueens-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="dca38a8e0865f78e253f34bf6f5e2baaa2c8a1677ba931c830ea888e7f630ba1df181f67657b8ce3cebb02450c0c7809afb6ca9a8b65a94ccd3b676028f593e4"
heroku config:set SESSION_SECRET="08771b14221f70e899815572b3b7ab6b9d31f82fcd87138478fdfe191e131b052250c6077a71f6b3ec1ace176403403ba94ba058e1308cc9306681c359d261d"
heroku config:set MONGO_URI="mongodb+srv://nqueens-app:YourPassword@nqueens-production.xxxxx.mongodb.net/n-queens-game-prod?retryWrites=true&w=majority"
heroku config:set CLIENT_ORIGIN="https://your-vercel-app.vercel.app,capacitor://localhost"

# Deploy server subfolder
git subtree push --prefix server heroku main
```

---

## 🔗 STEP 4: Connect Frontend and Backend

### 4.1 Get Your Backend URL
- **Railway**: Your URL will be like `https://your-app-name.railway.app`
- **Heroku**: Your URL will be like `https://your-app-name.herokuapp.com`

### 4.2 Update Frontend Environment Variables
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add/Update these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.railway.app` | Production |
| `VITE_SOCKET_URL` | `https://your-backend-url.railway.app` | Production |

### 4.3 Update Backend CORS Settings
1. Go to your Railway/Heroku dashboard
2. Update the `CLIENT_ORIGIN` variable:
```bash
CLIENT_ORIGIN=https://your-vercel-app.vercel.app,https://www.your-custom-domain.com,capacitor://localhost
```

### 4.4 Redeploy Both Services
- **Vercel**: Automatically redeploys on environment variable changes
- **Railway**: Automatically redeploys on variable changes
- **Heroku**: May need manual redeploy: `git subtree push --prefix server heroku main`

---

## 🌐 STEP 5: Custom Domain Setup (Optional)

### 5.1 Configure Custom Domain for Frontend (Vercel)
1. Go to your Vercel project → Settings → Domains
2. Add your domain: `your-game-domain.com`
3. Configure DNS records as instructed by Vercel
4. Vercel automatically provides SSL certificates

### 5.2 Configure Custom Domain for Backend (Railway)
1. Go to Railway project → Settings → Domains
2. Add custom domain: `api.your-game-domain.com`
3. Configure DNS CNAME record to point to Railway

### 5.3 Update Environment Variables with Custom Domains
```bash
# Update in Vercel
VITE_API_URL=https://api.your-game-domain.com

# Update in Railway/Heroku
CLIENT_ORIGIN=https://your-game-domain.com,https://www.your-game-domain.com,capacitor://localhost
```

---

## 📧 STEP 6: Email Configuration (Optional)

### 6.1 Gmail App Password Setup
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings → Security → App Passwords
3. Generate an app password for "Mail"
4. Save the 16-character password

### 6.2 Add Email Variables to Backend
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-nqueens-app@gmail.com
EMAIL_PASS=your-16-character-app-password
```

---

## 🔔 STEP 7: Push Notifications Setup (Optional)

### 7.1 Generate VAPID Keys
1. Visit: https://web-push-codelab.glitch.me/
2. Click "Generate Keys"
3. Save both public and private keys

### 7.2 Add VAPID Variables to Backend
```bash
VAPID_PUBLIC_KEY=your-generated-public-key
VAPID_PRIVATE_KEY=your-generated-private-key
NOTIFICATION_EMAIL=notifications@your-domain.com
```

---

## 🧪 STEP 8: Testing Your Deployment

### 8.1 Backend Health Check
```bash
# Test your backend is running
curl https://your-backend-url.railway.app/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-10-19T...",
  "database": "Connected",
  "uptime": 123.45
}
```

### 8.2 Database Connection Test
```bash
# Test user registration
curl -X POST https://your-backend-url.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "1234567890",
    "password": "testpass123"
  }'

# Expected response:
{
  "message": "Account created successfully...",
  "success": true,
  "user": {...}
}
```

### 8.3 Frontend-Backend Connection Test
1. Visit your Vercel frontend URL
2. Try to register a new account
3. Test login functionality
4. Play a game to test full flow
5. Check browser console for any errors

### 8.4 CORS Test
```bash
# Test CORS is working
curl -H "Origin: https://your-vercel-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend-url.railway.app/api/auth/login
```

---

## 🔒 STEP 9: Security Verification

### 9.1 SSL Certificate Check
- Visit: https://www.ssllabs.com/ssltest/
- Test both your frontend and backend URLs
- Ensure A+ rating

### 9.2 Security Headers Check
```bash
# Check security headers
curl -I https://your-backend-url.railway.app/

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

### 9.3 Environment Variables Security Check
- Ensure no secrets are visible in frontend
- Verify backend environment variables are set correctly
- Check that JWT tokens are working

---

## 📱 STEP 10: Mobile App Configuration

### 10.1 Update Capacitor Configuration
Edit `client/capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nqueens.premium.game',
  appName: 'N-Queens Premium',
  webDir: 'dist',
  server: {
    url: 'https://your-vercel-app.vercel.app',
    cleartext: false
  },
  plugins: {
    // ... existing plugins
  }
};

export default config;
```

### 10.2 Build Mobile Apps
```bash
cd client

# Build web assets
npm run build

# Sync with mobile platforms
npx cap sync

# Open in native IDEs
npx cap open android  # For Android
npx cap open ios      # For iOS
```

---

## 📊 STEP 11: Monitoring & Analytics Setup

### 11.1 Basic Logging
Add to your backend environment:
```bash
LOG_LEVEL=info
ENABLE_HEALTH_CHECKS=true
```

### 11.2 Error Tracking (Optional)
Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for user session replay
- **Google Analytics** for usage analytics

---

## ✅ STEP 12: Final Deployment Checklist

### Pre-Launch Verification:
- [ ] MongoDB Atlas cluster is running
- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads correctly
- [ ] Database connection working
- [ ] User registration/login working
- [ ] Game functionality working
- [ ] CORS configured correctly
- [ ] SSL certificates active
- [ ] Environment variables secure
- [ ] Mobile apps build successfully

### Performance Check:
- [ ] Frontend loads in <3 seconds
- [ ] API responses in <500ms
- [ ] WebSocket connections stable
- [ ] No console errors
- [ ] Mobile responsive design works

### Security Audit:
- [ ] All secrets are environment variables
- [ ] No hardcoded credentials
- [ ] HTTPS enabled everywhere
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] Session security enabled

---

## 🎉 STEP 13: Go Live!

### 13.1 Final Deployment Commands
```bash
# Ensure latest code is deployed
git add .
git commit -m "Production deployment ready"
git push origin main

# Vercel and Railway will auto-deploy from Git
```

### 13.2 Announce Your Launch
1. Test everything one final time
2. Share your game URL with friends
3. Monitor server logs for any issues
4. Be ready to handle user feedback

---

## 🆘 Troubleshooting Common Issues

### Backend Issues:
- **500 Error**: Check server logs and environment variables
- **Database Connection Failed**: Verify MongoDB URI and IP whitelist
- **CORS Error**: Check CLIENT_ORIGIN includes your frontend domain

### Frontend Issues:
- **API Calls Fail**: Verify VITE_API_URL is correct
- **Build Fails**: Check for TypeScript errors or missing dependencies
- **Routing Issues**: Ensure _redirects file exists in public folder

### Quick Debug Commands:
```bash
# Check backend logs (Railway)
railway logs

# Check environment variables
railway variables

# Test API endpoint
curl https://your-backend-url.railway.app/health
```

---

## 🚀 Congratulations!

Your N-Queens game is now live in production with:

✅ **Secure Database**: MongoDB Atlas with proper authentication
✅ **Scalable Backend**: Railway/Heroku with environment-based configuration  
✅ **Fast Frontend**: Vercel with global CDN
✅ **Enterprise Security**: JWT authentication, HTTPS, secure headers
✅ **Mobile Ready**: Capacitor apps for iOS and Android
✅ **Production Monitoring**: Health checks and error handling

**Your game is ready to serve thousands of players! 🎮**

---

*Deployment completed on: $(date)*
*Security Level: Production Grade 🔒*
*Performance: Optimized ⚡*
*Scalability: Cloud Ready ☁️*