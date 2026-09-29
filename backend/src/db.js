import 'dotenv/config';
import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function migrate() {
  const sqlPath = path.resolve(__dirname, '../migrations/001_initial.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');
  await pool.query(sql);
  console.log('Database migration complete.');
}

if (process.argv.includes('--migrate')) {
  migrate().then(() => pool.end()).catch((err) => {
    console.error(err);
    pool.end().finally(() => process.exit(1));
  });
}
