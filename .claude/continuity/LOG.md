# Polyglyph — Session Log

Append-only. Newest entry at the top. Each entry: date, what happened, why it
mattered. This is a narrative for humans and future Claude sessions to
understand *how* the project got to its current state — for what's *true
right now*, see STATE.md instead. Don't edit past entries; if something here
turned out to be wrong, add a new entry correcting it rather than rewriting
history.

---

### 2026-07-28 — Corrected Read mode's gate threshold: Level 5 → Level 6
The user asked why Level 5 specifically, which exposed that the number had never actually
been derived from data — just a gut "5 of 7 feels like most of the way" call. Went back and
counted real character distribution per level (`getLevelChars`/`getAllChars` in
`fidel.js`): 231 core characters across the 7 levels (35/35/35/28/35/35/28). Also had to
correct a bigger misunderstanding first: "reached Level N" means Level N is *unlocked*, not
mastered — unlocking only requires ~85% mastery of the *previous* level
(`LEVEL_UNLOCK_THRESHOLD` in `progress.js`), so Level N itself could have zero engagement at
that point. Redoing the guarantee at 85% (not 100%) of prior levels: Level 5 reached only
guarantees ~49% of the alphabet mastered, well under "most of it" like the locked-screen
copy claimed; Level 6 guarantees ~62%; Level 7-reached (not the old full-mastery gate) would
guarantee ~75% but sits close enough to the original requirement to barely loosen anything.
Moved `READ_MODE_MIN_LEVEL` in `src/utils/progress.js` from 5 to 6 as the real middle
ground, updated the locked-screen copy in `SentenceReader.jsx` to match, verified live via
Playwright that Level 5 is still locked and Level 6 unlocks correctly.

