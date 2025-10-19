# 🔥 Heroku Deployment - Quick Setup Guide

## Heroku Backend Deployment

### Prerequisites
- Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- Have a Heroku account

### Step 1: Login and Create App
```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-nqueens-backend

# Verify app creation
heroku apps
```

### Step 2: Set Environment Variables
```bash
# Set production environment
heroku config:set NODE_ENV=production

# Set your generated secrets
heroku config:set JWT_SECRET="dca38a8e0865f78e253f34bf6f5e2baaa2c8a1677ba931c830ea888e7f630ba1df181f67657b8ce3cebb02450c0c7809afb6ca9a8b65a94ccd3b676028f593e4"

heroku config:set SESSION_SECRET="08771b14221f70e899815572b3b7ab6b9d31f82fcd87138478fdfe191e131b052250c6077a71f6b3ec1ace176403403ba94ba058e1308cc9306681c359d261d"

# Set MongoDB Atlas URI (replace with your actual URI)
heroku config:set MONGO_URI="mongodb+srv://nqueens-app:YourPassword@nqueens-production.xxxxx.mongodb.net/n-queens-game-prod?retryWrites=true&w=majority"

# Set CORS (will update after frontend deployment)
heroku config:set CLIENT_ORIGIN="capacitor://localhost"

# Set security configurations
heroku config:set TRUST_PROXY=true
heroku config:set SESSION_COOKIE_SECURE=true
heroku config:set SESSION_COOKIE_HTTPONLY=true
heroku config:set SESSION_COOKIE_SAMESITE=strict

# Set performance configurations
heroku config:set COMPRESSION_LEVEL=6
heroku config:set DB_MAX_CONNECTIONS=10

# Set rate limiting
heroku config:set RATE_LIMIT_WINDOW=15
heroku config:set RATE_LIMIT_MAX=50

# Verify all variables are set
heroku config
```

### Step 3: Deploy Server Code
```bash
# From your project root directory
git subtree push --prefix server heroku main

# If you get errors, force push:
git push heroku `git subtree split --prefix server main`:main --force
```

### Step 4: Verify Deployment
```bash
# Check app status
heroku ps

# View logs
heroku logs --tail

# Test health endpoint
curl https://your-nqueens-backend.herokuapp.com/health
```

---

## ⚡ Vercel Frontend Deployment

### Step 1: Deploy to Vercel
```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

### Step 2: Set Environment Variables
In Vercel dashboard → Project → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|--------|-------------|
| `VITE_API_URL` | `https://your-nqueens-backend.herokuapp.com` | Production |
| `VITE_SOCKET_URL` | `https://your-nqueens-backend.herokuapp.com` | Production |
| `VITE_APP_NAME` | `N-Queens Game` | Production |
| `VITE_ENABLE_PWA` | `true` | Production |

### Step 3: Update Heroku CORS
```bash
# Update CORS with your Vercel domain
heroku config:set CLIENT_ORIGIN="https://your-vercel-app.vercel.app,capacitor://localhost"
```

---

## 🧪 Testing Your Deployment

### 1. Backend Health Check
```bash
curl https://your-nqueens-backend.herokuapp.com/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-10-19T...",
  "database": "Connected",
  "uptime": 123.45
}
```

### 2. Test User Registration
```bash
curl -X POST https://your-nqueens-backend.herokuapp.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "1234567890",
    "password": "testpass123"
  }'
```

### 3. Test Frontend Connection
- Visit your Vercel URL
- Open browser dev tools (F12)
- Try to register/login
- Check for any CORS or connection errors

---

## 🔧 Troubleshooting

### Common Heroku Issues:

#### App Crashes (H10 Error)
```bash
# Check logs
heroku logs --tail

# Common causes:
# - Missing environment variables
# - Port configuration issues
# - Database connection failures
```

#### Build Failures
```bash
# Ensure package.json has correct start script
# In server/package.json:
{
  "scripts": {
    "start": "node server.js"
  }
}
```

#### Database Connection Issues
```bash
# Verify MongoDB URI
heroku config:get MONGO_URI

# Test connection locally with production URI
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Failed:', err));
"
```

#### CORS Errors
```bash
# Check CORS configuration
heroku config:get CLIENT_ORIGIN

# Update if needed
heroku config:set CLIENT_ORIGIN="https://your-vercel-app.vercel.app,capacitor://localhost"
```

---

## 📊 Monitoring Your App

### Heroku Dashboard
- View app metrics: `https://dashboard.heroku.com/apps/your-app-name`
- Monitor dyno usage and performance
- Check error rates and response times

### Log Monitoring
```bash
# Real-time logs
heroku logs --tail

# Last 100 log lines
heroku logs -n 100

# Filter for errors
heroku logs --tail | grep ERROR
```

### Performance Monitoring
```bash
# Check dyno status
heroku ps

# Restart if needed
heroku restart

# Scale up if needed (requires paid plan)
heroku ps:scale web=2
```

---

## 💰 Cost Optimization

### Free Tier Limitations
- Heroku Free tier has been discontinued
- Minimum cost: $5/month for Eco dynos
- Consider Railway or Render for free alternatives

### Eco Dyno ($5/month)
```bash
# Scale to Eco dyno
heroku ps:scale web=1:eco
```

---

## 🎉 Your App is Live!

Your N-Queens game is now deployed on:
- **Backend**: Heroku (reliable, scalable)
- **Frontend**: Vercel (global CDN, instant)
- **Database**: MongoDB Atlas (managed, secure)

**URLs:**
- Frontend: `https://your-vercel-app.vercel.app`
- Backend: `https://your-nqueens-backend.herokuapp.com`
- Health Check: `https://your-nqueens-backend.herokuapp.com/health`

**🚀 Ready to serve thousands of players!**