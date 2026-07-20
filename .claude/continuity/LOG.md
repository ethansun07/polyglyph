# Polyglyph — Session Log

Append-only. Newest entry at the top. Each entry: date, what happened, why it
mattered. This is a narrative for humans and future Claude sessions to
understand *how* the project got to its current state — for what's *true
right now*, see STATE.md instead. Don't edit past entries; if something here
turned out to be wrong, add a new entry correcting it rather than rewriting
history.

---

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
