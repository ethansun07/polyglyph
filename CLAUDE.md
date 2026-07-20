# Polyglyph

Before starting work, read `.claude/continuity/STATE.md` — it has current
architecture, what's recently shipped, known issues, and deployment
reminders, so you don't have to re-derive project state from git history and
code alone. `.claude/continuity/LOG.md` has a dated narrative of past
sessions if you want the "why" behind a past decision.

After finishing non-trivial work in a session, update `STATE.md` in place to
reflect the new current state (don't leave stale entries), and append a
dated entry to `LOG.md` summarizing what changed and why. Small/routine
fixes don't need a log entry — reserve it for things a future session would
actually benefit from knowing.

This is separate from the auto-memory system at
`~/.claude/projects/-Users-ethansun-amharic-fidel-app/memory/` (user
preferences, feedback, stable facts) — that one is auto-loaded and covers a
different kind of thing. This continuity folder is specifically for
engineering/project state.
