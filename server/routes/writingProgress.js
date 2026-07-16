import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/writing-progress
router.get('/', async (req, res) => {
  const { uid } = req.user;
  try {
    // TEMPORARY diagnostic logging — tracking down a cross-account data leak
    pool.query(`
      INSERT INTO logs (uid, action, table_name, detail)
      VALUES ($1, 'debug_get_writing_progress', 'writing_progress', $2)
    `, [uid, JSON.stringify({ email: req.user.email, name: req.user.name })]).catch(() => {});
    const result = await pool.query(
      'SELECT * FROM writing_progress WHERE uid = $1', [uid]
    );
    const progress = {};
    for (const row of result.rows) {
      progress[row.char_id] = {
        attempts:      row.attempts,
        correct:       row.correct,
        almost:        row.almost,
        wrong:         row.wrong,
        lastPracticed: row.last_practiced,
      };
    }
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/writing-progress
router.put('/', async (req, res) => {
  const { uid } = req.user;
  const chars = req.body; // { [charId]: { attempts, correct, almost, wrong, lastPracticed } }
  const client = await pool.connect();
  try {
    // TEMPORARY diagnostic logging — tracking down a cross-account data leak
    await client.query(`
      INSERT INTO logs (uid, action, table_name, detail)
      VALUES ($1, 'debug_put_writing_progress', 'writing_progress', $2)
    `, [uid, JSON.stringify({ email: req.user.email, count: Object.keys(chars).length })]);
    await client.query('BEGIN');
    for (const [char_id, s] of Object.entries(chars)) {
      await client.query(`
        INSERT INTO writing_progress (uid, char_id, attempts, correct, almost, wrong, last_practiced)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (uid, char_id) DO UPDATE SET
          attempts       = EXCLUDED.attempts,
          correct        = EXCLUDED.correct,
          almost         = EXCLUDED.almost,
          wrong          = EXCLUDED.wrong,
          last_practiced = EXCLUDED.last_practiced
      `, [uid, char_id, s.attempts, s.correct, s.almost, s.wrong, s.lastPracticed]);
    }
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
