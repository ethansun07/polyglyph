import { getAllChars, getLevelChars, LEVELS } from '../data/fidel.js';

const STORAGE_KEY = 'amharic_fidel_v1';

// ─── Mastery thresholds ───────────────────────────────────────────────────────
const MASTERY_NET = 5;              // correct − wrong must reach this
const LEVEL_UNLOCK_THRESHOLD = 0.85; // 85% of prev level must be mastered

// ─── SRS intervals (days per streak level) ───────────────────────────────────
const SRS_INTERVALS = [1, 3, 7, 14, 30, 60];

// ─── Load / Save / Reset ─────────────────────────────────────────────────────
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const def = makeDefaultProgress();
      return { ...def, ...saved, settings: { ...def.settings, ...saved.settings } };
    }
  } catch {
    // corrupt storage — start fresh
  }
  return makeDefaultProgress();
}

export function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(READ_SEEN_KEY);
  localStorage.removeItem('amharic_word_drills_seen');
}

export function makeDefaultProgress() {
  return {
    chars: {},   // { [charId]: { seen, correct, wrong, mastered, lastSeen } }
    streak: { lastDate: null, count: 0 },
    settings: { audioEnabled: true, englishFallback: true, extendedChars: false },
    phraseTestPassed: false,
    readUnlockedByAdmin: false,
  };
}

// ─── Individual character state ───────────────────────────────────────────────
const DEFAULT_CHAR = { seen: 0, correct: 0, wrong: 0, mastered: false, lastSeen: null, streak: 0, interval: 0, due: 0 };

export function getCharState(progress, charId) {
  const s = progress.chars[charId] || { ...DEFAULT_CHAR };
  return s.wrong > s.correct ? { ...s, wrong: s.correct } : s;
}

export function getCharNet(progress, charId) {
  const s = getCharState(progress, charId);
  return Math.max(0, s.correct - s.wrong);
}

export function recordAnswer(progress, charId, wasCorrect) {
  const prev = getCharState(progress, charId);
  const now = Date.now();

  const seen    = prev.seen + 1;
  const correct = prev.correct + (wasCorrect ? 1 : 0);
  const wrong   = prev.wrong   + (wasCorrect ? 0 : 1);
  const mastered = Math.max(0, correct - wrong) >= MASTERY_NET;

  const streak = wasCorrect ? (prev.streak || 0) + 1 : 0;
  const idx = Math.min(streak - 1, SRS_INTERVALS.length - 1);
  const interval = wasCorrect ? SRS_INTERVALS[Math.max(0, idx)] : 0;
  const due = wasCorrect ? now + interval * 86_400_000 : now;

  return {
    ...progress,
    chars: {
      ...progress.chars,
      [charId]: { seen, correct, wrong, mastered, lastSeen: new Date().toISOString(), streak, interval, due },
    },
  };
}

export function isCharMastered(progress, charId) {
  const s = getCharState(progress, charId);
  return s.seen > 0 && getCharNet(progress, charId) >= MASTERY_NET;
}

// ─── Level unlock logic ───────────────────────────────────────────────────────
export function isLevelUnlocked(progress, levelNum) {
  if (levelNum === 1) return true;
  // Once unlocked, stays unlocked
  if (levelNum <= (progress.highestUnlockedLevel || 1)) return true;
  const prevChars = getLevelChars(levelNum - 1);
  if (prevChars.length === 0) return false;
  const masteredCount = prevChars.filter(c => isCharMastered(progress, c.id)).length;
  return masteredCount / prevChars.length >= LEVEL_UNLOCK_THRESHOLD;
}

/** Highest level that is currently unlocked (never decreases). */
export function getHighestUnlockedLevel(progress) {
  let highest = 1;
  for (const lvl of LEVELS) {
    if (isLevelUnlocked(progress, lvl.level)) highest = lvl.level;
    else break;
  }
  return highest;
}

/** All unlocked level numbers. */
export function getUnlockedLevels(progress) {
  return LEVELS.filter(l => isLevelUnlocked(progress, l.level)).map(l => l.level);
}

// ─── Stats helpers ────────────────────────────────────────────────────────────
export function getLevelProgress(progress, levelNum) {
  const chars = getLevelChars(levelNum);
  const total = chars.length;
  const mastered = chars.filter(c => isCharMastered(progress, c.id)).length;
  const seen = chars.filter(c => getCharState(progress, c.id).seen > 0).length;
  return { total, mastered, seen, pct: total > 0 ? mastered / total : 0 };
}

export function getTotalStats(progress) {
  const allChars = getAllChars();
  const total = allChars.length;
  const mastered = allChars.filter(c => isCharMastered(progress, c.id)).length;
  const seen = allChars.filter(c => getCharState(progress, c.id).seen > 0).length;
  const totalCorrect = allChars.reduce((s, c) => s + getCharState(progress, c.id).correct, 0);
  const totalSeen = allChars.reduce((s, c) => s + getCharState(progress, c.id).seen, 0);
  return {
    total,
    mastered,
    seen,
    accuracy: totalSeen > 0 ? totalCorrect / totalSeen : 0,
  };
}

// ─── Read mode unlock ────────────────────────────────────────────────────────

export function isLevel7Mastered(progress) {
  const level7Chars = getLevelChars(7);
  if (level7Chars.length === 0) return false;
  const masteredCount = level7Chars.filter(c => isCharMastered(progress, c.id)).length;
  return masteredCount / level7Chars.length >= LEVEL_UNLOCK_THRESHOLD;
}

// ─── Read mode: which sentences/dialogues have been opened (local only) ──────
const READ_SEEN_KEY = 'amharic_read_seen_v1';

export function loadReadSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_SEEN_KEY) || '[]'));
  } catch { return new Set(); }
}

export function markReadSeen(id, currentSet) {
  if (currentSet.has(id)) return currentSet;
  const next = new Set(currentSet);
  next.add(id);
  localStorage.setItem(READ_SEEN_KEY, JSON.stringify([...next]));
  return next;
}

export function isReadModeUnlocked(progress) {
  if (progress.readUnlockedByAdmin) return true;
  return isLevel7Mastered(progress) && progress.phraseTestPassed === true;
}

// ─── Streak ───────────────────────────────────────────────────────────────────
export function updateStreak(progress) {
  const today = new Date().toDateString();
  if (progress.streak?.lastDate === today) return progress; // already updated today

  const yesterday = new Date(Date.now() - 86_400_000).toDateString();
  const isConsecutive = progress.streak?.lastDate === yesterday;
  const newCount = isConsecutive ? (progress.streak.count || 0) + 1 : 1;

  return { ...progress, streak: { lastDate: today, count: newCount } };
}
