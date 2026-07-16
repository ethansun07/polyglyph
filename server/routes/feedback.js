import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, optionalAuth, ADMIN_EMAIL } from '../middleware/auth.js';

const router = Router();

// POST /api/feedback — optional auth: guests can submit too
router.post('/', optionalAuth, async (req, res) => {
  const { message, anonId } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Missing message' });
  try {
    await pool.query(`
      INSERT INTO feedback (uid, anon_id, message)
      VALUES ($1, $2, $3)
    `, [req.user?.uid ?? null, req.user ? null : (anonId ?? null), message.trim()]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback/all — admin only
router.get('/all', requireAuth, async (req, res) => {
  if (req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const result = await pool.query(`
      SELECT f.id, f.message, f.created_at, f.anon_id, u.email, u.display_name
      FROM feedback f
      LEFT JOIN users u ON u.uid = f.uid
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
