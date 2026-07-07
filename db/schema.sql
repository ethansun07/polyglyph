-- Amharic Fidel App — PostgreSQL Schema
-- Run: psql amharic_fidel -f db/schema.sql

CREATE TABLE IF NOT EXISTS users (
  uid          TEXT PRIMARY KEY,
  email        TEXT,
  display_name TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS logs (
  id         SERIAL PRIMARY KEY,
  uid        TEXT REFERENCES users(uid),
  action     TEXT,
  table_name TEXT,
  detail     JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
