#!/usr/bin/env node
/**
 * Generates audio for every possible combo-number value the Combos quiz can
 * produce (11-99 excluding round tens, and 101-999 with no exclusions),
 * using the same toEthiopic/toAmharicWords logic the quiz itself uses so the
 * audio text is guaranteed to match what's actually asked.
 *
 * Usage: GOOGLE_API_KEY=your_key node scripts/generate-combo-audio.js
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NUMBERS_DIR = join(ROOT, 'public', 'audio', 'numbers');

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('Error: set GOOGLE_API_KEY environment variable');
  process.exit(1);
}

const { toAmharicWords } = await import('../src/data/ethiopicNumbers.js');

const values = [];
for (let v = 11; v <= 99; v++) {
  if (v % 10 === 0) continue; // matches generateComboQuestion's 2digit exclusion
  values.push(v);
}
for (let v = 101; v <= 999; v++) {
  values.push(v);
}
for (let v = 1001; v <= 9999; v++) {
  values.push(v);
}

console.log(`Total values to check: ${values.length}`);

const URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;
const DELAY_MS = 120;

mkdirSync(NUMBERS_DIR, { recursive: true });

let generated = 0, skipped = 0, failed = 0;

async function synthesize(value) {
  const outPath = join(NUMBERS_DIR, `${value}.mp3`);
  if (existsSync(outPath)) { skipped++; return; }
  const text = toAmharicWords(value);
  if (!text) { console.error(`ERR  ${value}: no amharic words generated`); failed++; return; }

  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'am-ET', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.85 },
    }),
  });

  if (!res.ok) {
    console.error(`ERR  ${value}: ${res.status} ${await res.text()}`);
    failed++;
    return;
  }
  const { audioContent } = await res.json();
  writeFileSync(outPath, Buffer.from(audioContent, 'base64'));
  generated++;
  if (generated % 25 === 0) console.log(`... ${generated} generated so far`);
}

for (const v of values) {
  await synthesize(v);
  await new Promise(r => setTimeout(r, DELAY_MS));
}

console.log(`\nDone. generated=${generated} skipped=${skipped} failed=${failed}`);
