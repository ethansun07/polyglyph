# Polyglyph — Project State

Read this first. It should always reflect current reality — update it in place
(don't leave stale entries) whenever something here changes. For a dated
narrative of how we got here, see LOG.md instead.

## What this is
A free web app for learning to read/write the Amharic Fidel script (not the
spoken language). React 18 + Vite frontend, Express + Postgres backend.
Solo-developed by the repo owner; Claude Code is a regular pair-programming
partner across sessions.

## Architecture
- **Frontend**: React 18 + Vite, no router (state-based page switching in
  `src/App.jsx`). Deployed on **Vercel** — auto-deploys on push to `main`.
- **Backend**: Express + `pg` (raw SQL, no ORM). Deployed on **Render**
  (`polyglyph-api-a74k`) — does **not** reliably auto-deploy; a manual
  redeploy from the Render dashboard is needed after almost every
  `server/`-touching push.
- **Database**: **Neon Postgres is production.** Local dev's `server/.env`
  used to point at a stale/legacy RDS instance; that RDS host started timing
  out entirely (`ETIMEDOUT`), breaking every DB-backed route locally, not
  just new ones, so it's now switched to plain local Postgres (`DB_HOST=localhost`,
  `DB_USER=ethansun`, no password, matching `.env.example`'s defaults). If
  local DB calls ever silently do nothing again, check `server/.env`'s
  `DB_HOST` first. No migration runner exists: `db/schema.sql` is the source
  of truth, written with idempotent `CREATE TABLE IF NOT EXISTS` + `ALTER
  TABLE ... ADD COLUMN IF NOT EXISTS` so it's always safe to re-run, but new
  columns/tables must be manually applied to **both** local Postgres
  (`psql amharic_fidel -f db/schema.sql`) and Neon (via console.neon.tech's
  SQL Editor), nothing does this automatically, and it's easy to update the
  file and forget to actually run it against either one (see LOG.md, this is
  exactly how the generated-sentences "bookmark doesn't work" bug happened).
- **Auth**: Firebase Authentication. Every visitor gets a real anonymous uid
  the instant the app loads (`signInAsGuest`); signing in with Google upgrades
  that same identity in place via `linkWithPopup`, falling back to
  `signInWithCredential` if that Google account already has separate history
  elsewhere (`auth/credential-already-in-use`). There is no separate
  "local guest data to merge" concept anymore — this replaced an earlier
  architecture that had a serious cross-account data leak bug (see LOG.md).

## Recently shipped (most recent first)
- **Read mode's gate replaced with a level-based one, decoupled entirely
  from the Common Phrases Final Test.** Went through three states in one
  session: full gate (`phraseTestPassed`, i.e. Level 7 mastery + passing the
  Final Test) → removed entirely (argument: illegible content already gives
  a beginner the same "can't use this" signal a hard block would, so the
  gate wasn't protecting anything) → reconsidered and landed on a **partial
  gate**, `isReadModeUnlocked(progress)` in `src/utils/progress.js` = has
  reached Level 6 of 7 (`READ_MODE_MIN_LEVEL` constant there). The "remove
  entirely" argument proved too much — it would justify removing the
  level-progression gates too — and didn't distinguish a brand-new Level-1
  user (for whom Read is guaranteed useless, decoding ability is the
  bottleneck regardless of vocabulary knowledge) from someone most of the
  way through who just doesn't want to grind the last couple levels first.
  Level 6 blocks the former, not the latter — originally set to 5, but
  "reached Level N" only guarantees ~85% mastery of levels 1..N-1 (the
  unlock threshold), not full mastery, so Level 5 only guaranteed ~49% of
  the 231-character core alphabet, not "most of it" like the copy claimed;
  Level 6 guarantees ~62%, a real middle ground between that and Level 7
  (~75%, close enough to the original full-mastery gate to barely loosen
  anything). `SentenceReader.jsx`'s
  `LockedScreen` is back but simpler than the original (no checklist, no
  admin bypass, just "Level {current} of 7") since there's no discrete
  action to complete, just normal practice. The nav's lock-icon/dimmed
  treatment (`nav-locked` in `App.css`, `isReadLocked` in `App.jsx`) is back
  too, now genuinely meaningful again since the gate is real. Fixed a
  correctness bug found along the way: the Final Test's pass/fail screens in
  `CommonPhrases.jsx` still said "Read mode unlocked!" / "you need 85% to
  unlock Read mode" — false since the first "remove entirely" step, doubly
  false now since Read's gate has no relationship to the Final Test at all
  anymore. Copy fixed to just describe the test result. As a follow-up, the
  Final Test's own attempt-gate (`isLevel7Mastered` required to try it) was
  also removed — once it stopped unlocking anything, it was the only mode on
  the Common Phrases page still gated on full mastery while
  Browse/Flashcard/Type are all open from Level 2 on; it already scopes its
  content to `getUnlockedPhrases(highestLevel)` like the others, so an early
  attempt is just a smaller/easier version, not exposure to ungated content.
- **Passages tab split into "Stories" and "Dialogues" sub-tabs**
  (`passagesSubTab` state in `SentenceReader.jsx`) instead of stacking both
  sections in one scroll — done ahead of adding more stories, since Stories
  is expected to grow much larger than Dialogues' fixed ~12 (the Bloom
  Library catalog alone is 48+ books) and a single stacked scroll would
  eventually bury Dialogues. Stories renders first (matches the
  Sentences tab's Generate-first convention: heritage speakers who already
  understand spoken Amharic are this app's real primary audience once
  they've cleared the levels, so unconstrained real content leads).
  Bookmark filter moved to an icon-only toggle at the end of the main
  Sentences/Passages tab row (`.read-bookmark-filter`) after two rounds of
  layout feedback — it previously looked like a third tab option.
- **Lesson mode now actually persists progress.** `QuizStep`/`AudioStep` in
  `LessonMode.jsx` now call `onProgressUpdate(recordAnswer(...))` per
  answer, same as `QuizMode.jsx` — previously `onProgressUpdate` was
  accepted as a prop but never called anywhere in the file, so a full
  "Lesson complete!" run recorded nothing toward mastery, admin stats, or
  even the user's own progress. `MatchStep` deliberately still doesn't
  count: `MatchingGame.jsx` only returns one aggregate `errors` count per
  round with no per-character attribution, and with only 4 pairs the last
  match is always forced/zero-signal, so it can't feed the per-character
  net-score system cleanly the way Quiz/Audio's independent-choice
  questions can.
- **Page navigation now resets scroll to top** (`window.scrollTo(0, 0)` at
  the top of `navigate()` in `App.jsx`) — there's no router, so switching
  pages was just a React state change and the browser kept whatever scroll
  position the previous page was at. Affected every page, not just Read;
  Read's long content just made it obvious.
- **`DIALOGUES` cleaned up the same way `SENTENCES` was (35→40): audited for
  repetitive templates, cut/merged the worst offenders, landed on a clean
  round number.** Went from 15 to 12. Before: 11/15 dialogues opened with
  "ሰላም" and closed with the identical "አመሰግናለሁ! / ምንም አይደለም!" pair, and 5 of
  them (`dial_hotel`, `dial_minibus`, `dial_around_town`, `dial_cinema`,
  `dial_market`) were structurally near-duplicates, just chaining "is X
  near/far?" Q&A with the noun swapped, the dialogue-scale version of the
  "X እፈልጋለሁ" problem the original 35 sentences had. Consolidated those 5
  into 2 richer ones: `dial_directions` (hotel + minibus, keeps the
  charming "I don't understand, go slowly" beat) and `dial_errands` (around
  town + cinema + market folded into one natural outing: bank, pharmacy,
  cinema, then market bargaining), dropping some of the more marginal
  loanwords (ካፌ/ኢንተርኔት/ቡፌ/ሳንዱዊች/ፖሊስ from `cognates.js`) that only existed to
  pad out `dial_around_town` rather than serve any real content need — those
  are still valid allowed cognates, just not currently used anywhere in Read
  mode, that's fine, not a requirement. Farewell (ደህና ሁን) reserved for the 4
  dialogues that are genuinely about parting from someone (greeting,
  formal_greeting, intro, airport); every other dialogue now closes on
  something specific to its own scene instead (እግዚአብሔር ይመስገን, ችግር የለም, እንሂድ,
  ቶሎ ሂድ, ቻው, etc.), no two alike. ሰላም-openers dropped from 11/15 to 6/12,
  each remaining one contextually justified (first meeting a stranger, or a
  casual friend catch-up) rather than reflexive boilerplate. `phraseIds` per
  dialogue were also corrected to match actual line content (a few had
  drifted, e.g. old `dial_restaurant` listed `tej` despite ጠጅ never
  appearing in its lines). Deleted the 39 stale audio files for the 5
  removed dialogue ids and generated 20 new ones for the 2 new ids via the
  usual `find-missing-audio.js`/`generate-missing-audio.js` pipeline;
  `validate-reading-vocab.js` passes clean (0 flagged) on the new set.
- **Renamed the "Dialogues" tab to "Passages"** since it now holds both the
  Stories section and the curated dialogues — "Dialogues" stopped being an
  accurate name for the whole tab once Stories was added under it. Only the
  tab label/internal `tab` state value changed (`'dialogues'` → `'passages'`
  in `SentenceReader.jsx`); the `DIALOGUES` data export and its own
  "Practice dialogues" sub-section label are unchanged, since those still
  accurately describe just that one part of the tab.
- **Passages tab (formerly "Dialogues") reworked to add "Stories": real,
  existing Amharic children's stories, not AI-generated.** Mirrors the Sentences tab's heritage-speaker
  vs. beginner split: the existing curated `DIALOGUES` (vocab-constrained,
  built from taught phrases) stayed as-is as the "Practice dialogues"
  section, and a new gold "Stories" section was added above it for heritage
  speakers who want real narrative reading practice, not just phrase-level
  dialogues. Unlike the live sentence generator, these are **not
  AI-generated** — the user was explicit about that — they're real,
  existing children's stories reused with attribution under open licenses.
  Sourced from the African Storybook Initiative (africanstorybook.org) via
  its open-source text mirror at github.com/global-asp/asp-source (17
  Amharic stories there, 15 plain CC-BY). Also researched Bloom Library's
  Amharic catalog (has an OPDS API at api.bloomlibrary.org, ~48+ books with
  real reading-level tags: "first sentences"/"first paragraphs"/"longer
  paragraphs") as a bigger but more license-mixed source (lots of NC/ND/
  Bible-story content) for future expansion — not used for this first batch
  since extracting text means parsing epub/PDF downloads rather than plain
  markdown. First batch: 4 stories in `src/data/stories.js`
  (`story_look_at_animals`, `story_porridge`, `story_come_back_my_cat`,
  `story_young_abera`), each page shaped `{ amharic, meaning }` with a
  `credit` field (text/illustration/translation/license/source) rendered on
  the card. Each page's English meaning is hidden until tapped, then reveals
  + plays audio, same reveal pattern as `DialogueCard`'s lines — **do**
  include translations here, unlike the live generator's short 3-6 word
  sentences: these are longer real narratives with less common/literary
  vocabulary where losing the thread mid-paragraph is a real risk, not just
  simple everyday phrases a heritage speaker recognizes instantly. English
  text was pulled from African Storybook's matching English-language
  edition of each story (same GitHub mirror, `en/` folder, same numeric
  IDs), page-aligned 1:1 with the Amharic version, **except** `story_young_abera`:
  its English original (`young-palinyang`) uses different character names
  (Palinyang', Sausau, Lokeyokoni, Alinyang') and a different call-song than
  the Amharic translation actually reads, so that story's `meaning` fields
  are a direct translation of the Amharic text itself (Abera, Solomon,
  Laqew, Bora), not a copy-paste of the English edition — otherwise the
  names on screen would contradict the English gloss. New `StoryCard`
  component in `SentenceReader.jsx`, new `playStoryPageAudio` in
  `src/utils/audio.js` (same static-file-then-browser-TTS-fallback pattern
  as `playDialogueLineAudio`), audio pre-generated per page via the existing
  `find-missing-audio.js` +
  `generate-missing-audio.js` pipeline (42 files, all in
  `public/audio/stories/`). Bookmarking/read-status reuses the existing
  generic `reading_progress` table (`item_id` is just a TEXT column, no
  schema change needed). **Only 4 stories so far** — expanding this
  (especially pulling from Bloom Library's much bigger, level-tagged
  catalog) means building epub/PDF text extraction first, that hasn't been
  done yet.
- **Common Phrases Final Test unlock gate changed twice, ending on Level 7
  mastery.** Was originally gated on having browsed/practiced all 86 phrases
  (`allSeen` in `CommonPhrases.jsx`); the user pointed out this is real
  friction for heritage speakers who already know these everyday phrases
  from speaking Amharic and shouldn't have to click through every card.
  First tried gating on just having *reached* Level 7 (`highestLevel >=
  LEVELS.length`), then tightened to `isLevel7Mastered(progress)` (the same
  check Read mode uses) once we realized the looser version let someone
  pass the Final Test before actually mastering Level 7, leaving Read mode
  still locked afterward in a confusing way. Removed the now-dead
  browse-seen tracking entirely (`browseSeen` state/`onPhraseSeen` in
  `CommonPhrases.jsx`, `loadBrowseSeen`/`markBrowseSeen`/`BROWSE_SEEN_KEY` in
  `src/utils/phraseProgress.js`) since nothing else read it.
  `isReadModeUnlocked` (`src/utils/progress.js`) was also simplified to just
  `phraseTestPassed === true` (dropped the redundant live
  `isLevel7Mastered` re-check) — passing the Final Test already proves
  Level 7 mastery at that moment, and `phraseTestPassed` is a permanent
  flag, so re-checking live mastery on every render meant Read mode could
  silently re-lock if a later practice session knocked a Level 7 char's net
  score back down, a real regression risk that's now closed. The locked
  screen's checklist (`SentenceReader.jsx`'s `LockedScreen`) dropped from two
  items to one ("Pass the Common Phrases final test") accordingly.
- **Live "Generate a sentence" button in Read mode: built, torn down,
  rebuilt from scratch, then fixed for vocabulary repetition and UI clarity.**
  First build was iterated on extensively (constrained → unconstrained
  vocabulary, speed tuning, punctuation, duplicate-avoidance) but the user
  judged sentence quality not good enough and asked for a full teardown.
  Rebuilt immediately after with the same four requirements (any Amharic
  sentence, audio, bookmarking, speed) using the same architecture already
  proven to work mechanically: `server/lib/gemini.js`
  (`gemini-flash-lite-latest`, `thinkingConfig.thinkingBudget: 128`, raw
  `fetch`, no SDK — measured ~500-950ms including TTS), `server/lib/tts.js`
  (Google Cloud TTS REST, base64 MP3, never written to disk),
  `server/routes/generatedSentences.js` (`/generate` with
  retry-on-malformed/duplicate, rate-limited 100/hour per uid via
  `express-rate-limit`; plain CRUD for saved ones), the `generated_sentences`
  table (in `db/schema.sql`, applied to local Postgres — **still needs the
  same manually run against Neon before this works in production**, see
  Deployment checklist), the `generateSentence`/`saveGeneratedSentence`/
  `loadSavedGeneratedSentences`/`deleteSavedGeneratedSentence`/
  `fetchGeneratedAudio` exports in `src/utils/firebase.js`,
  `playAudioFromBase64`/`speakAmharicText` in `src/utils/audio.js`, and the
  Generate button/ephemeral preview/saved-list UI in
  `src/components/SentenceReader.jsx` (`SentenceCard` takes optional
  `onPlayAudio`/`onPlayWordAudio`/`bookmarkTitle` overrides so it serves both
  static and generated sentences). But even after the rebuild, the user
  reported the same few nouns (bank, doro wat, hotel) showing up constantly
  across generations — root cause was `theme` being picked from the app's
  own curriculum categories (`CATEGORY_ORDER` in `amharicPhrases.js`:
  greetings/food/travel/etc.), which are the exact categories the 40 static
  `SENTENCES` already draw canonical vocabulary from, so theming off them
  just steered Gemini back to the same "textbook" nouns. Fixed by replacing
  that with a ~95-item pool of specific, curriculum-independent everyday
  micro-scenarios (`THEMES`/`pickTheme()` in `server/lib/gemini.js`) too
  narrow for the model to fall back on one canonical answer, plus a live
  `extractOverusedWords()` in the route that scans the session's recent
  sentences and tells Gemini by name not to reuse whatever's already shown
  up twice. User confirmed this fixed the variety problem. Then did two UI
  passes: (1) added `ReadSectionHeader` (gold "Generate your own" vs. green
  "Practice sentences" sections in `SentenceReader.jsx`/`App.css`) so the
  AI-generated and curated-40 sentences aren't confused for each other,
  including a bookmarked-only-view variant that swaps the generate header to
  "Saved generated sentences" instead of showing an inert generate button;
  (2) fixed inconsistent ad hoc spacing by wrapping each section in a flex
  column with one consistent `gap` instead of scattered inline
  `marginBottom`s, and fixing the saved-generated list's label which had
  been sharing the same large flex gap as the cards themselves. Duplicate
  avoidance checks both the 40 static `SENTENCES` and a client-tracked,
  session-only `recentGeneratedTexts` ref (capped at 20, never persisted).
  Backend verified via direct smoke tests (694-964ms end-to-end,
  no duplicates, correct punctuation, DB round-trip); the vocabulary-variety
  fix was also smoke-tested (8 generations, 8 distinct topics/nouns). The
  Dialogues tab has no equivalent generate feature and no matching section
  header yet — user flagged this as a gap but said to hold off on deciding
  scope (just polish vs. also building AI-generated dialogues) for now.
- **`SENTENCES` went from 35 to 40, now covering all 86 `amharicPhrases.js`
  entries on its own and with less template repetition than the original 35
  had.** Two separate passes: (1) previously 32 phrases were only used in
  `DIALOGUES`, a different tab; added new sentences to close that gap,
  several phrases per entry (e.g. `bill_minibus`, `doro_misir_food`) rather
  than one phrase per sentence (first pass added 18 one/two-phrase
  sentences reaching 53 total, consolidated down after user feedback that
  53 felt like too many). (2) User then asked whether the *original* 35 had
  even been reviewed for quality, they hadn't been. Audited them: the
  "X እፈልጋለሁ" (I want X) template appeared 8 times and "is X good/well?"
  appeared 6-7 times, same grammar, different noun, not real variety.
  Merged the clearest near-duplicates in place (e.g. `want_taxi` +
  `silk_want` → `taxi_phone_want`; `wifi_good` + `pizza_good` →
  `wifi_pizza_good`), landing at a clean 40. `travelEssential` was
  explicitly ruled out as a quality signal for this pass, not a reliable
  proxy for which phrases matter. Audio generated/cleaned up for all
  additions and removals via the usual `find-missing-audio.js` +
  `generate-missing-audio.js` pipeline. This content work is independent of
  the live-generation feature above and stayed in place when that got torn
  down.
- **`scripts/validate-reading-vocab.js`**: audits `readingSentences.js` against
  the actual allowed vocabulary (Common Phrases + new `src/data/cognates.js`
  centralized loanword/proper-noun list + `ethiopicNumbers.js` + the fixed
  connector set) and flags any word not in that set — this is what "the AI
  sentence creator" turned into (see LOG.md): rather than a live LLM API
  integration, new Read-mode content is Claude-drafted directly in
  conversation, gated by this script instead of a new API key/dependency.
  Best-effort suffix stripper (definite -ው/-ቱ/-ሉ, object -ን, possessive
  -ቴ/-ሜ), not exhaustive Amharic morphology. Run it after any
  `readingSentences.js` edit: `node scripts/validate-reading-vocab.js`.
  When it catches a real gap, prefer teaching the missing word/variant over
  rewording around it if the word is genuinely useful (see LOG.md — this is
  how ይናገራሉ/እባክዎ got fixed, by adding `formalAmharic` fields rather than
  deleting the honorific dialogue lines that used them).
- **Bookmarks + synced read-status** for Read mode's sentences/dialogues
  (`reading_progress` table, `server/routes/readingProgress.js`,
  `src/utils/readingProgress.js`). Fifth instance of the
  schema-table/GET-PUT-route/client-utils/`onAuthChange`-effect sync pattern
  in this codebase — see LOG.md if a sixth is ever needed, it's a
  well-worn template by now. **Needs a Neon migration + Render redeploy
  before it works in production** — verify both happened.
- Guest/user **location tracking** in the admin dashboard: self-hosted IP
  lookup (`geoip-lite`, npm package, no third-party API calls), stores only
  the derived country/city, never the raw IP. Refreshes on every login;
  a failed lookup keeps the last known value instead of blanking it.
  Schema migrated to Neon and confirmed by the user. **Verify Render was
  redeployed after this** if location isn't showing up yet.
- Full **visual redesign**: replaced ~150 emoji with `lucide-react` icons
  app-wide (nav, buttons, feedback, celebratory moments with subtle
  animations), bolder button/card styling (gradients, elevation tiers), nav
  restructured to 5 top-level items + a "More" bottom sheet on phone, full
  9-item bar on desktop (CSS breakpoint at 768px, see `.nav-item-overflow`
  in `App.css`).
- Fixed the "requires a tiny scroll to reach the button" issue across every
  mode — established pattern: `.quiz-next-bar` (position: fixed) for
  full-page contexts + a page-level `padding-bottom: 6rem` class, or
  `.wr-sticky-footer` (position: sticky) for modal contexts (Row Drill, Word
  Reading Exercise) since the modal itself is the scrolling ancestor.
- Em-dash sweep: removed em dashes used as **sentence breaks** throughout UI
  copy and data-file notes (`fidel.js`, `amharicPhrases.js`). Kept
  connector-style **"X — Y" labels** (row titles like "ፈ — fä family", page
  titles like "Admin — 5 users") since that's a distinct, intentionally-kept
  format — see the memory file `feedback_no_em_dashes.md` for the full rule.
- Sign-in nudge now fires on three triggers (first completed session,
  level-up, or full Level 1 mastery), not just level-up.

## Known non-critical issues / deliberately left alone
- **`src/components/MixedReview.jsx` is dead code** — not imported or
  referenced anywhere in `App.jsx`, not reachable from any nav path. It still
  got the same fixes as everything else (scroll bars, emoji swap) for
  consistency, but this can't be verified live until/unless it's reconnected.
- **`src/data/fidel.js` character notes still contain 💡 as literal content**
  (not a UI icon) — rendered as plain text via `{c.note}` at 5+ call sites.
  Explicitly out of scope for the icon redesign (that pass was about UI
  chrome, not data content); would need both data-file edits and
  render-site restructuring to fix properly. Not yet requested by the user.
- **OAuth/Google-sign-in fixes can't be tested live by Claude** — no way to
  drive a real multi-account Google popup flow in this environment. Always
  ask the user to verify manually after these ship.

## Deployment checklist
1. Frontend-only change → push to `main`, Vercel picks it up automatically.
2. Backend (`server/`) change → push, **then manually redeploy on Render**
   (dashboard → the service → redeploy). Nothing does this automatically.
3. Schema change (`db/schema.sql`) → manually run the new
   `ALTER TABLE`/`CREATE TABLE` lines against Neon via the SQL Editor at
   console.neon.tech. **Watch out**: a fresh Neon SQL Editor pre-populates
   placeholder example queries (`playing_with_neon` table) — don't run those,
   only the actual migration lines.
4. New env var added → set it in both local `server/.env` and Render's
   dashboard env vars; Render does not read from `.env.example` or infer
   anything, it needs the real value entered manually.

## Where to look
- Auth logic: `src/utils/firebase.js`, `src/App.jsx` (the `onAuthChange` effect)
- Admin dashboard: `src/components/AdminDashboard.jsx`, `server/routes/users.js`
- Read mode (sentences/passages, bookmarks, read-status): gated on reaching
  **Level 6 of 7** (`isReadModeUnlocked` in `src/utils/progress.js`,
  `READ_MODE_MIN_LEVEL` constant there), fully decoupled from the Common
  Phrases Final Test now — see LOG.md for how this went through "full gate"
  → "no gate" → "partial gate" in one session. `src/components/SentenceReader.jsx`
  (`LockedScreen`), `src/utils/readingProgress.js`, `server/routes/readingProgress.js`
- Live "Generate a sentence" (unconstrained AI sentence + audio + save):
  `server/lib/gemini.js`, `server/lib/tts.js`,
  `server/routes/generatedSentences.js`, the `generated_sentences` table in
  `db/schema.sql`. Per-word tap audio goes through the real backend TTS too
  now (`POST /generated-sentences/word-audio`, `fetchGeneratedWordAudio` in
  `firebase.js`) — it used to be the one place in the app relying on
  browser-only `speechSynthesis` with no fallback, silent on any
  browser/OS without an Amharic voice installed.
- Common Phrases Final Test: **not gated at all now** either (attempt-gate on
  `isLevel7Mastered` removed) — it's just another practice mode like
  Browse/Flashcard/Type, scoped to `getUnlockedPhrases(highestLevel)` same as
  the others, available from Level 2 onward same as the rest of the page.
  `src/components/CommonPhrases.jsx` (`MODES`, `PhraseTestMode`)
- Stories (heritage-speaker real-story reading, now its own sub-tab inside
  Passages alongside Dialogues — `passagesSubTab` state in
  `SentenceReader.jsx`): `src/data/stories.js`, `StoryCard` in
  `src/components/SentenceReader.jsx`, `playStoryPageAudio` in
  `src/utils/audio.js`
- Shared CSS patterns/design tokens: `src/App.css` (`:root` variables,
  `.quiz-next-bar`/`.wr-sticky-footer` no-scroll patterns, `.nav-item-overflow`
  responsive nav breakpoint)
- Progress/mastery logic: `src/utils/progress.js` (`getLevelProgress`,
  `isLevelUnlocked`, mastery = net score ≥ 5 reading / ≥ 3 writing)
- Sound-alike character handling: `SOUND_GROUPS` in `src/utils/quiz.js`
  (excludes historically-merged-pronunciation pairs from audio quiz — correct,
  they're genuinely indistinguishable by ear) vs. `unambiguousChars` in
  `WritingPractice.jsx` (excludes by raw romanization-string collision — every
  sound-group row needs its own distinct romanization spelling in `fidel.js`
  or Writing Quiz silently drops the whole row forever, not just sometimes;
  see LOG.md for how ጰ/ፐ both being plain `p` did exactly this to ፕ)
- Read-mode vocabulary audit: `scripts/validate-reading-vocab.js`,
  `src/utils/readingVocab.js` (allowed-vocab builder/checker), `src/data/cognates.js`
  (centralized loanwords/proper nouns not in `amharicPhrases.js`)

## Separate from this file
The user-preferences/feedback/stable-facts memory system at
`/Users/ethansun/.claude/projects/-Users-ethansun-amharic-fidel-app/memory/`
is a **different** system (auto-loaded, covers things like the romanization
convention, IME handling, no-em-dash rule, deployment infra facts). This
continuity folder is specifically for **engineering/project state** — what's
currently true about the codebase and what's in flight. Some overlap between
the two is fine; don't worry about de-duplicating perfectly.
