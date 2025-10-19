![alt text](image.png)# 🚨 Deployment Troubleshooting Guide

## 🔍 Quick Problem Solver

**Use this guide when something isn't working during deployment.**

---

## 🗄️ MongoDB Atlas Issues

### ❌ Problem: "Can't connect to database"
**What you see:** Health check shows `"database": "Disconnected"`

**Solutions:**
1. **Check your MongoDB connection string:**
   - Go to MongoDB Atlas → Clusters → Connect
   - Make sure you replaced `<password>` with your actual password
   - Verify you added `/n-queens-game-prod` before the `?`

2. **Check Network Access:**
   - MongoDB Atlas → Network Access
   - Make sure you have `0.0.0.0/0` in the IP Access List
   - If not: Click "Add IP Address" → "Allow Access from Anywhere"

3. **Check Database User:**
   - MongoDB Atlas → Database Access
   - Make sure your user exists and has "Read and write to any database"

**✅ Test:** Visit `YOUR_RAILWAY_URL/health` - should show `"database": "Connected"`

### ❌ Problem: "Cluster is taking forever to create"
**What you see:** Spinning loader for 10+ minutes

**Solutions:**
1. **Wait longer** - can take up to 15 minutes
2. **Refresh the page** after 10 minutes
3. **Try a different region** if it's still stuck
4. **Contact MongoDB support** if stuck for 30+ minutes

### ❌ Problem: "Invalid connection string"
**What you see:** Connection errors in Railway logs

**Solutions:**
1. **Double-check format:**
   ```
   mongodb+srv://nqueens-app:YOUR_PASSWORD@nqueens-production.xxxxx.mongodb.net/n-queens-game-prod?retryWrites=true&w=majority
   ```
2. **Common mistakes:**
   - Missing database name (`/n-queens-game-prod`)
   - Wrong password (use the auto-generated one)
   - Extra spaces at beginning/end

---

## 🚂 Railway Deployment Issues

### ❌ Problem: "Deployment keeps failing"
**What you see:** Red "FAILED" status in Railway

**Solutions:**
1. **Check Root Directory:**
   - Railway → Settings → Root Directory
   - Must be set to `server` (not empty, not `n-queens-game`)

2. **Check Environment Variables:**
   - Railway → Variables
   - Must have: `NODE_ENV`, `JWT_SECRET`, `SESSION_SECRET`, `MONGO_URI`
   - No extra spaces or quotes around values

3. **Check Logs:**
   - Railway → Deployments → Click on failed deployment
   - Look for error messages in logs
   - Common errors: "Module not found" = wrong root directory

**✅ Test:** Railway deployment should show green "SUCCESS" status

### ❌ Problem: "Can't find my GitHub repository"
**What you see:** Repository not listed in Railway

**Solutions:**
1. **Make repository public:**
   - GitHub → Your repo → Settings → Change visibility to Public

2. **Reconnect GitHub:**
   - Railway → Account Settings → Connected Accounts
   - Disconnect and reconnect GitHub

3. **Check repository structure:**
   - Make sure you have `server/` folder with `package.json` inside

### ❌ Problem: "Health check returns 404"
**What you see:** `YOUR_RAILWAY_URL/health` shows "Not Found"

**Solutions:**
1. **Wait for deployment:**
   - Check Railway → Deployments
   - Wait for green "SUCCESS" status

2. **Check server.js:**
   - Make sure you have the health endpoint in your code
   - Should be in `server/server.js`

3. **Check PORT configuration:**
   - Railway → Variables → Make sure `PORT` is NOT set
   - Railway automatically sets the port

---

## ⚡ Vercel Frontend Issues

### ❌ Problem: "Build failed"
**What you see:** Red error in Vercel deployment

**Solutions:**
1. **Check Root Directory:**
   - Vercel → Settings → General → Root Directory = `client`

2. **Check Framework:**
   - Should be detected as "Vite"
   - If not: Manually select Vite in settings

3. **Check Build Command:**
   - Should be `npm run build`
   - Output Directory should be `dist`

4. **Check package.json:**
   - Make sure `client/package.json` exists
   - Should have `"build": "vite build"` in scripts

**✅ Test:** Vercel deployment should show green checkmark

### ❌ Problem: "Environment variables not working"
**What you see:** Game can't connect to backend

**Solutions:**
1. **Check variable names:**
   - Must start with `VITE_` for Vite projects
   - Correct names: `VITE_API_URL`, `VITE_SOCKET_URL`

2. **Check environment:**
   - Variables must be set for "Production" environment

3. **Redeploy after adding variables:**
   - Vercel → Deployments → Redeploy latest

4. **Check values:**
   - `VITE_API_URL` should be your Railway URL (no trailing slash)
   - Example: `https://yourapp-production-xxxx.up.railway.app`

---

## 🔗 Connection Issues

### ❌ Problem: "CORS Error" in browser console
**What you see:** `Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy`

