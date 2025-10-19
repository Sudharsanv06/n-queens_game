# 🚂 Railway Deployment - Quick Setup Guide

## Railway Backend Deployment (5-minute setup)

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `n-queens_game` repository
5. Choose **"server"** as the root directory
6. Railway will automatically detect Node.js and start deployment

### Step 2: Configure Environment Variables
In your Railway project dashboard:

1. Click on your service
2. Go to **"Variables"** tab
3. Add these variables one by one:

```bash
NODE_ENV=production
PORT=5000

# Your generated secrets (from earlier)
JWT_SECRET=dca38a8e0865f78e253f34bf6f5e2baaa2c8a1677ba931c830ea888e7f630ba1df181f67657b8ce3cebb02450c0c7809afb6ca9a8b65a94ccd3b676028f593e4
SESSION_SECRET=08771b14221f70e899815572b3b7ab6b9d31f82fcd87138478fdfe191e131b052250c6077a71f6b3ec1ace176403403ba94ba058e1308cc9306681c359d261d

# MongoDB Atlas connection (replace with your actual URI)
MONGO_URI=mongodb+srv://nqueens-app:YourPassword@nqueens-production.xxxxx.mongodb.net/n-queens-game-prod?retryWrites=true&w=majority

# CORS (will update after frontend deployment)
CLIENT_ORIGIN=capacitor://localhost

# Security settings
TRUST_PROXY=true
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=strict

# Performance
COMPRESSION_LEVEL=6
DB_MAX_CONNECTIONS=10

# Rate limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50
```

### Step 3: Get Your Railway URL
- After deployment, Railway will provide a URL like: `https://your-app-name.railway.app`
- Test your backend: `https://your-app-name.railway.app/health`

### Step 4: Update CORS
Once you have your frontend URL, update the `CLIENT_ORIGIN` variable:
```bash
CLIENT_ORIGIN=https://your-vercel-app.vercel.app,capacitor://localhost
```

---

## ⚡ Vercel Frontend Deployment

### Step 1: Deploy Frontend
```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

### Step 2: Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|--------|-------------|
| `VITE_API_URL` | `https://your-railway-app.railway.app` | Production |
| `VITE_SOCKET_URL` | `https://your-railway-app.railway.app` | Production |
| `VITE_APP_NAME` | `N-Queens Game` | Production |
| `VITE_ENABLE_PWA` | `true` | Production |

### Step 3: Update Railway CORS
Go back to Railway and update `CLIENT_ORIGIN`:
```bash
CLIENT_ORIGIN=https://your-vercel-app.vercel.app,capacitor://localhost
```

---

## ✅ Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://your-railway-app.railway.app/health
```

### 2. Test User Registration
```bash
curl -X POST https://your-railway-app.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","mobile":"1234567890","password":"testpass123"}'
```

### 3. Test Frontend
- Visit your Vercel URL
- Try registering and logging in
- Play a game to test complete functionality

---

## 🎉 You're Live!

Your N-Queens game is now deployed on:
- **Backend**: Railway (auto-scaling, global)
- **Frontend**: Vercel (global CDN, instant)
- **Database**: MongoDB Atlas (managed, secure)

**Total deployment time: ~10-15 minutes** 🚀