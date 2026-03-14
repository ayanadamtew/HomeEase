# HomeEase: Step-by-Step Deployment Guide

Follow these instructions to deploy HomeEase using **Supabase** (Database), **Render** (Backend), and **Vercel** (Frontend).

## 1. Supabase Setup (Database)

1. **Create Project:** Log in to [Supabase](https://supabase.com) and create a new project.
2. **Retrieve Connection String:**
   - Go to **Project Settings** > **Database**.
   - Copy the **Connection string** (URI).
   - **Important:** Use the **Transaction Mode** string (usually port 6543) for `DATABASE_URL` to handle connection pooling.
3. **Prisma Configuration:**
   - Update your server's `.env` with the Supabase `DATABASE_URL`.
   - Run migrations from your local machine to populate the production DB:
     ```bash
     cd server
     npx prisma generate
     npx prisma migrate deploy
     npm run db:seed # Optional: only if you want initial demo data
     ```

---

## 2. Render Setup (Backend)

1. **Create Web Service:** Log in to [Render](https://render.com) and click **New** > **Web Service**.
2. **Connect Repository:** Link your GitHub repo.
3. **Configure Service:**
   - **Name:** `homeease-api`
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
4. **Environment Variables:** Add all variables from the "Backend" section in [deployment_guide.md](file:///home/ayuda/.gemini/antigravity/brain/5415ae0d-8875-45ff-aa2a-e9fc67ec1945/deployment_guide.md).
   - Ensure `CLIENT_URL` is set to your future Vercel URL (e.g., `https://homeease.vercel.app`).
5. **Deploy:** Render will automatically build and deploy the `server` directory.

---

## 3. Vercel Setup (Frontend)

1. **Create Project:** Log in to [Vercel](https://vercel.com) and click **Add New** > **Project**.
2. **Connect Repository:** Link your GitHub repo.
3. **Configure Project:**
   - **Root Directory:** `client`
   - **Framework Preset:** Next.js
4. **Environment Variables:**
   - Add `NEXT_PUBLIC_API_URL`. This must be your Render API URL + `/api` (e.g., `https://homeease-api.onrender.com/api`).
5. **Deploy:** Vercel will build and deploy the `client` directory.

---

## 4. Final Integration Steps

1. **Update Redirects:** 
   - Go to Google Cloud Console and update your **Authorized Redirect URIs** with the new Render API URL.
   - Update **Authorized JavaScript Origins** with both the Vercel and Render URLs.
2. **Verify CORS:** 
   - Ensure the `CLIENT_URL` in your Render environment variables exactly matches the domain Vercel assigned to you.
3. **Test:** Navigate to your Vercel URL and attempt to log in or browse listings.
