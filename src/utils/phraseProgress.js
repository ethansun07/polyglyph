const PHRASE_KEY        = 'amharic_phrases_v1';
const BROWSE_SEEN_KEY   = 'amharic_phrases_browse_seen_v1';

const DEFAULT = { seen: 0, easy: 0, hard: 0, didntKnow: 0, lastPracticed: null };

// ─── Load / Save ──────────────────────────────────────────────────────────────
export function loadPhraseProgress() {
  try {
    const raw = localStorage.getItem(PHRASE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function savePhraseProgress(p) {
  localStorage.setItem(PHRASE_KEY, JSON.stringify(p));
}

export function resetPhraseProgress() {
  localStorage.removeItem(PHRASE_KEY);
  localStorage.removeItem(BROWSE_SEEN_KEY);
}

// Merge per-phrase, keeping whichever side saw it more recently — a stale
// cloud snapshot must never clobber more-advanced local progress.
export function mergePhraseProgress(local, cloud) {
  const merged = { ...(cloud || {}) };
  for (const [id, localEntry] of Object.entries(local || {})) {
    const cloudEntry = merged[id];
    if (!cloudEntry || new Date(localEntry.lastPracticed || 0) > new Date(cloudEntry.lastPracticed || 0)) {
      merged[id] = localEntry;
    }
  }
  return merged;
}

// ─── Browse-seen tracking (local only, no cloud sync needed) ─────────────────

export function loadBrowseSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(BROWSE_SEEN_KEY) || '[]'));
  } catch { return new Set(); }
}

export function markBrowseSeen(phraseId, currentSet) {
  const next = new Set(currentSet);
  next.add(phraseId);
  localStorage.setItem(BROWSE_SEEN_KEY, JSON.stringify([...next]));
  return next;
}

// ─── Per-phrase state ─────────────────────────────────────────────────────────
export function getPhraseState(progress, phraseId) {
  return progress[phraseId] || { ...DEFAULT };
}

export function recordPhraseResult(progress, phraseId, result) {
  // result: 'easy' | 'hard' | 'didntKnow'
  const prev = getPhraseState(progress, phraseId);
  return {
    ...progress,
    [phraseId]: {
      seen:          prev.seen + 1,
      easy:          prev.easy      + (result === 'easy'      ? 1 : 0),
      hard:          prev.hard      + (result === 'hard'      ? 1 : 0),
      didntKnow:     prev.didntKnow + (result === 'didntKnow' ? 1 : 0),
      lastPracticed: new Date().toISOString(),
    },
  };
}

// ─── Spaced-repetition weight ─────────────────────────────────────────────────
// Phrases you know well (net easy−didntKnow ≥ 3) appear rarely; unseen appear often.
export function getPhraseWeight(progress, phraseId) {
  const s = getPhraseState(progress, phraseId);
  if (s.seen === 0) return 8;
  const net = s.easy - s.didntKnow;
  if (net >= 3)  return 1;
  if (net < 0)   return 10;
  if (net === 0) return 7;
  if (net === 1) return 4;
  return 2;
}

export function weightedPickPhrase(phrases, progress) {
  if (!phrases || phrases.length === 0) return null;
  const weights = phrases.map(p => getPhraseWeight(progress, p.id));
  const total   = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < phrases.length; i++) {
    r -= weights[i];
    if (r <= 0) return phrases[i];
  }
  return phrases[phrases.length - 1];
}

// ─── Aggregate stats ──────────────────────────────────────────────────────────
export function getPhraseStats(phrases, progress) {
  const total = phrases.length;
  const seen  = phrases.filter(p => getPhraseState(progress, p.id).seen > 0).length;
  return { total, seen };
}
