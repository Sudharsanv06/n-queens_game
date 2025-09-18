# Deployment Guide

This document explains how to deploy the N-Queens Game application.

- Frontend: React + Vite (Netlify or Vercel)
- Backend: Node.js + Express (Render)
- Database: MongoDB Atlas

## Prerequisites
- Node.js 18+
- MongoDB Atlas account (or other MongoDB provider)
- Accounts on Netlify and/or Vercel
- Render account for backend

## 1) Configure Environment Variables

### Backend (Render)
Create a Web Service in Render from the `server/` folder.

Environment Variables (Render -> Settings -> Environment):
- MONGO_URI: mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
- JWT_SECRET: <generate a strong secret>
- CLIENT_ORIGIN: https://<your-frontend-domain>
- PORT: 5000 (Render will set PORT automatically; Express uses it)

Start Command:
```
node server.js
```

Build Command:
- None (leave empty) or `npm install` if Render requests a build step.

### Frontend (Netlify or Vercel)

In your client project environment variables:
- VITE_API_URL: https://<your-render-service>.onrender.com/api
- VITE_SOCKET_URL: https://<your-render-service>.onrender.com

Note: Vite injects `VITE_*` variables at build time.

## 2) Deploy Backend (Render)
1. Push your repository to GitHub/GitLab.
2. In Render, create a New Web Service -> select the repo.
3. Set Root Directory to `server/`.
4. Environment: Node.
5. Add the environment variables listed above.
6. Save & Deploy. Wait for build and deployment to complete.
7. Note the deployed URL, e.g. `https://nqueens-backend.onrender.com`

## 3) Deploy Frontend (choose Netlify or Vercel)

### Option A: Netlify
1. In Netlify, create a New Site from Git.
2. Set Base directory: `client/`.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Add Environment variables (Netlify -> Site settings -> Environment):
   - VITE_API_URL: https://<render-app>/api
   - VITE_SOCKET_URL: https://<render-app>
6. Deploy.

Note: SPA Fallback is configured with `client/public/_redirects` which contains:
```
/* /index.html 200
```

### Option B: Vercel
1. Import the repo in Vercel.
2. Framework Preset: Vite.
3. Root Directory: `client/`.
4. Build Command: `npm run build` (default from Vercel preset is OK).
5. Output Directory: `dist`.
6. Environment Variables:
   - VITE_API_URL: https://<render-app>/api
   - VITE_SOCKET_URL: https://<render-app>
7. Deploy.

Note: SPA fallback is configured with `client/vercel.json` rewrites.

## 4) Verify CORS & API
- In the backend `.env` (or Render env), ensure `CLIENT_ORIGIN` matches your deployed frontend URL.
- Example: `CLIENT_ORIGIN=https://nqueens-frontend.netlify.app`
- The server enables CORS for this origin in `server/server.js`.

## 5) Local Testing Before Deploy
- Backend: `cd server && npm start` (http://localhost:5000)
- Frontend: `cd client && npm run dev` (http://localhost:5173)
- Set client `.env.local` values:
  - `VITE_API_URL=http://localhost:5000/api`
  - `VITE_SOCKET_URL=http://localhost:5000`

## 6) Post-Deployment Checks
- Visit your deployed frontend URL and test:
  - Signup/Login (JWT stored and axios Authorization header set)
  - Leaderboard data loads
  - Daily challenge loads
  - Multiplayer Socket connection (optional initial test via console)

## 7) Production Recommendations
- Use MongoDB Atlas with Network Access/IP allowlist configured.
- Rotate `JWT_SECRET` periodically.
- Consider adding HTTPS-only cookies and CSRF protections if moving to cookie-based auth later.
- Monitor Render logs and set up alerts.

## 8) Troubleshooting
- CORS errors: ensure `CLIENT_ORIGIN` exactly matches your deployed frontend origin (protocol + domain + port if any).
- SPA 404s on refresh: ensure Netlify `_redirects` exists or Vercel rewrites are set.
- API 404s: confirm `VITE_API_URL` and server routes.
- Socket issues: confirm `VITE_SOCKET_URL` and server Socket.IO CORS config.
