import { useState, useEffect, useRef } from 'react';
import { LEVELS, FIDEL_ROWS, getAllChars } from '../data/fidel.js';
import { isLevelUnlocked } from '../utils/progress.js';
import {
  loadWritingProgress, saveWritingProgress,
  resetWritingProgress,
  recordWritingResult,
  isWritingMastered,
  getWritingState,
  weightedPickChar,
  getWritingStats,
} from '../utils/writingProgress.js';
import { auth, onAuthChange, loadWritingProgressFromCloud, saveWritingProgressFromCloud } from '../utils/firebase.js';
import DrawingCanvas from './DrawingCanvas.jsx';
import { playCharAudio } from '../utils/audio.js';
import { useEnterKey } from '../utils/useEnterKey.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// selectedLevels: Set<number> — empty means "all unlocked"
function buildPool(recognitionProgress, selectedLevels) {
  const unlockedNums = LEVELS
    .filter(l => isLevelUnlocked(recognitionProgress, l.level))
    .map(l => l.level);

  const activeNums = selectedLevels.size === 0
    ? unlockedNums
    : [...selectedLevels].filter(l => unlockedNums.includes(l));

  return getAllChars().filter(c => {
    const lvl = LEVELS.find(l => l.rowIds.includes(c.rowId));
    return lvl && activeNums.includes(lvl.level);
  });
}

// ─── Toolbar shared by all modes ──────────────────────────────────────────────
function CanvasToolbar({ onClear, onUndo, hasStrokes, extra }) {
  return (
    <div className="canvas-toolbar">
      <button className="btn btn-secondary canvas-tool-btn" onClick={onUndo} disabled={!hasStrokes}>
        ↩ Undo
      </button>
      <button className="btn btn-secondary canvas-tool-btn" onClick={onClear} disabled={!hasStrokes}>
        🗑 Clear
      </button>
      {extra}
    </div>
  );
}

// ─── Copy Mode ────────────────────────────────────────────────────────────────
function CopyMode({ chars, writingProgress, settings }) {
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [idx, setIdx]                 = useState(0);
  const [strokes, setStrokes]         = useState([]);

  const rowIds = [...new Set(chars.map(c => c.rowId))];
  const rows   = rowIds.map(id => FIDEL_ROWS.find(r => r.id === id)).filter(Boolean);

  const activeChars = selectedRows.size === 0 ? chars : chars.filter(c => selectedRows.has(c.rowId));
  const char = activeChars[idx % activeChars.length];

  useEffect(() => { if (char) playCharAudio(char, settings); }, [idx, selectedRows]);

  function next() { setIdx(i => (i + 1) % activeChars.length); setStrokes([]); }
  function prev() { setIdx(i => (i - 1 + activeChars.length) % activeChars.length); setStrokes([]); }

  useEnterKey(activeChars.length > 1, next);

  function toggleRow(rowId) {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId); else next.add(rowId);
      return next;
    });
    setIdx(0);
    setStrokes([]);
  }

  const mastered = char && isWritingMastered(writingProgress, char.id);

  return (
    <div className="writing-mode-content">
      <p className="writing-instructions">
        Study the character above, then copy it onto the blank canvas.
        When you feel ready, switch to Quiz mode to write from memory.
      </p>

      <div className="level-selector" style={{flexWrap:'wrap'}}>
        <button
          className={`level-pill ${selectedRows.size === 0 ? 'active' : ''}`}
          onClick={() => { setSelectedRows(new Set()); setIdx(0); setStrokes([]); }}
        >All</button>
        {rows.map(row => (
          <button
            key={row.id}
            className={`level-pill ${selectedRows.has(row.id) ? 'active' : ''}`}
            onClick={() => toggleRow(row.id)}
          >
            {row.baseName}
          </button>
        ))}
      </div>

      <div className="writing-char-info">
        <span className="wci-char">{char?.char}</span>
        <span className="wci-rom">{char?.romanization}</span>
        {mastered && <span className="wci-badge wci-mastered">⭐ Mastered</span>}
      </div>

      {char?.note && <div className="row-note" style={{marginBottom:'0.75rem'}}>{char.note}</div>}

      <DrawingCanvas
        guideChar={null}
        strokes={strokes}
        onStrokesChange={setStrokes}
      />

      <CanvasToolbar
        onClear={() => setStrokes([])}
        onUndo={() => setStrokes(s => s.slice(0, -1))}
        hasStrokes={strokes.length > 0}
        extra={
          <button
            className="btn btn-secondary canvas-tool-btn"
            onClick={() => char && playCharAudio(char, settings)}
          >
            🔊
          </button>
        }
      />

      <div className="writing-nav">
        <button className="btn btn-secondary" onClick={prev} disabled={activeChars.length <= 1}>← Prev</button>
        <span className="writing-nav-count">{(idx % activeChars.length) + 1} / {activeChars.length}</span>
        <button className="btn btn-primary" onClick={next} disabled={activeChars.length <= 1}>Next →</button>
      </div>
    </div>
  );
}

