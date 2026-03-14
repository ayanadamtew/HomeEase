# 🏠 HomeEase

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://homeease-ivory.vercel.app)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://homeease-api.onrender.com)
[![Supabase Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

**HomeEase** is a premium, full-stack platform that bridges the gap between real estate and home services. Whether you're looking for your next architectural oasis or need a vetted professional for home repairs, HomeEase provides a seamless, integrated experience.

---

## ✨ Key Features

- **🏠 Premium Real Estate Listings:** Browse and rent luxury properties with high-quality imagery and detailed specifications.
- **🛠️ Integrated Home Services:** Discover, contact, and hire vetted service providers (plumbers, electricians, cleaners) directly through the platform.
- **💬 Real-time Messaging:** Secure, instant communication between clients, landlords, and service providers.
- **🔐 Role-based Access Control:** Specialized dashboards for Admins, Clients, Landlords, and Service Providers.
- **🌓 Modern UI/UX:** Stunning, responsive design with fluid animations and a focus on premium aesthetics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Vanilla CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State/Auth:** React Context API + JWT

### Backend
- **Runtime:** Node.js + Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Passport.js (JWT & Google OAuth 2.0)
- **File Storage:** Cloudinary

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL instance (Local or Supabase)
- Cloudinary Account
- Google Cloud Console Project (for OAuth)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/HomeEase.git
   cd HomeEase
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   cp .env.example .env # Update with your credentials
   npx prisma generate
   npx prisma migrate deploy
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   cp .env.local.example .env.local # Update with NEXT_PUBLIC_API_URL
   npm run build
   npm run start
   ```

---

## 🌐 Deployment

For a detailed, platform-specific guide (Supabase, Render, Vercel), see our [Deployment Guide](./deployment_guide.md).

### Quick Links
- **Client (Vercel):** `client/` root directory.
- **API (Render):** `server/` root directory.
- **DB (Supabase):** Use Port 6543 (Transaction Pooler) for production.

---

## 📄 License

This project is licensed under the ISC License.
