import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/reading-progress
router.get('/', async (req, res) => {
  const { uid } = req.user;
  try {
    const result = await pool.query(
      'SELECT * FROM reading_progress WHERE uid = $1', [uid]
    );
    const progress = {};
    for (const row of result.rows) {
      progress[row.item_id] = {
        read:       row.read,
        bookmarked: row.bookmarked,
      };
    }
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reading-progress
router.put('/', async (req, res) => {
  const { uid } = req.user;
  const items = req.body; // { [itemId]: { read, bookmarked } }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [item_id, s] of Object.entries(items)) {
      await client.query(`
        INSERT INTO reading_progress (uid, item_id, read, bookmarked, updated_at)
        VALUES ($1, $2, $3, $4, now())
        ON CONFLICT (uid, item_id) DO UPDATE SET
          read       = EXCLUDED.read,
          bookmarked = EXCLUDED.bookmarked,
          updated_at = now()
      `, [uid, item_id, !!s.read, !!s.bookmarked]);
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
