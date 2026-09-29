import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const schema = z.object({ name: z.string().trim().min(1).max(120), targetAmount: z.coerce.number().positive().max(1_000_000_000), currentAmount: z.coerce.number().nonnegative().max(1_000_000_000).default(0), targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional() });

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(`SELECT id,name,target_amount::float AS "targetAmount",current_amount::float AS "currentAmount",target_date AS "targetDate",created_at AS "createdAt" FROM goals WHERE user_id=$1 ORDER BY target_date NULLS LAST,created_at DESC`, [req.user.id]);
    res.json({ goals: rows });
  } catch (err) { next(err); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const v = schema.parse(req.body);
    const { rows } = await query(`INSERT INTO goals(user_id,name,target_amount,current_amount,target_date) VALUES($1,$2,$3,$4,$5) RETURNING id,name,target_amount::float AS "targetAmount",current_amount::float AS "currentAmount",target_date AS "targetDate"`, [req.user.id, v.name, v.targetAmount, v.currentAmount, v.targetDate || null]);
    res.status(201).json({ goal: rows[0] });
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const v = schema.parse(req.body);
    const { rows } = await query(`UPDATE goals SET name=$1,target_amount=$2,current_amount=$3,target_date=$4 WHERE id=$5 AND user_id=$6 RETURNING id,name,target_amount::float AS "targetAmount",current_amount::float AS "currentAmount",target_date AS "targetDate"`, [v.name, v.targetAmount, v.currentAmount, v.targetDate || null, req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ goal: rows[0] });
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM goals WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Goal not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
