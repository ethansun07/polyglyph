/**
 * Builds the set of every Amharic word actually taught by this app (Common
 * Phrases + cognates/proper nouns + Ethiopic number words + the fixed
 * connector set documented in readingSentences.js's header), and checks a
 * word against it.
 *
 * Shared by scripts/validate-reading-vocab.js (audits existing Read-mode
 * content) and server/routes/generatedSentences.js (validates live
 * AI-generated sentences before they're shown to a user).
 *
 * Best-effort: strips a small hardcoded set of Amharic suffixes (definite
 * -ው/-ቱ/-ሉ/etc, object marker -ን, first-person possessive -ቴ/-ሜ). This is
 * not exhaustive Amharic morphology, just enough to cover the patterns
 * already used in this app's own content.
 */

import { PHRASES } from '../data/amharicPhrases.js';
import { COGNATES, PROPER_NOUNS } from '../data/cognates.js';
import {
  ETHIOPIC_DIGITS, ETHIOPIC_TENS, ETHIOPIC_HUNDREDS,
  ETHIOPIC_THOUSANDS, ETHIOPIC_TEN_THOUSANDS, ETHIOPIC_LARGE_ROUND,
} from '../data/ethiopicNumbers.js';

// ── Tokenize an Amharic string into individual words ───────────────────────
const PUNCTUATION = /[።፣፤፥!?]/g;
const ETHIOPIC = /[ሀ-፿]/;

export function splitWords(str) {
  if (!str) return [];
  return str
    .replace(PUNCTUATION, '')
    .trim()
    .split(/\s+/)
    .filter(w => ETHIOPIC.test(w));
}

// Fixed permitted connectors (readingSentences.js header rule): the
// suffix-form connectors (-ው/-ቱ/-ሉ definite, -ን object marker) are handled
// by candidateStems() below instead, since they attach directly to a noun.
const CONNECTORS = ['ነው', 'ናት', 'ነኝ', 'እና', 'ግን'];

export function buildAllowedVocab() {
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

  CONNECTORS.forEach(w => allowed.add(w));
  return allowed;
}

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

export function isAllowedWord(word, allowedSet) {
  return candidateStems(word).some(w => allowedSet.has(w));
}

/** Returns every word in `text` that isn't in `allowedSet` (empty = fully valid). */
export function findDisallowedWords(text, allowedSet) {
  return splitWords(text).filter(w => !isAllowedWord(w, allowedSet));
}
