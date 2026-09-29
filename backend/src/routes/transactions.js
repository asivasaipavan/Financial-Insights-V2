import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const txSchema = z.object({
  type: z.enum(['income','expense']),
  amount: z.coerce.number().positive().max(1_000_000_000),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(180).default(''),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    await query('SELECT process_due_recurring($1)', [req.user.id]).catch(() => {});
    const limit = Math.min(200, Math.max(1, Number(req.query.limit || 100)));
    const { rows } = await query(`SELECT id,type,amount::float,category,description,transaction_date AS "transactionDate",created_at AS "createdAt" FROM transactions WHERE user_id=$1 ORDER BY transaction_date DESC,created_at DESC LIMIT $2`, [req.user.id, limit]);
    res.json({ transactions: rows });
  } catch (err) { next(err); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const v = txSchema.parse(req.body);
    const { rows } = await query(`INSERT INTO transactions(user_id,type,amount,category,description,transaction_date) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,type,amount::float,category,description,transaction_date AS "transactionDate",created_at AS "createdAt"`, [req.user.id, v.type, v.amount, v.category, v.description, v.transactionDate]);
    res.status(201).json({ transaction: rows[0] });
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const v = txSchema.parse(req.body);
    const { rows } = await query(`UPDATE transactions SET type=$1,amount=$2,category=$3,description=$4,transaction_date=$5 WHERE id=$6 AND user_id=$7 RETURNING id,type,amount::float,category,description,transaction_date AS "transactionDate",created_at AS "createdAt"`, [v.type, v.amount, v.category, v.description, v.transactionDate, req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ transaction: rows[0] });
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM transactions WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Transaction not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
