#!/usr/bin/env node
/**
 * Cross-checks src/data/*.js (source of truth) against public/audio/ and
 * reports every expected audio file that doesn't exist yet.
 *
 * Usage: node scripts/find-missing-audio.js
 *
 * Writes scripts/missing-audio.json, consumed by generate-missing-audio.js.
 */

import { existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const AUDIO = join(ROOT, 'public', 'audio');

const { PHRASES } = await import('../src/data/amharicPhrases.js');
const { SENTENCES, DIALOGUES } = await import('../src/data/readingSentences.js');
const { LEVEL_WORDS } = await import('../src/data/levelWords.js');

const missing = [];

const check = (relPath, text, meta) => {
  if (!existsSync(join(AUDIO, relPath))) {
    missing.push({ path: relPath, text, ...meta });
  }
};

// ── Phrases (+ gendered/formal variants) ───────────────────────────────────
// `amharic` is a display string ("male / female / formal") when femaleAmharic
// is set — the male-only audio text is the segment before the first " / ".
for (const p of PHRASES) {
  const maleText = p.femaleAmharic ? p.amharic.split(' / ')[0] : p.amharic;
  check(`phrases/${p.id}.mp3`, maleText, { kind: 'phrase', id: p.id });
  if (p.femaleAmharic) check(`phrases/${p.id}_f.mp3`, p.femaleAmharic, { kind: 'phrase', id: p.id, variant: 'f' });
  if (p.formalAmharic) check(`phrases/${p.id}_formal.mp3`, p.formalAmharic, { kind: 'phrase', id: p.id, variant: 'formal' });
  if (p.groupAmharic) check(`phrases/${p.id}_group.mp3`, p.groupAmharic, { kind: 'phrase', id: p.id, variant: 'group' });
}

// ── Sentences ────────────────────────────────────────────────────────────
for (const s of SENTENCES) {
  check(`sentences/${s.id}.mp3`, s.amharic, { kind: 'sentence', id: s.id });
  s.words.forEach((word, i) => {
    check(`sentence-words/${s.id}_w${i}.mp3`, word.amharic, { kind: 'sentence-word', id: s.id, index: i });
  });
}

// ── Dialogue lines ──────────────────────────────────────────────────────
for (const d of DIALOGUES) {
  d.lines.forEach((line, i) => {
    check(`dialogues/${d.id}_${i}.mp3`, line.amharic, { kind: 'dialogue', id: d.id, index: i });
  });
}

// ── Level words ──────────────────────────────────────────────────────────
for (const level of Object.keys(LEVEL_WORDS)) {
  for (const w of LEVEL_WORDS[level]) {
    check(`words/${w.id}.mp3`, w.amharic, { kind: 'word', id: w.id, level });
  }
}

console.log(`Missing: ${missing.length}`);
for (const m of missing) console.log(`  ${m.path}  (${m.text})`);

writeFileSync(join(__dirname, 'missing-audio.json'), JSON.stringify(missing, null, 2));
console.log(`\nWrote scripts/missing-audio.json`);
