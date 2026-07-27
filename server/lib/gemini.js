// Google Gemini text generation for the live "Generate a sentence" button.
// Deliberately unconstrained: unlike the 40 curated SENTENCES (which only
// use vocabulary from src/data/amharicPhrases.js, checked by
// scripts/validate-reading-vocab.js), this is meant for someone who already
// understands spoken Amharic and is practicing reading the Fidel script, so
// there's no vocabulary allowlist here at all. Raw fetch against the REST
// endpoint, no SDK dependency, same philosophy as server/lib/tts.js.

// An alias rather than a pinned version, so this doesn't silently break when
// a dated model gets deprecated (already hit this once: gemini-2.5-flash
// returned 404 "no longer available to new users" for this project's key,
// even though it was still listed by the models.list endpoint). The "lite"
// tier was tested head-to-head against the full flash model on this task:
// same success rate, but a much tighter and consistently faster latency
// distribution (roughly 600-750ms vs. 1.2-6s). Full quality reasoning isn't
// needed here, so lite is the better fit.
const MODEL = 'gemini-flash-lite-latest';
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
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 1.15,
        topP: 0.97,
        // This model does extended "thinking" by default, ~6s and 1000+
        // hidden reasoning tokens even for a trivial reply, unnecessary for
        // a short everyday sentence. A small nonzero budget (thinkingBudget:
        // 0 is rejected as invalid by this model) cuts latency substantially.
        thinkingConfig: { thinkingBudget: 128 },
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no text');
  return text;
}

// Deliberately NOT the app's own curriculum categories (src/data/amharicPhrases.js's
// CATEGORY_ORDER = greetings/food/travel/places/etc.) — those are the exact
// categories the 40 curated SENTENCES already draw their canonical vocabulary
// from (e.g. "food" → doro wat, "places"/"travel" → bank/hotel/taxi), so
// theming off them just steers Gemini back to the same handful of textbook
// nouns every time, which is exactly the repetition users reported. These are
// specific everyday micro-scenarios instead of broad categories, precisely so
// there's no single "canonical" example sentence for the model to default to.
const THEMES = [
  'the weather today', 'a morning routine', 'making coffee at home', 'a rainy day',
  'doing laundry', 'cleaning the house', 'a pet doing something funny', 'a bird outside a window',
  'a child learning to walk', 'grandparents visiting', 'a family argument being resolved',
  'gardening', 'watering plants', 'a broken appliance', 'fixing something with tools',
  'a phone running out of battery', 'scrolling on social media', 'watching television at night',
  'a favorite song', 'dancing at a party', 'a wedding celebration', 'a funeral and mourning',
  'a new baby in the family', 'a school exam', 'a teacher praising a student',
  'forgetting homework', 'being late to work', 'traffic on the road', 'a bus breaking down',
  'walking instead of driving', 'a long journey by foot', 'getting lost in a new city',
  'a mountain view', 'a river flooding', 'a dry season with no rain', 'a cold night',
  'a hot afternoon', 'wearing warm clothes', 'losing a shoe', 'a torn piece of clothing',
  'a haircut', 'jewelry as a gift', 'a surprise gift', 'a secret being shared',
  'gossip among neighbors', 'a rumor spreading', 'an old proverb', 'a grandmother telling a story',
  'a childhood memory', 'missing someone far away', 'writing a letter', 'reading a book at night',
  'falling asleep early', 'a strange dream', 'waking up late', 'praying before a meal',
  'fasting during a holiday', 'a religious holiday', 'a coffee ceremony with friends',
  'sharing food with a neighbor', 'a picnic outdoors', 'a spicy dish that is too hot',
  'leftovers from dinner', 'a market seller bargaining', 'buying vegetables', 'a farmer harvesting crops',
  'planting seeds', 'a cow or goat on a farm', 'chickens in a yard', 'an insect bite',
  'a headache and medicine', 'visiting a doctor', 'recovering from being sick', 'a sports match on TV',
  'playing a board game', 'a card game between friends', 'children playing outside', 'a football team winning',
  'exercising in the morning', 'going for a run', 'feeling proud of an achievement',
  'feeling embarrassed about a mistake', 'apologizing to a friend', 'forgiving someone',
  'thanking someone for help', 'borrowing money from a friend', 'saving money for the future',
  'a power outage', 'the internet being slow', 'an old photograph', 'a new haircut being complimented',
  'a joke that made everyone laugh', 'teasing a sibling', 'an argument about chores',
  'city life versus village life', 'moving to a new house', 'painting a room', 'a noisy street',
  'a quiet village at night', 'stars in the night sky', 'the moon being bright',
];

