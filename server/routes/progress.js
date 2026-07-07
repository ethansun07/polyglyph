import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/progress — load char progress + streak + settings for the user
router.get('/', async (req, res) => {
  const { uid } = req.user;
  try {
    const [charsResult, settingsResult] = await Promise.all([
      pool.query('SELECT * FROM char_progress WHERE uid = $1', [uid]),
      pool.query('SELECT * FROM user_settings WHERE uid = $1', [uid]),
    ]);

    const chars = {};
    for (const row of charsResult.rows) {
      chars[row.char_id] = {
        seen:     row.seen,
        correct:  row.correct,
        wrong:    row.wrong,
        mastered: row.mastered,
        lastSeen: row.last_seen,
        streak:   row.streak,
        interval: row.interval,
        due:      Number(row.due),
      };
    }

    // No data yet — tell the frontend to fall back to localStorage
    if (charsResult.rows.length === 0 && !settingsResult.rows[0]) {
      return res.json(null);
    }

    const s = settingsResult.rows[0] || {};
    res.json({
      chars,
      streak:   { lastDate: s.streak_last_date || null, count: s.streak_count || 0 },
      settings: { audioEnabled: s.audio_enabled ?? true, englishFallback: s.english_fallback ?? true },
      highestUnlockedLevel:  s.highest_unlocked_level || 1,
      phraseTestPassed:      s.phrase_test_passed ?? false,
      phraseTestHighScores:  s.phrase_test_high_scores || {},
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/progress — save full progress blob (upserts each char row)
router.put('/', async (req, res) => {
  const { uid } = req.user;
  const { chars = {}, streak = {}, settings = {}, highestUnlockedLevel, phraseTestPassed, phraseTestHighScores } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const [char_id, s] of Object.entries(chars)) {
      await client.query(`
        INSERT INTO char_progress
          (uid, char_id, seen, correct, wrong, mastered, last_seen, streak, interval, due)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (uid, char_id) DO UPDATE SET
          seen      = EXCLUDED.seen,
          correct   = EXCLUDED.correct,
          wrong     = EXCLUDED.wrong,
          mastered  = EXCLUDED.mastered,
          last_seen = EXCLUDED.last_seen,
          streak    = EXCLUDED.streak,
          interval  = EXCLUDED.interval,
          due       = EXCLUDED.due
      `, [uid, char_id, s.seen, s.correct, s.wrong, s.mastered, s.lastSeen, s.streak, s.interval, s.due]);
    }

    await client.query(`
      INSERT INTO user_settings
        (uid, audio_enabled, english_fallback, streak_last_date, streak_count, highest_unlocked_level, phrase_test_passed, phrase_test_high_scores)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (uid) DO UPDATE SET
        audio_enabled            = EXCLUDED.audio_enabled,
        english_fallback         = EXCLUDED.english_fallback,
        streak_last_date         = EXCLUDED.streak_last_date,
        streak_count             = EXCLUDED.streak_count,
        highest_unlocked_level   = GREATEST(user_settings.highest_unlocked_level, EXCLUDED.highest_unlocked_level),
        phrase_test_passed       = user_settings.phrase_test_passed OR EXCLUDED.phrase_test_passed,
        phrase_test_high_scores  = EXCLUDED.phrase_test_high_scores
    `, [uid, settings.audioEnabled ?? true, settings.englishFallback ?? true,
        streak.lastDate ?? null, streak.count ?? 0,
        highestUnlockedLevel ?? 1, phraseTestPassed ?? false,
        JSON.stringify(phraseTestHighScores ?? {})]);

    await client.query(`
      INSERT INTO logs (uid, action, table_name, detail)
      VALUES ($1, 'save_progress', 'char_progress', $2)
    `, [uid, JSON.stringify({ char_count: Object.keys(chars).length })]);

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/progress — wipe all progress for the user
router.delete('/', async (req, res) => {
  const { uid } = req.user;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM char_progress   WHERE uid = $1', [uid]);
    await client.query('DELETE FROM phrase_progress  WHERE uid = $1', [uid]);
    await client.query('DELETE FROM number_progress  WHERE uid = $1', [uid]);
    await client.query('DELETE FROM user_settings    WHERE uid = $1', [uid]);
    await client.query(`
      INSERT INTO logs (uid, action, table_name, detail)
      VALUES ($1, 'reset_progress', 'all', '{}')
    `, [uid]);
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
