import pg from 'pg';
const { Pool } = pg;

const host = process.env.DB_HOST || 'localhost';

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host,
      database: process.env.DB_NAME     || 'amharic_fidel',
      user:     process.env.DB_USER     || process.env.USER,
      password: process.env.DB_PASSWORD || '',
      port:     Number(process.env.DB_PORT) || 5432,
      ssl:      host === 'localhost' ? false : { rejectUnauthorized: false },
    });

export default pool;
