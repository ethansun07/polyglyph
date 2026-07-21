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
- **Database**: **Neon Postgres is production.** The RDS instance referenced
  in `server/.env` is a stale/legacy dev-only DB — don't confuse the two.
  No migration runner exists: `db/schema.sql` is the source of truth, written
  with idempotent `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... ADD COLUMN
  IF NOT EXISTS` so it's always safe to re-run, but new columns/tables must be
  manually applied to Neon (via console.neon.tech's SQL Editor) — nothing
  does this automatically.
- **Auth**: Firebase Authentication. Every visitor gets a real anonymous uid
  the instant the app loads (`signInAsGuest`); signing in with Google upgrades
  that same identity in place via `linkWithPopup`, falling back to
  `signInWithCredential` if that Google account already has separate history
  elsewhere (`auth/credential-already-in-use`). There is no separate
  "local guest data to merge" concept anymore — this replaced an earlier
  architecture that had a serious cross-account data leak bug (see LOG.md).

## Recently shipped (most recent first)
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

## Where to look
- Auth logic: `src/utils/firebase.js`, `src/App.jsx` (the `onAuthChange` effect)
- Admin dashboard: `src/components/AdminDashboard.jsx`, `server/routes/users.js`
- Read mode (sentences/dialogues, bookmarks, read-status):
  `src/components/SentenceReader.jsx`, `src/utils/readingProgress.js`,
  `server/routes/readingProgress.js`
- Shared CSS patterns/design tokens: `src/App.css` (`:root` variables,
  `.quiz-next-bar`/`.wr-sticky-footer` no-scroll patterns, `.nav-item-overflow`
  responsive nav breakpoint)
- Progress/mastery logic: `src/utils/progress.js` (`getLevelProgress`,
  `isLevelUnlocked`, mastery = net score ≥ 5 reading / ≥ 3 writing)

## Separate from this file
The user-preferences/feedback/stable-facts memory system at
`/Users/ethansun/.claude/projects/-Users-ethansun-amharic-fidel-app/memory/`
is a **different** system (auto-loaded, covers things like the romanization
convention, IME handling, no-em-dash rule, deployment infra facts). This
continuity folder is specifically for **engineering/project state** — what's
currently true about the codebase and what's in flight. Some overlap between
the two is fine; don't worry about de-duplicating perfectly.