### 2026-07-28 — Closed the loop: removed the Final Test's own attempt-gate too
Picked back up the question left open in the entry below ("should the Final Test's attempt
gate come off too, now that it doesn't unlock anything"). Reframed it by asking what the
Final Test's purpose even still was, now that it doesn't gate Read mode: concluded it's
still worth keeping as a feature — a mixed-format (multiple-choice + matching) comprehensive
review across all learned phrases, with pass/fail scoring and per-level high-score tracking,
genuinely different from Browse/Flashcard/Type's topic-drilling format, not redundant.

But once its role is "another practice mode" rather than "the gate," it was the odd one out:
Browse/Flashcard/Type are all available from Level 2 onward, ungated, while Test alone still
required full `isLevel7Mastered`. Removed that gate (`testUnlocked` check deleted from
`CommonPhrases.jsx`, `MODES` always includes the test tab now) for consistency with its
siblings — it already scopes its own content to `getUnlockedPhrases(highestLevel)`, so an
early attempt is just a smaller/easier version of the same test, not exposure to content
beyond what's been taught, same mechanism that made Read mode's Level-5 gate safe to reason
about. Also deleted the now-stale "master Level 7 letters to unlock the Final Test" hint
text. Verified live (Playwright, Level 2 progress) that the Final Test tab appears and opens
correctly with a smaller 15-question pool instead of the full 86, no crash.

### 2026-07-28 — Reversed course again: Read mode's "no gate" was an overcorrection, landed on a level-based partial gate instead
Immediately re-examined the "removed entirely" decision from earlier the same session
(entry below) after the user asked "are you sure that was the right call." On reflection,
the argument that won ("illegible content gives the same signal a hard block would, so the
gate wasn't protecting anything") proved too much: it would justify removing the
level-progression gates too, which nobody was arguing for, and it didn't distinguish
between two very different people — a brand-new Level-1 user (Read is guaranteed useless
for them, decoding ability is the actual bottleneck regardless of whether they already know
the spoken vocabulary) and someone most of the way through the levels who just doesn't want
to grind the last stretch before trying real content. Full removal served the second
person fine but made the page pure noise for the first, which is most first-time users.

Landed on a partial gate: `isReadModeUnlocked` back in `src/utils/progress.js`, now meaning
"reached Level 5 of 7" (`READ_MODE_MIN_LEVEL`), checked via `getHighestUnlockedLevel` —
deliberately **not** re-coupled to the Common Phrases Final Test the way the original gate
was. That original coupling (Read mode ← Final Test ← Level 7 mastery) was itself
questionable in the same conversation (see "so should we get rid of the gate for the final
test too?" below), and character-decoding progress is the more direct signal for "can this
person plausibly use Read mode" than a vocabulary test is anyway. `SentenceReader.jsx`'s
`LockedScreen` came back too, simplified from the original (no checklist, no admin
unlock/relock bypass) since there's no discrete action to complete this time, just normal
leveling. Nav's lock icon (`nav-locked`/`isReadLocked`) came back as well, this time
actually meaningful again since there's a real gate behind it.

Along the way, caught a real bug the first "remove the gate" pass had introduced and not
noticed: `CommonPhrases.jsx`'s Final Test pass/fail screens still said "Read mode
unlocked!" and "you need 85% to unlock Read mode" — both already false once Read's gate was
removed, and still false now that Read's gate doesn't reference the Final Test at all.
Fixed the copy to just describe the test result, no Read mode mention.

Also flagged, but explicitly left open, a related question: should the Final Test's own
*attempt*-gate (`isLevel7Mastered` required to even try it, in `CommonPhrases.jsx`) also
come off, now that passing/failing it no longer unlocks anything? Established that the test
already scopes its content to `getUnlockedPhrases(highestLevel)` and tracks high scores
per-level (`phraseTestHighScores[highestLevel]`), so removing that gate wouldn't expose
early learners to content beyond their level — mechanically low-risk. The only real
downside found: `phraseTestPassed` is a permanent flag, so passing an early, easier-scoped
attempt would permanently swap the tab label from "Final Test" to "Test," which is a minor
cosmetic mismatch with the "final" framing, not a functional problem. Not resolved yet —
next session should pick this back up rather than re-deriving it.

### 2026-07-28 — Reversed course: removed Read mode's gate for real, split Passages into sub-tabs, fixed Lesson mode's silent no-op progress bug, fixed scroll-on-navigate
Picked back up the "should Read even be gated" question from the entry below, which had
concluded "not worth it" and shelved the idea. Re-argued it from a different angle this
time: someone who can't read the script yet gets real negative feedback from the illegible
content itself the moment they open Read (can't understand it, gets nothing, leaves) — the
same practical outcome as being blocked, except more honest. The hard gate wasn't
protecting anyone from anything the content wouldn't already teach them by being
illegible. This argument held up where the placement-test ideas in the earlier entry
didn't, so this time it actually got built: `LockedScreen` in `SentenceReader.jsx` deleted,
`isReadModeUnlocked`/`readUnlockedByAdmin` removed from `progress.js`, admin unlock/relock
buttons gone. Verified live via a scripted Playwright run (no chromium-cli available in
this environment, so installed Playwright straight into the scratchpad directory) that a
fresh guest can open Read and see real content instead of the lock screen.

Kept, then also cut, the nav's lock-icon/dimmed treatment on the Read tab as a "milestone"
indicator — reasoned initially that it had gamification value even with the hard block
gone, but on reflection a padlock icon still tells an unprepared user "you can't use this,"
which undoes the entire point of removing the block (they just won't click it). Removed
`isReadLocked`/`nav-locked` too. **The Common Phrases Final Test gate itself is untouched
and still real** — still requires `isLevel7Mastered` to even attempt the test; only Read
mode's *own* separate gate on top of that is gone.

Split the Passages tab into "Stories" and "Dialogues" sub-tabs (`passagesSubTab` state)
before adding any new stories, at the user's request to fix layout before content so new
stories land in their final home in one pass. Prompted by a worry that Stories (currently
4, but the Bloom Library catalog scoped out earlier this week has 48+) would eventually
crowd out Dialogues (fixed at ~12) in the old single stacked-scroll layout. Considered and
rejected just reordering (put the small stable section first) since that only protects one
side and just relocates the burial problem instead of solving it — sub-tabs give both
sections their own space regardless of how long either list gets. Went through two rounds
of layout polish after the user flagged the result looked "kinda odd": first pass moved the
bookmark filter to its own right-aligned row (was sharing a row with the tabs, looked like
a third tab), which fixed the label issue but broke width alignment between the sub-tabs
row and the tab row above it; user picked "icon-only, end of the tab row" from a set of
options for where the bookmark toggle should live, which then needed a matching-width fix
(`margin-right` on `.read-subtabs`) so the sub-tabs' right edge lines up with "Passages"
above it instead of overhanging past it to match the icon button's edge.

Also fixed two bugs found along the way, unrelated to the gate work: (1) `LessonMode.jsx`'s
`QuizStep`/`AudioStep` accepted an `onProgressUpdate` prop but never called it — a full
"Lesson complete!" run recorded nothing anywhere (not mastery, not admin stats, not even
locally), because it was surfaced by a "does lesson progress show in admin" question that
led to actually reading the component. Fixed by wiring `recordAnswer`/`onProgressUpdate`
into Quiz/Audio the same way `QuizMode.jsx` does. Deliberately did **not** wire `MatchStep`
in too — `MatchingGame.jsx` only returns one aggregate `errors` count per round with no
per-character attribution, and with only 4 pairs the last match is always forced (zero
recall signal), so it can't cleanly feed the per-character net-score system the way
Quiz/Audio's independent multiple-choice questions can. (2) Navigating between pages never
reset scroll position, since there's no router and page switches are just a React state
change — `window.scrollTo(0, 0)` added at the top of `navigate()` in `App.jsx` fixes it
app-wide, not just for Read (where it was first noticed because the page is long).

### 2026-07-27 — DIALOGUES cleanup (15→12) and renamed the tab to "Passages"
User asked for the same treatment DIALOGUES that SENTENCES got earlier this session (35→40:
audit for repetitive templates, consolidate near-duplicates, land on a clean number), plus
renaming the tab since it now holds Stories too, not just dialogues.

Ran the same kind of audit as before: computed phrase-id coverage and per-dialogue phrase
frequency across all 15. Confirmed all 86 taught phrases are covered somewhere between
SENTENCES and DIALOGUES combined (0 gaps), but frequency counts exposed the same shallow-
template problem the original 35 sentences had, at dialogue scale: `selam` appeared in
11/15 dialogues, `ameseginalehu`/`minim_ayidelem` (thank you / you're welcome) in most of
them as an identical closing pair, and 5 dialogues (`dial_hotel`, `dial_minibus`,
`dial_around_town`, `dial_cinema`, `dial_market`) were all structurally the same "is X
near/far?" Q&A chain with just the noun swapped.

Consolidated those 5 into 2 richer ones (`dial_directions`, `dial_errands`), kept the other
10 largely as-is content-wise, and deliberately varied every dialogue's opening/closing so
the boilerplate wrapper doesn't dominate: farewell (ደህና ሁን) reserved for the 4 dialogues
genuinely about parting from someone, every other dialogue closes on something specific to
its own scene (እግዚአብሔር ይመስገን, ችግር የለም, እንሂድ, ቶሎ ሂድ, ቻው), no repeats. ሰላም-openers dropped
from 11/15 to 6/12. This was a real vocabulary-imposed ceiling, not an aesthetic choice
alone: the taught vocabulary only offers a handful of verb-like constructions (ቅርብ/ሩቅ ነው,
ጥሩ ነው, ስንት ነው, a short list of taught verb-phrases), so some structural repetition across
dialogues is unavoidable, same as it was for SENTENCES. The fix is capping how many
dialogues lean on the same construction as their *entire* structure, not eliminating the
construction itself.

Landed on exactly 12 (a clean, round number, matching what was asked for even though it went
down rather than up like SENTENCES did — the user explicitly said the count could change
either direction as long as it landed clean). `validate-reading-vocab.js` passes at 0
flagged on the new set. Deleted 39 stale audio files for the 5 removed dialogue ids, generated
20 new ones for the 2 new ids via the existing pipeline.

Separately, renamed the tab from "Dialogues" to "Passages" (`SentenceReader.jsx`'s `tab`
state value, `'dialogues'` → `'passages'`) since it now contains both the Stories section and
the curated dialogues — "Dialogues" wasn't accurate anymore once Stories was added under the
same tab. The `DIALOGUES` data export name and its own "Practice dialogues" sub-section label
didn't need to change, since those still correctly describe just that one part of the tab.

### 2026-07-27 — Discussed, then shelved, loosening the Final Test / Read Mode gate
User asked whether Final Test/Read should really require full sequential mastery of
levels 1-7 (`isLevelUnlocked` chain + `isLevel7Mastered` in `progress.js`), worried it's
too much friction for someone who already knows how to read Fidel but is rusty and just
wants practice, without grinding through 7 levels of letter drills they don't need.

Talked through a few approaches and each fell apart under scrutiny:
- A single one-shot placement test spanning all levels: rejected, too gameable (a
  level-6 user could fluke through level-7 questions via guessing and get marked
  "mastered" without ever really learning those characters).
- Removing the sequential unlock but keeping the existing per-character net-score bar
  (≥5 net reading / ≥3 net writing) aggregated across *all* characters instead of just
  level 7: fixed the gameability problem and the "level 7 alone isn't a real literacy
  proxy" problem, but then the user pointed out it doesn't actually reduce anything —
  same total number of correct reps required either way, just reordered, so it wouldn't
  actually help the persona it was meant for.
- A stricter-but-shorter placement test (fewer reps required, but perfect/near-perfect
  accuracy demanded, production-based not multiple-choice) would be a genuinely
  different tradeoff and could work, but only for a fairly narrow persona.

Landed on: not worth building. If someone already reads Fidel fluently and just wants
rust-shaking practice, they have far better options than this app (native content, news,
etc.) — this app's value prop is structured from-scratch character drilling, not a
practice surface for people who already know the script. Building a bypass for a persona
unlikely to pick this tool as their primary practice destination isn't worth the
complexity. **No code changed** — gate stays exactly as it is
(`isLevelUnlocked`/`isLevel7Mastered`/`isReadModeUnlocked` in `src/utils/progress.js`).
If this comes up again, start from "does a real user actually hit this friction" rather
than re-deriving the design space from scratch.

### 2026-07-27 — Corrected: Stories do include English translations after all
The story entry directly below says stories deliberately have no English translation,
"same 'amharic only' philosophy as the live generator." That claim was wrong on my part —
the live sentence generator actually does include a translation (the `meaning` field,
revealed via a "Show translation" button on `SentenceCard`, same for per-word meanings). The
user caught this directly ("the sentence generator does include translations idk why u
think it doesnt"). Once corrected, decided stories should include translations, and more
so than the sentence generator: these are longer real narratives with less common/literary
vocabulary (e.g. "ወረበላዎች" in the Abera folktale), so losing the thread mid-paragraph is a
real risk in a way that losing one 3-6 word sentence isn't.

Turned out to be easy to source properly rather than manually translating: African
Storybook publishes the same stories in multiple languages, and the GitHub markdown mirror
(`global-asp/asp-source`) has an `en/` folder with matching numeric IDs, so the English
edition of each of the 4 shipped stories was already sitting right next to the Amharic one.
Confirmed page-for-page 1:1 alignment for 3 of the 4. The 4th, "Young Abera," turned out to
be a real localization, not a line-for-line translation: the English original
(`young-palinyang`) uses entirely different character names (Palinyang', Sausau,
Lokeyokoni, Alinyang') and a different nonsense call-song than what the Amharic translation
actually reads (a "moo, come find me" cattle-calling song built around ቦራ/Bora), so pasting
the English original's text as the `meaning` field would have shown character names on
screen that contradicted the Amharic text right next to them. Wrote that story's `meaning`
fields as a direct translation of the Amharic text itself instead, keeping the English
original only as a structural/plot reference, not literal source text.

Changed `pages` in `src/data/stories.js` from an array of Amharic strings to
`{ amharic, meaning }` objects, and reworked `StoryCard` (`SentenceReader.jsx`) so each page
is now a tappable button: tap reveals the English meaning and plays audio (same reveal
pattern as `DialogueCard`'s lines), tap again to hide. Also added a `titleMeaning` per story,
shown as a small dim gloss next to the Amharic title. No changes needed to the audio
pipeline since the underlying Amharic text per page didn't change, only how it's wrapped in
the data structure.

### 2026-07-27 — Added real (non-AI) Amharic children's stories to the Dialogues tab
The user floated reworking the Dialogues tab the same way Sentences had been split:
a heritage-speaker section and a beginner section. Their idea for the heritage side was
short children's stories in Amharic, explicitly *not* AI-generated, pulled from real
existing sources instead, since generation quality had already been a whole saga this
session. Wasn't sure yet what the non-heritage side would be.

Researched where such stories could actually come from. The African Storybook Initiative
(africanstorybook.org) turned out to have exactly this: openly-licensed (mostly CC-BY)
short illustrated stories in African languages including Amharic. Its content is also
mirrored as plain Markdown on GitHub (`global-asp/asp-source`), which made it possible to
pull real story text programmatically instead of scraping a JS-heavy site. That repo has 17
Amharic stories, 15 of them plain CC-BY, ranging from single-sentence-per-page picture books
up to full folktales.

Also looked at Bloom Library, which has a much bigger Amharic catalog (~48+ books found via
its OPDS API at api.bloomlibrary.org) and, notably, explicit reading-level tags ("first
sentences" / "first paragraphs" / "longer paragraphs") baked into the metadata, real graded
readers. But its licensing is messier: most of that catalog is CC-BY-NC or CC-BY-NC-SA (fine
for a free app, just needs attribution), some is CC-BY-NC-**ND** (riskier since reformatting
into the app's own card UI could count as a derivative, which ND forbids), 2 titles were
flagged "ask" (not freely usable at all), and a large fraction of the catalog turned out to
be Bible/Gospel stories and parables, not generally appropriate for a general-audience
language app. Extracting actual page text from Bloom also means parsing epub or PDF
downloads (not plain text like African Storybook's markdown mirror), so it was set aside for
a future expansion rather than this first batch.

Landed on: reuse the existing curated `DIALOGUES` as the non-heritage side (unchanged,
matches its existing role), add a new gold "Stories" section for the heritage side, sourced
from African Storybook via the GitHub markdown mirror. No English translation on the story
text itself, matching the same design philosophy as the live sentence generator (heritage
speakers already understand spoken Amharic; this is unaided script practice). Shipped 4
stories (`src/data/stories.js`): a very simple animal-sounds picture book
(`story_look_at_animals`, CC-BY-NC), a cute short family scene about porridge
(`story_porridge`, CC-BY), a repetitive simple "chasing the cat" story (`story_come_back_my_cat`,
CC-BY), and a fuller folktale about an orphan boy and his lost cattle (`story_young_abera`,
CC-BY) — deliberately a range from easiest to richest. Built a new `StoryCard` component
(list of pages, per-page play-audio button, bookmark, and a visible attribution/credit line
per the license requirements) and `playStoryPageAudio` in `audio.js`. Reused the existing
`reading_progress` table for bookmarking/read-status (no schema change, `item_id` is just
text) and the existing `find-missing-audio.js`/`generate-missing-audio.js` pipeline for
audio (42 files generated and confirmed present in `public/audio/stories/`).

### 2026-07-27 — Generator vocabulary variety fix, UI polish, and Phrases Final Test regating
Same day as the rebuild entry directly below: after trying the freshly-rebuilt generator,
the user reported the same problem in a new form, the same handful of nouns (bank, doro
wat, hotel) kept showing up across generations even with duplicate-of-exact-sentence
checking in place. Root cause: `theme` was being picked from the app's own curriculum
categories (`CATEGORY_ORDER` in `amharicPhrases.js`), the same categories the 40 static
`SENTENCES` draw their canonical vocabulary from, so any theme just steered Gemini back to
that category's "textbook" answer. Fixed by decoupling theme selection entirely from the
curriculum: a new ~95-item pool of specific everyday micro-scenarios (`THEMES`/`pickTheme()`
in `server/lib/gemini.js`), each too narrow for a single canonical answer to exist, plus a
new `extractOverusedWords()` in the route that names specific words back to Gemini once
they've shown up twice in a session. User confirmed this actually fixed it (8 test
generations came back with 8 completely different topics/nouns).

Then two rounds of UI polish, both reactive to specific "looks sloppy" feedback rather than
a redesign: first, added `ReadSectionHeader` (gold "Generate your own" vs. green "Practice
sentences") so the two sentence sources read as clearly distinct, including a
bookmarked-only variant of the generate header ("Saved generated sentences") so it doesn't
show an inert generate button with no button underneath it. Then fixed actual spacing bugs
once the user clarified "sloppy" meant alignment specifically: the saved-generated list's
label had been sharing the same `gap: 1rem` flex container as the cards, producing a much
bigger gap after the label than between cards; replaced scattered inline
`marginBottom`s with each section wrapped in one flex column with a single consistent
`gap`. Separately, user asked about the Dialogues tab having no equivalent polish/feature;
recommended just matching the header treatment as the lower-risk option versus also
building AI-generated dialogues, user said to hold off on deciding for now (open item).

Unrelated to the generator: the user proposed (as an open question, not a bug report) that
Common Phrases' Final Test shouldn't require browsing all 86 phrases to unlock, since a
heritage speaker likely already knows these everyday phrases from speaking Amharic and
browsing every card first is just friction. Went through two iterations: first gated on
merely *reaching* Level 7 (`highestLevel >= LEVELS.length`), but talking through Read mode's
own separate gate surfaced a bad interaction, since Read mode requires `isLevel7Mastered`
(actual 85% mastery, not just reaching), someone could unlock and pass the Final Test right
after reaching Level 7, then find Read mode still locked because they hadn't mastered it
yet, a confusing "I already passed, why is this still locked" moment. Retightened to gate on
`isLevel7Mastered(progress)` directly (the same check Read mode uses), so passing the Final
Test always implies Read mode's other requirement is already satisfied. That surfaced one
more thing: `isReadModeUnlocked` was re-checking `isLevel7Mastered` live on every render,
while `phraseTestPassed` is a permanent flag, so Read mode could in theory silently re-lock
if a later practice session dropped a Level 7 character's net score back below the mastery
threshold, even after the user had legitimately earned Read mode access before. Simplified
`isReadModeUnlocked` to just `phraseTestPassed === true`, closing that regression risk, and
dropped the locked-screen checklist from two items to one to match. Removed the now-fully-dead
browse-seen tracking (`browseSeen`/`onPhraseSeen` in `CommonPhrases.jsx`,
`loadBrowseSeen`/`markBrowseSeen`/`BROWSE_SEEN_KEY` in `phraseProgress.js`) since the new
gate doesn't need it and nothing else read it.

### 2026-07-27 — Live sentence generator rebuilt from scratch after teardown
Same day as the teardown entry directly below: immediately after removing the feature
entirely, the user asked to rebuild it with the same four requirements restated plainly
("generate any amharic sentence with ai, with audio, bookmark feature, and for it to be
fast"). Rather than inventing new architecture, rebuilt using the exact patterns already
proven to work well *mechanically* in the torn-down version, since the prior quality
complaint was about specific sentence outputs, not the pipeline: `gemini-flash-lite-latest`
with `thinkingConfig.thinkingBudget: 128`, unconstrained vocabulary (heritage-speaker
audience, separate from the 40 vocab-constrained static `SENTENCES`), Cloud TTS for audio,
a `generated_sentences` table for saves, duplicate-avoidance against both the static
40 and a session-only `recentGeneratedTexts` client ref, and the punctuation-tidying regex
safety net. Recreated: `server/lib/gemini.js`, `server/lib/tts.js`,
`server/routes/generatedSentences.js` (mounted in `server/index.js`), the table in
`db/schema.sql` (applied to local Postgres only so far, **Neon still pending**), the five
`generate*`/`saveGeneratedSentence`/etc. exports in `src/utils/firebase.js`,
`playAudioFromBase64`/`speakAmharicText` in `src/utils/audio.js`, and the Generate
button/preview/saved-list UI in `src/components/SentenceReader.jsx`. `SentenceCard` gained
optional `onPlayAudio`/`onPlayWordAudio`/`bookmarkTitle` props so the same component could
serve an ephemeral AI preview (bookmark icon repurposed as "Save", using the base64 audio
from the generate response) and the saved-generated list (bookmark icon repurposed as
"Remove", audio re-fetched on demand since bytes are never persisted) without forking it.
Deliberately avoided the earlier bookmark-filter bug (saved-generated section rendered
unconditionally this time, not nested inside the `!bookmarkedOnly` block). Verified via
direct backend smoke tests bypassing HTTP auth (a real Firebase ID token needs a browser):
4 back-to-back generations, 694-964ms end-to-end each, no duplicates, correct punctuation;
DB save/list/delete round-trip against local Postgres confirmed working. `npm run build`
and `scripts/validate-reading-vocab.js` both clean. Not yet exercised in an actual browser
click-through — that, plus the user's fresh reaction to sentence quality this time, is the
open item.

### 2026-07-27 — Live sentence generator built, iterated on extensively, then torn down
Same session as the entry directly below, continued: after the unconstrained-vocabulary
pivot (removing all the vocab-matching machinery in favor of "generate any basic Amharic
sentence"), still hit real problems. Generation speed was inconsistent (traced to Gemini's
default "thinking" behavior, fixed with `thinkingConfig` then a model swap to
`gemini-flash-lite-latest`), the rate limiter was too tight for active testing (raised
20 → 100/hour), Ctrl+Z had been used all session instead of Ctrl+C to stop the local
server, which only suspends a process rather than killing it, explaining the repeated
stale-port issues (ten zombie `node --watch` processes had piled up, cleaned out).
Repeats were still common even after adding a duplicate-of-the-40-static-sentences
check, root cause: nothing tracked what the model had already generated earlier in
the *same session*, since each request was stateless; added a client-tracked
`recentGeneratedTexts` list sent with each request to close that gap.

After all of that, the user judged output quality still wasn't good enough and asked
to remove the entire feature and restart rather than keep iterating. Fully torn down:
deleted `server/lib/gemini.js`, `server/lib/tts.js`, `server/routes/generatedSentences.js`;
reverted the route mount in `server/index.js`, the `generate*` exports in
`src/utils/firebase.js`, the `playAudioFromBase64`/`speakAmharicText` additions in
`src/utils/audio.js`, and all Generate-related state/UI in `src/components/SentenceReader.jsx`
(back to just the static list + "Continue" button, no top section); removed the
`.read-generate-*`/`.spin` CSS, the `generated_sentences` table from `db/schema.sql`
(and dropped it from local Postgres; it had never been confirmed applied to Neon, so
production needed no cleanup), and uninstalled `express-rate-limit`. Deliberately left
untouched: the 40 curated `SENTENCES` (35→40 content-quality work from earlier this
session) and `scripts/validate-reading-vocab.js`/`src/utils/readingVocab.js`/`src/data/cognates.js`
(the separate Claude-drafts-content-plus-validator workflow), neither is part of "the
generate sentences feature" and both predate or are independent of it. If AI sentence
generation comes up again, treat it as a from-scratch design, not a resume, none of
this session's specific choices (unconstrained vocabulary, lite model, thinking budget,
session-level duplicate tracking) should be assumed to still be the right call.

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

Committed and pushed everything (server routes/lib, cognates.js, readingVocab.js,
the 40-sentence readingSentences.js, the reordered/rebugfixed SentenceReader.jsx,
db/schema.sql). Deployment checklist follow-through surfaced two more gaps, both
about things Render never previously needed at runtime: `GEMINI_API_KEY` obviously
had to be added there, but so does `GOOGLE_API_KEY` (Cloud TTS), since before this
feature the deployed server never called it live, audio was always pre-baked
locally and committed as static files. Forgetting either one on Render produces the
exact same visible symptom: the live call fails, the fallback kicks in, and every
generated sentence shows an immediate checkmark (since a static fallback pick is
marked read the moment it's surfaced) even though nothing is actually broken in
the generation logic itself.

User then flagged two real quality issues once things were working end-to-end.
(1) Generation felt slow. Root cause: `gemini-flash-latest` (currently resolving
to `gemini-3.6-flash`) does extended internal "thinking" by default, over 1000
hidden reasoning tokens and ~6 seconds even for a one-word test reply, wasted
effort for a short constrained-vocabulary sentence. `thinkingConfig: {
thinkingBudget: 0 }` is rejected outright as an invalid value by this model, but
a small nonzero budget (128 tested) cut it to about 1 second with no drop in
output quality or vocab compliance, confirmed with several live test calls
before touching the real code. (2) Live-generated sentences had no ending
punctuation at all, unlike every static sentence. The prompt never asked for
any. Added explicit instructions (። for statements, ?/! for
questions/exclamations, matching the static convention, no space before the
mark, never doubled), which mostly fixed it, plus a small deterministic
`tidyPunctuationSpacing()` regex in the route as a safety net for the cases
where the model still left a stray space before the mark.

User then caught a subtler bug from an actual generated example: `አማርኛን ትንሽ
እናገራለሁ`, word order wrong, `ትንሽ` (a little) needs to directly precede `አማርኛ`
(Amharic) per how `amarenna`'s taught form `ትንሽ አማርኛ እናገራለሁ` is structured.
Root cause: the vocab-list builder flattens every taught phrase into loose
individual words with no memory of which words were only ever taught as one
fixed multi-word unit, so the model saw ትንሽ/አማርኛ/እናገራለሁ as three
independently swappable words and recombined them into an ungrammatical
order. There are 19 such multi-word phrases in `amharicPhrases.js` (compound
nouns like ቡና ቤት, city names like ባህር ዳር, fixed idioms like ችግር የለም),
all equally at risk. Added `fixedPhrasesIn()` to `generatedSentences.js`:
for a given call's vocab subset, find which taught multi-word phrases are
fully covered by it, and tell the prompt those specific ones must stay
adjacent and in order if used at all. Verified across all 8 phrase
categories with real Gemini calls: every multi-word phrase that appeared
stayed correctly ordered afterward.

That word-order fix immediately caused a new, related problem: `ትንሽ አማርኛ
እናገራለሁ` started showing up constantly, and it's exactly the phrase the user
already learned verbatim in Phrases, so regenerating it wasn't actually new
practice. Cause: several of the 19 "fixed units" (amarenna, sint_new,
wedet_new, dehna_negn, im_from, minim_ayidelem, cheger_yelem,
egzabihir_yemisgen, qes_qes_hid) are themselves already complete taught
sentences, not noun fragments needing composition, so telling the model
"these exact groups are valid, keep them intact" just handed it a ready-made
full answer to echo back, especially under the "language" theme, which has
few alternatives to amarenna. Fixed by adding an explicit rule: the output
must never be identical to just one fixed group by itself, it has to combine
one with additional words or use different vocabulary entirely. Verified
0/8 verbatim echoes afterward on the "language" theme forced repeatedly
(previously the worst offender), each result either extended the phrase
with more content or avoided it in favor of different vocabulary.

User pointed out the same duplicate-content problem exists one level up:
nothing stopped a generated sentence from exactly matching one of the 40
curated `SENTENCES` entries, also not new practice, just the same content
twice. Fixed the same way as vocab validation, both a prompt instruction and
a deterministic check, not relying on the model alone: pass all 40 existing
sentence texts to the prompt as "don't repeat any of these," and after
generation, normalize (strip punctuation/whitespace) and compare against the
existing set; an exact match gets treated as invalid and retried, same code
path as a disallowed word. Verified 0/6 duplicates afterward, including one
near-miss (`ምግብ እና ጠጅ እወዳለሁ` vs the static `... እፈልጋለሁ`) that correctly
wasn't flagged since the verb actually differs.

User then said generation still felt slow "sometimes," inconsistent with the
earlier "cut it to ~1s" claim. Measured it properly this time (instrumented
real route calls with per-attempt timing) instead of trusting a small
earlier sample: TTS was consistently fast (155-198ms) and never the issue,
but the Gemini call itself varied from 1.2s to 6s on a single first attempt
with zero retries, same `thinkingBudget: 128` setting every time. The earlier
"~1s" number was real but not representative, this model's latency is just
inherently variable even with thinking turned down. Tested
`gemini-flash-lite-latest` head-to-head against the full `gemini-flash-latest`
on the actual production prompt: 10/10 valid outputs, consistently
600-750ms, versus the full model's 1.2-6s spread. Switched `MODEL` in
`server/lib/gemini.js` to the lite variant. Full end-to-end route calls
afterward landed at 600ms-1.6s total including TTS, a real, consistent
improvement rather than a lucky sample.

Rate limit came up too: user reported "Couldn't generate a sentence right
now" after generating a bunch. Turned out to be the `/generate` rate limiter
(20/hour/uid), a reasonable guard when the model was slower and pricier, too
tight now that a call costs well under a cent and takes under a second.
Raised to 100/hour. Separately, the user pointed out Ctrl+Z (not Ctrl+C) had
been used to stop the local server throughout this whole session, Ctrl+Z
only *suspends* a process (SIGTSTP), it doesn't terminate it, which is
exactly why port 3001 kept needing a manual `lsof`/`kill -9` over and over.
Found ten stopped zombie `node --watch index.js` processes accumulated back
to `3Jul26`, cleaned them up; the two processes still running (`--watch`
parent + its child) turned out to be one legitimate session, not a leak.

Then a genuine design reconsideration: the app's own framing is "learning
to read/write the Fidel script, not the spoken language," which points at a
heritage-speaker-leaning audience who already know spoken Amharic and just
need script practice, not vocabulary scaffolding. For that audience,
constraining live generation to only-taught words is unnecessary, and
removing it would eliminate basically every bug fought this session (word
order breaking when phrases flatten into loose words, the model echoing
taught phrases back verbatim, duplicate detection needed at all). Weighed
against: the Phrases curriculum (86 phrases, cultural notes, gendered forms,
travel framing) reads like it's built for people with zero prior Amharic
too, for whom unconstrained content would introduce vocabulary they can't
parse yet. Landed on a split: the 40 curated `SENTENCES` and the Phrases
curriculum stay exactly as they are, fully vocab-scoped, for the guided
beginner path; live "Generate" becomes fully unconstrained, for reading
practice specifically. Removed `buildAllowedVocab`, `findDisallowedWords`,
`themedVocabSubset`, `fixedPhrasesIn`, and the disallowed-word retry path
from `generatedSentences.js` and `gemini.js` entirely (`src/utils/readingVocab.js`
is untouched and still used by `scripts/validate-reading-vocab.js` for the
still-constrained static content). Kept the duplicate-of-existing-SENTENCES
check and the punctuation handling, both still relevant regardless of
vocabulary constraints. Verified live afterward: noticeably richer,
more natural output (words like ትችላለህ "can you", መጠጣት "to drink" that
were never in the taught phrase list at all), still fast (760ms-1.3s),
still properly punctuated, no duplicates of the 40 static sentences.

Despite that, user reported repeats were still common once generating "a bunch"
in a row, which made sense once traced through: the duplicate check only ever
compared against the 40 permanent `SENTENCES`, never against anything the
model had already generated earlier in the same clicking session, and each
`/generate` request is otherwise completely stateless, so nothing stopped
the model from giving the exact same sentence back a few clicks later. User
also asked, reasonably, why fixes were being layered on incrementally rather
than the vocab-constraint logic just being torn out; confirmed that removal
already happened in full the previous turn (`buildAllowedVocab`,
`findDisallowedWords`, `themedVocabSubset`, `fixedPhrasesIn` are gone), what
remains (punctuation formatting, duplicate avoidance, a theme hint) isn't
leftover constraint machinery, it's the minimum any version of this feature
needs. Fixed the actual repeat bug: `SentenceReader.jsx` now keeps a
`recentGeneratedTexts` ref (last 20 sentences shown via Generate this
session, not persisted anywhere) and sends it as `recentTexts` in the
request body; the server merges it with the 40 static texts for both the
prompt's "don't repeat these" instruction and the deterministic
`normalizeForComparison()` check. Also strengthened the prompt to explicitly
push variety ("do not default to the same handful of safe sentences") and
nudge toward simpler/common vocabulary per the user's preference. Verified
with 8 rapid calls in one simulated session: 7 valid, all genuinely
distinct topics and vocabulary, zero repeats (the 8th was a test-harness
shell-escaping artifact, not an API failure).

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
