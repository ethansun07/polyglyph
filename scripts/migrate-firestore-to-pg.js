// One-time migration: Firestore → Postgres
// Run from project root: node scripts/migrate-firestore-to-pg.js <uid>
// Find your uid in Firestore Console → users collection → your document id

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import pg from 'pg';

const { Pool } = pg;

const firebaseConfig = {
  apiKey:            'AIzaSyAp1t8bisFVxFm6no6u_3VcTG_V0SIj640',
  authDomain:        'amharic-fidel.firebaseapp.com',
  projectId:         'amharic-fidel',
  storageBucket:     'amharic-fidel.firebasestorage.app',
  messagingSenderId: '519826179599',
  appId:             '1:519826179599:web:65f10230cd69500675c57a',
};

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node scripts/migrate-firestore-to-pg.js <uid>');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const pool = new Pool({ database: 'amharic_fidel' });

async function cloudGet(key) {
  const snap = await getDoc(doc(db, 'users', uid, 'data', key));
  return snap.exists() ? snap.data() : null;
}

async function migrate() {
  const [progress, phraseProgress, numberProgress] = await Promise.all([
    cloudGet('progress'),
    cloudGet('phraseProgress'),
    cloudGet('numberProgress'),
  ]);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure user row exists
    await client.query(`
      INSERT INTO users (uid) VALUES ($1) ON CONFLICT DO NOTHING
    `, [uid]);

    // Char progress
    if (progress?.chars) {
      for (const [char_id, s] of Object.entries(progress.chars)) {
        await client.query(`
          INSERT INTO char_progress
            (uid, char_id, seen, correct, wrong, mastered, last_seen, streak, interval, due)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
          ON CONFLICT (uid, char_id) DO UPDATE SET
            seen=EXCLUDED.seen, correct=EXCLUDED.correct, wrong=EXCLUDED.wrong,
            mastered=EXCLUDED.mastered, last_seen=EXCLUDED.last_seen,
            streak=EXCLUDED.streak, interval=EXCLUDED.interval, due=EXCLUDED.due
        `, [uid, char_id, s.seen, s.correct, s.wrong, s.mastered,
            s.lastSeen, s.streak ?? 0, s.interval ?? 0, s.due ?? 0]);
      }
      console.log(`✓ Migrated ${Object.keys(progress.chars).length} chars`);
    }

    // Settings + streak
    if (progress) {
      await client.query(`
        INSERT INTO user_settings
          (uid, audio_enabled, english_fallback, streak_last_date, streak_count)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (uid) DO UPDATE SET
          audio_enabled=EXCLUDED.audio_enabled,
          english_fallback=EXCLUDED.english_fallback,
          streak_last_date=EXCLUDED.streak_last_date,
          streak_count=EXCLUDED.streak_count
      `, [uid,
          progress.settings?.audioEnabled ?? true,
          progress.settings?.englishFallback ?? true,
          progress.streak?.lastDate ?? null,
          progress.streak?.count ?? 0]);
      console.log('✓ Migrated settings + streak');
    }

    // Phrase progress
    if (phraseProgress) {
      for (const [phrase_id, s] of Object.entries(phraseProgress)) {
        await client.query(`
          INSERT INTO phrase_progress
            (uid, phrase_id, seen, easy, hard, didnt_know, last_practiced)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          ON CONFLICT (uid, phrase_id) DO UPDATE SET
            seen=EXCLUDED.seen, easy=EXCLUDED.easy, hard=EXCLUDED.hard,
            didnt_know=EXCLUDED.didnt_know, last_practiced=EXCLUDED.last_practiced
        `, [uid, phrase_id, s.seen, s.easy, s.hard, s.didntKnow, s.lastPracticed]);
      }
      console.log(`✓ Migrated ${Object.keys(phraseProgress).length} phrases`);
    }

    // Number progress
    if (numberProgress) {
      for (const [value, s] of Object.entries(numberProgress)) {
        await client.query(`
          INSERT INTO number_progress (uid, value, seen, correct, wrong)
          VALUES ($1,$2,$3,$4,$5)
          ON CONFLICT (uid, value) DO UPDATE SET
            seen=EXCLUDED.seen, correct=EXCLUDED.correct, wrong=EXCLUDED.wrong
        `, [uid, value, s.seen, s.correct, s.wrong]);
      }
      console.log(`✓ Migrated ${Object.keys(numberProgress).length} numbers`);
    }

    await client.query(`
      INSERT INTO logs (uid, action, table_name, detail)
      VALUES ($1, 'firestore_migration', 'all', '{}')
    `, [uid]);

    await client.query('COMMIT');
    console.log('Migration complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

migrate();
