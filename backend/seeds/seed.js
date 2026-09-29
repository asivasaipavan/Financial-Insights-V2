import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, migrate } from '../src/db.js';

await migrate();
const hash = await bcrypt.hash('Demo@12345', 12);
const { rows } = await pool.query(`INSERT INTO users(name,email,password_hash) VALUES('Demo User','demo@financialinsights.local',$1) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,password_hash=EXCLUDED.password_hash RETURNING id`, [hash]);
const userId = rows[0].id;
await pool.query('DELETE FROM transactions WHERE user_id=$1',[userId]);
await pool.query('DELETE FROM budgets WHERE user_id=$1',[userId]);
await pool.query('DELETE FROM goals WHERE user_id=$1',[userId]);
await pool.query('DELETE FROM recurring_transactions WHERE user_id=$1',[userId]);
await pool.query('DELETE FROM net_worth_snapshots WHERE user_id=$1',[userId]);
await pool.query(`INSERT INTO transactions(user_id,type,amount,category,description,transaction_date) VALUES
  ($1,'income',70000,'Salary','Monthly salary','2026-09-01'),
  ($1,'expense',18000,'Rent','Home rent','2026-09-03'),
  ($1,'expense',4500,'Food','Groceries & dining','2026-09-05'),
  ($1,'expense',2500,'Transport','Fuel / commute','2026-09-07'),
  ($1,'expense',1800,'Utilities','Electricity and internet','2026-09-09'),
  ($1,'expense',3000,'Shopping','Personal shopping','2026-09-12'),
  ($1,'income',70000,'Salary','Monthly salary','2026-08-01'),
  ($1,'expense',18000,'Rent','Home rent','2026-08-03'),
  ($1,'expense',5200,'Food','Groceries & dining','2026-08-06'),
  ($1,'expense',2200,'Transport','Commute','2026-08-08'),
  ($1,'expense',1600,'Utilities','Bills','2026-08-10')`,[userId]);
await pool.query(`INSERT INTO budgets(user_id,month,category,amount) VALUES
  ($1,'2026-09','Food',7000),($1,'2026-09','Transport',4000),($1,'2026-09','Shopping',5000),($1,'2026-09','Utilities',2500)`,[userId]);
await pool.query(`INSERT INTO goals(user_id,name,target_amount,current_amount,target_date) VALUES
  ($1,'Emergency Fund',150000,65000,'2027-03-31'),($1,'New Laptop',90000,30000,'2027-01-31')`,[userId]);
await pool.query(`INSERT INTO recurring_transactions(user_id,type,amount,category,description,frequency,next_run_date) VALUES
  ($1,'expense',18000,'Rent','Home rent','monthly','2026-10-03')`,[userId]);
await pool.query(`INSERT INTO net_worth_snapshots(user_id,total_assets,total_liabilities,net_worth,snapshot_date) VALUES($1,320000,95000,225000,'2026-09-29')`,[userId]);
console.log('Seed complete. Demo login: demo@financialinsights.local / Demo@12345');
await pool.end();