**Solutions:**
1. **Update CLIENT_ORIGIN in Railway:**
   - Railway → Variables → Edit `CLIENT_ORIGIN`
   - Value should be: `https://your-vercel-url.vercel.app,capacitor://localhost`
   - No spaces around the comma

2. **Wait for redeploy:**
   - Railway automatically redeploys when you change variables
   - Wait 2-3 minutes

3. **Check exact URLs:**
   - Vercel URL should match exactly (no extra `/` at end)
   - Case-sensitive

**✅ Test:** Open browser dev tools → Network tab → No CORS errors

### ❌ Problem: "API calls returning 404"
**What you see:** Frontend can't reach backend endpoints

**Solutions:**
1. **Check VITE_API_URL:**
   - Should be your Railway URL
   - Example: `https://yourapp-production-xxxx.up.railway.app`
   - NO trailing slash

2. **Test backend directly:**
   - Visit `YOUR_RAILWAY_URL/health` in browser
   - Should show JSON response

3. **Check Railway domain:**
   - Railway → Settings → Domains
   - Make sure domain is generated and active

### ❌ Problem: "Users can't register/login"
**What you see:** Forms submit but nothing happens

**Solutions:**
1. **Check browser console:**
   - Press F12 → Console tab
   - Look for error messages

2. **Test API endpoints:**
   ```
   POST YOUR_RAILWAY_URL/api/auth/signup
   POST YOUR_RAILWAY_URL/api/auth/login
   ```

3. **Check JWT secrets:**
   - Railway → Variables
   - `JWT_SECRET` and `SESSION_SECRET` must be set

4. **Check database connection:**
   - Visit `YOUR_RAILWAY_URL/health`
   - Should show `"database": "Connected"`

---

## 📱 Mobile/Browser Issues

### ❌ Problem: "Game doesn't work on mobile"
**What you see:** Layout broken or buttons not working

**Solutions:**
1. **Test in mobile browser:**
   - Open game URL in phone's browser
   - Should be responsive

2. **Check viewport meta tag:**
   - Should be in `client/index.html`

3. **Test touch events:**
   - Make sure you can tap chess squares

### ❌ Problem: "Game loads but pieces don't appear"
**What you see:** Empty chess board

**Solutions:**
1. **Check console errors:**
   - F12 → Console → Look for JavaScript errors

2. **Check static files:**
   - Vercel should serve CSS and JS files correctly

3. **Clear browser cache:**
   - Ctrl+F5 or Cmd+Shift+R

---

## 🔧 Quick Diagnostic Commands

### Test Backend Health
```
Visit: YOUR_RAILWAY_URL/health
Expected: {"status":"OK","database":"Connected"}
```

### Test Frontend Loading
```
Visit: YOUR_VERCEL_URL
Expected: Game loads without errors
```

### Test API Connection
```
Browser Console (F12):
fetch('YOUR_RAILWAY_URL/health').then(r => r.json()).then(console.log)
Expected: {"status":"OK","database":"Connected"}
```

### Check CORS
```
Browser Console (F12):
fetch('YOUR_RAILWAY_URL/api/auth/signup', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: '{"name":"test","email":"test@test.com","password":"test123","mobile":"1234567890"}'
}).then(r => r.json()).then(console.log)
Expected: No CORS errors
```

---

## 🆘 When All Else Fails

### Complete Reset Steps

1. **Railway Reset:**
   - Delete your Railway project
   - Create new project from GitHub
   - Set root directory to `server`
   - Re-add all environment variables

2. **Vercel Reset:**
   - Delete your Vercel project
   - Re-import from GitHub
   - Set root directory to `client`
   - Re-add environment variables

3. **MongoDB Reset:**
   - Create new database user
   - Generate new password
   - Update MONGO_URI in Railway

### Getting Help

**Railway Support:**
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app/

**Vercel Support:**
- Vercel Discord: https://discord.gg/vercel
- Vercel Docs: https://vercel.com/docs

**MongoDB Support:**
- MongoDB Community: https://community.mongodb.com/
- MongoDB Docs: https://docs.mongodb.com/

---

## ✅ Success Checklist

**When everything works, you should have:**

- [ ] MongoDB Atlas cluster showing "Active" with green dot
- [ ] Railway deployment showing green "SUCCESS" status
- [ ] Vercel deployment showing green checkmark
- [ ] `YOUR_RAILWAY_URL/health` returns connected database
- [ ] `YOUR_VERCEL_URL` loads the game without console errors
- [ ] User registration creates new accounts successfully
- [ ] User login works and redirects to game
- [ ] Game functionality works (placing queens, scoring, etc.)
- [ ] No CORS errors in browser console
- [ ] Mobile devices can access and play the game

**🎉 If all boxes are checked, your deployment is successful! 🎉**

---

*Remember: Most deployment issues are simple configuration problems. Work through this checklist systematically and your game will be running smoothly!*