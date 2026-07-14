import { useState, useEffect, useRef } from 'react';
import {
  CATEGORIES, CATEGORY_ORDER, PHRASES,
  getUnlockedPhrases, shuffleArray,
} from '../data/amharicPhrases.js';
import { getHighestUnlockedLevel } from '../utils/progress.js';
import { playPhraseAudio } from '../utils/audio.js';
import { loadPhraseProgress, savePhraseProgress, recordPhraseResult, loadBrowseSeen, markBrowseSeen, mergePhraseProgress, getPhraseState, getPhraseWeight } from '../utils/phraseProgress.js';
import { auth, onAuthChange, loadPhraseProgressFromCloud, savePhraseProgressToCloud, ADMIN_EMAIL } from '../utils/firebase.js';

// ─── Browse Mode ──────────────────────────────────────────────────────────────
function BrowseMode({ pool, settings, newestLevel, onPhraseSeen }) {
  const [revealed, setRevealed] = useState({});
  const [openCats, setOpenCats] = useState(() =>
    Object.fromEntries(CATEGORY_ORDER.map(c => [c, true]))
  );

  const byCategory = {};
  for (const phrase of pool) {
    if (!byCategory[phrase.category]) byCategory[phrase.category] = [];
    byCategory[phrase.category].push(phrase);
  }
  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => a.requiredLevel - b.requiredLevel);
  }

  if (pool.length === 0) {
    return <div className="empty-state">No phrases unlocked yet.<br />Keep learning characters!</div>;
  }

  return (
    <div className="browse-mode">
      {CATEGORY_ORDER.filter(cat => byCategory[cat]).map(cat => (
        <div key={cat} className="browse-category">
          <button
            className="browse-cat-header"
            onClick={() => setOpenCats(o => ({ ...o, [cat]: !o[cat] }))}
          >
            <span className="browse-cat-name">{CATEGORIES[cat]}</span>
            <span className="browse-cat-count">{byCategory[cat].length}</span>
            <span className="browse-cat-arrow">{openCats[cat] ? '▾' : '▸'}</span>
          </button>

          {openCats[cat] && (
            <div className="browse-phrase-list">
              {byCategory[cat].map(phrase => {
                const isOpen = !!revealed[phrase.id];
                return (
                  <div
                    key={phrase.id}
                    className={`phrase-card ${isOpen ? 'phrase-card-open' : ''}`}
                    onClick={() => {
                      const next = !revealed[phrase.id];
                      setRevealed(r => ({ ...r, [phrase.id]: next }));
                      if (next) onPhraseSeen(phrase.id);
                    }}
                  >
                    <div className="phrase-card-top">
                      <span className="phrase-amharic">{phrase.amharic}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {phrase.requiredLevel === newestLevel && (
                          <span className="phrase-new-badge">NEW</span>
                        )}
                        <span className="phrase-reveal-hint">{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="phrase-card-detail" onClick={e => e.stopPropagation()}>
                        <div className="phrase-translit">{phrase.transliteration}</div>
                        <div className="phrase-meaning">{phrase.meaning}</div>
                        {phrase.note && <div className="phrase-note">💡 {phrase.note}</div>}
                        <button
                          className="phrase-audio-btn"
                          onClick={() => playPhraseAudio(phrase, settings)}
                        >🔊</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const PHRASE_SESSION_SIZE = 8;

// ─── Flashcard Mode ───────────────────────────────────────────────────────────
// Direction changes which phrases are eligible (reverse drops skipReverse
// phrases), so it's folded into the key alongside the level selection.
function flashKey(selectedLevels, direction) {
  return `${levelKey(selectedLevels)}:${direction}`;
}

function FlashcardMode({ pool, settings, onPhraseResult, progress, onProgressUpdate }) {
  const availableLevels = [...new Set(pool.map(p => p.requiredLevel))].sort((a, b) => a - b);

  function getActivePool(levels, dir) {
    let p = levels.size === 0 ? pool : pool.filter(p => levels.has(p.requiredLevel));
    if (dir === 'reverse') p = p.filter(p => !p.skipReverse);
    return p;
  }

  function makeQueue(levels, dir) {
    return shuffleArray([...getActivePool(levels, dir)]).slice(0, 20);
  }

  const [direction, setDirection]           = useState('forward');
  const [selectedLevels, setSelectedLevels] = useState(() => new Set());
  const [queue, setQueue]                   = useState(() => makeQueue(new Set(), 'forward'));
  const [flipped, setFlipped]               = useState(false);
  const [graded, setGraded]                 = useState(null);
  const [session, setSession]               = useState({ correct: 0, total: 0 });
  const [done, setDone]                     = useState(false);
  const [wrongIds, setWrongIds]             = useState(() => new Set());
  const [scoredIds, setScoredIds]           = useState(() => new Set()); // phrases already counted toward the score
  const [finalScore, setFinalScore]         = useState(null); // { correct, total, pct, isNew }

  const phrase    = queue[0];
  const remaining = queue.length;

  function reset(levels, dir) {
    setQueue(makeQueue(levels, dir));
    setFlipped(false);
    setGraded(null);
    setDone(false);
    setSession({ correct: 0, total: 0 });
    setWrongIds(new Set());
    setScoredIds(new Set());
    setFinalScore(null);
  }

  function toggleLevel(lvl) {
    setSelectedLevels(prev => {
      const next = new Set(prev);
      if (next.has(lvl)) next.delete(lvl); else next.add(lvl);
      reset(next, direction);
      return next;
    });
  }

  function flip() {
    if (graded) return;
    if (!flipped) playPhraseAudio(phrase, settings);
    setFlipped(f => !f);
  }

  function grade(result) {
    const wasCorrect = result === 'correct';
    // Only the first attempt at a phrase counts toward the score — retries
    // (after a miss) are extra practice, not additional score opportunities.
    const alreadyScored = scoredIds.has(phrase.id);
    const newSession = alreadyScored
      ? session
      : { correct: session.correct + (wasCorrect ? 1 : 0), total: session.total + 1 };
    setGraded(result);
    if (!alreadyScored) {
      setSession(newSession);
      setScoredIds(prev => new Set([...prev, phrase.id]));
    }
    if (!wasCorrect) setWrongIds(prev => new Set([...prev, phrase.id]));
    onPhraseResult(phrase.id, wasCorrect ? 'easy' : 'didntKnow');
    setTimeout(() => {
      setQueue(prev => {
        const [current, ...rest] = prev;
        return wasCorrect ? rest : [...rest, current];
      });
      setFlipped(false);
      setGraded(null);
      if (wasCorrect && remaining === 1) {
        // Only single-level or "All" selections are worth tracking as a high
        // score — arbitrary multi-level combos are one-off and just add noise.
        if (selectedLevels.size <= 1) {
          const key      = flashKey(selectedLevels, direction);
          const existing = progress?.phraseFlashcardHighScores?.[key];
          const pct      = newSession.total > 0 ? newSession.correct / newSession.total : 0;
          const isNew    = !existing || pct > existing.pct;
          setFinalScore(isNew
            ? { correct: newSession.correct, total: newSession.total, pct, isNew: true }
            : { ...existing, isNew: false });
          if (isNew && onProgressUpdate) {
            onProgressUpdate({
              ...progress,
              phraseFlashcardHighScores: {
                ...(progress.phraseFlashcardHighScores || {}),
                [key]: { correct: newSession.correct, total: newSession.total, pct, date: new Date().toISOString() },
              },
            });
          }
        }
        setDone(true);
      }
    }, 600);
  }

  function switchDirection(dir) {
    setDirection(dir);
    reset(selectedLevels, dir);
  }

  if (!phrase && !done) return <div className="empty-state">No phrases in this pool.</div>;

  if (done) {
    return (
      <div className="flashcard-mode">
        <div className="session-summary-box">
          <div className="ss-score">{session.correct}/{session.total}</div>
          <div className="ss-label">correct this session</div>
          <button className="btn btn-primary" onClick={() => reset(selectedLevels, direction)}>
            Again →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-mode">
      <div className="level-selector">
        <button
          className={`level-pill ${selectedLevels.size === 0 ? 'active' : ''}`}
          onClick={() => { setSelectedLevels(new Set()); reset(new Set(), direction); }}
        >All</button>
        {availableLevels.map(lvl => (
          <button
            key={lvl}
            className={`level-pill ${selectedLevels.has(lvl) ? 'active' : ''}`}
            onClick={() => toggleLevel(lvl)}
          >Lv {lvl}</button>
        ))}
      </div>

      <div className="pq-direction-tabs">
        <button
          className={`pq-dir-btn ${direction === 'forward' ? 'active' : ''}`}
          onClick={() => switchDirection('forward')}
        >🇪🇹 → 🇬🇧</button>
        <button
          className={`pq-dir-btn ${direction === 'reverse' ? 'active' : ''}`}
          onClick={() => switchDirection('reverse')}
        >🇬🇧 → 🇪🇹</button>
      </div>

      <div className="score-bar">
        {session.total > 0 && <>
          <span className="score-correct">{session.correct} ✓</span>
          <span className="score-total">/ {session.total}</span>
          <span className="score-pct">{Math.round((session.correct / session.total) * 100)}%</span>
        </>}
        <span className="session-progress-pill">{remaining} left</span>
      </div>

      <div
        className={`phrase-flashcard ${flipped ? 'phrase-flashcard-revealed' : ''} ${graded ? `phrase-flashcard-${graded}` : ''}`}
        onClick={flip}
      >
        {!flipped ? (
          <>
            {wrongIds.has(phrase.id) && <span className="retry-badge">↩ retry</span>}
            {direction === 'forward'
              ? <div className="pfc-amharic">{phrase.amharic}</div>
              : <div className="pfc-meaning pfc-front-meaning">{phrase.meaning}</div>
            }
            <p className="pfc-flip-hint">tap to flip</p>
          </>
        ) : (
          <div className="pfc-reveal-content">
            {direction === 'forward' ? (
              <>
                <div className="pfc-translit">{phrase.transliteration}</div>
                <div className="pfc-meaning">{phrase.meaning}</div>
              </>
            ) : (
              <>
                <div className="pfc-amharic">{phrase.amharic}</div>
                <div className="pfc-translit">{phrase.transliteration}</div>
              </>
            )}
            {phrase.note && <div className="phrase-note pfc-note">💡 {phrase.note}</div>}
            <button
              className="phrase-audio-btn"
              onClick={e => { e.stopPropagation(); playPhraseAudio(phrase, settings); }}
            >🔊</button>
          </div>
        )}
      </div>

      {flipped && !graded && (
        <div className="pfc-grade-btns">
          <button className="pfc-btn-wrong"   onClick={() => grade('wrong')}>✗ Wrong</button>
          <button className="pfc-btn-correct" onClick={() => grade('correct')}>✓ Got it</button>
        </div>
      )}

    </div>
  );
}

// ─── Ge'ez Keyboard Guide ─────────────────────────────────────────────────────
const VOWEL_ORDERS = [
  { keys: 'a',      order: '1st', name: 'ግዕዝ',  example: 'b+a',   result: 'በ' },
  { keys: 'u',      order: '2nd', name: 'ካዕብ',  example: 'b+u',   result: 'ቡ' },
  { keys: 'i',      order: '3rd', name: 'ሣልስ',  example: 'b+i',   result: 'ቢ' },
  { keys: 'aa',     order: '4th', name: 'ራብዕ',  example: 'b+aa',  result: 'ባ' },
  { keys: 'ie',     order: '5th', name: 'ኃምስ',  example: 'b+ie',  result: 'ቤ' },
  { keys: '—',      order: '6th', name: 'ሳድስ',  example: 'b',     result: 'ብ' },
  { keys: 'o',      order: '7th', name: 'ሳብዕ',  example: 'b+o',   result: 'ቦ' },
];

const BASE_CONSONANTS = [
  ['h','ህ'],['l','ል'],['m','ም'],['r','ር'],['s','ስ'],['x','ሽ'],
  ['q','ቅ'],['b','ብ'],['v','ቭ'],['t','ት'],['c','ች'],['n','ን'],
  ['k','ክ'],['w','ው'],['z','ዝ'],['y','ይ'],['d','ድ'],['j','ጅ'],
  ['g','ግ'],['f','ፍ'],['p','ፕ'],
];

const SHIFT_CONSONANTS = [
  ['H','ሕ'],['S','ጽ'],['T','ጥ'],['C','ጭ'],['N','ኝ'],['Z','ዥ'],['P','ጵ'],
];

const DOUBLED_CONSONANTS = [
  ['ss','ሥ'],['SS','ፅ'],['hh','ኅ'],
];

// Independent vowel row (አ ኡ ኢ ኣ ኤ እ ኦ) — this row's consonant is silent/glottal,
// so unlike other rows it gets its own direct key per vowel order rather than the
// usual "consonant + vowel suffix" pattern. Order 4 (ኣ) has no known key yet.
const VOWEL_ROW = [
  { keys: 'a',  order: '1st', result: 'አ' },
  { keys: 'u',  order: '2nd', result: 'ኡ' },
  { keys: 'i',  order: '3rd', result: 'ኢ' },
  { keys: '?',  order: '4th', result: 'ኣ' },
  { keys: 'ie', order: '5th', result: 'ኤ' },
  { keys: 'e',  order: '6th', result: 'እ' },
  { keys: 'o',  order: '7th', result: 'ኦ' },
];

// Second glottal/pharyngeal vowel row (ዐ ዑ ዒ ዓ ዔ ዕ ዖ) — reached by doubling the
// vowel key instead of the single key used for the VOWEL_ROW above.
// Orders 1 (ዐ) and 5 (ዔ) have no known key yet.
const GHA_ROW = [
  { keys: '?',  order: '1st', result: 'ዐ' },
  { keys: 'uu', order: '2nd', result: 'ዑ' },
  { keys: 'ii', order: '3rd', result: 'ዒ' },
  { keys: 'aa', order: '4th', result: 'ዓ' },
  { keys: '?',  order: '5th', result: 'ዔ' },
  { keys: 'ee', order: '6th', result: 'ዕ' },
  { keys: 'oo', order: '7th', result: 'ዖ' },
];

// Labiovelar rows (consonant+w combined) — only orders 3rd-7th exist. Pattern so
// far: [row's own base/doubled key] + "ua" = 4th order. Other orders unconfirmed.
const LABIOVELAR_FORMS = [
  { keys: 'kua',  row: 'k',  result: 'ኳ' },
  { keys: 'qua',  row: 'q',  result: 'ቋ' },
  { keys: 'gua',  row: 'g',  result: 'ጓ' },
  { keys: 'hhua', row: 'hh', result: 'ኋ' },
];

function GeezKeyboardGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="geez-guide">
      <button className="geez-guide-toggle" onClick={() => setOpen(o => !o)}>
        ⌨ Ge'ez keyboard guide {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="geez-guide-body">
          <p className="geez-guide-note">Apple Amharic Ge'ez keyboard. Type consonant first, then add vowel keys to change the form.</p>

          <table className="geez-vowel-table">
            <thead>
              <tr><th>Keys after consonant</th><th>Order</th><th>Name</th><th>Example</th><th>Result</th></tr>
            </thead>
            <tbody>
              {VOWEL_ORDERS.map(row => (
                <tr key={row.order}>
                  <td><code>{row.keys}</code></td>
                  <td className="geez-td-dim">{row.order}</td>
                  <td className="geez-td-dim">{row.name}</td>
                  <td><code>{row.example}</code></td>
                  <td className="geez-td-char">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="geez-consonant-section">
            <div className="geez-consonant-label">Base consonants (6th form by default)</div>
            <div className="geez-consonant-grid">
              {BASE_CONSONANTS.map(([k, c]) => (
                <span key={k} className="geez-key-pair"><code>{k}</code> {c}</span>
              ))}
            </div>
          </div>

          <div className="geez-consonant-section">
            <div className="geez-consonant-label">Shift variants</div>
            <div className="geez-consonant-grid">
              {SHIFT_CONSONANTS.map(([k, c]) => (
                <span key={k} className="geez-key-pair"><code>{k}</code> {c}</span>
              ))}
            </div>
          </div>

          <div className="geez-consonant-section">
            <div className="geez-consonant-label">Doubled-letter forms</div>
            <div className="geez-consonant-grid">
              {DOUBLED_CONSONANTS.map(([k, c]) => (
                <span key={k} className="geez-key-pair"><code>{k}</code> {c}</span>
              ))}
            </div>
          </div>

          <p className="geez-guide-note">Independent vowels — this row's consonant is silent, so each order has its own direct key.</p>
          <table className="geez-vowel-table">
            <thead>
              <tr><th>Keys</th><th>Order</th><th>Result</th></tr>
            </thead>
            <tbody>
              {VOWEL_ROW.map(row => (
                <tr key={row.order}>
                  <td><code>{row.keys}</code></td>
                  <td className="geez-td-dim">{row.order}</td>
                  <td className="geez-td-char">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="geez-guide-note">Second independent-vowel row — reached with doubled vowel keys instead.</p>
          <table className="geez-vowel-table">
            <thead>
              <tr><th>Keys</th><th>Order</th><th>Result</th></tr>
            </thead>
            <tbody>
              {GHA_ROW.map(row => (
                <tr key={row.order}>
                  <td><code>{row.keys}</code></td>
                  <td className="geez-td-dim">{row.order}</td>
                  <td className="geez-td-char">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="geez-guide-note">Labiovelar forms (consonant+w) — 4th order confirmed, others unknown.</p>
          <div className="geez-consonant-section">
            <div className="geez-consonant-grid">
              {LABIOVELAR_FORMS.map(row => (
                <span key={row.keys} className="geez-key-pair"><code>{row.keys}</code> {row.result}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Typing Mode ──────────────────────────────────────────────────────────────
// Canonical key for a level selection so high scores across different level
// combinations (which have different phrase pools, and thus difficulty) stay separate.
function levelKey(selectedLevels) {
  return selectedLevels.size === 0 ? 'all' : [...selectedLevels].sort((a, b) => a - b).join(',');
}

// Every fully-correct answer for a phrase. `amharic` is sometimes an
// abbreviated "male / femaleSuffix" display string (e.g. 'እንኳን ደስ አለህ / አለሽ'),
// so the male form and any gendered/formal/group variants must come from
// their dedicated fields rather than a naive split of the display string.
function phraseVariants(phrase) {
  const male = phrase.femaleAmharic ? phrase.amharic.split(' / ')[0] : phrase.amharic;
  return [male, phrase.femaleAmharic, phrase.formalAmharic, phrase.groupAmharic].filter(Boolean);
}

function TypingMode({ pool, settings, onPhraseResult, progress, onProgressUpdate }) {
  const availableLevels = [...new Set(pool.map(p => p.requiredLevel))].sort((a, b) => a - b);

  function makeQueue(levels) {
    const p = levels.size === 0 ? pool : pool.filter(p => levels.has(p.requiredLevel));
    return shuffleArray([...p]).slice(0, 20);
  }

  const [selectedLevels, setSelectedLevels] = useState(() => new Set());
  const [queue, setQueue]     = useState(() => makeQueue(new Set()));
  const [input, setInput]     = useState('');
  const [result, setResult]   = useState(null);
  const [session, setSession] = useState({ correct: 0, total: 0 });
  const [done, setDone]       = useState(false);
  const [wrongIds, setWrongIds] = useState(() => new Set());
  const [scoredIds, setScoredIds] = useState(() => new Set()); // phrases already counted toward the score
  const [finalScore, setFinalScore] = useState(null); // { correct, total, pct, isNew }
  const inputRef              = useRef(null);

  const phrase    = queue[0];
  const remaining = queue.length;

  function reset(levels) {
    setQueue(makeQueue(levels));
    setInput('');
    setResult(null);
    setDone(false);
    setSession({ correct: 0, total: 0 });
    setWrongIds(new Set());
    setScoredIds(new Set());
    setFinalScore(null);
  }

  function toggleLevel(lvl) {
    setSelectedLevels(prev => {
      const next = new Set(prev);
      if (next.has(lvl)) next.delete(lvl); else next.add(lvl);
      reset(next);
      return next;
    });
  }

  // Strip everything except Ethiopic script and spaces before comparing
  function normalize(str) {
    return str.replace(/[^ሀ-᎟ⶀ-⷟ ]/g, '').replace(/\s+/g, ' ').trim();
  }

  function checkAnswer() {
    const current = inputRef.current?.value ?? '';
    if (!phrase || result) return;
    const variants = phraseVariants(phrase).map(v => normalize(v));
    const isCorrect = variants.some(v => v === normalize(current));
    setResult(isCorrect ? 'correct' : 'wrong');
    // Only the first attempt at a phrase counts toward the score — retries
    // (after a miss) are extra practice, not additional score opportunities.
    if (!scoredIds.has(phrase.id)) {
      setSession(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
      setScoredIds(prev => new Set([...prev, phrase.id]));
    }
    if (!isCorrect) setWrongIds(prev => new Set([...prev, phrase.id]));
    onPhraseResult(phrase.id, isCorrect ? 'easy' : 'didntKnow');
  }

  function next() {
    const wasCorrect = result === 'correct';
    if (wasCorrect && remaining === 1) {
      // Only single-level or "All" selections are worth tracking as a high
      // score — arbitrary multi-level combos are one-off and just add noise.
      if (selectedLevels.size <= 1) {
        const key      = levelKey(selectedLevels);
        const existing = progress?.phraseTypingHighScores?.[key];
        const pct      = session.total > 0 ? session.correct / session.total : 0;
        const isNew    = !existing || pct > existing.pct;
        setFinalScore(isNew
          ? { correct: session.correct, total: session.total, pct, isNew: true }
          : { ...existing, isNew: false });
        if (isNew && onProgressUpdate) {
          onProgressUpdate({
            ...progress,
            phraseTypingHighScores: {
              ...(progress.phraseTypingHighScores || {}),
              [key]: { correct: session.correct, total: session.total, pct, date: new Date().toISOString() },
            },
          });
        }
      }
      setDone(true);
      return;
    }
    setQueue(prev => {
      const [current, ...rest] = prev;
      return wasCorrect ? rest : [...rest, current];
    });
    setInput('');
    setResult(null);
  }

  const stateRef = useRef({});
  stateRef.current = { result, input, next, checkAnswer, done, restart: () => reset(selectedLevels) };
  const justCheckedRef = useRef(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter') return;
      const { result, next, checkAnswer, done, restart } = stateRef.current;
      if (done) {
        restart();
      } else if (result) {
        if (!justCheckedRef.current) next();
      } else {
        checkAnswer();
        justCheckedRef.current = true;
        setTimeout(() => { justCheckedRef.current = false; }, 400);
      }
    };
    window.addEventListener('keyup', onKey);
    return () => window.removeEventListener('keyup', onKey);
  }, []);

  useEffect(() => { inputRef.current?.focus(); }, [phrase]);
  useEffect(() => { if (result) playPhraseAudio(phrase, settings); }, [result]); // eslint-disable-line

  if (!phrase && !done) {
    return <div className="empty-state">No typeable phrases in this pool.<br />Try unlocking more levels!</div>;
  }

  if (done) {
    return (
      <div className="flashcard-mode">
        <div className="session-summary-box">
          <div className="ss-score">{session.correct}/{session.total}</div>
          <div className="ss-label">correct this session</div>
          {finalScore?.isNew ? (
            <div className="phrase-test-high-score phrase-test-high-score-new">🏆 New high score!</div>
          ) : finalScore ? (
            <div className="phrase-test-high-score">🏆 Best: {finalScore.correct} / {finalScore.total} ({Math.round(finalScore.pct * 100)}%)</div>
          ) : null}
          <button className="btn btn-primary" onClick={() => reset(selectedLevels)}>Again →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-mode">
      <div className="level-selector">
        <button
          className={`level-pill ${selectedLevels.size === 0 ? 'active' : ''}`}
          onClick={() => { setSelectedLevels(new Set()); reset(new Set()); }}
        >All</button>
        {availableLevels.map(lvl => (
          <button
            key={lvl}
            className={`level-pill ${selectedLevels.has(lvl) ? 'active' : ''}`}
            onClick={() => toggleLevel(lvl)}
          >Lv {lvl}</button>
        ))}
      </div>

      <div className="score-bar">
        {session.total > 0 && <>
          <span className="score-correct">{session.correct} ✓</span>
          <span className="score-total">/ {session.total}</span>
          <span className="score-pct">{Math.round((session.correct / session.total) * 100)}%</span>
        </>}
        <span className="session-progress-pill">{remaining} left</span>
      </div>

      <div className="phrase-flashcard phrase-typing-card">
        {wrongIds.has(phrase.id) && <span className="retry-badge">↩ retry</span>}
        <div className="pfc-meaning pfc-front-meaning">{phrase.meaning}</div>
      </div>

      <input
        ref={inputRef}
        className={`typing-input${result ? ` typing-input-${result}` : ''}`}
        value={input}
        onChange={e => { if (!result) setInput(e.target.value); }}
        placeholder="type Amharic here…"
        disabled={!!result}
        dir="auto"
        lang="am"
      />

      {result && (
        <div className="typing-feedback">
          {result === 'correct'
            ? <span className="typing-result-correct">✓ Correct!</span>
            : <span className="typing-result-wrong">
                ✗ <span className="typing-answer">{phraseVariants(phrase).join(' / ')}</span>
              </span>
          }
          <div className="typing-translit">{phrase.transliteration}</div>
          <button
            className="phrase-audio-btn"
            onClick={() => playPhraseAudio(phrase, settings)}
          >🔊</button>
        </div>
      )}

      {!result
        ? <button className="btn btn-primary btn-next" onClick={checkAnswer} disabled={!input.trim()}>Check →</button>
        : <button className="btn btn-primary btn-next" onClick={next}>Next →</button>
      }

      <GeezKeyboardGuide />
    </div>
  );
}

// ─── Phrase Test Mode ─────────────────────────────────────────────────────────
const PASS_THRESHOLD = 0.85;
const TEST_SIZE = 30;        // cap so the exam isn't every phrase every time
const MATCH_ROUND_SIZE = 6;  // phrases per matching round

// Weighted random sample without replacement (Efraimidis-Spirakis): phrases
// with less practice (higher getPhraseWeight) are more likely to be picked.
function weightedSample(pool, n, phraseProgress) {
  const keyed = pool.map(p => ({
    p,
    key: Math.pow(Math.random(), 1 / Math.max(1, getPhraseWeight(phraseProgress || {}, p.id))),
  }));
  keyed.sort((a, b) => b.key - a.key);
  return keyed.slice(0, n).map(k => k.p);
}

// reverse=false: show Amharic, pick the English meaning (reading recall).
// reverse=true:  show the English meaning, pick the correct Amharic script
//                out of 4 options (reading recognition) — both formats stay
//                focused on the script, unlike an audio-based question would.
function buildMCQuestion(phrase, pool, reverse) {
  const field = reverse ? 'amharic' : 'meaning';
  const wrong = pool
    .filter(p => p.id !== phrase.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(p => p[field]);
  const options = [...wrong, phrase[field]].sort(() => Math.random() - 0.5);
  return { type: 'mc', phrase, options, correct: phrase[field], reverse };
}

// Builds a mixed-format exam: some phrases as matching-grid rounds (pair
// Amharic with meaning, several resolved per screen), the rest split between
// forward and reverse multiple choice — instead of one repetitive 80-question
// multiple-choice grind, while staying focused on reading the script (the
// app's core purpose) rather than testing an unrelated skill like listening.
function buildTestPlan(pool, phraseProgress) {
  const size = Math.min(TEST_SIZE, pool.length);
  const sampled = weightedSample(pool, size, phraseProgress);

  const matchCount = sampled.length >= MATCH_ROUND_SIZE * 2
    ? Math.floor(sampled.length / 3 / MATCH_ROUND_SIZE) * MATCH_ROUND_SIZE
    : 0;
  const matchPhrases   = sampled.slice(0, matchCount);
  const rest           = sampled.slice(matchCount);
  const reverseCount   = Math.floor(rest.length / 2);
  const reversePhrases = rest.slice(0, reverseCount);
  const forwardPhrases = rest.slice(reverseCount);

  const steps = [];
  for (let i = 0; i < matchPhrases.length; i += MATCH_ROUND_SIZE) {
    steps.push({ type: 'match', phrases: matchPhrases.slice(i, i + MATCH_ROUND_SIZE) });
  }
  for (const phrase of reversePhrases) steps.push(buildMCQuestion(phrase, pool, true));
  for (const phrase of forwardPhrases) steps.push(buildMCQuestion(phrase, pool, false));

  return steps.sort(() => Math.random() - 0.5); // interleave so match rounds aren't all bunched together
}

function stepQuestionCount(step) {
  return step.type === 'match' ? step.phrases.length : 1;
}

// One phrase.id can appear as a tile on both sides (Amharic column + meaning
// column); matching its own two tiles together is a correct answer.
function MatchingRound({ phrases, settings, onComplete }) {
  const [amharicOrder] = useState(() => shuffleArray(phrases));
  const [meaningOrder]  = useState(() => shuffleArray(phrases));
  const [selected, setSelected] = useState(null); // { side: 'a'|'m', id }
  const [resolved, setResolved] = useState({});   // id -> 'correct' | 'wrong'

  function handleTap(side, phrase) {
    if (resolved[phrase.id]) return;
    if (!selected || selected.side === side) {
      setSelected({ side, id: phrase.id });
      return;
    }
    const otherId  = selected.id;
    const isMatch  = otherId === phrase.id;
    const aId = side === 'a' ? phrase.id : otherId;
    const mId = side === 'm' ? phrase.id : otherId;
    setResolved(r => ({ ...r, [aId]: isMatch ? 'correct' : 'wrong', [mId]: isMatch ? 'correct' : 'wrong' }));
    setSelected(null);
    if (isMatch) playPhraseAudio(phrase, settings);
  }

  useEffect(() => {
    if (Object.keys(resolved).length === phrases.length) {
      const results = phrases.map(p => ({ correct: resolved[p.id] === 'correct' }));
      const t = setTimeout(() => onComplete(results), 700);
      return () => clearTimeout(t);
    }
  }, [resolved]); // eslint-disable-line

  return (
    <div className="match-round">
      <div className="phrase-test-hint">Tap a phrase, then tap its matching meaning</div>
      <div className="match-columns">
        <div className="match-col">
          {amharicOrder.map(p => (
            <button
              key={p.id}
              disabled={!!resolved[p.id]}
              className={`match-tile ${selected?.side === 'a' && selected.id === p.id ? 'match-selected' : ''} ${resolved[p.id] ? 'match-' + resolved[p.id] : ''}`}
              onClick={() => handleTap('a', p)}
            >
              {p.amharic}
            </button>
          ))}
        </div>
        <div className="match-col">
          {meaningOrder.map(p => (
            <button
              key={p.id}
              disabled={!!resolved[p.id]}
              className={`match-tile ${selected?.side === 'm' && selected.id === p.id ? 'match-selected' : ''} ${resolved[p.id] ? 'match-' + resolved[p.id] : ''}`}
              onClick={() => handleTap('m', p)}
            >
              {p.meaning}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhraseTestMode({ pool, progress, phraseProgress, onProgressUpdate, alreadyPassed, settings, highestLevel }) {
  const [steps]     = useState(() => buildTestPlan(pool, phraseProgress));
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected]   = useState(null);
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);
  const [newHighScore, setNewHighScore] = useState(false);
  const [tiedBest, setTiedBest] = useState(false);

  const step  = steps[stepIndex];
  const total = steps.reduce((s, st) => s + stepQuestionCount(st), 0);
  const questionsSoFar = steps.slice(0, stepIndex).reduce((s, st) => s + stepQuestionCount(st), 0);

  const highScores = progress.phraseTestHighScores || {};
  const bestForLevel = highScores[highestLevel];

  function finishOrAdvance(newScore) {
    if (stepIndex + 1 >= steps.length) {
      setDone(true);
      const updates = {};
      if (newScore / total >= PASS_THRESHOLD) updates.phraseTestPassed = true;

      const newPct = newScore / total;
      if (!bestForLevel || newPct > bestForLevel.pct) {
        setNewHighScore(!!bestForLevel);
        updates.phraseTestHighScores = {
          ...highScores,
          [highestLevel]: { score: newScore, total, pct: newPct, date: new Date().toISOString() },
        };
      } else if (newPct === bestForLevel.pct) {
        setTiedBest(true);
      }
      if (Object.keys(updates).length > 0) onProgressUpdate({ ...progress, ...updates });
    } else {
      setStepIndex(i => i + 1);
      setSelected(null);
    }
  }

  function pick(option) {
    if (selected !== null) return;
    const correct = option === step.correct;
    setSelected(option);
    playPhraseAudio(step.phrase, settings);
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);
    setTimeout(() => finishOrAdvance(newScore), 900);
  }

  function handleMatchComplete(results) {
    const newScore = score + results.filter(r => r.correct).length;
    setScore(newScore);
    finishOrAdvance(newScore);
  }

  if (done) {
    const finalPassed = score / total >= PASS_THRESHOLD;
    return (
      <div className="phrase-test-done">
        <div className={`phrase-test-result ${finalPassed ? 'test-pass' : 'test-fail'}`}>
          {finalPassed ? '🎉' : '📖'}
        </div>
        <div className="phrase-test-score">{score} / {total}</div>
        <div className="phrase-test-score-pct">{Math.round((score / total) * 100)}%</div>
        {newHighScore ? (
          <div className="phrase-test-high-score phrase-test-high-score-new">🏆 New high score!</div>
        ) : tiedBest ? (
          <div className="phrase-test-high-score phrase-test-high-score-new">🏆 Matched your best!</div>
        ) : bestForLevel ? (
          <div className="phrase-test-high-score">🏆 Best: {bestForLevel.score} / {bestForLevel.total} ({Math.round(bestForLevel.pct * 100)}%)</div>
        ) : null}
        {finalPassed ? (
          <>
            <div className="phrase-test-msg phrase-test-msg-pass">
              Read mode unlocked! Head to the 📜 Read tab.
            </div>
          </>
        ) : (
          <>
            <div className="phrase-test-msg phrase-test-msg-fail">
              You need {Math.round(PASS_THRESHOLD * 100)}% to unlock Read mode. Keep practising and try again!
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="phrase-test-mode">
      {alreadyPassed && (
        <div className="phrase-test-passed-banner">✓ Read mode already unlocked — retaking for fun</div>
      )}
      <div className="phrase-test-progress">
        Question {questionsSoFar + 1}{step.type === 'match' ? `–${questionsSoFar + step.phrases.length}` : ''} of {total}
        <span className="phrase-test-score-inline"> · {score} correct</span>
      </div>
      <div className="phrase-test-progress-bar">
        <div className="phrase-test-progress-fill" style={{ width: `${(questionsSoFar / total) * 100}%` }} />
      </div>

      {step.type === 'match' ? (
        <MatchingRound phrases={step.phrases} settings={settings} onComplete={handleMatchComplete} />
      ) : (
        <>
          <div className="phrase-test-card">
            {step.reverse ? (
              <>
                <div className="phrase-test-meaning-prompt">{step.phrase.meaning}</div>
                <div className="phrase-test-hint">Which one means this?</div>
              </>
            ) : (
              <>
                <div className="phrase-test-amharic">{step.phrase.amharic}</div>
                <div className="phrase-test-hint">What does this mean?</div>
              </>
            )}
          </div>

          <div className="phrase-test-options">
            {step.options.map(opt => {
              let cls = 'phrase-test-option' + (step.reverse ? ' phrase-test-option-amharic' : '');
              if (selected !== null) {
                if (opt === step.correct)  cls += ' opt-correct';
                else if (opt === selected) cls += ' opt-wrong';
                else                       cls += ' opt-dim';
              }
              return (
                <button key={opt} className={cls} onClick={() => pick(opt)}>
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Admin Breakdown ──────────────────────────────────────────────────────────
function PhraseBreakdown() {
  const [open, setOpen] = useState(false);

  const byLevel = {};
  for (const p of PHRASES) {
    if (!byLevel[p.requiredLevel]) byLevel[p.requiredLevel] = [];
    byLevel[p.requiredLevel].push(p);
  }
  const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          fontSize: '0.72rem', padding: '0.2rem 0.6rem', marginBottom: '0.5rem',
          background: 'transparent', border: '1px solid #555',
          borderRadius: '4px', color: '#aaa', cursor: 'pointer',
        }}
      >
        📊 Breakdown
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
              width: '100%', maxWidth: '700px', maxHeight: '80vh',
              overflow: 'auto', fontSize: '0.78rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', borderBottom: '1px solid #2a2a2a' }}>
              <span style={{ color: '#ccc', fontWeight: 600 }}>Phrase Breakdown — {PHRASES.length} total</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#222', color: '#aaa' }}>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Level</th>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>Count</th>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Phrases</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((lvl, i) => (
                  <tr key={lvl} style={{ background: i % 2 === 0 ? '#141414' : '#1a1a1a', verticalAlign: 'top' }}>
                    <td style={{ padding: '0.4rem 0.6rem', color: '#888', whiteSpace: 'nowrap' }}>Lv {lvl}</td>
                    <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontWeight: 600, color: '#ccc' }}>
                      {byLevel[lvl].length}
                    </td>
                    <td style={{ padding: '0.4rem 0.6rem', color: '#999', lineHeight: 1.8 }}>
                      {byLevel[lvl].map(p => (
                        <span key={p.id} style={{ marginRight: '0.8rem', display: 'inline-block' }}>
                          <span style={{ color: '#ddd' }}>{p.amharic}</span>
                          <span style={{ color: '#555' }}> · </span>
                          <span style={{ color: '#888' }}>{p.meaning}</span>
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ─── High scores panel (Final Test + Typing) ───────────────────────────────────
function levelKeyLabel(key) {
  return key === 'all' ? 'All levels' : `Lv ${key.split(',').join(', ')}`;
}

// Flashcard high scores are tracked (see phraseFlashcardHighScores) but not
// shown here — Flashcard is self-graded, so a "score" there is trivially
// gameable and isn't a meaningful signal the way Typing/Final Test are.
function HighScorePanel({ progress }) {
  const [open, setOpen] = useState(false);
  const testScores   = progress.phraseTestHighScores   || {};
  const typingScores = progress.phraseTypingHighScores || {};
  const testLevels  = Object.keys(testScores).map(Number).sort((a, b) => a - b);
  const typingKeys  = Object.keys(typingScores).sort();

  if (testLevels.length === 0 && typingKeys.length === 0) return null;

  return (
    <div className="grammar-note">
      <button className="grammar-note-toggle" onClick={() => setOpen(o => !o)}>
        🏆 High Scores {open ? '▲' : '▼'}
      </button>
      {open && (
        <ul className="grammar-note-body">
          {testLevels.map(lvl => {
            const s = testScores[lvl];
            return (
              <li key={`test-${lvl}`}>
                🎯 Final Test · Level {lvl}: {s.score} / {s.total} ({Math.round(s.pct * 100)}%)
              </li>
            );
          })}
          {typingKeys.map(key => {
            const s = typingScores[key];
            return (
              <li key={`type-${key}`}>
                ⌨️ Typing · {levelKeyLabel(key)}: {s.correct} / {s.total} ({Math.round(s.pct * 100)}%)
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const BASE_MODES = [
  { id: 'browse',    label: '📖 Browse'    },
  { id: 'flashcard', label: '🃏 Flashcard' },
  { id: 'type',      label: '⌨️ Type'      },
];

export default function CommonPhrases({ progress, initialMode = 'browse', onProgressUpdate }) {
  const [mode, setMode] = useState(initialMode);
  const phraseProgressRef = useRef(loadPhraseProgress());
  const [browseSeen, setBrowseSeen] = useState(() => loadBrowseSeen());

  useEffect(() => {
    // Listen for the actual sign-in event, not just the state at mount time —
    // a guest can sign in while already sitting on this page.
    return onAuthChange(firebaseUser => {
      if (!firebaseUser) return;
      loadPhraseProgressFromCloud().then(data => {
        const merged = mergePhraseProgress(loadPhraseProgress(), data);
        phraseProgressRef.current = merged;
        savePhraseProgress(merged);
        savePhraseProgressToCloud(null, merged).catch(() => {});
      }).catch(() => {});
    });
  }, []);

  function onPhraseSeen(phraseId) {
    setBrowseSeen(prev => markBrowseSeen(phraseId, prev));
  }

  function onPhraseResult(phraseId, result) {
    const updated = recordPhraseResult(phraseProgressRef.current, phraseId, result);
    phraseProgressRef.current = updated;
    savePhraseProgress(updated);
    if (auth.currentUser) {
      savePhraseProgressToCloud(null, updated).catch(() => {});
    }
  }

  const highestLevel = getHighestUnlockedLevel(progress);
  const pool         = getUnlockedPhrases(highestLevel);

  // A phrase counts as "seen" if it's been revealed in Browse mode, or if it
  // has any recorded attempt from Flashcard/Typing mode — exposure to the
  // content shouldn't depend on which mode the user happened to practice in.
  const isPhraseSeen = (id) => browseSeen.has(id) || getPhraseState(phraseProgressRef.current, id).seen > 0;
  const allSeen    = pool.length > 0 && pool.every(p => isPhraseSeen(p.id));
  const seenCount  = pool.filter(p => isPhraseSeen(p.id)).length;
  const testUnlocked = allSeen;
  const alreadyPassed = !!progress.phraseTestPassed;

  const MODES = testUnlocked
    ? [...BASE_MODES, { id: 'test', label: alreadyPassed ? '✓ Test' : '🎯 Final Test' }]
    : BASE_MODES;

  if (highestLevel < 2) {
    return (
      <div className="page">
        <h2 className="page-title">🗣️ Common Phrases</h2>
        <div className="empty-state">
          Complete Level 1 to unlock your first phrases!
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="phrases-header">
        <h2 className="page-title">🗣️ Common Phrases</h2>
      </div>

      {auth.currentUser?.email === ADMIN_EMAIL && <PhraseBreakdown />}
      <HighScorePanel progress={progress} />

      <div className="writing-mode-tabs" style={{marginBottom:'0.6rem'}}>
        {MODES.map(m => (
          <button
            key={m.id}
            className={`writing-mode-tab ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
          >{m.label}</button>
        ))}
      </div>

      {pool.length > 0 && mode !== 'test' && (
        <p className="phrases-pool-info">
          {pool.length} phrase{pool.length !== 1 ? 's' : ''} available
          {PHRASES.some(p => p.requiredLevel > highestLevel) && ` · unlock Level ${highestLevel + 1} for more`}
          {!testUnlocked && pool.length > 0 && (
            <span className="phrases-seen-hint"> · see all phrases to unlock the Final Test ({seenCount}/{pool.length} seen)</span>
          )}
        </p>
      )}

      {mode === 'browse' && (
        <BrowseMode key="browse" pool={pool} settings={progress.settings} newestLevel={highestLevel} onPhraseSeen={onPhraseSeen} />
      )}
      {mode === 'flashcard' && (
        <FlashcardMode key="flashcard" pool={pool} settings={progress.settings} onPhraseResult={onPhraseResult} progress={progress} onProgressUpdate={onProgressUpdate} />
      )}
      {mode === 'type' && (
        <TypingMode key="type" pool={pool} settings={progress.settings} onPhraseResult={onPhraseResult} progress={progress} onProgressUpdate={onProgressUpdate} />
      )}
      {mode === 'test' && testUnlocked && (
        <PhraseTestMode
          key="test"
          pool={pool}
          progress={progress}
          phraseProgress={phraseProgressRef.current}
          onProgressUpdate={onProgressUpdate || (() => {})}
          alreadyPassed={alreadyPassed}
          settings={progress.settings}
          highestLevel={highestLevel}
        />
      )}
    </div>
  );
}
