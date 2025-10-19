# 🚀 N-Queens Game - Production Deployment Checklist

## ✅ Pre-Deployment Security Checklist

### 1. Environment Variables Configuration
- [ ] Generate secure JWT_SECRET (completed ✅)
- [ ] Generate secure SESSION_SECRET (completed ✅)
- [ ] Configure MongoDB Atlas connection string
- [ ] Set production CORS origins
- [ ] Configure email settings (if using notifications)
- [ ] Set up push notification keys (if using)
- [ ] Update rate limiting for production

### 2. Database Setup
- [ ] Create MongoDB Atlas cluster
- [ ] Create database user with appropriate permissions
- [ ] Whitelist server IP addresses
- [ ] Test database connection
- [ ] Set up database backups

### 3. Security Hardening
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure secure headers (Helmet.js)
- [ ] Set up proper CORS policy
- [ ] Enable session security settings
- [ ] Configure rate limiting
- [ ] Set up error logging

## 🔐 Your Generated Production Secrets

### **CRITICAL: Store these securely - Never commit to version control!**

```bash
# Primary Security Secrets (Use these in production)
JWT_SECRET=dca38a8e0865f78e253f34bf6f5e2baaa2c8a1677ba931c830ea888e7f630ba1df181f67657b8ce3cebb02450c0c7809afb6ca9a8b65a94ccd3b676028f593e4

SESSION_SECRET=08771b14221f70e899815572b3b7ab6b9d31f82fcd87138478fdfe191e131b052250c6077a71f6b3ec1ace176403403ba94ba058e1308cc9306681c359d261d

# Optional: For push notifications
VAPID_PRIVATE_KEY=RUG50ZSyIaJF8xVt4cDNXFj2ONXNSAODGzgKX1nuTN4

# Additional API security
API_KEY=bf553bccf65f4d5c53d35be40a9f0ca2ec63df2e2ab2deac919fa7fef908c17f
```

## 🏗️ Platform-Specific Deployment Commands

### **Heroku Deployment**
```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="dca38a8e0865f78e253f34bf6f5e2baaa2c8a1677ba931c830ea888e7f630ba1df181f67657b8ce3cebb02450c0c7809afb6ca9a8b65a94ccd3b676028f593e4"
heroku config:set SESSION_SECRET="08771b14221f70e899815572b3b7ab6b9d31f82fcd87138478fdfe191e131b052250c6077a71f6b3ec1ace176403403ba94ba058e1308cc9306681c359d261d"
heroku config:set MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/n-queens-game-prod"
heroku config:set CLIENT_ORIGIN="https://your-domain.com,capacitor://localhost"

# Deploy
git subtree push --prefix server heroku main
```

### **Railway Deployment**
```bash
# Using Railway CLI
railway login
railway variables set JWT_SECRET="dca38a8e0865f78e253f34bf6f5e2baaa2c8a1677ba931c830ea888e7f630ba1df181f67657b8ce3cebb02450c0c7809afb6ca9a8b65a94ccd3b676028f593e4"
railway variables set SESSION_SECRET="08771b14221f70e899815572b3b7ab6b9d31f82fcd87138478fdfe191e131b052250c6077a71f6b3ec1ace176403403ba94ba058e1308cc9306681c359d261d"
railway deploy
```

### **Vercel Deployment** (Client)
```bash
# Frontend deployment
cd client
vercel env add VITE_API_URL production
vercel env add VITE_SOCKET_URL production
vercel --prod
```

## 📧 Email Configuration (Optional)

