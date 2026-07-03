import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/phrase-progress
router.get('/', async (req, res) => {
  const { uid } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM phrase_progress WHERE uid = $1', [uid]
    );
    const progress = {};
    for (const row of result.rows) {
      progress[row.phrase_id] = {
        seen:          row.seen,
        easy:          row.easy,
        hard:          row.hard,
        didntKnow:     row.didnt_know,
        lastPracticed: row.last_practiced,
      };
    }
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/phrase-progress
router.put('/', async (req, res) => {
  const { uid } = req.user;
  const phrases = req.body; // { [phraseId]: { seen, easy, hard, didntKnow, lastPracticed } }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const [phrase_id, s] of Object.entries(phrases)) {
      await client.query(`
        INSERT INTO phrase_progress
          (uid, phrase_id, seen, easy, hard, didnt_know, last_practiced)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (uid, phrase_id) DO UPDATE SET
          seen           = EXCLUDED.seen,
          easy           = EXCLUDED.easy,
          hard           = EXCLUDED.hard,
          didnt_know     = EXCLUDED.didnt_know,
          last_practiced = EXCLUDED.last_practiced
      `, [uid, phrase_id, s.seen, s.easy, s.hard, s.didntKnow, s.lastPracticed]);
    }

    await client.query(`
      INSERT INTO logs (uid, action, table_name, detail)
      VALUES ($1, 'save_phrase_progress', 'phrase_progress', $2)
    `, [uid, JSON.stringify({ phrase_count: Object.keys(phrases).length })]);

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
