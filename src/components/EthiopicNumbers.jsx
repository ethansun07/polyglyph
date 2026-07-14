import { useState, useEffect, useRef } from 'react';
import {
  ALL_BASE_SYMBOLS, ETHIOPIC_DIGITS, ETHIOPIC_TENS, ETHIOPIC_HUNDREDS, ETHIOPIC_THOUSANDS,
  ETHIOPIC_TEN_THOUSANDS, ETHIOPIC_LARGE_ROUND,
  generateComboQuestion,
} from '../data/ethiopicNumbers.js';
import { PUNCTUATION } from '../data/fidel.js';
import { playNumberAudio } from '../utils/audio.js';
import { useEnterKey } from '../utils/useEnterKey.js';
import { useChoiceKeys } from '../utils/useChoiceKeys.js';
import {
  loadNumberProgress, saveNumberProgress, mergeNumberProgress,
  recordNumberAnswer, isNumberMastered, getNumberNet,
  weightedPickSymbol, getTotalNumberStats, getNumberState,
} from '../utils/numberProgress.js';
import { auth, onAuthChange, loadNumberProgressFromCloud, saveNumberProgressToCloud } from '../utils/firebase.js';

const SESSION_SIZE = 20;

// ── Learn ─────────────────────────────────────────────────────────────────────
function LearnNumbers({ progress, settings }) {
  const [punctOpen, setPunctOpen] = useState(false);

  function Section({ title, items, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div className="num-section">
        <button className="num-section-toggle" onClick={() => setOpen(o => !o)}>
          <h3 className="num-section-title">{title}</h3>
          <span className="num-section-arrow">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="num-grid">
            {items.map(item => {
              const mastered = isNumberMastered(progress, item.value);
              const net = getNumberNet(progress, item.value);
              const seen = getNumberState(progress, item.value).seen > 0;
              return (
                <button
                  key={item.value}
                  className={`num-card ${mastered ? 'num-card-mastered' : seen ? 'num-card-seen' : ''}`}
                  onClick={() => playNumberAudio(item.value, item.amharic, settings)}
                  title={`Hear ${item.value}`}
                >
                  <span className="num-symbol">{item.symbol}</span>
                  <span className="num-value">{item.value.toLocaleString()}</span>
                  <span className="num-amharic">{item.amharic}</span>
                  <span className="num-name">{item.name}</span>
                  {mastered
                    ? <span className="num-star">⭐</span>
                    : seen
                      ? (
                        <div className="num-card-bar">
                          <div className="num-card-bar-fill" style={{ width: `${Math.min(net / 5 * 100, 100)}%` }} />
                        </div>
                      )
                    : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="num-learn">
      <Section title="1 – 9"        items={ETHIOPIC_DIGITS}    defaultOpen />
      <Section title="10 – 90"      items={ETHIOPIC_TENS}      defaultOpen />
      <Section title="100 – 900"    items={ETHIOPIC_HUNDREDS}  defaultOpen />
      <Section title="1,000 – 9,000" items={ETHIOPIC_THOUSANDS} defaultOpen />
      <p className="num-learn-note">
        Combinations work like English: ፲፩ = 11, ፳፭ = 25, ፻፲ = 110, ፪፻ = 200.
      </p>
      <Section title="10,000 – 90,000" items={ETHIOPIC_TEN_THOUSANDS} />
      <Section title="100,000 and up"  items={ETHIOPIC_LARGE_ROUND}  />
      <p className="num-learn-note">
        These bigger milestones are just for recognition — worth knowing the words, not something you'll be quizzed on combining.
      </p>

      <div className="num-section">
        <button className="num-section-toggle" onClick={() => setPunctOpen(o => !o)}>
          <h3 className="num-section-title">Punctuation</h3>
          <span className="num-section-arrow">{punctOpen ? '▲' : '▼'}</span>
        </button>
        {punctOpen && (
          <div className="chart-punct-row">
            {PUNCTUATION.map(p => (
              <div key={p.char} className="chart-punct-cell" title={p.description}>
                <span className="chart-cell-char">{p.char}</span>
                <span className="chart-cell-rom">{p.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Symbols Quiz ──────────────────────────────────────────────────────────────
function NumberValueQuiz({ progress, settings, onProgressUpdate, onDone }) {
  const [modes, setModes] = useState(() => new Set(['symbol']));

  // Pure — returns the toggled set without writing state, so the caller can
  // use the up-to-date value immediately instead of a stale pre-toggle read.
  function toggled(set, val) {
    if (set.has(val) && set.size === 1) return set; // keep at least one selected
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  }

  function pickMode(modesSet) {
    const arr = [...modesSet];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function toggleMode(m) {
    const next = toggled(modes, m);
    setModes(next);
    setQ(q => ({ ...q, displayMode: pickMode(next) }));
  }

  function buildQuestion(prog, modesSet, seen = new Set()) {
    const pickPool = seen.size > 0
      ? ALL_BASE_SYMBOLS.filter(s => !seen.has(s.value))
      : ALL_BASE_SYMBOLS;
    const base = pickPool.length >= 4 ? pickPool : ALL_BASE_SYMBOLS;
    const symbol = weightedPickSymbol(base, prog);
    // Category-aware distractors — same category makes it harder
    let pool;
    if (symbol.value <= 9) {
      pool = ETHIOPIC_DIGITS.filter(s => s.value !== symbol.value);
    } else if (symbol.value <= 90) {
      pool = ETHIOPIC_TENS.filter(s => s.value !== symbol.value);
    } else if (symbol.value <= 900) {
      pool = ETHIOPIC_HUNDREDS.filter(s => s.value !== symbol.value);
    } else if (symbol.value <= 9000) {
      pool = ETHIOPIC_THOUSANDS.filter(s => s.value !== symbol.value);
    } else {
      pool = ALL_BASE_SYMBOLS.filter(s => s.value !== symbol.value);
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const choices = [symbol.value, ...shuffled.slice(0, 3).map(s => s.value)]
      .sort((a, b) => a - b);
    return { symbol, choices, displayMode: pickMode(modesSet) };
  }

  const [q, setQ] = useState(() => buildQuestion(progress, modes));
  const [selected, setSelected] = useState(null);
  const [sessionLog, setSessionLog] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [preSessionProgress, setPreSessionProgress] = useState(() => progress);
  const [seenInSession, setSeenInSession] = useState(() => new Set());
  const seenInSessionRef = useRef(seenInSession);
  seenInSessionRef.current = seenInSession;

  const sessionCorrect = sessionLog.filter(e => e.wasCorrect).length;
  const sessionTotal   = sessionLog.length;

  function handleAnswer(value) {
    if (selected !== null) return;
    setSelected(value);
    const wasCorrect = value === q.symbol.value;
    setSessionLog(log => [...log, {
      value: q.symbol.value,
      symbol: q.symbol.symbol,
      wasCorrect,
    }]);
    setSeenInSession(s => { const n = new Set(s); n.add(q.symbol.value); return n; });
    const updated = recordNumberAnswer(progress, q.symbol.value, wasCorrect);
    onProgressUpdate(updated);
    if (wasCorrect) playNumberAudio(q.symbol.value, q.symbol.amharic, settings);
  }

  function handleNext() {
    if (sessionLog.length >= SESSION_SIZE) {
      setShowSummary(true);
      return;
    }
    setQ(buildQuestion(progress, modes, seenInSessionRef.current));
    setSelected(null);
  }

  if (showSummary) {
    const pct = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    const seenMap = new Map();
    for (const e of sessionLog) {
      if (!seenMap.has(e.value)) seenMap.set(e.value, e);
    }
    const seenEntries = [...seenMap.values()];
    const newlyMastered = seenEntries.filter(e =>
      !isNumberMastered(preSessionProgress, e.value) && isNumberMastered(progress, e.value)
    );
    const inProgress = seenEntries
      .filter(e => !isNumberMastered(progress, e.value))
      .sort((a, b) => getNumberNet(progress, b.value) - getNumberNet(progress, a.value));
    const scoreClass = pct >= 80 ? 'score-great' : pct >= 60 ? 'score-ok' : 'score-low';

    return (
      <div className="page session-summary">
        <h2 className="session-summary-title">Session Complete!</h2>
        <div className={`summary-score-display ${scoreClass}`}>
          <div className="summary-pct">{pct}%</div>
          <div className="summary-fraction">{sessionCorrect} / {sessionTotal} correct</div>
        </div>
        {newlyMastered.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">⭐ Newly Mastered</h3>
            <div className="num-summary-row">
              {newlyMastered.map(e => (
                <div key={e.value} className="num-summary-badge badge-mastered">
                  <span className="num-symbol">{e.symbol}</span>
                  <span className="num-badge-val">{e.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {inProgress.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">Progress toward mastery</h3>
            <div className="num-summary-row">
              {inProgress.map(e => {
                const net = getNumberNet(progress, e.value);
                return (
                  <div key={e.value} className="num-summary-badge">
                    <span className="num-symbol">{e.symbol}</span>
                    <span className="num-badge-val">{e.value}</span>
                    <div className="badge-dots">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`badge-dot${i <= net ? ' dot-filled' : ''}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="summary-actions">
          <button className="btn btn-primary" onClick={() => {
            setPreSessionProgress(progress);
            setSessionLog([]);
            setShowSummary(false);
            setSeenInSession(new Set());
            setQ(buildQuestion(progress, modes));
            setSelected(null);
          }}>Keep Going →</button>
          <button className="btn btn-secondary" onClick={onDone}>Done for Now</button>
        </div>
      </div>
    );
  }

  const answered = selected !== null;
  const wasCorrect = answered && selected === q.symbol.value;
  const isLastQuestion = sessionLog.length >= SESSION_SIZE;

  useChoiceKeys(!answered, q.choices.length, i => handleAnswer(q.choices[i]));

  useEnterKey(answered && !showSummary, handleNext);

  return (
    <div className="numbers-quiz-page">
      <div className="num-range-tabs">
        <button
          className={`num-range-btn ${modes.has('word') ? 'active' : ''}`}
          onClick={() => toggleMode('word')}
        >Words</button>
        <button
          className={`num-range-btn ${modes.has('symbol') ? 'active' : ''}`}
          onClick={() => toggleMode('symbol')}
        >Symbols</button>
      </div>

      <div className="score-bar">
        <span className="score-correct">{sessionCorrect} ✓</span>
        <span className="score-total">/ {sessionTotal}</span>
        {sessionTotal > 0 && (
          <span className="score-pct">{Math.round(sessionCorrect / sessionTotal * 100)}%</span>
        )}
        <span className="session-progress-pill">{sessionTotal}/{SESSION_SIZE}</span>
      </div>

      <div className={`quiz-card ${answered ? (wasCorrect ? 'quiz-correct' : 'quiz-wrong') : ''}`}>
        <p className="quiz-prompt">What number is this?</p>
        <div className={q.displayMode === 'word' ? 'num-quiz-word' : 'num-quiz-symbol'}>
          {q.displayMode === 'word' ? q.symbol.amharic : q.symbol.symbol}
        </div>
        <button
          className="quiz-audio-btn"
          onClick={() => playNumberAudio(q.symbol.value, q.symbol.amharic, settings)}
          title="Hear pronunciation"
        >🔊</button>
      </div>

      <div className="choice-grid">
        {q.choices.map(choice => {
          let cls = 'choice-btn';
          if (answered) {
            if (choice === q.symbol.value) cls += ' choice-correct';
            else if (choice === selected)  cls += ' choice-wrong';
            else                           cls += ' choice-dim';
          }
          return (
            <button key={choice} className={cls} onClick={() => handleAnswer(choice)} disabled={answered}>
              {choice}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`feedback-box ${wasCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          {wasCorrect
            ? `✅ Correct! ${q.displayMode === 'word' ? q.symbol.amharic : q.symbol.symbol} = ${q.symbol.value}`
            : `❌ That's ${q.displayMode === 'word' ? q.symbol.amharic : q.symbol.symbol} = ${q.symbol.value}`}
        </div>
      )}

      {answered && (
        <div className="quiz-next-bar">
          <button className="btn btn-primary btn-next" onClick={handleNext}>
            {isLastQuestion ? '📊 See Results' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Combos Quiz ───────────────────────────────────────────────────────────────
function CombosQuiz({ settings }) {
  const [rangeKeys, setRangeKeys] = useState(() => new Set(['2digit']));
  const [modes, setModes] = useState(() => new Set(['symbol']));

  function pickOne(set) {
    const arr = [...set];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Returns the toggled set (pure, no state write) so the caller can use the
  // up-to-date value immediately instead of reading the stale pre-toggle state.
  function toggled(set, val) {
    if (set.has(val) && set.size === 1) return set; // keep at least one selected
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  }

  function buildQuestion(rangeKeysSet, modesSet) {
    return { ...generateComboQuestion(pickOne(rangeKeysSet)), displayMode: pickOne(modesSet) };
  }

  const [q, setQ] = useState(() => buildQuestion(rangeKeys, modes));
  const [selected, setSelected] = useState(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  function toggleRange(key) {
    const next = toggled(rangeKeys, key);
    setRangeKeys(next);
    setQ(buildQuestion(next, modes));
    setSelected(null);
  }

  function toggleMode(m) {
    const next = toggled(modes, m);
    setModes(next);
    setQ(buildQuestion(rangeKeys, next));
    setSelected(null);
  }

  function handleAnswer(value) {
    if (selected !== null) return;
    setSelected(value);
    const wasCorrect = value === q.value;
    setSessionCorrect(s => s + (wasCorrect ? 1 : 0));
    setSessionTotal(s => s + 1);
    if (wasCorrect) playNumberAudio(q.value, q.amharic, settings);
  }

  function handleNext() {
    setQ(buildQuestion(rangeKeys, modes));
    setSelected(null);
  }

  const answered = selected !== null;
  const wasCorrect = answered && selected === q.value;

  useEnterKey(answered, handleNext);
  useChoiceKeys(!answered, q.choices.length, i => handleAnswer(q.choices[i]));
  const display = q.displayMode === 'word' ? q.amharic : q.symbol;

  return (
    <div className="numbers-quiz-page">
      <div className="num-range-tabs">
        <button
          className={`num-range-btn ${rangeKeys.has('2digit') ? 'active' : ''}`}
          onClick={() => toggleRange('2digit')}
        >
          11 – 99
        </button>
        <button
          className={`num-range-btn ${rangeKeys.has('3digit') ? 'active' : ''}`}
          onClick={() => toggleRange('3digit')}
        >
          100 – 999
        </button>
        <button
          className={`num-range-btn ${rangeKeys.has('4digit') ? 'active' : ''}`}
          onClick={() => toggleRange('4digit')}
        >
          1000 – 9999
        </button>
      </div>

      <div className="num-range-tabs">
        <button
          className={`num-range-btn ${modes.has('word') ? 'active' : ''}`}
          onClick={() => toggleMode('word')}
        >Words</button>
        <button
          className={`num-range-btn ${modes.has('symbol') ? 'active' : ''}`}
          onClick={() => toggleMode('symbol')}
        >Symbols</button>
      </div>

      <div className="score-bar">
        <span className="score-correct">{sessionCorrect} ✓</span>
        <span className="score-total">/ {sessionTotal}</span>
        {sessionTotal > 0 && (
          <span className="score-pct">{Math.round(sessionCorrect / sessionTotal * 100)}%</span>
        )}
      </div>

      <div className={`quiz-card ${answered ? (wasCorrect ? 'quiz-correct' : 'quiz-wrong') : ''}`}>
        <p className="quiz-prompt">What number is this?</p>
        <div className={q.displayMode === 'word' ? 'num-quiz-word' : 'num-quiz-symbol'}>{display}</div>
        <button
          className="quiz-audio-btn"
          onClick={() => playNumberAudio(q.value, q.amharic, settings)}
          title="Hear pronunciation"
        >🔊</button>
      </div>

      <div className="choice-grid">
        {q.choices.map(choice => {
          let cls = 'choice-btn';
          if (answered) {
            if (choice === q.value)       cls += ' choice-correct';
            else if (choice === selected) cls += ' choice-wrong';
            else                          cls += ' choice-dim';
          }
          return (
            <button key={choice} className={cls} onClick={() => handleAnswer(choice)} disabled={answered}>
              {choice}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`feedback-box ${wasCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          {wasCorrect
            ? `✅ Correct! ${display} = ${q.value}`
            : `❌ That's ${display} = ${q.value}`}
        </div>
      )}

      {answered && (
        <div className="quiz-next-bar">
          <button className="btn btn-primary btn-next" onClick={handleNext}>Next →</button>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EthiopicNumbers({ settings }) {
  const [tab, setTab] = useState('learn');
  const [numberProgress, setNumberProgress] = useState(() => loadNumberProgress());

  useEffect(() => {
    // Listen for the actual sign-in event, not just the state at mount time —
    // a guest can sign in while already sitting on this page.
    return onAuthChange(firebaseUser => {
      if (!firebaseUser) return;
      loadNumberProgressFromCloud().then(data => {
        const merged = mergeNumberProgress(loadNumberProgress(), data);
        setNumberProgress(merged);
        saveNumberProgress(merged);
        saveNumberProgressToCloud(null, merged).catch(() => {});
      }).catch(() => {});
    });
  }, []);

  function handleProgressUpdate(newProgress) {
    setNumberProgress(newProgress);
    saveNumberProgress(newProgress);
    if (auth.currentUser) {
      saveNumberProgressToCloud(null, newProgress).catch(() => {});
    }
  }

  const stats = getTotalNumberStats(ALL_BASE_SYMBOLS, numberProgress);

  return (
    <div className="page">
      <h2 className="page-title">፩ Ethiopic Numbers</h2>
      <p className="page-sub">{stats.mastered}/{stats.total} base symbols mastered</p>

      <div className="writing-mode-tabs">
        <button
          className={`writing-mode-tab ${tab === 'learn' ? 'active' : ''}`}
          onClick={() => setTab('learn')}
        >Learn</button>
        <button
          className={`writing-mode-tab ${tab === 'basics' ? 'active' : ''}`}
          onClick={() => setTab('basics')}
        >Basics</button>
        <button
          className={`writing-mode-tab ${tab === 'combos' ? 'active' : ''}`}
          onClick={() => setTab('combos')}
        >Combos</button>
      </div>

      {tab === 'learn'  && <LearnNumbers progress={numberProgress} settings={settings} />}
      {tab === 'basics' && (
        <NumberValueQuiz
          progress={numberProgress}
          settings={settings}
          onProgressUpdate={handleProgressUpdate}
          onDone={() => setTab('learn')}
        />
      )}
      {tab === 'combos' && <CombosQuiz settings={settings} />}
    </div>
  );
}
