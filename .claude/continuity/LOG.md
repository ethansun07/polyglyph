# Polyglyph — Session Log

Append-only. Newest entry at the top. Each entry: date, what happened, why it
mattered. This is a narrative for humans and future Claude sessions to
understand *how* the project got to its current state — for what's *true
right now*, see STATE.md instead. Don't edit past entries; if something here
turned out to be wrong, add a new entry correcting it rather than rewriting
history.

---

### 2026-07-27 — Live in-app sentence generator (what "AI sentence creator" actually meant)
Turned out the previous session's read of "AI sentence creator" (a Claude-drafted-content
+ validator-script workflow) wasn't what the user meant — they wanted a real feature
*in the running app*: a button a user clicks that calls an LLM live and shows/plays a
fresh sentence immediately, no Claude conversation or git commit involved. Re-planned
from scratch given this was a materially bigger scope (new LLM API + key, new backend
route, new DB table, new UI) — two Explore agents confirmed no rate-limiting library,
no LLM SDK, and no precedent anywhere in the app for user-triggered content generation
or for the frontend playing non-static audio (existing `src/utils/audio.js` functions
are all hardcoded to `/audio/...` file paths).

Built: `POST /api/generated-sentences/generate` calls Gemini (`server/lib/gemini.js`,
picked over Anthropic per user's choice, raw `fetch` against the REST endpoint rather
than adding an SDK, matching the existing TTS script's no-dependency philosophy) with a
prompt built from the exact same allowed-vocabulary set `validate-reading-vocab.js`
already checks against — extracted that vocab-set/checker logic out of the script into
`src/utils/readingVocab.js` so both share it, no duplicated source of truth. If Gemini's
output uses a disallowed word, the route re-prompts (up to 3 attempts total) pointing out
exactly which words weren't allowed, rather than just failing immediately. On success it
calls the existing Cloud TTS pattern (factored into `server/lib/tts.js`) and returns
everything — text + word breakdown + base64 audio — in one response; audio is never
written to disk anywhere in this flow.

User's scope call: ephemeral by default (each click shows a temporary card, nothing
persisted), but an explicit "Save" persists it to a new `generated_sentences` table
(one new table, `db/schema.sql`) — reused `SentenceCard`'s existing bookmark
button/icon for this (filled = saved, click to toggle) rather than building new UI,
since the interaction is identical. Saved sentences' audio is re-synthesized on demand
when replayed (`POST /:id/audio`) instead of ever being stored, avoiding needing any
file/blob storage infra. Added `onPlayAudio`/`onPlayWordAudio` override props to
`SentenceCard` (default to the old path-based behavior when omitted, so every existing
usage is unaffected) so generated content's live base64 audio and the browser-voice
fallback for word-chip taps could reuse the same card component instead of building a
parallel one. Rate-limited `/generate` specifically (`express-rate-limit`, 20/hour/uid)
since it's the only endpoint that costs real money per call.

User provided a `GEMINI_API_KEY` later the same session, which uncovered one bug before
it could be tested: the hardcoded model name `gemini-2.5-flash` returned a 404 "no
longer available to new users" for this key/project, despite `models.list` still
listing it as available. Switched to the `gemini-flash-latest` alias instead (resolves
to `gemini-3.6-flash` currently) specifically to avoid pinning to a version that can be
silently deprecated like this again. After that fix, verified the entire pipeline live:
generate, JSON parse, vocab validation (0 disallowed words), TTS synthesis (real MP3
bytes back), the actual Express route over real HTTP.

