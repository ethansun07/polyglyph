import { Router } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import pool from '../db.js';
import { callGemini, buildSentencePrompt, pickTheme } from '../lib/gemini.js';
import { synthesizeAmharic } from '../lib/tts.js';
import { SENTENCES } from '../../src/data/readingSentences.js';

const router = Router();
const MAX_ATTEMPTS = 3;

// Only /generate has real per-call cost (an LLM call + a TTS call), so only
// it is rate-limited: keyed by uid (set by requireAuth upstream) rather
// than IP, since every visitor including guests has a stable uid. A call
// costs well under a cent and takes under a second on the lite model, so
// this is really just a guard against a genuine runaway loop, not a limit
// on normal active use.
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user.uid,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Generation limit reached for this hour, try again later.' },
});

// The model is told not to put a space before ending punctuation but doesn't
// always comply; strip it deterministically rather than relying on the
// prompt alone.
function tidyPunctuationSpacing(text) {
  return text.replace(/\s+([።፣፤፥!?])/g, '$1');
}

// Punctuation/whitespace-insensitive comparison so "ደህና ነህ?" and "ደህና  ነህ ?"
// count as the same sentence for duplicate-detection purposes.
function normalizeForComparison(text) {
  return text.replace(/[።፣፤፥!?]/g, '').replace(/\s+/g, ' ').trim();
}

// Copulas/particles common enough in nearly every sentence that flagging
// them as "overused" would be noise, not signal.
const COMMON_WORDS = new Set(['ነው', 'ናት', 'ናቸው', 'ነኝ', 'ነህ', 'ነሽ', 'እና', 'ግን', 'በጣም']);

// Naming specific overused content words to Gemini (see buildSentencePrompt's
// avoidWords) is a much stronger signal than theme variety alone, since the
// same "safe" noun can resurface under many different themes. Built from
// whatever's actually shown up recently rather than a fixed list, so it
// adapts as the user's session grows.
function extractOverusedWords(texts, minCount = 2, limit = 12) {
  const freq = new Map();
  for (const text of texts) {
    for (const word of normalizeForComparison(text).split(/\s+/)) {
      if (!word || COMMON_WORDS.has(word)) continue;
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }
  return [...freq.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

// The 40 curated SENTENCES are permanent app content; regenerating one of
// these verbatim isn't new practice.
const EXISTING_SENTENCE_TEXTS = SENTENCES.map(s => s.amharic);
const EXISTING_NORMALIZED = new Set(EXISTING_SENTENCE_TEXTS.map(normalizeForComparison));

// POST /api/generated-sentences/generate
router.post('/generate', generateLimiter, async (req, res) => {
  // A random theme keeps this from defaulting to the same kind of sentence
  // every time (see server/lib/gemini.js). Deliberately not one of the app's
  // own curriculum categories, see pickTheme's comment for why.
  const theme = pickTheme();

  // Sentences the client already showed this user earlier in the current
  // session (not persisted, just kept in React state), so a rapid string of
  // clicks doesn't repeat itself. Bounded so a malicious/buggy client can't
  // blow up the prompt.
  const recentTexts = Array.isArray(req.body?.recentTexts)
    ? req.body.recentTexts.filter(t => typeof t === 'string').slice(0, 20).map(t => t.slice(0, 200))
    : [];
  const recentNormalized = new Set(recentTexts.map(normalizeForComparison));
  const avoidTexts = [...EXISTING_SENTENCE_TEXTS, ...recentTexts];
  // Only the user's own recent session, not the full 40-sentence curriculum,
  // otherwise this would just permanently blocklist ordinary taught words.
  const avoidWords = extractOverusedWords(recentTexts);

  let candidate = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS && !candidate; attempt++) {
    let raw;
    try {
      raw = await callGemini(buildSentencePrompt(theme, avoidTexts, avoidWords));
    } catch (err) {
      return res.status(502).json({ error: `Sentence generation failed: ${err.message}` });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue; // malformed JSON, just retry
    }

    if (!parsed?.amharic || !parsed?.meaning || !Array.isArray(parsed.words) || parsed.words.length === 0) {
      continue;
    }

    parsed.amharic = tidyPunctuationSpacing(parsed.amharic);
    parsed.words = parsed.words.map(w => ({ ...w, amharic: tidyPunctuationSpacing(w.amharic) }));

    // A generated sentence identical to one already in the curated
    // SENTENCES, or one already shown this session, isn't new practice,
    // it's just a duplicate; retry instead of showing it again.
    const normalized = normalizeForComparison(parsed.amharic);
    if (EXISTING_NORMALIZED.has(normalized) || recentNormalized.has(normalized)) {
      continue;
    }

    candidate = parsed;
  }

  if (!candidate) {
    return res.status(422).json({ error: "Couldn't generate a sentence right now, try again." });
  }

  let audioBase64;
  try {
    audioBase64 = await synthesizeAmharic(candidate.amharic);
  } catch (err) {
    return res.status(502).json({ error: `Audio generation failed: ${err.message}` });
  }

  res.json({
    id: `gen_${crypto.randomUUID()}`,
    amharic: candidate.amharic,
    meaning: candidate.meaning,
    words: candidate.words,
    audioBase64,
  });
});

// POST /api/generated-sentences: save a generated sentence the user liked
router.post('/', async (req, res) => {
  const { uid } = req.user;
  const { id, amharic, meaning, words } = req.body;
  if (!id || !amharic || !meaning || !Array.isArray(words)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await pool.query(`
      INSERT INTO generated_sentences (uid, id, amharic, meaning, words)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (uid, id) DO NOTHING
    `, [uid, id, amharic, meaning, JSON.stringify(words)]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/generated-sentences: the user's saved ones
router.get('/', async (req, res) => {
  const { uid } = req.user;
  try {
    const result = await pool.query(
      'SELECT id, amharic, meaning, words FROM generated_sentences WHERE uid = $1 ORDER BY created_at DESC',
      [uid]
    );
    res.json(result.rows.map(r => ({
      id: r.id, amharic: r.amharic, meaning: r.meaning, words: r.words, type: 'sentence',
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/generated-sentences/:id
router.delete('/:id', async (req, res) => {
  const { uid } = req.user;
  try {
    await pool.query('DELETE FROM generated_sentences WHERE uid = $1 AND id = $2', [uid, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/generated-sentences/:id/audio: re-synthesize on demand for a
// saved sentence being replayed (audio bytes are never persisted).
router.post('/:id/audio', async (req, res) => {
  const { uid } = req.user;
  try {
    const result = await pool.query(
      'SELECT amharic FROM generated_sentences WHERE uid = $1 AND id = $2',
      [uid, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const audioBase64 = await synthesizeAmharic(result.rows[0].amharic);
    res.json({ audioBase64 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
