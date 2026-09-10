# QuickGyan Production Deployment Guide

This guide details how to deploy the **QuickGyan** application to production across the frontend (Next.js 16) and backend (Express + MongoDB).

---

## 1. System Architecture & Authentication Overview

QuickGyan is designed as a decoupled full-stack platform:
- **Frontend**: Next.js 16 (App Router + Turbopack + TailwindCSS) located in `/frontend-architecture-plan`.
- **Backend**: Node.js + Express 5 + MongoDB Mongoose located in `/backend2`.

### Production Authentication (Dual-Token Strategy)
To ensure reliable authentication across modern browsers (Google Chrome, Apple Safari, Firefox, mobile browsers) that block cross-origin third-party cookies:
1. **Dual Tokens**: The backend returns `accessToken` in both HTTP cookies (`Set-Cookie` with `SameSite=None; Secure; Partitioned`) and the JSON response payload.
2. **Authorization Header**: The frontend automatically attaches `Authorization: Bearer <token>` to all HTTP requests via an Axios interceptor and stores the session in `localStorage`.
3. **Server-Side Session**: Client-side sets a first-party cookie on the frontend domain so Next.js server components can read the session.
4. **Role Normalization**: Roles are normalized so normal registered users (`role: "user"`) seamlessly map to student privileges throughout the application.

---

## 2. Pre-Deployment: MongoDB Atlas Network Access

Because cloud platforms like Vercel and Render use dynamic IP addresses, you must allow them to connect to your MongoDB Atlas cluster:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Navigate to **Security** -> **Network Access**.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (`0.0.0.0/0`).
5. Click **Confirm**.

---

## 3. Deployment Option A: Full Vercel Deployment (Frontend + Backend)

Both the frontend and backend can be hosted on Vercel as two separate Vercel projects from the same GitHub repository:

### Project 1: Backend (`backend2`)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Select your `quickgyan` GitHub repository.
3. In **Project Settings**:
   - **Project Name**: `quickgyan-backend` (or your chosen name)
   - **Framework Preset**: **Other**
   - **Root Directory**: Click *Edit* and select **`backend2`**
4. Expand **Environment Variables** and add the following:
   | Variable | Example Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production environment |
   | `PORT` | `8060` | Server port |
   | `MONGODB_URI` | `mongodb+srv://...` | Atlas connection string |
   | `JWT_SECRET` | `your-secure-secret-key` | Token signing secret |
   | `GEMINI_API_KEY` | `AIzaSy...` | Google Gemini API key |
   | `CLOUDINARY_CLOUD_NAME` | `dgmteyzkk` | Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | `678452514756969` | Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | `76ULhdlJQe...` | Cloudinary secret |
   | `EMAIL` | `your-email@gmail.com` | Gmail for OTP emails |
   | `PASSWORD` | `your-gmail-app-password` | Gmail App password (16 characters) |
   | `FRONTEND_URL` | `https://quick-gyan.vercel.app` | Your deployed frontend domain |
5. Click **Deploy**. Note your deployed backend URL (e.g., `https://quickgyan-ecl3.vercel.app`).

### Project 2: Frontend (`frontend-architecture-plan`)
1. Click **Add New...** -> **Project** on Vercel.
2. Select your `quickgyan` GitHub repository.
3. In **Project Settings**:
   - **Project Name**: `quick-gyan` (or your chosen name)
   - **Framework Preset**: **Next.js**
   - **Root Directory**: Click *Edit* and select **`frontend-architecture-plan`**
4. Expand **Environment Variables** and add:
   | Variable | Example Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://quickgyan-backend.vercel.app` | URL of your deployed backend |
5. Click **Deploy**.

---

## 4. Deployment Option B: Vercel (Frontend) + Render / Railway (Backend) [Recommended]

For traditional Express applications with background tasks and persistent database connection pooling, hosting the backend on **Render** or **Railway** is recommended:

### Backend on Render (Web Service)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository `quickgyan`.
3. Configure settings:
   - **Name**: `quickgyan-backend`
   - **Root Directory**: `backend2`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter
4. Under **Environment Variables**, add the variables from `backend2/.env.example`.
5. Click **Deploy Web Service**.

### Frontend on Vercel
Deploy `frontend-architecture-plan` on Vercel as described above, setting `NEXT_PUBLIC_API_URL` to your Render backend URL (e.g. `https://quickgyan-backend.onrender.com`).

---

## 5. Post-Deployment Verification Checklist

Once deployed, verify the live deployment:
- [ ] **Health Endpoint**: Open `https://<backend-url>/health` in a browser. It should return:
  ```json
  {
    "status": "healthy",
    "uptime": ...,
    "timestamp": "...",
    "database": "connected"
  }
  ```
- [ ] **Normal User Login**: Log in on the frontend with a student/normal user account.
- [ ] **Dashboard Access**: Verify the user transitions to `/dashboard` and is not redirected to `/login`.
- [ ] **Session Persistence**: Press `F5` / reload on `/dashboard`. The session should remain intact.
- [ ] **Admin Login**: Log in with an admin account and verify access to `/admin`.
- [ ] **AI Assistant**: Test a prompt in `/dashboard/ai-chat` to confirm Gemini API connectivity.
- [ ] **File / Resource Upload**: Test downloading or viewing a course resource.

---

## 6. Local Development Commands

From the root directory of the repository:
```bash
# Run both frontend and backend
npm run dev:frontend   # Runs Next.js frontend on http://localhost:3000
npm run dev:backend    # Runs Express backend on http://localhost:8060

# Production build test
npm run build:frontend # Tests Next.js production compilation
```