export function pickTheme() {
  return THEMES[Math.floor(Math.random() * THEMES.length)];
}

// `theme` varies the topic call to call so it doesn't always default to the
// same kind of sentence. `avoidTexts` are sentences the user has already
// seen, either permanent app content (the 40 curated SENTENCES) or ones
// generated earlier in the same browsing session, regenerating one
// verbatim isn't new practice. `avoidWords` are specific content words that
// have shown up unusually often across those same sentences (see
// extractOverusedWords in the route) — naming them directly is a much
// stronger signal than just varying the theme, since Gemini can still reach
// for the same "safe" noun (e.g. ባንክ, ዶሮ ወጥ) under a dozen different themes.
export function buildSentencePrompt(theme = null, avoidTexts = [], avoidWords = []) {
  const themeNote = theme
    ? `\n\nBuild this one around the specific everyday scenario of "${theme}". Commit to that scenario concretely rather than drifting back to a generic greeting or food/drink order.`
    : '';
  const avoidNote = avoidTexts.length
    ? `\n\nThe user has already seen every one of these exact sentences (some are permanent app content, some were shown earlier in this same session), so your output must not be identical (ignoring punctuation) to any of them, and should be meaningfully different in structure and vocabulary, not just a trivial tweak of one: ${avoidTexts.join(' | ')}`
    : '';
  const wordsNote = avoidWords.length
    ? `\n\nThese specific words have already shown up far too often in recent output, so do not use any of them this time unless the sentence is truly impossible without one: ${avoidWords.join(', ')}. This app has had a real problem with the same handful of nouns (bank, doro wat/ዶሮ ወጥ, hotel, taxi) showing up constantly, actively reach for different, less obvious everyday vocabulary instead.`
    : '';

  return `You are generating a single simple, natural Amharic sentence for someone who already understands spoken Amharic and is practicing reading the Fidel script. Amharic has an enormous, rich vocabulary, draw from all of it: rotate through many different nouns, verbs, and subjects across calls, and actively avoid falling back to the same "textbook" sentences (greetings, ordering food, asking for a hotel/taxi/bank) unless the given theme genuinely calls for it.

Keep it short (3-6 words), simple, and natural, basic everyday vocabulary a language learner would encounter constantly, not obscure, literary, or overly formal language, but favor variety over defaulting to the handful of most common nouns.
Amharic is Subject-Object-Verb (SOV) word order: the verb always comes last.

Punctuate it properly: end statements with ። (the Amharic full stop, U+1362,
not a Latin period and not ፤ or ፥ which are a different mark entirely), end
questions with ?, end exclamations with !. Exactly one punctuation mark at the
very end, directly attached to the last word with no space before it and
nothing repeated or doubled. Never leave a sentence with no ending punctuation
at all.

Return ONLY valid JSON in exactly this shape, nothing else:
{"amharic": "<the full sentence, in Amharic script, properly punctuated>", "meaning": "<English translation>", "words": [{"amharic": "<word or word group, WITHOUT the trailing punctuation>", "meaning": "<its meaning>"}]}

The "words" array should break the sentence into 2-4 chunks that, concatenated with spaces plus the ending punctuation, reconstruct "amharic" exactly. Strip punctuation from each individual word chunk, it only belongs in the full "amharic" field.${themeNote}${avoidNote}${wordsNote}`;
}
