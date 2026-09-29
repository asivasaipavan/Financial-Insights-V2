CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(80) NOT NULL,
  description VARCHAR(180) NOT NULL DEFAULT '',
  transaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month CHAR(7) NOT NULL,
  category VARCHAR(80) NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month, category)
);

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(80) NOT NULL,
  description VARCHAR(180) NOT NULL DEFAULT '',
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly','yearly')),
  next_run_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_assets NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_liabilities NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_worth NUMERIC(14,2) NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_net_worth_user_date ON net_worth_snapshots(user_id, snapshot_date DESC);


CREATE OR REPLACE FUNCTION process_due_recurring(p_user UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  rec recurring_transactions%ROWTYPE;
  processed INTEGER := 0;
  run_date DATE;
  next_date DATE;
  max_runs INTEGER;
BEGIN
  FOR rec IN SELECT * FROM recurring_transactions WHERE user_id=p_user AND active=TRUE AND next_run_date <= CURRENT_DATE ORDER BY next_run_date FOR UPDATE LOOP
    run_date := rec.next_run_date;
    max_runs := 0;
    WHILE run_date <= CURRENT_DATE AND max_runs < 120 LOOP
      INSERT INTO transactions(user_id,type,amount,category,description,transaction_date)
      VALUES(rec.user_id,rec.type,rec.amount,rec.category,COALESCE(rec.description,'') || ' · recurring',run_date);
      IF rec.frequency='yearly' THEN next_date := (run_date + INTERVAL '1 year')::date;
      ELSE next_date := (run_date + INTERVAL '1 month')::date;
      END IF;
      run_date := next_date;
      processed := processed + 1;
      max_runs := max_runs + 1;
    END LOOP;
    UPDATE recurring_transactions SET next_run_date=run_date WHERE id=rec.id;
  END LOOP;
  RETURN processed;
END;
$$;
