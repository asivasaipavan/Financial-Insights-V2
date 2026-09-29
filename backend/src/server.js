import 'dotenv/config';
import app from './app.js';
import { pool } from './db.js';

const port = Number(process.env.PORT || 5000);

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Copy .env.example to .env and configure it.');
  process.exit(1);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
  console.error('JWT_SECRET must be at least 24 characters.');
  process.exit(1);
}

const server = app.listen(port, '0.0.0.0', () => console.log(`Financial Insights API listening on port ${port}`));

const shutdown = async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
