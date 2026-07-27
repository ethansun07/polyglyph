// Google Gemini text generation, used only to draft a candidate Read-mode
// sentence; src/utils/readingVocab.js is the actual source of truth for
// whether that candidate is allowed. Raw fetch against the REST endpoint,
// no SDK dependency, same philosophy as server/lib/tts.js.

// An alias rather than a pinned version, so this doesn't silently break when
// a dated model gets deprecated (already hit this once: gemini-2.5-flash
// returned 404 "no longer available to new users" for this project's key,
// even though it was still listed by the models.list endpoint).
const MODEL = 'gemini-flash-latest';
const GEMINI_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

export async function callGemini(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(GEMINI_URL(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 1.15, topP: 0.97 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no text');
  return text;
}

// `disallowedFromLastAttempt` lets the caller re-prompt after a rejected
// attempt, pointing out exactly which words weren't allowed rather than
// starting the retry blind. `theme` and a shuffled `allowedWords` order are
// what actually drive variety between calls (see server/routes/generatedSentences.js):
// without them the model gravitates toward the same handful of "safe"
// combinations (coffee/water/want) every time, since the vocab list looks
// identical call to call otherwise.
export function buildSentencePrompt(allowedWords, disallowedFromLastAttempt = [], theme = null) {
  const vocabList = allowedWords.join(', ');
  const retryNote = disallowedFromLastAttempt.length
    ? `\n\nYour previous attempt used these words, which are NOT in the allowed list: ${disallowedFromLastAttempt.join(', ')}. Do not use them: pick different words from the allowed list only.`
    : '';
  const themeNote = theme
    ? `\n\nBuild this one around the everyday theme of "${theme}" (e.g. a greeting exchange, a food/drink order, asking directions, a market/price haggle, talking about family, etc., whatever fits "${theme}" best) using only the allowed words above. Avoid defaulting to a generic "I want [drink]" sentence unless that genuinely fits the theme.`
    : '';

  return `You are generating a single simple Amharic practice sentence for a language-learning app. Vary the sentence structure and topic each time you're asked. Do not always produce the same kind of sentence.

STRICT RULE: every Amharic word in your sentence must be either:
(a) one of these exact allowed words: ${vocabList}
(b) one of these connectors: ነው, ናት, ነኝ, እና, ግን
(c) a permitted suffix attached directly to an allowed noun: -ው/-ቱ/-ሉ ("the"), -ን (object marker)

Amharic is Subject-Object-Verb (SOV) word order: the verb always comes last.
Keep it short (3-6 words) and natural, the kind of sentence a beginner traveler would see.

Return ONLY valid JSON in exactly this shape, nothing else:
{"amharic": "<the full sentence, in Amharic script>", "meaning": "<English translation>", "words": [{"amharic": "<word or word group>", "meaning": "<its meaning>"}]}

The "words" array should break the sentence into 2-4 chunks that, concatenated with spaces, reconstruct "amharic" exactly.${themeNote}${retryNote}`;
}