### **Gmail Setup**
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings → Security → App Passwords
3. Generate an app password for "Mail"
4. Use these settings:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-nqueens-app@gmail.com
EMAIL_PASS=your-16-character-app-password  # NOT your regular password
```

### **Alternative: SendGrid** (Recommended for production)
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

## 🔔 Push Notification Setup (Optional)

### **Generate VAPID Keys**
1. Visit: https://web-push-codelab.glitch.me/
2. Click "Generate Keys"
3. Use the generated keys:

```bash
VAPID_PUBLIC_KEY=your-generated-public-key
VAPID_PRIVATE_KEY=RUG50ZSyIaJF8xVt4cDNXFj2ONXNSAODGzgKX1nuTN4  # Use generated key
NOTIFICATION_EMAIL=notifications@your-domain.com
```

## 🗄️ Database Configuration

### **MongoDB Atlas Setup**
1. Create account at https://cloud.mongodb.com/
2. Create new cluster (free tier available)
3. Create database user:
   - Username: `nqueens-app`
   - Password: Generate strong password
   - Permissions: Read and write to any database

4. Network Access:
   - Add IP addresses: `0.0.0.0/0` (allow from anywhere)
   - For production: Restrict to your server IPs

5. Get connection string:
```bash
MONGO_URI=mongodb+srv://nqueens-app:your-password@cluster.mongodb.net/n-queens-game-prod?retryWrites=true&w=majority
```

## 🌐 Frontend Deployment

### **Update Client Environment**
Create `client/.env.production`:

```bash
VITE_API_URL=https://your-api-domain.com
VITE_SOCKET_URL=https://your-api-domain.com
VITE_APP_NAME=N-Queens Game
VITE_ENABLE_PWA=true
```

## 📱 Mobile App Configuration

### **Update Production URLs**
In `client/capacitor.config.ts`:

```typescript
server: {
  url: 'https://your-api-domain.com',
  cleartext: false
}
```

### **Build Mobile Apps**
```bash
# Android
cd client
npm run build
npx cap sync android
npx cap open android

# iOS
npx cap sync ios
npx cap open ios
```

## 🔍 Testing Your Deployment

### **Health Check**
```bash
curl https://your-api-domain.com/health
# Should return: {"status":"OK","database":"Connected"}
```

### **API Test**
```bash
# Test user registration
curl -X POST https://your-api-domain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","mobile":"1234567890","password":"testpass123"}'
```

## 🚨 Security Best Practices

### **Environment Management**
- [ ] Use different secrets for dev/staging/production
- [ ] Store secrets in deployment platform securely
- [ ] Never log sensitive environment variables
- [ ] Rotate secrets every 90 days
- [ ] Use secret management services for enterprise

### **Runtime Security**
- [ ] Enable HTTPS everywhere
- [ ] Set secure cookie flags
- [ ] Implement proper error handling
- [ ] Set up monitoring and alerting
- [ ] Regular security updates

## 📊 Monitoring Setup

### **Basic Monitoring**
```bash
# Add to your production environment
LOG_LEVEL=info
ENABLE_HEALTH_CHECKS=true
MONITORING_ENDPOINT=/health
```

### **Error Tracking** (Optional)
Consider integrating:
- Sentry for error tracking
- LogRocket for user session replay
- New Relic for performance monitoring

## 🎯 Go-Live Checklist

### **Final Verification**
- [ ] All environment variables set correctly
- [ ] Database connection working
- [ ] Frontend can communicate with backend
- [ ] Mobile apps build successfully
- [ ] CORS configured for all domains
- [ ] SSL certificates installed
- [ ] Error pages configured
- [ ] Backup strategy in place

### **Launch Commands**
```bash
# 1. Deploy backend
git push heroku main  # or your chosen platform

# 2. Deploy frontend
cd client && vercel --prod

# 3. Update mobile apps
cd client && npm run mobile:build

# 4. Test everything
npm run test:production
```

## 🎉 Post-Launch

### **After Successful Deployment**
1. ✅ Monitor server logs for errors
2. ✅ Test all game features
3. ✅ Verify user registration/login
4. ✅ Test multiplayer functionality
5. ✅ Check mobile app performance
6. ✅ Monitor database connections
7. ✅ Set up regular backups

### **Marketing Ready**
- [ ] App store submissions
- [ ] Social media announcements
- [ ] User documentation
- [ ] Feedback collection system

---

## 🔐 **SECURITY REMINDER**

**Your generated secrets are cryptographically secure and ready for production use.**

**NEVER share these secrets publicly or commit them to version control!**

Store them securely in:
- Your deployment platform's environment variables
- A secure password manager
- Your organization's secret management system

---

🚀 **Your N-Queens game is now ready for secure production deployment!**