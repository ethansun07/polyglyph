import { getCharState } from './progress.js';

// ─── Sound-alike rows ─────────────────────────────────────────────────────────
// Historically-distinct consonants that have merged to the same modern
// pronunciation. Different rows, same sound at the same vowel order — audio
// questions must never ask a learner to distinguish these by ear.
const SOUND_GROUPS = [
  ['se', 'se_old'],           // ሰ / ሠ — both /s/
  ['tse', 'tse2'],            // ጸ / ፀ — both /sʼ/
  ['ha', 'he', 'khe', 'hhe'], // ሀ / ሐ / ኀ / ኸ — all /h/
  ['a', 'gha'],               // አ / ዐ — both glottal stop
];
const ROW_TO_SOUND_GROUP = {};
SOUND_GROUPS.forEach((rows, i) => rows.forEach(rowId => { ROW_TO_SOUND_GROUP[rowId] = i; }));

/** True if two chars are indistinguishable by ear (same romanization, or
 *  same historically-merged sound group at the same vowel order). */
function soundsLike(a, b) {
  if (a.id === b.id) return false;
  if (a.romanization === b.romanization) return true;
  const groupA = ROW_TO_SOUND_GROUP[a.rowId];
  const groupB = ROW_TO_SOUND_GROUP[b.rowId];
  return groupA !== undefined && groupA === groupB && a.order === b.order;
}

// ─── SRS-aware weights ───────────────────────────────────────────────────────
// Higher weight → character is picked more often.
export function getCharWeight(progress, charId) {
  const s = getCharState(progress, charId);
  const now = Date.now();

  if (s.seen === 0) return 8; // new — high priority

  const net = Math.max(0, s.correct - s.wrong);

  // Only suppress via SRS once the character is solidly learned
  if (net >= 3 && s.due && s.due > now) return 0.5;

  // Due or overdue — weight by net score (mirrors mastery threshold of 5)
  if (net <= 0)  return 10;
  if (net <= 2)  return 7;
  if (net <= 4)  return 4;
  return 3; // mastered (net >= 5) but due for review
}

/** Pick one character from an array using weighted random. */
export function weightedRandomPick(chars, progress, excludeId = null) {
  if (chars.length === 0) return null;
  const pool = chars.length > 1 && excludeId ? chars.filter(c => c.id !== excludeId) : chars;
  const weights = pool.map(c => getCharWeight(progress, c.id));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// ─── Shuffle utility ──────────────────────────────────────────────────────────
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Quiz (show char → pick romanization) ────────────────────────────────────
/**
 * Returns 4 romanization strings: [correct, ...3 wrong], already shuffled.
 * Distractors prefer same-row characters (confusable vowel orders).
 */
export function buildQuizChoices(correctChar, allUnlockedChars) {
  const correct = correctChar.romanization;

  // Same-row characters as confusable distractors (different order, same consonant)
  const sameRow = allUnlockedChars.filter(
    c => c.rowId === correctChar.rowId && c.romanization !== correct
  );
  // Other rows
  const otherRows = allUnlockedChars.filter(
    c => c.rowId !== correctChar.rowId && c.romanization !== correct
  );

  const distractors = new Set();
  for (const c of shuffle(sameRow)) {
    if (distractors.size >= 1) break;
    distractors.add(c.romanization);
  }
  for (const c of shuffle(otherRows)) {
    if (distractors.size >= 3) break;
    if (!distractors.has(c.romanization)) distractors.add(c.romanization);
  }

  // Fall back to anything if pool too small
  for (const c of shuffle(allUnlockedChars)) {
    if (distractors.size >= 3) break;
    if (c.romanization !== correct && !distractors.has(c.romanization))
      distractors.add(c.romanization);
  }

  return shuffle([correct, ...[...distractors].slice(0, 3)]);
}

// ─── Reverse quiz (show romanization → pick char) ────────────────────────────
/**
 * Returns 4 character objects: [correctChar, ...3 wrong], already shuffled.
 * Distractors prefer same-row characters.
 * Skips generating a question if the romanization is ambiguous
 * (used by multiple characters), to avoid unfair questions.
 */
export function buildReverseChoices(correctChar, allUnlockedChars) {
  // Find all chars that sound the same (ambiguous case)
  const siblings = allUnlockedChars.filter(c => soundsLike(correctChar, c));
  // If ambiguous, caller should skip this character
  if (siblings.length > 0) return null;

  const sameRow = allUnlockedChars.filter(
    c => c.rowId === correctChar.rowId && c.id !== correctChar.id
  );
  const otherRows = allUnlockedChars.filter(
    c => c.rowId !== correctChar.rowId && c.id !== correctChar.id
  );

  const distractors = [];
  for (const c of shuffle(sameRow)) {
    if (distractors.length >= 1) break;
    distractors.push(c);
  }
  for (const c of shuffle(otherRows)) {
    if (distractors.length >= 3) break;
    distractors.push(c);
  }
  for (const c of shuffle(allUnlockedChars)) {
    if (distractors.length >= 3) break;
    if (c.id !== correctChar.id && !distractors.find(d => d.id === c.id))
      distractors.push(c);
  }

  return shuffle([correctChar, ...distractors.slice(0, 3)]);
}

/**
 * Pick a character suitable for reverse quiz from a pool.
 * Skips ambiguous romanizations (e.g. ሀ and ኸ both say "hä").
 */
export function pickReverseChar(chars, progress) {
  // Build list of chars with no sound-alike sibling within the pool
  const unique = chars.filter(c => !chars.some(other => soundsLike(c, other)));
  if (unique.length === 0) return weightedRandomPick(chars, progress); // fallback
  return weightedRandomPick(unique, progress);
}