Then it kept generating near-identical sentences ("I want coffee," "I want coffee and
water"), because the prompt sent the entire allowed vocabulary in the same order every
call, so the model kept landing on the same "safe" combination. Fixed by picking a
random theme (one of `amharicPhrases.js`'s `CATEGORY_ORDER`) each call and, after a
follow-up cost question, replacing the full ~166-word list with a themed subset
(~30-50 words: everything from that category's phrases plus a random sample of the
rest) instead of dumping the whole vocabulary every time. Cuts input tokens
substantially and incidentally reinforces the variety fix.

Debugging "it's not generating" turned into a long chain: a stray orphaned `node`
process was squatting on port 3001 (`EADDRINUSE`), so the freshly-restarted dev server
silently never bound and requests hung pending forever, not just the new endpoint, every
API call including pre-existing ones. Killed it (`lsof -nP -iTCP:3001 -sTCP:LISTEN`,
`kill -9`) and the server started cleanly. After that, the real error surfaced: Gemini's
free tier caps at 20 requests/day per model per project, easy to exhaust while testing
(each click can cost up to 3 Gemini calls if the vocab validator rejects an attempt).
User asked for a cost estimate; answered with a historical-pattern estimate (not
confirmed for this specific newer model) rather than guessing a hard number. User then
enabled billing, but Gemini API billing is prepay, not postpay: the error changed from
"free tier quota exceeded" to "prepayment credits are depleted," meaning billing alone
doesn't remove the cap, the project needs actual prepay credits added at
ai.studio/projects. Once credits were added, the pipeline worked end-to-end for real.

Since the whole point of the curated static sentences is that they're free and reliable
(see the entry below), and the live generator turned out to have real cost/quota
fragility, "Generate a sentence" now tries an unread static sentence first (random pick,
reuses normal `reading_progress` read/bookmark tracking, no "Save" needed) and only
calls Gemini once all of them are read. First version of this had a bug: it only marked
a surfaced sentence as read once the user tapped into its words, same as the normal
list, so repeatedly clicking "Generate"/"Generate another" without engaging with each
card never advanced past the static set at all ("it's only giving the [static ones], not
generating new after"). Fixed by marking the pick read immediately when the button
surfaces it, clicking the button at all counts as "seen it," unlike browsing the list
normally where only real interaction counts.

User then asked whether the static set's size (35) was even right, and to make sure it
covered the most words/variety/importance. Checked: only 54 of `amharicPhrases.js`'s 86
phrases were used anywhere in `SENTENCES`, the other 32 were only reachable via
`DIALOGUES`, a separate tab the "Generate" fallback doesn't read from. First pass added
18 new sentences (one or two phrases each) targeting exactly those 32 phrases, bringing
the static set to 53. User flagged that 53 felt like too many; asked whether the concern
was volume or how long before the AI feature kicks in, answer was volume. Consolidated
the 18 into 8 denser sentences (several phrase pairs per entry, e.g. combining a
name/how-are-you/where-from exchange into one card) plus the one that was already
standalone, landing at 44. User then wanted a rounder number, split the single densest
entry (6 phrase-pairs in one card, arguably too packed anyway) back into two, landing on
a clean 45. Deleted the orphaned audio from the intermediate 53-sentence ids and
regenerated for the final set. Also reordered the tab: the static list (with "Continue")
now comes first, "Generate a sentence" comes after, framed explicitly as what to do once
you've read through the pre-made set.

User then asked directly whether the *original* 35 sentences had actually been touched
during any of this, correctly suspecting the answer was no, they hadn't, only new ones
had been added around them. Went back and actually audited the original 35: the
"X እፈልጋለሁ" (I want X) template appeared 8 times (`want_taxi`, `ticket_want`,
`silk_want`, `sira_want`, `khat_new`, `no_money`, `hurry_taxi`, `wait_no_money`), and
"is X good/well/far?" appeared 6-7 times, same grammar, different noun swapped in, not
real variety. First instinct was to flag a couple of phrase choices (`khat`, `feqer`) as
lower-priority using their `travelEssential` flag; user pushed back that `travelEssential`
shouldn't be used as an importance signal for this at all (and specifically that khat
*is* travel-relevant despite the flag), so that got dropped as a criterion entirely.
Fixed the actual grammar-template redundancy instead: merged the clearest near-duplicate
pairs in place (`want_taxi`+`silk_want` → `taxi_phone_want`, `sira_want`+`no_money` →
`work_money_want`, `ticket_want`+`khat_new` → `ticket_khat_want`, `wifi_good`+`pizza_good`
→ `wifi_pizza_good`, `family_well`+`brother_well` → `family_brother_well`), landing at a
final 40 sentences, still full 86-phrase coverage, noticeably less repetitive. Cleaned up
the now-orphaned audio for every removed/renamed id and regenerated for the 5 merged
entries.

Last change: user asked whether the original 35 should be removed from what "Generate"
can surface, now that the full static list is separately browsable at the top of the
Sentences tab (the earlier reorder). Realized the static-first fallback (surface an
unread static sentence before ever calling Gemini) had become redundant with that list's
own "Continue" button, since a user could just scroll up to find the same unread
sentence the button would've shown them. Flipped the priority: `handleGenerate` now
calls the live Gemini endpoint first on every click, and only falls back to a random
unread static sentence if that call throws (quota, billing, network, anything). Same
static pool as before, same read-marking-on-surface behavior, just demoted from primary
path to error-fallback. Verified live end-to-end again (real Gemini call succeeded
through the actual route) since this touched the client-side call order, not the
backend itself.

With that flip, the button no longer depends on finishing the static list, so its
position moved too: back to the top of the Sentences tab (a "Sentences" heading now
separates it from the static list below), since burying an always-available, no-longer-
sequential feature under 40 sentences of scrolling didn't make sense once it stopped
being "the reward for finishing."

User then reported the bookmark/"Save" button on generated sentences didn't work. Root
cause turned out to be two stacked problems, neither in the new feature's own logic:
(1) the `generated_sentences` table had been added to `db/schema.sql` (the source of
truth) but never actually applied to any real database this session, every save/list
call was hitting a table that didn't exist; (2) worse, `server/.env`'s `DB_HOST` was
pointed at a stale/legacy AWS RDS instance (already flagged as such in STATE.md) that
is now timing out entirely, meaning the local server couldn't reach *any* database, not
just this one, every DB-backed feature (reading progress, phrase progress, all of it)
has been silently broken locally. The frontend's `.catch(() => {})` error-swallowing
pattern hid this: saves looked like they worked (optimistic local state update) but
never persisted anything. Fixed by switching `server/.env` to local Postgres
(`DB_HOST=localhost`, matching `.env.example`'s defaults) and running
`psql amharic_fidel -f db/schema.sql` to actually create the missing table locally.
Verified with a real INSERT/SELECT/DELETE against a real Postgres row (had to first
insert a throwaway `users` row to satisfy the `generated_sentences_uid_fkey` constraint
for the synthetic test uid, then cleaned it up). This is a good example of why "updated
the schema file" and "the schema is actually applied" are two different, easy-to-conflate
facts, worth remembering for the next new table.

Once saving actually persisted, a second bug surfaced: toggling "Show bookmarked only"
made saved generated sentences disappear instead of showing them, exactly backwards.
Cause: the entire "Generate" section, including the "Your saved generated sentences"
list, was wrapped in one `{!bookmarkedOnly && (...)}` block, so the bookmark filter hid
the very thing it should surface. Split it: the "Generate a new sentence" button/preview
stays gated on `!bookmarkedOnly` (doesn't make sense while filtering to bookmarks), but
the saved-generated list now renders unconditionally, since it *is* the user's bookmarked
generated content. Also fixed the static list's "No bookmarked sentences yet" empty
state so it only shows when there are truly zero bookmarked items across both the static
list and the saved-generated list, not just the static one.

### 2026-07-26 — "AI sentence creator" became a vocab validator, not an LLM integration
User asked about using AI to generate Read-mode content faster, and separately
about adding real birr amounts and Ethiopic numbers to existing dialogue
lines (both done manually first — see below). When asked to actually build
"the AI sentence creator," research turned up: no LLM text-generation API key
or SDK exists in this repo (the existing `GOOGLE_API_KEY` is Cloud
Text-to-Speech only, a different Google product), and any such pipeline would
still need the same human/Claude review step before merging anyway. Decided
against standing up new API infrastructure; instead, Claude drafts Read-mode
content directly in conversation (as it already had been doing), gated by a
new `scripts/validate-reading-vocab.js` that mechanically checks every word
in `SENTENCES`/`DIALOGUES` against the real allowed vocabulary — Common
Phrases, a new centralized `src/data/cognates.js` (loanwords + proper nouns
that were previously scattered inline with nothing to check them against),
and `ethiopicNumbers.js`. User confirmed two scope calls: proper
nouns/obviously-English-adjacent loanwords don't need pre-approval (just get
added to `cognates.js` in the same pass they're introduced), and new content
going forward doesn't need per-sentence manual review from the user — Claude
+ the validator are the quality gate now.

Running the validator against all existing content (the audit promised in
the previous log entry) found exactly two more real gaps, both honorific-
register words used in `dial_formal_greeting` but never taught: ይናገራሉ
(polite "do you speak?") and እባክዎ (formal "please"). Rather than reword
those dialogue lines down to casual register, added `formalAmharic` fields
to the `englizgna_yinageralu` and `ibakih` phrases (both already had the
male/female split, formal was just missing — `ibakih`'s own note already
mentioned እባክዎ in passing, same leak pattern as ወዴት/የለኝም before it) and
generated their audio. Validator now reports zero flags against all 35
sentences/paragraphs + 15 dialogues.

Also added real birr amounts to four dialogue lines that previously said the
vague "it's birr" with no number (ሂሳቡ ብር ነው → e.g. ሂሳቡ ሁለት መቶ ሃምሳ ብር ነው,
250 birr), after first trying unrealistically low amounts (50/100/200/300)
that the user correctly called out as implausible for current Ethiopian
prices — settled on 250/850/600/750 birr across the coffee house, restaurant,
airport taxi, and market radio dialogues. Considered gating Read mode behind
Numbers-page mastery now that it uses number words, but decided against it
per the user — Read mode's unlock stays exactly `isReadModeUnlocked()`
(Level 7 mastery + phrase test), no numbers requirement.

### 2026-07-25 — Untaught words leaking into Read mode sentences
User caught two Read-mode sentences using words that were never actually
taught as Common Phrases: ወዴት ("which way") in `passport_where`,
`hospital_where`, `dial_airport`, and `dial_medical`, and የለኝም ("I don't
have") in `no_money`/`wait_no_money`. Both words only appeared as an
aside inside a *different* phrase's `note` field (`wedet_new`'s note
mentions ወዴት ነው as a related form of የት ነው; `genzeb`'s note mentions
ገንዘብ የለኝም as an example sentence) — that note text got lifted into
`readingSentences.js` as if it were taught vocabulary, violating the
file's own "all words come from Common Phrases ONLY" rule. Fixed by
swapping ወዴት → የት (the word `wedet_new` actually teaches) throughout,
and rewording the money sentences to `ገንዘብ እፈልጋለሁ` ("I need money",
built from the taught `genzeb` + `ifelgalehu`). Regenerated the 14
affected audio files (`find-missing-audio.js` / `generate-missing-audio.js`
after deleting the stale ones) since content changed but ids/paths didn't.
No systematic audit was done beyond the two the user flagged — see the
STATE.md known-issues note if this keeps recurring.

### 2026-07-20 — Bookmarks + synced read-status for Read mode
Added a bookmark feature (tap the bookmark icon on any sentence/dialogue
card, filter to "show bookmarked only") and upgraded the existing
"already read" tracking from local-only to cloud-synced, per explicit
user request after discussing the tradeoff (local-only ships instantly
with no backend changes; synced is more useful but needs a new table +
API route + Render redeploy — user chose synced for both). New
`reading_progress` table (uid, item_id, read, bookmarked) — one row per
user per sentence/dialogue, since both flags are just "this user's
relationship to one reading item." Client-side: new
`src/utils/readingProgress.js` replacing the old local-only
`READ_SEEN_KEY` logic that used to live in `progress.js`. Follows the
exact same sync pattern as reading/writing/phrase/number progress: an
`onAuthChange` effect with the stale-response guard, wired into Reset
Progress and the identity-switch cache clear. This is the fifth instance
of this exact sync pattern in the codebase now — if a sixth progress
type is ever needed, it's a well-worn template at this point (schema
table → GET/PUT route → client utils file → onAuthChange effect →
reset/identity-switch wiring).

### 2026-07-20 — Reset Progress silently failing to refresh
User reported the "already read" checkmark on Read mode's sentences (and
dialogues) sometimes surviving a Reset Progress. Root cause:
`deleteMainProgressFromCloud()` in `Settings.jsx`'s `handleReset()` wasn't
wrapped in a try/catch, so if that request failed for any reason (a
cold-starting Render backend, a transient network blip), it threw and
`window.location.reload()` on the next line never ran. Local storage was
already correctly cleared by that point, but since the page never
reloaded, every screen kept showing stale in-memory React state — not
just the read-seen checkmarks, potentially anything. Fix: wrapped the
cloud delete in try/catch so `reload()` always runs regardless of whether
it succeeds. Good general lesson for this codebase: an unhandled
await-that-throws silently skips everything after it in the same async
function, which is an easy way for a "did the UI actually refresh" bug to
hide behind a "the data looks fine in the database" check.

### 2026-07-20 — Guest/user location tracking + this continuity system
Added self-hosted IP → country/city lookup (`geoip-lite`) for the admin
dashboard, after discussing with the user whether this was normal practice
(it is — same as any analytics tool's "visitors by country" view) and
choosing a self-hosted lookup over a third-party API for privacy (no IP ever
leaves the server, and the raw IP itself is never persisted, only the
derived location). User applied the Neon migration themselves via the SQL
Editor (had to warn them not to also run Neon's default placeholder
`playing_with_neon` example query sitting in the same editor). Confirmed
`upsertUserDoc()` fires on every app load, not just first sign-up, so
existing users/guests backfill automatically next time they visit — no
migration script needed for that part.

Also created this `.claude/continuity/` folder at the user's request, plus a
root `CLAUDE.md` pointing future sessions here, so a fresh session can read
STATE.md and immediately know where things stand instead of re-deriving
everything from git history and code.

### 2026-07-17 to 2026-07-20 — Em-dash cleanup, several rounds
What looked like a quick "remove em dashes from two lines" request turned
into multiple rounds: first a data-file sweep (fidel.js, amharicPhrases.js),
then a full re-scan across every component + server route (found 8 more the
first pass missed — JSX literals and component-level strings, not just data
files), then a correction pass after the user pointed out some em-dash→colon
swaps had been done mechanically without checking the sentence still read
naturally (a colon only works for a definition/example relationship; three
instances actually needed a contrast "but" or two full sentences instead).
Lesson: when doing a mechanical find-and-replace on prose, actually re-read
each result, don't just confirm the character is gone.

Also clarified and preserved a **connector-style exception**: "X — Y" labels
(row titles, page titles like "Admin — 5 users") are intentionally kept, only
em dashes used as a *sentence break* get removed. Documented in the memory
file `feedback_no_em_dashes.md`.

### 2026-07-17 — Nav/scroll audit + flag color bug
User pointed out the Flashcard mode's Wrong/Got it buttons required
scrolling, and was frustrated at having to report this per-mode individually
rather than it being caught everywhere at once ("isn't it obvious you should
apply to all"). Did a full audit and found the same issue in Word Reading
Exercise, Lesson Mode's quiz/audio steps, and Mixed Review (which turned out
to be dead code, not reachable from any nav path — fixed anyway for
consistency). Also fixed the Full Fidel Chart requiring a tiny horizontal
scroll per row (cells had a fixed min-width that didn't leave room for all 7
columns on narrow phones; switched to `min-width: 0` so flex shrinks cells to
exactly fill the row).

Separately: the header/dashboard flag decoration was using **vertical**
green/yellow/red stripes (Mali's flag) instead of Ethiopia's **horizontal**
ones — a `flex-direction` bug in the CSS recreation. Fixed the orientation,
but the user then asked to just use the real 🇪🇹 emoji instead of a CSS
recreation at all, so that's what's live now.

### 2026-07-16 to 2026-07-17 — Full visual redesign
User said the app "looks so basic." Planned and executed a large redesign:
replaced ~150 emoji with `lucide-react` icons (catalog undercounted the true
number twice — budget extra time for stragglers when doing an emoji sweep),
bolder gradient buttons + elevated cards, and a responsive nav (5 items +
"More" sheet on phone, full 9-item bar restored on desktop after the user
pointed out desktop had room for the old format). Also switched the
Dashboard's "Typing" quick-start button to "Flashcards" since typing Amharic
on a phone keyboard is rough.

Also fixed a real auth bug found during this work: the header showed no
name/photo for some accounts because Firebase only backfills top-level
`displayName`/`photoURL` at account creation — an account that got created
via the `credential-already-in-use` fallback path can have those fields
stay null even though the linked Google account has a real name/photo now.
Fixed with a `providerData` fallback in `AuthButton.jsx`. (A separate
attempt to fix a *different* reported issue — signing in as the wrong
Google account — by forcing `prompt: 'select_account'` was reverted; it
wasn't actually the cause of the reported symptom and the user asked for it
back out.)

### Earlier (dates approximate, prior to this log's creation)
- **Migrated from ad-hoc localStorage-merge guests to real Firebase
  Anonymous Auth + account linking.** This was a structural fix, not a
  patch, for a serious bug: a brand-new account had received another user's
  entire private history, root-caused via direct production database
  queries to a race condition (an in-flight cloud fetch under one identity
  still got applied after the identity changed). The immediate race was
  fixed with an identity-check guard, then the whole guest/merge concept was
  replaced so the underlying bug class can't recur.
- Built the admin dashboard, feedback submission feature, and various
  quiz/lesson mode UX fixes (keyboard shortcuts, swipe gestures, streak-calc
  race condition, React rules-of-hooks crashes on Numbers/Writing quiz
  completion).
- Removed persistent Dashboard "nudge cards" after the user had to ask twice
  — first ask was misread as "don't add more," not "remove what's there."
