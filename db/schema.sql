-- Amharic Fidel App — PostgreSQL Schema
-- Run: psql amharic_fidel -f db/schema.sql

CREATE TABLE IF NOT EXISTS users (
  uid          TEXT PRIMARY KEY,
  email        TEXT,
  display_name TEXT,
  is_anonymous BOOL DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_anonymous BOOL DEFAULT FALSE;
-- Derived from IP at request time (via self-hosted geoip-lite), never the
-- raw IP itself, and refreshed on every login.
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city    TEXT;

CREATE TABLE IF NOT EXISTS char_progress (
  uid       TEXT REFERENCES users(uid) ON DELETE CASCADE,
  char_id   TEXT,
  seen      INT     DEFAULT 0,
  correct   INT     DEFAULT 0,
  wrong     INT     DEFAULT 0,
  mastered  BOOL    DEFAULT FALSE,
  last_seen TIMESTAMPTZ,
  streak    INT     DEFAULT 0,
  interval  INT     DEFAULT 0,
  due       BIGINT  DEFAULT 0,
  PRIMARY KEY (uid, char_id)
);

CREATE TABLE IF NOT EXISTS phrase_progress (
  uid            TEXT REFERENCES users(uid) ON DELETE CASCADE,
  phrase_id      TEXT,
  seen           INT  DEFAULT 0,
  easy           INT  DEFAULT 0,
  hard           INT  DEFAULT 0,
  didnt_know     INT  DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  PRIMARY KEY (uid, phrase_id)
);

CREATE TABLE IF NOT EXISTS number_progress (
  uid     TEXT REFERENCES users(uid) ON DELETE CASCADE,
  value   TEXT,
  seen    INT DEFAULT 0,
  correct INT DEFAULT 0,
  wrong   INT DEFAULT 0,
  PRIMARY KEY (uid, value)
);

CREATE TABLE IF NOT EXISTS writing_progress (
  uid            TEXT REFERENCES users(uid) ON DELETE CASCADE,
  char_id        TEXT,
  attempts       INT DEFAULT 0,
  correct        INT DEFAULT 0,
  almost         INT DEFAULT 0,
  wrong          INT DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  PRIMARY KEY (uid, char_id)
);

-- item_id is a sentence or dialogue id from readingSentences.js. Both "seen
-- this before" and "bookmarked" live on the same row since they're both just
-- a user's relationship to one reading item.
CREATE TABLE IF NOT EXISTS reading_progress (
  uid        TEXT REFERENCES users(uid) ON DELETE CASCADE,
  item_id    TEXT,
  read       BOOL DEFAULT FALSE,
  bookmarked BOOL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (uid, item_id)
);

CREATE TABLE IF NOT EXISTS user_settings (
  uid                    TEXT PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  audio_enabled          BOOL DEFAULT TRUE,
  english_fallback       BOOL DEFAULT TRUE,
  streak_last_date       TEXT,
  streak_count           INT  DEFAULT 0,
  highest_unlocked_level INT  DEFAULT 1,
  phrase_test_passed     BOOL DEFAULT FALSE,
  phrase_test_high_scores       JSONB DEFAULT '{}'::jsonb,
  phrase_typing_high_scores     JSONB DEFAULT '{}'::jsonb,
  phrase_flashcard_high_scores  JSONB DEFAULT '{}'::jsonb
);
-- CREATE TABLE IF NOT EXISTS is a no-op against a table that already exists
-- under an older shape, so columns added since this table was first created
-- anywhere (including via ad-hoc ALTERs against just one environment) need
-- to be listed here explicitly, or other environments silently drift behind.
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS highest_unlocked_level INT DEFAULT 1;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS phrase_test_passed BOOL DEFAULT FALSE;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS phrase_test_high_scores JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS phrase_typing_high_scores JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS phrase_flashcard_high_scores JSONB DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS guest_sessions (
  anon_id       TEXT PRIMARY KEY,
  first_seen    TIMESTAMPTZ DEFAULT now(),
  last_seen     TIMESTAMPTZ DEFAULT now(),
  highest_level INT DEFAULT 1,
  chars_seen    INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS feedback (
  id         SERIAL PRIMARY KEY,
  uid        TEXT REFERENCES users(uid),
  anon_id    TEXT,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS logs (
  id         SERIAL PRIMARY KEY,
  uid        TEXT REFERENCES users(uid),
  action     TEXT,
  table_name TEXT,
  detail     JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
