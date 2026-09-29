import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const schema = z.object({
  type: z.enum(['income','expense']),
  amount: z.coerce.number().positive().max(1_000_000_000),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(180).default(''),
  frequency: z.enum(['monthly','yearly']),
  nextRunDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  active: z.boolean().default(true),
});

router.post('/apply-due', requireAuth, async (req, res, next) => {
  try {
    const result = await query('SELECT process_due_recurring($1) AS processed', [req.user.id]);
    res.json({ processed: Number(result.rows[0]?.processed || 0) });
  } catch (err) { next(err); }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(`SELECT id,type,amount::float,category,description,frequency,next_run_date AS "nextRunDate",active,created_at AS "createdAt" FROM recurring_transactions WHERE user_id=$1 ORDER BY active DESC,next_run_date`, [req.user.id]);
    res.json({ recurringTransactions: rows });
  } catch (err) { next(err); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const v = schema.parse(req.body);
    const { rows } = await query(`INSERT INTO recurring_transactions(user_id,type,amount,category,description,frequency,next_run_date,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,type,amount::float,category,description,frequency,next_run_date AS "nextRunDate",active`, [req.user.id,v.type,v.amount,v.category,v.description,v.frequency,v.nextRunDate,v.active]);
    res.status(201).json({ recurringTransaction: rows[0] });
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const v = schema.parse(req.body);
    const { rows } = await query(`UPDATE recurring_transactions SET type=$1,amount=$2,category=$3,description=$4,frequency=$5,next_run_date=$6,active=$7 WHERE id=$8 AND user_id=$9 RETURNING id,type,amount::float,category,description,frequency,next_run_date AS "nextRunDate",active`, [v.type,v.amount,v.category,v.description,v.frequency,v.nextRunDate,v.active,req.params.id,req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Recurring transaction not found.' });
    res.json({ recurringTransaction: rows[0] });
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM recurring_transactions WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Recurring transaction not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
