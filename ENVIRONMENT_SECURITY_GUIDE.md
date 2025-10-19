# Environment Variables Security Guide for N-Queens Game

## 🔐 Production Environment Variables Configuration

This guide provides secure environment variable configurations and best practices for deploying your N-Queens game to production.

## 🚨 CRITICAL SECURITY NOTICE

**NEVER commit actual production secrets to version control!**
The values provided here are examples. Generate your own unique secrets for production.

## 📋 Required Environment Variables

### 1. Database Configuration

```bash
# MongoDB Atlas (Recommended for production)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/n-queens-game-prod?retryWrites=true&w=majority
```

**Setup Instructions:**
1. Create a MongoDB Atlas account at mongodb.com/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your server IP addresses
5. Get the connection string and replace username/password

### 2. JWT Secret (CRITICAL)

```bash
# Generate a strong, unique JWT secret (256+ characters recommended)
JWT_SECRET=your-super-long-random-string-here
```

**How to generate securely:**
```bash
# Method 1: Using Node.js crypto
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 64

# Method 3: Online generator (use trusted sources only)
# Visit: https://generate-secret.now.sh/64
```

### 3. Session Secret

```bash
# Another unique secret for session management
SESSION_SECRET=another-super-long-random-string-here
```

### 4. CORS Origins

```bash
# Update with your actual production domains
CLIENT_ORIGIN=https://your-domain.com,https://www.your-domain.com,capacitor://localhost
```

## 📧 Optional: Email Configuration

For user notifications and password reset functionality:

### Gmail Setup (Recommended)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-nqueens-app@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Gmail App Password Setup:**
1. Enable 2FA on your Google account
2. Go to Google Account Settings → Security
3. Generate an "App Password" for "Mail"
4. Use the 16-character password (not your regular password)

### Alternative Email Providers
```bash
# SendGrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key

# Mailgun
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASS=your-mailgun-smtp-password
```

## 🔔 Optional: Push Notifications

For daily challenge reminders and game notifications:

### Web Push (VAPID) Configuration
```bash
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
NOTIFICATION_EMAIL=your-contact-email@domain.com
```

**Generate VAPID Keys:**
1. Visit: https://web-push-codelab.glitch.me/
2. Click "Generate Keys"
3. Copy the public and private keys
4. Store them securely

**Or generate locally:**
```bash
npm install -g web-push
web-push generate-vapid-keys
```

## 🏗️ Platform-Specific Deployment

### Heroku
```bash
# Set environment variables via CLI
heroku config:set JWT_SECRET="your-jwt-secret-here"
heroku config:set MONGO_URI="your-mongodb-uri"
heroku config:set SESSION_SECRET="your-session-secret"

# Or use Heroku Dashboard → Settings → Config Vars
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add JWT_SECRET production
vercel env add MONGO_URI production
vercel env add SESSION_SECRET production
```

### Railway
```bash
# Set via Railway dashboard
# Or use railway CLI
railway variables set JWT_SECRET="your-jwt-secret-here"
```

### DigitalOcean App Platform
1. Go to App Platform dashboard
2. Select your app → Settings → Environment Variables
3. Add each variable individually

## 🔒 Security Best Practices

### 1. Environment Variable Management
- **Never** commit `.env` files to version control
- Use different secrets for different environments (dev/staging/prod)
- Rotate secrets regularly (every 90 days)
- Use a password manager or secret management service

### 2. Production Security Checklist
```bash
# Additional security variables for production
NODE_ENV=production
TRUST_PROXY=true
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=strict
```

### 3. Database Security
- Use MongoDB Atlas with IP whitelisting
- Create dedicated database users with minimal permissions
- Enable database authentication
- Use SSL/TLS connections

### 4. Rate Limiting (Production)
```bash
# Stricter limits for production
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50  # Reduced from 100 for production
```

## 🧪 Testing Your Configuration

### 1. Environment Variable Validation
```javascript
// Add to your server.js startup
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI', 'SESSION_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
}
```

### 2. Connection Testing
```bash
# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection failed:', err));
"
```

## 🔄 Environment File Structure

```
server/
├── .env                    # Development (already configured)
├── .env.production        # Production secrets (created above)
├── .env.staging          # Staging environment (optional)
└── .env.example          # Template for team members
```

## 📱 Mobile App Configuration

For mobile apps, update the client environment:

```bash
# client/.env.production
VITE_API_URL=https://your-production-api.com
VITE_SOCKET_URL=https://your-production-api.com
VITE_ENABLE_PWA=true
```

## 🚀 Quick Setup Commands

```bash
# 1. Copy production template
cp .env.production.example .env.production

# 2. Generate secrets
echo "JWT_SECRET=$(openssl rand -hex 64)" >> .env.production
echo "SESSION_SECRET=$(openssl rand -hex 64)" >> .env.production

# 3. Edit with your specific values
nano .env.production

# 4. Validate before deployment
node scripts/validate-env.js
```

## ⚠️ Important Reminders

1. **Backup your secrets** in a secure password manager
2. **Use different secrets** for each environment
3. **Monitor for secret leaks** in logs and error messages
4. **Implement secret rotation** for long-running applications
5. **Use managed secret services** for enterprise deployments (AWS Secrets Manager, Azure Key Vault, etc.)

## 🆘 Troubleshooting

### Common Issues:
- **MongoDB connection fails**: Check IP whitelist and credentials
- **JWT errors**: Ensure JWT_SECRET is set and consistent
- **CORS errors**: Verify CLIENT_ORIGIN includes all your domains
- **Email not sending**: Check EMAIL_PASS is app password, not regular password

---

**🔐 Your N-Queens game is now ready for secure production deployment!**