import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/number-progress
router.get('/', async (req, res) => {
  const { uid } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM number_progress WHERE uid = $1', [uid]
    );
    const progress = {};
    for (const row of result.rows) {
      progress[row.value] = {
        seen:    row.seen,
        correct: row.correct,
        wrong:   row.wrong,
      };
    }
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/number-progress
router.put('/', async (req, res) => {
  const { uid } = req.user;
  const numbers = req.body; // { [value]: { seen, correct, wrong } }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const [value, s] of Object.entries(numbers)) {
      await client.query(`
        INSERT INTO number_progress (uid, value, seen, correct, wrong)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (uid, value) DO UPDATE SET
          seen    = EXCLUDED.seen,
          correct = EXCLUDED.correct,
          wrong   = EXCLUDED.wrong
      `, [uid, value, s.seen, s.correct, s.wrong]);
    }

    await client.query(`
      INSERT INTO logs (uid, action, table_name, detail)
      VALUES ($1, 'save_number_progress', 'number_progress', $2)
    `, [uid, JSON.stringify({ number_count: Object.keys(numbers).length })]);

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
