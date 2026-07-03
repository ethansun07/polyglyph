import { Router } from 'express';
import pool from '../db.js';
import { ADMIN_EMAIL } from '../middleware/auth.js';

const router = Router();

// POST /api/users/me — upsert user record on login
router.post('/me', async (req, res) => {
  const { uid, email, name: display_name } = req.user;
  try {
    await pool.query(`
      INSERT INTO users (uid, email, display_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (uid) DO UPDATE SET
        email        = EXCLUDED.email,
        display_name = EXCLUDED.display_name
    `, [uid, email, display_name]);

    await pool.query(`
      INSERT INTO logs (uid, action, table_name, detail)
      VALUES ($1, 'upsert_user', 'users', $2)
    `, [uid, JSON.stringify({ email })]);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/all — admin only: all users with their progress
router.get('/all', async (req, res) => {
  if (req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const result = await pool.query(`
      SELECT
        u.uid, u.email, u.display_name, u.created_at,
        COALESCE(us.streak_count, 0)      AS streak_count,
        COALESCE(us.streak_last_date, '') AS streak_last_date,
        COALESCE((
          SELECT COUNT(*) FROM char_progress
          WHERE uid = u.uid AND (correct - wrong) >= 5
        ), 0) AS mastered_chars,
        COALESCE((
          SELECT SUM(correct + wrong) FROM char_progress
          WHERE uid = u.uid
        ), 0) AS total_reviews,
        COALESCE((
          SELECT SUM(correct) FROM char_progress WHERE uid = u.uid
        ), 0) AS total_correct,
        COALESCE((
          SELECT SUM(wrong) FROM char_progress WHERE uid = u.uid
        ), 0) AS total_wrong,
        COALESCE((
          SELECT COUNT(*) FROM phrase_progress
          WHERE uid = u.uid AND seen >= 1
        ), 0) AS phrases_seen,
        COALESCE((
          SELECT COUNT(*) FROM writing_progress
          WHERE uid = u.uid AND attempts > 0
        ), 0) AS writing_chars,
        (
          SELECT created_at FROM logs
          WHERE uid = u.uid
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_seen
      FROM users u
      LEFT JOIN user_settings us ON us.uid = u.uid
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
