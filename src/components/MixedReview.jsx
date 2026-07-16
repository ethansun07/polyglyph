import { useState, useEffect, useRef } from 'react';
import { Shuffle, Grid3x3, PenLine, Volume2, HelpCircle, Check, X, Undo2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { LEVELS, getAllChars } from '../data/fidel.js';
import { isLevelUnlocked, recordAnswer } from '../utils/progress.js';
import {
  weightedRandomPick,
  buildQuizChoices,
  shuffle,
} from '../utils/quiz.js';
import { playCharAudio } from '../utils/audio.js';
import { useEnterKey } from '../utils/useEnterKey.js';
import {
  loadWritingProgress,
  saveWritingProgress,
  recordWritingResult,
} from '../utils/writingProgress.js';
import DrawingCanvas from './DrawingCanvas.jsx';
import SessionSummary, { SESSION_SIZE } from './SessionSummary.jsx';
import ChartModal from './ChartModal.jsx';

function buildMixedQuestion(pool, progress, includeWriting = true, excludeId = null) {
  if (pool.length < 4) return null;

  const audioEnabled = progress.settings?.audioEnabled !== false;
  const rand = Math.random();

  // 20% write (when enabled)
  if (includeWriting && rand < 0.20) {
    const char = weightedRandomPick(pool, progress, excludeId);
    if (char) return { type: 'write', char };
  }

  // 20% audio (when audio enabled)
  if (audioEnabled && rand < (includeWriting ? 0.40 : 0.20)) {
    const char = weightedRandomPick(pool, progress, excludeId);
    if (char) {
      const sameRow = pool.filter(c => c.rowId === char.rowId && c.id !== char.id);
      const others  = pool.filter(c => c.rowId !== char.rowId && c.id !== char.id);
      const picks   = [...shuffle(sameRow).slice(0, 2), ...shuffle(others)].slice(0, 3);
      const choices = shuffle([char, ...picks]);
      return { type: 'audio', char, choices };
    }
  }

  // remaining: forward
  const char = weightedRandomPick(pool, progress, excludeId);
  const choices = buildQuizChoices(char, pool);
  return { type: 'forward', char, choices };
}

function buildPool(selectedLevels, unlockedNums, includeExtended) {
  const activeNums = selectedLevels.size === 0
    ? unlockedNums
    : [...selectedLevels].filter(l => unlockedNums.includes(l));
  return getAllChars(includeExtended).filter(c => {
    const lvl = LEVELS.find(l => l.rowIds.includes(c.rowId));
    return lvl && activeNums.includes(lvl.level);
  });
}

export default function MixedReview({ progress, onProgressUpdate, onDone }) {
  const unlockedLevels = LEVELS.filter(l => isLevelUnlocked(progress, l.level));
  const unlockedNums   = unlockedLevels.map(l => l.level);

  const [selectedLevels, setSelectedLevels] = useState(() => new Set());
  const selectedLevelsRef = useRef(selectedLevels);
  selectedLevelsRef.current = selectedLevels;

  const includeExtended = progress?.settings?.extendedChars || false;
  const pool = buildPool(selectedLevels, unlockedNums, includeExtended);

  const [includeWriting, setIncludeWriting] = useState(true);
  const [q, setQ]                         = useState(() => buildMixedQuestion(pool, progress, true));
  const settingsRef = useRef(progress.settings);
  settingsRef.current = progress.settings;
  const [seenInSession, setSeenInSession] = useState(() => new Set());
  const seenInSessionRef = useRef(seenInSession);
  seenInSessionRef.current = seenInSession;

  const isFirstAudio = useRef(true);
  useEffect(() => {
    if (q?.type !== 'audio') { isFirstAudio.current = true; return; }
    const delay = isFirstAudio.current ? 800 : 0;
    isFirstAudio.current = false;
    const t = setTimeout(() => playCharAudio(q.char, settingsRef.current), delay);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line
  const [selected, setSelected]           = useState(null);
  const [sessionLog, setSessionLog]       = useState([]);
  const [writeLog, setWriteLog]           = useState([]);
  const [showSummary, setShowSummary]     = useState(false);
  const [preSessionProgress, setPreSessionProgress] = useState(() => progress);
  const [showChart, setShowChart]         = useState(false);
  const [writingProgress, setWritingProgress] = useState(() => loadWritingProgress());
  const [preWritingProgress, setPreWritingProgress] = useState(() => loadWritingProgress());
  const [writeStrokes, setWriteStrokes]   = useState([]);
  const [writeRevealed, setWriteRevealed] = useState(false);

  const sessionCorrect = sessionLog.filter(e => e.wasCorrect).length;
  const sessionTotal   = sessionLog.length;

  function nextQuestion(updatedProgress, excludeId = null) {
    const freshPool = buildPool(selectedLevelsRef.current, unlockedNums, settingsRef.current?.extendedChars || false);
    const seen = seenInSessionRef.current;
    const unseen = freshPool.filter(c => !seen.has(c.id));
    const pickPool = unseen.length > 0 ? unseen : freshPool;
    setQ(buildMixedQuestion(pickPool, updatedProgress || progress, includeWriting, excludeId));
    setSelected(null);
    setWriteStrokes([]);
    setWriteRevealed(false);
  }

  function toggleLevel(lvl) {
    setSelectedLevels(prev => {
      const next = new Set(prev);
      if (next.has(lvl)) { next.delete(lvl); } else { next.add(lvl); }
      const freshPool = buildPool(next, unlockedNums, settingsRef.current?.extendedChars || false);
      setQ(buildMixedQuestion(freshPool, progress, includeWriting));
      setSelected(null); setWriteStrokes([]); setWriteRevealed(false);
      setSeenInSession(new Set());
      return next;
    });
  }

  function selectAll() {
    const empty = new Set();
    setSelectedLevels(empty);
    setQ(buildMixedQuestion(buildPool(empty, unlockedNums, settingsRef.current?.extendedChars || false), progress, includeWriting));
    setSelected(null); setWriteStrokes([]); setWriteRevealed(false);
    setSeenInSession(new Set());
  }

  function handleForwardAnswer(choice) {
    if (selected !== null) return;
    setSelected(choice);
    const wasCorrect = choice === q.char.romanization;
    setSessionLog(log => [...log, {
      charId: q.char.id, char: q.char.char,
      romanization: q.char.romanization, wasCorrect,
    }]);
    setSeenInSession(s => { const n = new Set(s); n.add(q.char.id); return n; });
    const updated = recordAnswer(progress, q.char.id, wasCorrect);
    onProgressUpdate(updated);
    if (wasCorrect) playCharAudio(q.char, progress.settings);
  }


  function handleWriteCheck() {
    setWriteRevealed(true);
    playCharAudio(q.char, progress.settings);
  }

  function handleWriteGrade(grade) {
    const wasCorrect = grade !== 'wrong';
    const updatedWriting = recordWritingResult(writingProgress, q.char.id, grade);
    saveWritingProgress(updatedWriting);
    setWritingProgress(updatedWriting);
    const newLog = [...sessionLog, {
      charId: q.char.id, char: q.char.char,
      romanization: q.char.romanization, wasCorrect,
    }];
    setSessionLog(newLog);
    setWriteLog(wl => [...wl, { charId: q.char.id, char: q.char.char, romanization: q.char.romanization, result: grade }]);
    setSeenInSession(s => { const n = new Set(s); n.add(q.char.id); return n; });
    const updated = recordAnswer(progress, q.char.id, wasCorrect);
    onProgressUpdate(updated);
    if (newLog.length >= SESSION_SIZE) {
      setShowSummary(true);
    } else {
      nextQuestion(updated, q.char.id);
    }
  }

  function handleNext() {
    if (sessionLog.length >= SESSION_SIZE) {
      setShowSummary(true);
      return;
    }
    nextQuestion(undefined, q.char.id);
  }

  if (!q) {
    return (
      <div className="page">
        <h2 className="page-title"><Shuffle size={22} className="page-title-icon" /> Mixed Review</h2>
        <div className="empty-state">
          Not enough characters unlocked yet.<br />
          Complete Level 1 first!
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <SessionSummary
        sessionLog={sessionLog}
        preSessionProgress={preSessionProgress}
        currentProgress={progress}
        writeLog={writeLog}
        preWritingProgress={preWritingProgress}
        currentWritingProgress={writingProgress}
        onKeepGoing={() => {
          setPreSessionProgress(progress);
          setPreWritingProgress(writingProgress);
          setSessionLog([]);
          setWriteLog([]);
          setShowSummary(false);
          setSeenInSession(new Set());
          setQ(buildMixedQuestion(buildPool(selectedLevelsRef.current, unlockedNums, settingsRef.current?.extendedChars || false), progress, includeWriting, q.char.id));
          setSelected(null);
          setWriteStrokes([]);
          setWriteRevealed(false);
        }}
        onDone={onDone}
      />
    );
  }

  const answered = selected !== null;
  const wasCorrect = q.type === 'audio'
    ? answered && selected === q.char.id
    : q.type === 'write'
    ? answered && selected !== 'wrong'
    : answered && selected === q.char.romanization;
  const isLastQuestion = sessionLog.length >= SESSION_SIZE;

  useEnterKey(q.type === 'write' && !writeRevealed, handleWriteCheck);
  useEnterKey(answered && q.type !== 'write' && !showChart && !showSummary, handleNext);

  const typeBadge = q.type === 'write'  ? <><PenLine size={13} strokeWidth={2.25} /> Write</>
    : q.type === 'audio'  ? <><Volume2 size={13} strokeWidth={2.25} /> Listen</>
    : <><HelpCircle size={13} strokeWidth={2.25} /> Forward</>;

  return (
    <div className="page">
      {showChart && <ChartModal progress={progress} onClose={() => setShowChart(false)} />}
      <div className="page-title-row">
        <h2 className="page-title"><Shuffle size={22} className="page-title-icon" /> Mixed Review</h2>
        <div className="mr-header-btns">
          <button
            className={`mr-toggle-btn ${includeWriting ? 'mr-toggle-on' : 'mr-toggle-off'}`}
            onClick={() => setIncludeWriting(w => !w)}
            title="Toggle writing questions"
          >
            <PenLine size={14} strokeWidth={2.25} /> {includeWriting ? 'Writing: on' : 'Writing: off'}
          </button>
          {answered && <button className="chart-peek-btn" onClick={() => setShowChart(true)}><Grid3x3 size={15} strokeWidth={2.25} /> Chart</button>}
        </div>
      </div>
      <p className="page-sub">Reading, listening, and writing: weak characters appear more often.</p>

      <div className="level-selector">
        <button
          className={`level-pill ${selectedLevels.size === 0 ? 'active' : ''}`}
          onClick={selectAll}
        >All</button>
        {unlockedLevels.map(l => (
          <button
            key={l.level}
            className={`level-pill ${selectedLevels.has(l.level) ? 'active' : ''}`}
            onClick={() => toggleLevel(l.level)}
          >Lv {l.level}</button>
        ))}
      </div>

      <div className="score-bar">
        <span className="score-correct">{sessionCorrect} <Check size={14} strokeWidth={2.5} style={{ verticalAlign: 'middle' }} /></span>
        <span className="score-total">/ {sessionTotal}</span>
        {sessionTotal > 0 && (
          <span className="score-pct">
            {Math.round((sessionCorrect / sessionTotal) * 100)}%
          </span>
        )}
        <span className="score-type-badge-inline">{typeBadge}</span>
        <span className="session-progress-pill">{sessionTotal}/{SESSION_SIZE}</span>
      </div>

      {q.type === 'forward' && (
        <>
          <div className={`quiz-card ${answered ? (wasCorrect ? 'quiz-correct' : 'quiz-wrong') : ''}`}>
            <p className="quiz-prompt">What sound does this character make?</p>
            <div className="quiz-char">{q.char.char}</div>

            {answered && (
              <button className="quiz-audio-btn" onClick={() => playCharAudio(q.char, progress.settings)}>
                <Volume2 size={20} strokeWidth={2.25} />
              </button>
            )}
          </div>
          <div className="choice-grid">
            {q.choices.map(choice => {
              let cls = 'choice-btn';
              if (answered) {
                if (choice === q.char.romanization) cls += ' choice-correct';
                else if (choice === selected)        cls += ' choice-wrong';
                else                                 cls += ' choice-dim';
              }
              return (
                <button key={choice} className={cls} onClick={() => handleForwardAnswer(choice)} disabled={answered}>
                  {choice}
                </button>
              );
            })}
          </div>
        </>
      )}


      {q.type === 'write' && (
        <>
          <div className={`quiz-card ${writeRevealed ? 'quiz-card-revealed' : ''}`}>
            <div className="wq-prompt-rom">{q.char.romanization}</div>
            <button className="quiz-audio-btn" onClick={() => playCharAudio(q.char, progress.settings)}>
              <Volume2 size={20} strokeWidth={2.25} />
            </button>
            {writeRevealed && (
              <div className="wq-answer-reveal">
                <span className="wq-answer-label">Answer:</span>
                <span className="wq-answer-char">{q.char.char}</span>
              </div>
            )}
          </div>

          <DrawingCanvas strokes={writeStrokes} onStrokesChange={setWriteStrokes} />
          <div className="canvas-toolbar">
            <button
              className="btn btn-secondary canvas-tool-btn"
              onClick={() => setWriteStrokes(s => s.slice(0, -1))}
              disabled={writeStrokes.length === 0}
            >
              <Undo2 size={16} strokeWidth={2.25} /> Undo
            </button>
            <button
              className="btn btn-secondary canvas-tool-btn"
              onClick={() => setWriteStrokes([])}
              disabled={writeStrokes.length === 0}
            >
              <Trash2 size={16} strokeWidth={2.25} /> Clear
            </button>
          </div>

          {!writeRevealed ? (
            <button className="btn btn-primary btn-next" onClick={handleWriteCheck}>
              Reveal Answer
            </button>
          ) : (
            <>
              <p className="wq-grade-label">How did you do?</p>
              <div className="wq-grade-btns">
                <button className="btn wq-btn-wrong"   onClick={() => handleWriteGrade('wrong')}><X size={16} strokeWidth={2.25} /> Wrong</button>
                <button className="btn wq-btn-almost"  onClick={() => handleWriteGrade('almost')}>≈ Almost</button>
                <button className="btn wq-btn-correct" onClick={() => handleWriteGrade('correct')}><Check size={16} strokeWidth={2.25} /> Correct</button>
              </div>
            </>
          )}
        </>
      )}

      {q.type === 'audio' && (
        <>
          <div className={`quiz-card ${answered ? (wasCorrect ? 'quiz-correct' : 'quiz-wrong') : ''}`}>
            <p className="quiz-prompt">Which character makes this sound?</p>
            <button className="audio-step-play" onClick={() => playCharAudio(q.char, progress.settings)}>
              <Volume2 size={16} strokeWidth={2.25} /> Play again
            </button>
            {answered && (
              <div className="audio-step-reveal">{q.char.char} = {q.char.romanization}</div>
            )}
          </div>
          <div className="choice-grid">
            {q.choices.map(c => {
              let cls = 'choice-btn choice-btn-char';
              if (answered) {
                if (c.id === q.char.id) cls += ' choice-correct';
                else if (c.id === selected) cls += ' choice-wrong';
                else cls += ' choice-dim';
              }
              return (
                <button key={c.id} className={cls} onClick={() => {
                  if (selected !== null) return;
                  setSelected(c.id);
                  const wasCorrect = c.id === q.char.id;
                  setSessionLog(log => [...log, {
                    charId: q.char.id, char: q.char.char,
                    romanization: q.char.romanization, wasCorrect,
                  }]);
                  setSeenInSession(s => { const n = new Set(s); n.add(q.char.id); return n; });
                  const updated = recordAnswer(progress, q.char.id, wasCorrect);
                  onProgressUpdate(updated);
                }} disabled={answered}>
                  {c.char}
                </button>
              );
            })}
          </div>
        </>
      )}

      {answered && q.type === 'forward' && (
        <div className={`feedback-box ${wasCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          {wasCorrect
            ? <><CheckCircle2 size={17} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /> Correct! {q.char.char} = {q.char.romanization}</>
            : <><XCircle size={17} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /> Not quite. {q.char.char} = {q.char.romanization} (you chose "{selected}")</>
          }
          {q.char.note && <p className="feedback-note">{q.char.note}</p>}
        </div>
      )}

      {answered && q.type === 'audio' && (
        <div className={`feedback-box ${wasCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          {wasCorrect
            ? <><CheckCircle2 size={17} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /> Correct! "{q.char.romanization}" = {q.char.char}</>
            : <><XCircle size={17} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /> Not quite. "{q.char.romanization}" = {q.char.char}</>
          }
          {q.char.note && <p className="feedback-note">{q.char.note}</p>}
        </div>
      )}

      {answered && (
        <button className="btn btn-primary btn-next" onClick={handleNext}>
          {isLastQuestion ? <><Grid3x3 size={16} strokeWidth={2.25} /> See Results</> : 'Next →'}
        </button>
      )}
    </div>
  );
}
