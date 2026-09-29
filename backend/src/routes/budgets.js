import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const schema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/), category: z.string().trim().min(1).max(80), amount: z.coerce.number().nonnegative().max(1_000_000_000) });

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const month = String(req.query.month || new Date().toISOString().slice(0,7));
    const { rows } = await query(`SELECT b.id,b.month,b.category,b.amount::float,COALESCE(SUM(t.amount) FILTER (WHERE t.type='expense' AND TO_CHAR(t.transaction_date,'YYYY-MM')=b.month),0)::float AS spent FROM budgets b LEFT JOIN transactions t ON t.user_id=b.user_id AND t.category=b.category WHERE b.user_id=$1 AND b.month=$2 GROUP BY b.id ORDER BY b.category`, [req.user.id, month]);
    res.json({ budgets: rows.map(b => ({ ...b, remaining: Number(b.amount)-Number(b.spent), progress: Number(b.amount) ? Math.min(100, Number(b.spent)/Number(b.amount)*100) : 0 })) });
  } catch (err) { next(err); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const v = schema.parse(req.body);
    const { rows } = await query(`INSERT INTO budgets(user_id,month,category,amount) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,month,category) DO UPDATE SET amount=EXCLUDED.amount RETURNING id,month,category,amount::float`, [req.user.id, v.month, v.category, v.amount]);
    res.status(201).json({ budget: rows[0] });
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM budgets WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Budget not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
