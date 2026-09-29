# Architecture

## High-level flow

```text
Browser
  │
  ▼
React SPA (Vite)
  │ Axios + Bearer JWT
  ▼
Express REST API
  │
  ├── Auth
  ├── Dashboard aggregation
  ├── Transactions
  ├── Budgets
  ├── Goals
  ├── Recurring transactions
  └── Calculator endpoints
  │
  ▼
PostgreSQL
```

## Data ownership

Every user-owned row has a `user_id` foreign key. Protected endpoints read the authenticated user ID from the verified JWT and never accept an arbitrary owner ID from the frontend.

## Database entities

- `users`: account credentials and profile name
- `transactions`: income and expense records
- `budgets`: category/month spending limits
- `goals`: savings targets
- `recurring_transactions`: recurring income/expense rules
- `net_worth_snapshots`: saved asset/liability snapshots for history

## Recurring transactions

Recurring rules are applied lazily. The dashboard and transaction endpoints call the recurring processor before returning data. This keeps deployment simple and avoids a paid cron service.

## Visualization strategy

- KPI cards for totals
- Area/line chart for income, expenses, and savings over time
- Donut chart for spending categories
- Progress bars for budget health
- Goal progress visualizations
- Exact tables alongside charts for accessible numeric context
