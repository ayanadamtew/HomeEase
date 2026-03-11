# HomeEase

A comprehensive web platform that bridges real estate and home services. Users can browse and rent houses, as well as discover and hire local home service providers.

## Project Structure

```
HomeEase/
├── server/          # Express.js backend API
│   ├── prisma/      # Database schema & migrations
│   ├── src/
│   │   ├── config/      # DB, Cloudinary, Passport configs
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # Auth, error handling, validation
│   │   └── routes/      # API route definitions
│   └── package.json
├── client/          # Next.js frontend (Step 4)
└── README.md
```

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + Google OAuth (Passport.js)
- **Storage:** Cloudinary

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL installed and running

### Backend Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@homeease.com | admin123 |
| Client | client@demo.com | demo123 |
| Provider | provider@demo.com | demo123 |
| Landlord | landlord@demo.com | demo123 |

### API Endpoints

#### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login with email/password
- `GET /api/auth/me` — Get current user profile (protected)
- `PUT /api/auth/profile` — Update profile (protected)
- `PUT /api/auth/change-password` — Change password (protected)
- `GET /api/auth/google` — Google OAuth login
