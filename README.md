# Financial Insights V2

🌐 **Live Demo:** https://financial-insights-v2.vercel.app/

A full-stack personal finance platform built with React, Express, PostgreSQL, and JWT authentication. It is designed as a portfolio-ready V2 of the original Financial Insights project, with the original project left untouched.

## Final feature set

- Personal Finance Dashboard
- Transactions (income + expenses)
- Budgeting
- Financial Goals
- Recurring Transactions
- Authentication + PostgreSQL database
- Responsive modern UI
- Interactive, mobile-friendly visualizations
- Financial tools:
  - EMI Calculator
  - Education Loan Planner
  - Gold Loan Calculator
  - Loan Comparison
  - Debt Payoff Planner
  - Insurance Analysis
  - Compound Interest Calculator
  - Net Worth Calculator

## Tech stack

### Frontend
- React + Vite
- React Router
- Recharts
- Axios
- Modern responsive CSS (no paid UI kit)

### Backend
- Node.js + Express
- PostgreSQL (`pg`)
- JWT authentication
- bcryptjs password hashing
- Zod validation
- Helmet + rate limiting

### Database
PostgreSQL. The included SQL migration is compatible with local Docker PostgreSQL and hosted PostgreSQL providers such as Neon.

## Folder structure

```text
Financial-Insights-V2/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── migrations/001_initial.sql
│   ├── seeds/seed.js
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── db.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── API.md
│   └── ARCHITECTURE.md
├── docker-compose.yml
├── render.yaml
└── README.md
```

## Run locally

### 1. Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (recommended for local PostgreSQL)

### 2. Start PostgreSQL

From the project root:

```bash
docker compose up -d postgres
```

The database is exposed on `localhost:5432`.

### 3. Configure backend

Copy `backend/.env.example` to `backend/.env`.

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/financial_insights
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:5173
```

Install and start the API:

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

### 4. Configure frontend

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in your terminal.

## Free deployment architecture

The code has **no paid API dependency** and all finance calculations run locally or on your Express server.

A simple no-subscription deployment path is:

```text
GitHub
   │
   ├── Frontend → Vercel Hobby / Render Static Site
   │
   ├── Backend  → Render Free Web Service
   │
   └── Database → Neon Free PostgreSQL
```

### Deployment steps

1. Push the repository to GitHub.
2. Create a free Neon PostgreSQL project and copy its `DATABASE_URL`.
3. Deploy `/backend` to a Render Web Service using `npm ci` and `npm start`.
4. In Render, set `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_ORIGIN`.
5. Run the migration using Render's Shell or a one-time command:

```bash
npm run migrate
```

6. Deploy `/frontend` to Vercel (Hobby) or Render Static Site.
7. Set `VITE_API_URL` to your public backend URL plus `/api`.
8. Update the backend `FRONTEND_ORIGIN` with the final frontend URL.

### Free-tier reality

Free hosting is suitable for a portfolio/demo project but may sleep, scale to zero, or impose usage limits. The project therefore avoids persistent local files and stores application data in PostgreSQL.

## Security notes

- Passwords are hashed with bcryptjs.
- JWTs are short-lived and stored client-side for this portfolio build.
- SQL queries use parameterized values.
- Zod validates API inputs.
- Helmet and basic rate limiting are enabled.
- No financial institution credentials, card numbers, or bank account passwords are stored.

## Financial disclaimer

Financial Insights is an educational planning tool. Calculator outputs are estimates based on the values entered by the user and should not be treated as regulated financial, tax, insurance, or investment advice.

## Useful commands

### Frontend
```bash
npm run dev
npm run build
npm run preview
```

### Backend
```bash
npm run dev
npm start
npm run migrate
npm run seed
```

## License

MIT
