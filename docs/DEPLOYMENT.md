# Free deployment guide

Checked against provider documentation on 29 September 2026.

## Recommended stack

- Frontend: Vercel Hobby (free)
- Backend: Render Free Web Service (free, with sleep/usage limits)
- Database: Neon Free Postgres (free, with resource limits)

No paid external API is required by this project.

## 1. Neon database

Create a Neon project and copy the PostgreSQL connection string into Render as `DATABASE_URL`.

The app only needs a normal PostgreSQL connection and does not rely on proprietary database SDKs.

## 2. Render backend

Create a Web Service from the `backend/` directory.

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variables:

```text
NODE_ENV=production
DATABASE_URL=<your Neon connection string>
JWT_SECRET=<long random secret>
FRONTEND_ORIGIN=<your final Vercel URL>
```

After the first deployment, run:

```bash
npm run migrate
```

Render free web services can spin down after inactivity and may take a little time to wake up. This is a hosting-tier limitation, not an application dependency.

## 3. Vercel frontend

Import the GitHub repository and set the project root to `frontend/`.

Environment variable:

```text
VITE_API_URL=https://<your-render-service>.onrender.com/api
```

`frontend/vercel.json` provides the SPA fallback for React Router routes.

## 4. Test the public app

Open the Vercel URL, create a user account, then verify:

1. Login/logout
2. Add income and expense
3. Dashboard totals + charts
4. Budget creation + progress
5. Goal creation + progress
6. Recurring rule + Apply due
7. All 8 calculators
8. Mobile layout

## Free-tier caveat

"Free" does not mean unlimited. Provider limits can change, free services can sleep/scale to zero, and usage caps can apply. This project avoids paid API dependencies so there is no application-level subscription requirement.
