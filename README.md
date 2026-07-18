# LeadGenPro

> Describe your ideal customer. AI finds the leads. Start with 50 free leads, then pay $0.20/lead.

A full-stack lead generation platform with a React frontend and Express API backend.

## Features

- **Real AI Web Scraping** — Powered by [ScrapeGraphAI](https://github.com/ScrapeGraphAI/Scrapegraph-ai): describe your ideal customer and the scraper searches the web, visits matching pages, and extracts real lead data (only publicly listed contact info — nothing fabricated)
- **Fair Billing** — Credits are only charged for leads actually delivered; failed searches cost nothing
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
| **Scraper** | Python + FastAPI + ScrapeGraphAI (OpenAI + Playwright) |
| **Database** | SQLite (via Prisma ORM) |
| **Auth** | JWT (bcryptjs) |
| **Email** | Nodemailer (SMTP) |
| **Deployment** | Docker + docker-compose |

## Quick Start (Development)

### Prerequisites

- Node.js 18+
- npm
- Python 3.10+ (for the scraper service)
- An OpenAI API key (powers the scraping LLM — `gpt-4o-mini` keeps costs to fractions of a cent per query)

### 1. Scraper service

```bash
cd scraper
pip install -r requirements.txt
playwright install chromium
OPENAI_API_KEY=sk-... uvicorn main:app --port 8000
```

Scraper runs on http://localhost:8000

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

API runs on http://localhost:3001

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173 — it proxies `/api` to the backend.

### 4. Configure Email (optional)

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

This starts all three services:
- **Frontend** on port 80 (nginx)
- **Backend** on port 3001
- **Scraper** (internal, ScrapeGraphAI + Playwright)

### Environment Variables

Copy `.env.example` to `.env` and configure:

```
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost
OPENAI_API_KEY=sk-...        # required for lead generation
OPENAI_MODEL=gpt-4o-mini
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
| POST | `/api/leads/generate` | Yes | Start lead generation (returns 202, poll `/api/leads/:id` for status) |
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
│       └── lib/           # Prisma client, Email service, Scraper client
├── scraper/               # ScrapeGraphAI lead-scraping service (Python/FastAPI)
├── docker-compose.yml     # Production deployment
├── Dockerfile.frontend    # Frontend container
├── Dockerfile.backend     # Backend container
├── Dockerfile.scraper     # Scraper container
└── nginx.conf             # Reverse proxy config
```
