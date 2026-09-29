import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();
const credentials = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});
const loginSchema = credentials.pick({ email: true, password: true });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = credentials.parse(req.body);
    const normalizedEmail = email.toLowerCase();
    const exists = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (exists.rowCount) return res.status(409).json({ message: 'An account with that email already exists.' });
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,created_at', [name, normalizedEmail, hash]);
    const user = rows[0];
    res.status(201).json({ token: signToken(user), user });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { rows } = await query('SELECT id,name,email,password_hash,created_at FROM users WHERE email = $1', [email.toLowerCase()]);
    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) return res.status(401).json({ message: 'Invalid email or password.' });
    const { password_hash, ...user } = rows[0];
    res.json({ token: signToken(user), user });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT id,name,email,created_at FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
});

export default router;
