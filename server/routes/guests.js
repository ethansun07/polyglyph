import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, ADMIN_EMAIL } from '../middleware/auth.js';

const router = Router();

// POST /api/guests/ping — no auth: guests have no Firebase account to verify
router.post('/ping', async (req, res) => {
  const { anonId, highestLevel, charsSeen } = req.body;
  if (!anonId) return res.status(400).json({ error: 'Missing anonId' });
  try {
    await pool.query(`
      INSERT INTO guest_sessions (anon_id, highest_level, chars_seen)
      VALUES ($1, $2, $3)
      ON CONFLICT (anon_id) DO UPDATE SET
        last_seen     = now(),
        highest_level = GREATEST(guest_sessions.highest_level, EXCLUDED.highest_level),
        chars_seen    = GREATEST(guest_sessions.chars_seen, EXCLUDED.chars_seen)
    `, [anonId, highestLevel ?? 1, charsSeen ?? 0]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/guests/all — admin only: all guest sessions
router.get('/all', requireAuth, async (req, res) => {
  if (req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const result = await pool.query(`
      SELECT anon_id, first_seen, last_seen, highest_level, chars_seen
      FROM guest_sessions
      ORDER BY last_seen DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
