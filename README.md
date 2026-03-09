# 💰 Finance Tracker

A full-stack personal finance application built with **PostgreSQL · Node.js/Express · Angular**.

---

## Stack

| Layer     | Technology         |
|-----------|--------------------|
| Database  | PostgreSQL 14+     |
| Backend   | Node.js + Express  |
| Auth      | JWT + bcrypt       |
| Frontend  | Angular 16+        |
| Charts    | Chart.js + ng2-charts |
| UI        | Angular Material   |
| Container | Docker Compose     |

---

## Quick Start (Docker)

```bash
git clone https://github.com/your-org/finance-tracker.git
cd finance-tracker
docker-compose up --build
```

- Frontend: http://localhost:4200
- API: http://localhost:3000
- Demo login: `demo@financetracker.com` / `demo1234`

---

## Manual Setup

### 1. Database
```bash
psql -U postgres
CREATE DATABASE finance_tracker;
CREATE USER finance_user WITH PASSWORD 'finance_pass';
GRANT ALL PRIVILEGES ON DATABASE finance_tracker TO finance_user;
\q

psql -U finance_user -d finance_tracker -f database/schema.sql
psql -U finance_user -d finance_tracker -f database/seeds/seed_categories.sql
psql -U finance_user -d finance_tracker -f database/seeds/seed_demo_data.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # http://localhost:3000
```

### 3. Frontend
```bash
cd frontend
npm install
ng serve               # http://localhost:4200
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Get JWT token |
| GET | /api/auth/me | ✓ | Current user |
| GET | /api/transactions | ✓ | List transactions (paginated, filtered) |
| POST | /api/transactions | ✓ | Create transaction |
| PUT | /api/transactions/:id | ✓ | Update transaction |
| DELETE | /api/transactions/:id | ✓ | Delete transaction |
| GET | /api/budgets | ✓ | Budgets with current spending |
| POST | /api/budgets | ✓ | Create budget |
| PUT | /api/budgets/:id | ✓ | Update budget |
| DELETE | /api/budgets/:id | ✓ | Delete budget |
| GET | /api/subscriptions | ✓ | All subscriptions |
| POST | /api/subscriptions | ✓ | Add subscription |
| PUT | /api/subscriptions/:id | ✓ | Update / pause subscription |
| GET | /api/analytics/summary | ✓ | Balance, monthly totals |
| GET | /api/analytics/burn-rate | ✓ | Daily rate & projections |
| GET | /api/analytics/trends | ✓ | 6-month income/expense trends |
| GET | /api/analytics/by-category | ✓ | Category spending breakdown |

---

## Features

- **Dashboard** — balance, monthly income/expense, burn rate, upcoming subscriptions, charts
- **Transactions** — create, edit, delete; filter by type/date/category; paginated
- **Budgets** — set monthly limits per category; live progress tracking
- **Subscriptions** — track recurring billing; pause/cancel; days-until-billing
- **Analytics** — 6-month trend charts, category doughnuts, burn rate analysis
