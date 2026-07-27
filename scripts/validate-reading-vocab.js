#!/usr/bin/env node
/**
 * Audits src/data/readingSentences.js against the actual taught vocabulary
 * (Common Phrases + cognates/proper nouns + Ethiopic number words + the
 * fixed connector set documented in readingSentences.js's own header) and
 * flags any word that isn't in that set.
 *
 * Usage: node scripts/validate-reading-vocab.js
 *
 * Best-effort: strips a small hardcoded set of Amharic suffixes (definite
 * -ው/-ቱ/-ሉ/etc, object marker -ን, first-person possessive -ቴ/-ሜ) before
 * giving up on a word. This is not exhaustive Amharic morphology, just
 * enough to cover the patterns already used in this file's own content —
 * treat flags as a starting point for review, not a guaranteed bug list.
 */

const { PHRASES } = await import('../src/data/amharicPhrases.js');
const { SENTENCES, DIALOGUES } = await import('../src/data/readingSentences.js');
const { COGNATES, PROPER_NOUNS } = await import('../src/data/cognates.js');
const {
  ETHIOPIC_DIGITS, ETHIOPIC_TENS, ETHIOPIC_HUNDREDS,
  ETHIOPIC_THOUSANDS, ETHIOPIC_TEN_THOUSANDS, ETHIOPIC_LARGE_ROUND,
} = await import('../src/data/ethiopicNumbers.js');

// ── Tokenize an Amharic string into individual words ───────────────────────
const PUNCTUATION = /[።፣፤፥!?]/g;
const ETHIOPIC = /[ሀ-፿]/;

function splitWords(str) {
  if (!str) return [];
  return str
    .replace(PUNCTUATION, '')
    .trim()
    .split(/\s+/)
    .filter(w => ETHIOPIC.test(w));
}

// ── Build the allowed-word set ─────────────────────────────────────────────
const allowed = new Set();
const addAmharic = (str) => splitWords(str).forEach(w => allowed.add(w));

for (const p of PHRASES) {
  addAmharic(p.amharic);
  addAmharic(p.femaleAmharic);
  addAmharic(p.formalAmharic);
  addAmharic(p.groupAmharic);
}
for (const c of [...COGNATES, ...PROPER_NOUNS]) addAmharic(c.amharic);
for (const n of [
  ...ETHIOPIC_DIGITS, ...ETHIOPIC_TENS, ...ETHIOPIC_HUNDREDS,
  ...ETHIOPIC_THOUSANDS, ...ETHIOPIC_TEN_THOUSANDS, ...ETHIOPIC_LARGE_ROUND,
]) addAmharic(n.amharic);

// Fixed permitted connectors (readingSentences.js header rule) — the
// suffix-form connectors (-ው/-ቱ/-ሉ definite, -ን object marker) are handled
// by candidateStems() below instead, since they attach directly to a noun.
['ነው', 'ናት', 'ነኝ', 'እና', 'ግን'].forEach(w => allowed.add(w));

// ── Best-effort suffix stripping ───────────────────────────────────────────
// Maps a word-final "suffixed" character back to the bare consonant it
// replaces, so e.g. ሆቴሉ (the hotel) resolves back to the taught ሆቴል (hotel).
const U_ORDER_TO_BARE = { 'ሉ': 'ል', 'ቱ': 'ት', 'ቡ': 'ብ', 'ሱ': 'ስ', 'ኩ': 'ክ', 'ቁ': 'ቅ' };
const E_ORDER_TO_BARE = { 'ቴ': 'ት', 'ሜ': 'ም' }; // first-person possessive ("my ...")
const STRIP_LITERAL = ['ው', 'ን']; // appended directly after a vowel-final stem

function candidateStems(word) {
  const last = word.at(-1);
  const stem = word.slice(0, -1);
  const candidates = [word];
  if (STRIP_LITERAL.includes(last)) candidates.push(stem);
  if (U_ORDER_TO_BARE[last]) candidates.push(stem + U_ORDER_TO_BARE[last]);
  if (E_ORDER_TO_BARE[last]) candidates.push(stem + E_ORDER_TO_BARE[last]);
  return candidates;
}

function isAllowed(word) {
  return candidateStems(word).some(w => allowed.has(w));
}

// ── Walk SENTENCES/DIALOGUES and flag anything unrecognized ────────────────
const flagged = [];
const seen = new Set(); // dedup: same bad word reported once per item id

function checkText(text, meta) {
  for (const word of splitWords(text)) {
    if (isAllowed(word)) continue;
    const key = `${meta.id}|${word}`;
    if (seen.has(key)) continue;
    seen.add(key);
    flagged.push({ ...meta, word });
  }
}

for (const s of SENTENCES) {
  checkText(s.amharic, { id: s.id, kind: s.type });
  s.words.forEach((w, i) => checkText(w.amharic, { id: s.id, kind: `${s.type}-word`, index: i }));
}

for (const d of DIALOGUES) {
  d.lines.forEach((line, i) => {
    checkText(line.amharic, { id: d.id, kind: 'dialogue', index: i, speaker: line.speaker });
  });
}

console.log(`Checked ${SENTENCES.length} sentences/paragraphs, ${DIALOGUES.length} dialogues.`);
console.log(`Flagged: ${flagged.length}\n`);
for (const f of flagged) {
  const loc = f.index !== undefined ? `${f.id}[${f.index}]` : f.id;
  console.log(`  [${f.kind}] ${loc} — unrecognized word: "${f.word}"`);
}
