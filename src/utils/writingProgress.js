const WRITING_KEY = 'amharic_writing_v1';
const MASTERY_NET = 3; // correct − wrong must reach this (mirrors reading's system)

const DEFAULT = { attempts: 0, correct: 0, almost: 0, wrong: 0, lastPracticed: null };

export function loadWritingProgress() {
  try {
    const raw = localStorage.getItem(WRITING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveWritingProgress(p) {
  localStorage.setItem(WRITING_KEY, JSON.stringify(p));
}

// Merge per-char, keeping whichever side practiced it more recently — a stale
// cloud snapshot must never clobber more-advanced local progress.
export function mergeWritingProgress(local, cloud) {
  const merged = { ...(cloud || {}) };
  for (const [id, localEntry] of Object.entries(local || {})) {
    const cloudEntry = merged[id];
    if (!cloudEntry || new Date(localEntry.lastPracticed || 0) > new Date(cloudEntry.lastPracticed || 0)) {
      merged[id] = localEntry;
    }
  }
  return merged;
}

export function getWritingState(progress, charId) {
  const s = progress[charId] || { ...DEFAULT };
  return s.wrong > s.correct ? { ...s, wrong: s.correct } : s;
}

export function recordWritingResult(progress, charId, result) {
  const prev = getWritingState(progress, charId);
  return {
    ...progress,
    [charId]: {
      attempts:      prev.attempts + 1,
      correct:       prev.correct  + (result === 'correct' ? 1 : 0),
      almost:        prev.almost   + (result === 'almost'  ? 1 : 0),
      wrong:         prev.wrong    + (result === 'wrong'   ? 1 : 0),
      lastPracticed: new Date().toISOString(),
    },
  };
}

export function isWritingMastered(progress, charId) {
  const s = getWritingState(progress, charId);
  return Math.max(0, s.correct - s.wrong) >= MASTERY_NET;
}

// Higher weight = appears more often in quiz
export function getWritingWeight(progress, charId) {
  const s = getWritingState(progress, charId);
  if (s.attempts === 0) return 8;
  if (isWritingMastered(progress, charId)) return 1;
  const net = Math.max(0, s.correct - s.wrong);
  if (net < 0)  return 10;
  if (net === 0) return 7;
  if (net === 1) return 4;
  return 2;
}

export function weightedPickChar(chars, writingProgress, excludeId = null) {
  if (!chars || chars.length === 0) return null;
  const pool = chars.length > 1 && excludeId ? chars.filter(c => c.id !== excludeId) : chars;
  const weights = pool.map(c => getWritingWeight(writingProgress, c.id));
  const total   = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// Characters that have been attempted but are not yet mastered
export function getWeakWritingChars(chars, writingProgress) {
  const weak = chars.filter(c => {
    const s = getWritingState(writingProgress, c.id);
    return s.attempts > 0 && !isWritingMastered(writingProgress, c.id);
  });
  // If nothing weak yet, return all (so the picker always has something)
  return weak.length > 0 ? weak : chars;
}

export function getWritingStats(chars, writingProgress) {
  const total    = chars.length;
  const mastered = chars.filter(c => isWritingMastered(writingProgress, c.id)).length;
  const attempted = chars.filter(c => getWritingState(writingProgress, c.id).attempts > 0).length;
  return { total, mastered, attempted };
}
