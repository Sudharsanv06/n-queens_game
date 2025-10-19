#!/usr/bin/env node

/**
 * Environment Secret Generator for N-Queens Game
 * Generates cryptographically secure secrets for production deployment
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 N-Queens Game - Secure Environment Generator\n');

// Generate cryptographically secure random strings
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateBase64Secret(length = 64) {
  return crypto.randomBytes(length).toString('base64url');
}

// Generate all required secrets
const secrets = {
  JWT_SECRET: generateSecret(64),
  SESSION_SECRET: generateSecret(64),
  VAPID_PRIVATE_KEY: generateBase64Secret(32),
  API_KEY: generateSecret(32),
  ENCRYPTION_KEY: generateSecret(32)
};

console.log('✅ Generated secure secrets:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value.substring(0, 20)}...`);
});

console.log('\n📋 Copy these to your production environment:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

// Generate production environment template
const productionEnv = `# PRODUCTION ENVIRONMENT - Generated ${new Date().toISOString()}
# WARNING: Keep these secrets secure and never commit to version control!

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/n-queens-game-prod?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=production

# Security Secrets (GENERATED - DO NOT CHANGE)
JWT_SECRET=${secrets.JWT_SECRET}
SESSION_SECRET=${secrets.SESSION_SECRET}

# CORS Configuration (UPDATE WITH YOUR DOMAINS)
CLIENT_ORIGIN=https://your-domain.com,https://www.your-domain.com,capacitor://localhost

# Email Configuration (CONFIGURE AS NEEDED)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-nqueens-app@gmail.com
EMAIL_PASS=your-gmail-app-password

# Push Notifications (CONFIGURE AS NEEDED)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=${secrets.VAPID_PRIVATE_KEY}
NOTIFICATION_EMAIL=notifications@your-domain.com

# Rate Limiting (Production Settings)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50

# Additional Security
TRUST_PROXY=true
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=strict

# Performance
COMPRESSION_LEVEL=6
DB_MAX_CONNECTIONS=10
`;

// Save to file
const envPath = path.join(__dirname, '.env.production.generated');
fs.writeFileSync(envPath, productionEnv);

console.log(`\n💾 Production environment saved to: ${envPath}`);
console.log('\n🚨 SECURITY REMINDERS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Never commit this file to version control');
console.log('2. Store secrets in your deployment platform securely');
console.log('3. Update MONGO_URI with your actual database connection');
console.log('4. Update CLIENT_ORIGIN with your production domains');
console.log('5. Configure email settings if using notifications');
console.log('6. Generate VAPID keys for push notifications if needed');

console.log('\n🔗 Useful Links:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('MongoDB Atlas: https://cloud.mongodb.com/');
console.log('VAPID Key Generator: https://web-push-codelab.glitch.me/');
console.log('Gmail App Passwords: https://support.google.com/accounts/answer/185833');

console.log('\n✅ Environment generation complete!');
console.log('🚀 Your N-Queens game is ready for secure production deployment!');