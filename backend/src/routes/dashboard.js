import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const monthsSchema = z.coerce.number().int().min(3).max(12).default(6);

router.get('/', requireAuth, async (req, res, next) => {
  try {
    await query('SELECT process_due_recurring($1)', [req.user.id]);
    const months = monthsSchema.parse(req.query.months);
    const [{ rows: totals }, { rows: trend }, { rows: categories }, { rows: budgets }, { rows: goals }, { rows: recent }, { rows: nw }] = await Promise.all([
      query(`SELECT COALESCE(SUM(amount) FILTER(WHERE type='income' AND transaction_date >= date_trunc('month',CURRENT_DATE)),0)::float AS income,COALESCE(SUM(amount) FILTER(WHERE type='expense' AND transaction_date >= date_trunc('month',CURRENT_DATE)),0)::float AS expenses FROM transactions WHERE user_id=$1`,[req.user.id]),
      query(`WITH series AS (SELECT generate_series(date_trunc('month',CURRENT_DATE) - make_interval(months => $2-1),date_trunc('month',CURRENT_DATE),'1 month')::date AS month) SELECT TO_CHAR(s.month,'Mon YYYY') AS label,COALESCE(SUM(t.amount) FILTER(WHERE t.type='income'),0)::float AS income,COALESCE(SUM(t.amount) FILTER(WHERE t.type='expense'),0)::float AS expenses FROM series s LEFT JOIN transactions t ON t.user_id=$1 AND t.transaction_date >= s.month AND t.transaction_date < s.month + INTERVAL '1 month' GROUP BY s.month ORDER BY s.month`,[req.user.id, months]),
      query(`SELECT category,SUM(amount)::float AS amount FROM transactions WHERE user_id=$1 AND type='expense' AND transaction_date >= date_trunc('month',CURRENT_DATE) GROUP BY category ORDER BY amount DESC LIMIT 8`,[req.user.id]),
      query(`SELECT b.id,b.category,b.amount::float,COALESCE(SUM(t.amount) FILTER(WHERE t.type='expense'),0)::float AS spent FROM budgets b LEFT JOIN transactions t ON t.user_id=b.user_id AND t.category=b.category AND TO_CHAR(t.transaction_date,'YYYY-MM')=b.month WHERE b.user_id=$1 AND b.month=TO_CHAR(CURRENT_DATE,'YYYY-MM') GROUP BY b.id ORDER BY b.amount DESC LIMIT 8`,[req.user.id]),
      query(`SELECT id,name,target_amount::float AS "targetAmount",current_amount::float AS "currentAmount",target_date AS "targetDate" FROM goals WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5`,[req.user.id]),
      query(`SELECT id,type,amount::float,category,description,transaction_date AS "transactionDate" FROM transactions WHERE user_id=$1 ORDER BY transaction_date DESC,created_at DESC LIMIT 6`,[req.user.id]),
      query(`SELECT total_assets::float AS "totalAssets",total_liabilities::float AS "totalLiabilities",net_worth::float AS "netWorth",snapshot_date AS "snapshotDate" FROM net_worth_snapshots WHERE user_id=$1 ORDER BY snapshot_date DESC,created_at DESC LIMIT 1`,[req.user.id]),
    ]);

    const income = Number(totals[0]?.income || 0), expenses = Number(totals[0]?.expenses || 0);
    res.json({
      summary: { income, expenses, savings: income - expenses, savingsRate: income ? (income-expenses)/income*100 : 0, netWorth: Number(nw[0]?.netWorth || 0) },
      trend,
      categories,
      budgets: budgets.map(b=>({ ...b, remaining:Number(b.amount)-Number(b.spent), progress:Number(b.amount)?Math.min(100,Number(b.spent)/Number(b.amount)*100):0 })),
      goals,
      recentTransactions: recent,
      latestNetWorth: nw[0] || null,
    });
  } catch (err) { next(err); }
});

router.post('/net-worth-snapshot', requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({ totalAssets: z.coerce.number().nonnegative(), totalLiabilities: z.coerce.number().nonnegative(), snapshotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });
    const v = schema.parse(req.body);
    const net = v.totalAssets - v.totalLiabilities;
    const { rows } = await query(`INSERT INTO net_worth_snapshots(user_id,total_assets,total_liabilities,net_worth,snapshot_date) VALUES($1,$2,$3,$4,COALESCE($5::date,CURRENT_DATE)) RETURNING id,total_assets::float AS "totalAssets",total_liabilities::float AS "totalLiabilities",net_worth::float AS "netWorth",snapshot_date AS "snapshotDate"`,[req.user.id,v.totalAssets,v.totalLiabilities,net,v.snapshotDate||null]);
    res.status(201).json({ snapshot: rows[0] });
  } catch (err) { next(err); }
});

export default router;
