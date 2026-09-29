# API Reference

Base URL: `/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## Dashboard

- `GET /dashboard?months=6`
- `POST /dashboard/net-worth-snapshot`

## Transactions

- `GET /transactions`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`

## Budgets

- `GET /budgets?month=YYYY-MM`
- `POST /budgets`
- `DELETE /budgets/:id`

## Goals

- `GET /goals`
- `POST /goals`
- `PUT /goals/:id`
- `DELETE /goals/:id`

## Recurring transactions

- `GET /recurring-transactions`
- `POST /recurring-transactions`
- `PUT /recurring-transactions/:id`
- `DELETE /recurring-transactions/:id`
- `POST /recurring-transactions/apply-due`

Protected routes require:

```http
Authorization: Bearer <JWT>
```
