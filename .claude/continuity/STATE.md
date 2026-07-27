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
- **Live "Generate a sentence" button in Read mode** (Sentences tab). Clicking
  it always tries a live call first: `POST /api/generated-sentences/generate` calls Gemini
  (`server/lib/gemini.js`, raw `fetch`, no SDK) constrained to the same
  allowed-vocabulary set `validate-reading-vocab.js` checks against (shared
  via `src/utils/readingVocab.js`), retries up to 3x server-side if the model
  uses a disallowed word, then synthesizes audio via the existing Cloud TTS
  pattern (`server/lib/tts.js`) and returns everything as one JSON payload.
  Audio is never written to disk, just returned as base64 and played via a
  new `playAudioFromBase64()` in `src/utils/audio.js`. Live-generated
  sentences are ephemeral by default; an explicit "Save" (reusing
  `SentenceCard`'s existing bookmark button/icon, just relabeled) persists to
  a new `generated_sentences` table (per-uid, `server/routes/generatedSentences.js`)
  so it survives reloads, audio for saved ones is re-synthesized on demand
  (`POST /:id/audio`), never stored. `/generate` is rate-limited
  (`express-rate-limit`, 20/hour per uid) since it's the only endpoint with
  real per-call cost. Uses the `gemini-flash-latest` alias, not a pinned
  version (`gemini-2.5-flash` returned a 404 "no longer available to new
  users" for this project's key even though `models.list` still showed it, so
  pin-by-version is apparently not safe here). Each prompt sends a themed
  subset of vocab (~30-50 words based on a randomly chosen phrase category)
  rather than the full ~166-word list, both for variety (a full identical
  list every call made the model default to the same "I want [drink]"
  pattern) and to cut input-token cost. If the live call fails for any reason
  (quota, billing, network), falls back to a random unread sentence from
  `SENTENCES` instead of showing a bare error, marking it read immediately
  since clicking the button counts as "seen it" either way. This used to be
  the *primary* path (static-first, live generation only once everything was
  read) but got flipped once the full static list became separately
  browsable above the button (see "Also reordered" below): re-surfacing an
  already-visible unread sentence via this button felt redundant with the
  list's own "Continue" button, so now it's purely an error fallback.

  **Gemini billing note**: the free tier is capped at 20 requests/day per
  model per project, easy to exhaust while testing. Gemini API billing is
  prepay, not postpay: enabling billing on the Cloud project alone isn't
  enough, the project also needs actual prepay credits added at
  ai.studio/projects (distinct "quota" vs "prepay credits depleted" 429
  errors tell you which state you're in). **Verified working locally
  end-to-end** (generate, validate, synthesize, real HTTP route, with a real
  `GEMINI_API_KEY` and prepay credits) this session. **Still needs, before
  production works**: `GEMINI_API_KEY` set in Render's env vars (local
  `server/.env` already has it), the new `generated_sentences` table applied
  to Neon, and a Render redeploy, per the deployment checklist below.
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
  `generate-missing-audio.js` pipeline. This matters because the "Generate a
  sentence" button's error-fallback only reads from `SENTENCES`, so
  the Sentences tab needed to be a complete, self-contained, and reasonably
  non-repetitive unit rather than relying on `DIALOGUES` for full phrase
  coverage. `SentenceReader.jsx`'s Sentences tab layout: "Generate a
  sentence" (button/preview/saved-list, under a "Want more? Generate a new
  sentence" heading) is at the **top**, followed by a "Sentences" heading and
  then the static list with its own "Continue" button. Went through two
  orderings this session: static-list-first (when Generate still meant
  "surface an unread static one"), then flipped to Generate-first once that
  behavior became a pure error-fallback (see above) and the button turned
  into an independent, always-available feature rather than a reward for
  finishing the list, so burying it below 40 sentences no longer made sense.
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
4. New env var added (e.g. `GEMINI_API_KEY`) → set it in both local
   `server/.env` and Render's dashboard env vars; Render does not read from
   `.env.example` or infer anything, it needs the real value entered manually.

## Where to look
- Auth logic: `src/utils/firebase.js`, `src/App.jsx` (the `onAuthChange` effect)
- Admin dashboard: `src/components/AdminDashboard.jsx`, `server/routes/users.js`
- Read mode (sentences/dialogues, bookmarks, read-status):
  `src/components/SentenceReader.jsx`, `src/utils/readingProgress.js`,
  `server/routes/readingProgress.js`
- Live sentence generation: `server/routes/generatedSentences.js`,
  `server/lib/gemini.js`, `server/lib/tts.js`, `src/utils/readingVocab.js`
- Shared CSS patterns/design tokens: `src/App.css` (`:root` variables,
  `.quiz-next-bar`/`.wr-sticky-footer` no-scroll patterns, `.nav-item-overflow`
  responsive nav breakpoint)
- Progress/mastery logic: `src/utils/progress.js` (`getLevelProgress`,
  `isLevelUnlocked`, mastery = net score ≥ 5 reading / ≥ 3 writing)
- Read-mode vocabulary audit: `scripts/validate-reading-vocab.js`,
  `src/data/cognates.js` (centralized loanwords/proper nouns not in
  `amharicPhrases.js`)

## Separate from this file
The user-preferences/feedback/stable-facts memory system at
`/Users/ethansun/.claude/projects/-Users-ethansun-amharic-fidel-app/memory/`
is a **different** system (auto-loaded, covers things like the romanization
convention, IME handling, no-em-dash rule, deployment infra facts). This
continuity folder is specifically for **engineering/project state** — what's
currently true about the codebase and what's in flight. Some overlap between
the two is fine; don't worry about de-duplicating perfectly.