// ─── Writing Session Summary ──────────────────────────────────────────────────
const WRITING_SESSION_SIZE = 10;

function WritingSessionSummary({ sessionLog, preProgress, currentProgress, onKeepGoing }) {
  const correct = sessionLog.filter(e => e.result === 'correct').length;
  const almost  = sessionLog.filter(e => e.result === 'almost').length;
  const wrong   = sessionLog.filter(e => e.result === 'wrong').length;
  const total   = sessionLog.length;
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
  const scoreClass = pct >= 80 ? 'score-great' : pct >= 60 ? 'score-ok' : 'score-low';

  const seenMap = new Map();
  for (const e of sessionLog) {
    if (!seenMap.has(e.charId)) seenMap.set(e.charId, e);
  }
  const seen = [...seenMap.values()];

  const newlyMastered = seen.filter(({ charId }) =>
    !isWritingMastered(preProgress, charId) && isWritingMastered(currentProgress, charId)
  );
  const inProgress = seen.filter(({ charId }) => !isWritingMastered(currentProgress, charId));

  return (
    <div className="page session-summary">
      <h2 className="session-summary-title">Session Complete!</h2>

      <div className={`summary-score-display ${scoreClass}`}>
        <div className="summary-pct">{pct}%</div>
        <div className="summary-fraction">{correct} / {total} correct</div>
        {almost > 0 && <div style={{fontSize:'0.8rem', color:'var(--text-sec)'}}>{almost} almost · {wrong} wrong</div>}
      </div>

      {newlyMastered.length > 0 && (
        <div className="summary-section">
          <h3 className="summary-section-title">⭐ Newly Mastered</h3>
          <div className="summary-char-grid">
            {newlyMastered.map(({ charId, char, romanization }) => (
              <div key={charId} className="summary-char-badge badge-mastered">
                <span className="badge-fidel">{char}</span>
                <span className="badge-rom">{romanization}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {inProgress.length > 0 && (
        <div className="summary-section">
          <h3 className="summary-section-title">Progress toward mastery</h3>
          <p className="summary-section-sub">Need net +3 correct to master</p>
          <div className="summary-char-grid">
            {inProgress.map(({ charId, char, romanization }) => {
              const ws = getWritingState(currentProgress, charId);
              const net = Math.max(0, ws.correct - ws.wrong);
              const filled = Math.min(net, 3);
              const badgeCls = filled >= 2 ? 'badge-almost' : filled >= 1 ? 'badge-midway' : 'badge-new';
              return (
                <div key={charId} className={`summary-char-badge ${badgeCls}`}>
                  <span className="badge-fidel">{char}</span>
                  <span className="badge-rom">{romanization}</span>
                  <div className="badge-dots">
                    {[1, 2, 3].map(i => (
                      <span key={i} className={`badge-dot${i <= filled ? ' dot-filled' : ''}`} />
                    ))}
                  </div>
                  <span className="badge-count">{net}/3</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="summary-actions">
        <button className="btn btn-primary" onClick={onKeepGoing}>Keep Going →</button>
      </div>
    </div>
  );
}

// ─── Writing Quiz Mode ────────────────────────────────────────────────────────
// Filter to chars with unique romanizations — ambiguous ones (ሀ/ኸ share "hä")
// can't be fairly quizzed by romanization prompt, same logic as pickReverseChar.
function unambiguousChars(chars) {
  const romCount = {};
  for (const c of chars) romCount[c.romanization] = (romCount[c.romanization] || 0) + 1;
  const filtered = chars.filter(c => romCount[c.romanization] === 1);
  return filtered.length > 0 ? filtered : chars;
}

function WritingQuizMode({ chars, writingProgress, onResultSaved, recognitionProgress, settings }) {
  const quizChars = unambiguousChars(chars);
  const [strokes, setStrokes]     = useState([]);
  const [revealed, setRevealed]   = useState(false);
  const [seenInSession, setSeenInSession] = useState(() => new Set());
  const seenInSessionRef = useRef(seenInSession);
  seenInSessionRef.current = seenInSession;
  const [char, setChar]           = useState(() => weightedPickChar(quizChars, writingProgress));
  const [sessionLog, setSessionLog] = useState([]);
  const [preProgress, setPreProgress] = useState(writingProgress);
  const [showSummary, setShowSummary] = useState(false);
  const [showChart, setShowChart]   = useState(false);

  useEffect(() => { if (char) playCharAudio(char, settings); }, [char]);

  function nextChar(newWritingProg, excludeId = null) {
    const seen = seenInSessionRef.current;
    const unseen = quizChars.filter(c => !seen.has(c.id));
    const pickPool = unseen.length >= 1 ? unseen : quizChars;
    setChar(weightedPickChar(pickPool, newWritingProg || writingProgress, excludeId));
    setStrokes([]);
    setRevealed(false);
  }

  function grade(result) {
    const updated = recordWritingResult(writingProgress, char.id, result);
    saveWritingProgress(updated);
    saveWritingProgressFromCloud(updated).catch(() => {});
    onResultSaved(updated);
    const newLog = [...sessionLog, { charId: char.id, char: char.char, romanization: char.romanization, result }];
    setSeenInSession(s => { const n = new Set(s); n.add(char.id); return n; });
    setSessionLog(newLog);
    if (newLog.length >= WRITING_SESSION_SIZE) {
      setShowSummary(true);
    } else {
      nextChar(updated, char.id);
    }
  }

  // Must run on every render, before the early returns below — conditionally
  // skipping a hook call breaks React's rules of hooks and crashes to a
  // blank screen once showSummary flips to true or char becomes null.
  useEnterKey(!!char && !revealed && !showChart && !showSummary, () => setRevealed(true));

  if (showSummary) {
    return (
      <WritingSessionSummary
        sessionLog={sessionLog}
        preProgress={preProgress}
        currentProgress={writingProgress}
        onKeepGoing={() => {
          setPreProgress(writingProgress);
          setSessionLog([]);
          setShowSummary(false);
          setSeenInSession(new Set());
          nextChar(null, char?.id);
        }}
      />
    );
  }

  if (!char) {
    return <div className="empty-state">No characters available in this pool.</div>;
  }

  const ws  = getWritingState(writingProgress, char.id);
  const qNum = sessionLog.length + 1;

  return (
    <div className="writing-mode-content writing-quiz-page">
      {showChart && <WritingChartModal writingProgress={writingProgress} recognitionProgress={recognitionProgress} settings={settings} onClose={() => setShowChart(false)} />}

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
        <div className="session-progress-pill">{qNum}/{WRITING_SESSION_SIZE}</div>
        {revealed && <button className="chart-peek-btn" onClick={() => setShowChart(true)}>📊 Chart</button>}
      </div>

      {/* Prompt */}
      <div className={`quiz-card ${revealed ? 'quiz-card-revealed' : ''}`}>
        <div className="wq-prompt-rom">{char.romanization}</div>
        <button
          className="quiz-audio-btn"
          onClick={() => playCharAudio(char, settings)}
        >🔊</button>

        {revealed && (
          <div className="wq-answer-reveal">
            <span className="wq-answer-label">Answer:</span>
            <span className="wq-answer-char">{char.char}</span>
          </div>
        )}
      </div>

      <DrawingCanvas
        guideChar={null}
        strokes={strokes}
        onStrokesChange={setStrokes}
      />

      <CanvasToolbar
        onClear={() => setStrokes([])}
        onUndo={() => setStrokes(s => s.slice(0, -1))}
        hasStrokes={strokes.length > 0}
      />

      {char.note && revealed && <div className="feedback-note" style={{color:'var(--text-sec)'}}>{char.note}</div>}

      {!revealed ? (
        <div className="quiz-next-bar">
          <button className="btn btn-primary btn-next" onClick={() => setRevealed(true)}>
            Reveal Answer
          </button>
        </div>
      ) : (
        <div className="quiz-next-bar">
          <p className="wq-grade-label">How did you do?</p>
          <div className="wq-grade-btns">
            <button className="btn wq-btn-wrong"   onClick={() => grade('wrong')}>✗ Wrong</button>
            <button className="btn wq-btn-almost"  onClick={() => grade('almost')}>≈ Almost</button>
            <button className="btn wq-btn-correct" onClick={() => grade('correct')}>✓ Correct</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Writing Progress Grid ────────────────────────────────────────────────────
function WritingProgressGrid({ writingProgress, recognitionProgress, settings }) {
  const unlockedNums = LEVELS
    .filter(l => isLevelUnlocked(recognitionProgress, l.level))
    .map(l => l.level);

  return (
    <div className="writing-mode-content">
      {/* Legend */}
      <div className="wp-grid-legend">
        <span className="wp-legend-item"><span className="wp-legend-dot wp-dot-unseen" />Unseen</span>
        <span className="wp-legend-item"><span className="wp-legend-dot wp-dot-attempted" />In progress</span>
        <span className="wp-legend-item"><span className="wp-legend-dot wp-dot-mastered" />Mastered</span>
      </div>

      {LEVELS.map(lvl => {
        const unlocked = unlockedNums.includes(lvl.level);
        const lvlRows = FIDEL_ROWS.filter(r => lvl.rowIds.includes(r.id));
        return (
          <div key={lvl.level} className={`chart-level ${unlocked ? '' : 'chart-level-locked'}`}>
            <div className="chart-level-header">
              <span className="chart-level-badge">
                {unlocked ? `Level ${lvl.level}` : `🔒 Level ${lvl.level}`}
              </span>
            </div>
            <div className="chart-rows">
              {lvlRows.map(row => (
                <div key={row.id} className="chart-row">
                  <div className="chart-row-label">
                    <span className="chart-row-base">{row.baseName}</span>
                    <span className="chart-row-id">{row.romanizations[0]}</span>
                  </div>
                  <div className="chart-row-cells">
                    {row.chars.map((char, i) => {
                      const charId = `${row.id}_${i + 1}`;
                      const ws = getWritingState(writingProgress, charId);
                      const mastered = unlocked && isWritingMastered(writingProgress, charId);
                      const attempted = unlocked && ws.attempts > 0 && !mastered;
                      const net = Math.max(0, ws.correct - ws.wrong);
                      return (
                        <button
                          key={charId}
                          className={`chart-cell ${!unlocked ? 'chart-cell-locked' : mastered ? 'wg-cell-mastered' : attempted ? 'wg-cell-attempted' : ''}`}
                          disabled={!unlocked}
                          onClick={() => unlocked && playCharAudio({ char, romanization: row.romanizations[i], rowId: row.id, order: i + 1 }, settings)}
                        >
                          <span className="chart-cell-char">{char}</span>
                          <span className="chart-cell-rom">{row.romanizations[i]}</span>
                          {mastered && <span className="chart-cell-star">⭐</span>}
                          {attempted && (
                            <div className="chart-cell-bar">
                              <div
                                className="chart-cell-bar-fill wg-bar-fill"
                                style={{ width: `${Math.min((net / 3) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Writing Chart Modal ──────────────────────────────────────────────────────
function WritingChartModal({ writingProgress, recognitionProgress, settings, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="chart-modal-backdrop" onClick={onClose}>
      <div className="chart-modal-sheet" onClick={e => e.stopPropagation()}>
        <button className="chart-modal-close" onClick={onClose}>✕ Close</button>
        <WritingProgressGrid
          writingProgress={writingProgress}
          recognitionProgress={recognitionProgress}
          settings={settings}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const MODES = [
  { id: 'copy',     label: '📋 Copy'     },
  { id: 'quiz',     label: '✏️ Quiz'     },
  { id: 'progress', label: '📊 Progress' },
];

export default function WritingPractice({ progress, initialMode = 'copy' }) {
  const [mode, setMode]                       = useState(initialMode);
  const [selectedLevels, setSelectedLevels]   = useState(() => new Set());
  const [writingProgress, setWritingProgress] = useState(() => loadWritingProgress());
  const prevUid = useRef(null);

  useEffect(() => {
    // Every visitor (guest or not) has a real uid, so this just re-syncs
    // whenever the active identity changes — no merge needed, cloud always
    // wins, since progress is never written anywhere but through the API.
    return onAuthChange(firebaseUser => {
      if (!firebaseUser) return; // brief bootstrap window; App.jsx handles it
      if (prevUid.current && prevUid.current !== firebaseUser.uid) {
        resetWritingProgress();
        setWritingProgress({});
      }
      prevUid.current = firebaseUser.uid;
      loadWritingProgressFromCloud().then(data => {
        // Bail if the signed-in identity changed while this fetch was in
        // flight — applying a stale response would leak one user's writing
        // history onto a different account.
        if (auth.currentUser?.uid !== firebaseUser.uid) return;
        setWritingProgress(data || {});
        saveWritingProgress(data || {});
      }).catch(() => {});
    });
  }, []);

  const unlockedLevels = LEVELS.filter(l => isLevelUnlocked(progress, l.level));
  const pool = buildPool(progress, selectedLevels);

  const stats = getWritingStats(pool, writingProgress);

  function handleModeChange(m) { setMode(m); }

  function toggleLevel(lvl) {
    setSelectedLevels(prev => {
      const next = new Set(prev);
      if (next.has(lvl)) {
        next.delete(lvl);
      } else {
        next.add(lvl);
      }
      return next;
    });
  }

  function handleResultSaved(updated) { setWritingProgress(updated); }


  if (unlockedLevels.length === 0 || pool.length === 0) {
    return (
      <div className="page">
        <h2 className="page-title">✏️ Writing Practice</h2>
        <div className="empty-state">
          Complete Level 1 recognition quizzes first to unlock writing practice.
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="page-title">✏️ Writing Practice</h2>

      {/* Mode tabs */}
      <div className="writing-mode-tabs">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`writing-mode-tab ${mode === m.id ? 'active' : ''}`}
            onClick={() => handleModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Level selector — hidden in progress tab */}
      {mode !== 'progress' && (
        <div className="level-selector">
          <button
            className={`level-pill ${selectedLevels.size === 0 ? 'active' : ''}`}
            onClick={() => setSelectedLevels(new Set())}
          >All</button>
          {unlockedLevels.map(l => (
            <button
              key={l.level}
              className={`level-pill ${selectedLevels.has(l.level) ? 'active' : ''}`}
              onClick={() => toggleLevel(l.level)}
            >
              Lv {l.level}
            </button>
          ))}
        </div>
      )}

      {mode !== 'progress' && (
        <div className="writing-progress-bar-wrap">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0}%` }}
            />
          </div>
          <span className="progress-label">
            {stats.mastered}/{stats.total} writing mastered
          </span>
        </div>
      )}

      {/* Sub-mode */}
      {mode === 'copy' && (
        <CopyMode
          key={`copy-${[...selectedLevels].sort().join(',') || 'all'}`}
          chars={pool}
          writingProgress={writingProgress}
          recognitionProgress={progress}
          settings={progress.settings}
        />
      )}
      {mode === 'quiz' && (
        <WritingQuizMode
          key={`quiz-${[...selectedLevels].sort().join(',') || 'all'}`}
          chars={pool}
          writingProgress={writingProgress}
          onResultSaved={handleResultSaved}
          recognitionProgress={progress}
          settings={progress.settings}
        />
      )}
      {mode === 'progress' && (
        <WritingProgressGrid
          writingProgress={writingProgress}
          recognitionProgress={progress}
          settings={progress.settings}
        />
      )}
    </div>
  );
}
