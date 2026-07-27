import { Router } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import pool from '../db.js';
import { buildAllowedVocab, findDisallowedWords, splitWords } from '../../src/utils/readingVocab.js';
import { callGemini, buildSentencePrompt } from '../lib/gemini.js';
import { synthesizeAmharic } from '../lib/tts.js';
import { PHRASES, CATEGORY_ORDER } from '../../src/data/amharicPhrases.js';

const router = Router();
const MAX_ATTEMPTS = 3;

// Only /generate has real per-call cost (an LLM call + a TTS call), so only
// it is rate-limited: keyed by uid (set by requireAuth upstream) rather
// than IP, since every visitor including guests has a stable uid.
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user.uid,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Generation limit reached for this hour, try again later.' },
});

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sending the *entire* allowed vocabulary (a few hundred words) in every
// prompt inflates input tokens (and cost) far more than a short prompt
// needs. Instead, show the model just the words from phrases in the chosen
// theme's category, plus a modest random sample of everything else for
// general utility. Validation below still checks the candidate sentence
// against the full allowed set, this subset only shapes what the model is
// nudged to use, it doesn't relax what's actually acceptable.
function themedVocabSubset(allowed, theme, extraCount = 25) {
  const themed = new Set();
  for (const p of PHRASES) {
    if (p.category !== theme) continue;
    [p.amharic, p.femaleAmharic, p.formalAmharic, p.groupAmharic].forEach(s => {
      splitWords(s).forEach(w => themed.add(w));
    });
  }
  const rest = shuffle([...allowed].filter(w => !themed.has(w))).slice(0, extraCount);
  return shuffle([...themed, ...rest]);
}

// POST /api/generated-sentences/generate
router.post('/generate', generateLimiter, async (req, res) => {
  const allowed = buildAllowedVocab();
  // A themed subset (not the full vocab list) plus a random theme are what
  // produce variety across calls (see server/lib/gemini.js) while keeping
  // the prompt, and therefore the token cost, small: without them the model
  // kept landing on the same "I want [drink]" pattern since the vocab list
  // looked identical and exhaustive every time.
  const theme = CATEGORY_ORDER[Math.floor(Math.random() * CATEGORY_ORDER.length)];
  const vocabWords = themedVocabSubset(allowed, theme);

  let disallowed = [];
  let candidate = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS && !candidate; attempt++) {
    let raw;
    try {
      raw = await callGemini(buildSentencePrompt(vocabWords, disallowed, theme));
    } catch (err) {
      return res.status(502).json({ error: `Sentence generation failed: ${err.message}` });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      disallowed = [];
      continue; // malformed JSON, retry fresh, nothing specific to point out
    }

    if (!parsed?.amharic || !parsed?.meaning || !Array.isArray(parsed.words) || parsed.words.length === 0) {
      disallowed = [];
      continue;
    }

    const bad = findDisallowedWords(parsed.amharic, allowed);
    if (bad.length > 0) {
      disallowed = bad;
      continue;
    }

    candidate = parsed;
  }

  if (!candidate) {
    return res.status(422).json({ error: "Couldn't generate a valid sentence right now, try again." });
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
