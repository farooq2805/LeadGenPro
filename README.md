# LeadGenPro

> Describe your ideal customer. AI finds the leads. Start with 50 free leads, then pay $0.20/lead.

A full-stack lead generation platform with a React frontend and Express API backend.

## Features

- **AI-Powered Lead Generation** — Describe your ideal customer and get targeted leads
- **50 Free Leads** — Every new user gets 50 free leads, no credit card required
- **Pay As You Go** — $0.20 per lead after free credits, no subscriptions
- **CSV Export** — Download your leads with one click
- **Email Notifications** — Get notified when your leads are ready
- **Smart Filtering** — Filter by industry, location, job title, company size
- **Dashboard** — Track your credits, queries, and generated leads

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vite + React 19 + TypeScript + Tailwind CSS |
| **Backend** | Express 5 + TypeScript |
| **Database** | SQLite (via Prisma ORM) |
| **Auth** | JWT (bcryptjs) |
| **Email** | Nodemailer (SMTP) |
| **Deployment** | Docker + docker-compose |

## Quick Start (Development)

### Prerequisites

- Node.js 18+
- npm

### 1. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

API runs on http://localhost:3001

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173 — it proxies `/api` to the backend.

### 3. Configure Email (optional)

Copy `backend/.env.example` to `backend/.env` and set SMTP credentials:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@prospectpro.com
```

## Docker Deployment

### Build & Run

```bash
docker compose up -d
```

This starts both services:
- **Frontend** on port 80 (nginx)
- **Backend** on port 3001

### Environment Variables

Copy `.env.example` to `.env` and configure:

```
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@prospectpro.com
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Get profile |
| POST | `/api/leads/generate` | Yes | Generate leads |
| GET | `/api/leads` | Yes | List queries |
| GET | `/api/leads/:id` | Yes | Query details + leads |
| GET | `/api/leads/:id/download` | Token | Download leads as CSV |
| GET | `/api/credits` | Yes | Check remaining credits |
| POST | `/api/orders/create` | Yes | Create purchase order |
| POST | `/api/orders/confirm` | Yes | Confirm payment |

## Project Structure

```
LeadGenPro/
├── frontend/              # Vite + React app
│   └── src/
│       ├── pages/         # Landing, Login, Signup, Dashboard, Generate, Results, Pricing
│       ├── components/    # Navbar, Footer
│       └── lib/           # API client, Auth context
├── backend/               # Express API
│   └── src/
│       ├── routes/        # auth, leads, credits, orders
│       ├── middleware/     # JWT authentication
│       └── lib/           # Prisma client, Email service
├── docker-compose.yml     # Production deployment
├── Dockerfile.frontend    # Frontend container
├── Dockerfile.backend     # Backend container
└── nginx.conf             # Reverse proxy config
```
