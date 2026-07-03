#!/usr/bin/env node
/**
 * Synthesizes every entry in scripts/missing-audio.json via Google Cloud TTS
 * and writes it to the matching public/audio/ path.
 *
 * Usage:
 *   node scripts/find-missing-audio.js        # (re)build missing-audio.json
 *   GOOGLE_API_KEY=your_key node scripts/generate-missing-audio.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const AUDIO = join(ROOT, 'public', 'audio');

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('Error: set GOOGLE_API_KEY environment variable');
  process.exit(1);
}

const missing = JSON.parse(readFileSync(join(__dirname, 'missing-audio.json'), 'utf8'));
if (missing.length === 0) {
  console.log('Nothing missing — run find-missing-audio.js again if data changed.');
  process.exit(0);
}

const URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

async function synthesize({ path, text }) {
  const outPath = join(AUDIO, path);
  if (existsSync(outPath)) { console.log(`SKIP ${path}`); return; }
  mkdirSync(dirname(outPath), { recursive: true });

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
    console.error(`ERR  ${path}: ${res.status} ${await res.text()}`);
    return;
  }
  const { audioContent } = await res.json();
  writeFileSync(outPath, Buffer.from(audioContent, 'base64'));
  console.log(`OK   ${path}  (${text})`);
}

for (const entry of missing) {
  await synthesize(entry);
  await new Promise(r => setTimeout(r, 120));
}

console.log('\nDone.');
