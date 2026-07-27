#!/usr/bin/env node
/**
 * Audits src/data/readingSentences.js against the actual taught vocabulary
 * and flags any word that isn't in it. See src/utils/readingVocab.js for how
 * the allowed-vocabulary set is built and how words are checked against it.
 *
 * Usage: node scripts/validate-reading-vocab.js
 */

const { SENTENCES, DIALOGUES } = await import('../src/data/readingSentences.js');
const { buildAllowedVocab, splitWords, isAllowedWord } = await import('../src/utils/readingVocab.js');

const allowed = buildAllowedVocab();

// ── Walk SENTENCES/DIALOGUES and flag anything unrecognized ────────────────
const flagged = [];
const seen = new Set(); // dedup: same bad word reported once per item id

function checkText(text, meta) {
  for (const word of splitWords(text)) {
    if (isAllowedWord(word, allowed)) continue;
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
  console.log(`  [${f.kind}] ${loc}: unrecognized word "${f.word}"`);
}
