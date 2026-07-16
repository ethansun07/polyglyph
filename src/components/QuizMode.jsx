import { useState, useRef, useEffect } from 'react';
import { HelpCircle, Grid3x3, Eye, Volume2, Check, CheckCircle2, XCircle } from 'lucide-react';
import { LEVELS, getAllChars } from '../data/fidel.js';
import { isLevelUnlocked, recordAnswer } from '../utils/progress.js';
import {
  weightedRandomPick,
  buildQuizChoices,
  pickReverseChar,
  buildReverseChoices,
} from '../utils/quiz.js';
import { playCharAudio } from '../utils/audio.js';
import { useEnterKey } from '../utils/useEnterKey.js';
import { useChoiceKeys } from '../utils/useChoiceKeys.js';
import SessionSummary, { SESSION_SIZE } from './SessionSummary.jsx';
import ChartModal from './ChartModal.jsx';

const QUIZ_MODES = [
  { id: 'forward', label: 'Forward', icon: Eye },
  { id: 'audio',   label: 'Audio',   icon: Volume2 },
];

function buildPool(selectedLevels, unlockedLevels, includeExtended) {
  const unlockedNums = unlockedLevels.map(l => l.level);
  const activeNums = selectedLevels.size === 0
    ? unlockedNums
    : [...selectedLevels].filter(l => unlockedNums.includes(l));
  return getAllChars(includeExtended).filter(c => {
    const lvl = LEVELS.find(l => l.rowIds.includes(c.rowId));
    return lvl && activeNums.includes(lvl.level);
  });
}

function pickMode(modes) {
  const arr = [...modes];
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildQuestion(pool, questionPool, progress, modes) {
  if (pool.length < 4) return null;
  const mode = pickMode(modes);
  if (mode === 'forward') {
    const char = weightedRandomPick(questionPool, progress);
    if (!char) return null;
    return { type: 'forward', char, choices: buildQuizChoices(char, pool) };
  }
  for (let i = 0; i < 20; i++) {
    const char = pickReverseChar(questionPool, progress);
    if (!char) break;
    const choices = buildReverseChoices(char, pool);
    if (choices) return { type: 'audio', char, choices };
  }
  // Audio mode couldn't build a fair question — e.g. every remaining
  // candidate has a same-sound sibling elsewhere in the unlocked pool
  // (buildReverseChoices rejects those). Fall back to a forward question
  // instead of dead-ending the whole quiz session.
  const char = weightedRandomPick(questionPool, progress);
  if (!char) return null;
  return { type: 'forward', char, choices: buildQuizChoices(char, pool) };
}

export default function QuizMode({ progress, onProgressUpdate, initialLevel, onDone }) {
  // Frozen at session start — new chars don't enter the pool mid-quiz
  const sessionUnlockedRef = useRef(LEVELS.filter(l => isLevelUnlocked(progress, l.level)));
  const [selectedLevels, setSelectedLevels] = useState(
    () => initialLevel ? new Set([initialLevel]) : new Set()
  );
  const selectedLevelsRef = useRef(selectedLevels);
  selectedLevelsRef.current = selectedLevels;

  const [enabledModes, setEnabledModes] = useState(() => new Set(['forward']));
  const enabledModesRef = useRef(enabledModes);
  enabledModesRef.current = enabledModes;

  const [preSessionProgress, setPreSessionProgress] = useState(() => progress);
  const [selected, setSelected]       = useState(null);
  const [sessionLog, setSessionLog]   = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showChart, setShowChart]     = useState(false);
  const [seenInSession, setSeenInSession] = useState(() => new Set());
  const seenInSessionRef = useRef(seenInSession);
  seenInSessionRef.current = seenInSession;

  const includeExtended = progress?.settings?.extendedChars || false;
  const pool = buildPool(selectedLevels, sessionUnlockedRef.current, includeExtended);
  const [q, setQ] = useState(() => buildQuestion(pool, pool, progress, new Set(['forward'])));

  const settingsRef = useRef(progress.settings);
  settingsRef.current = progress.settings;

  const isFirstAudio = useRef(true);
  useEffect(() => {
    if (q?.type !== 'audio') { isFirstAudio.current = true; return; }
    const delay = isFirstAudio.current ? 800 : 0;
    const t = setTimeout(() => {
      isFirstAudio.current = false;
      playCharAudio(q.char, settingsRef.current);
    }, delay);
    return () => clearTimeout(t);
  }, [q]);

  const sessionCorrect = sessionLog.filter(e => e.wasCorrect).length;
  const sessionTotal   = sessionLog.length;

  function nextQuestion(updatedProgress, excludeId = null) {
    const freshPool = buildPool(selectedLevelsRef.current, sessionUnlockedRef.current, settingsRef.current?.extendedChars || false);
    const seen = seenInSessionRef.current;
    const unseen = freshPool.filter(c => !seen.has(c.id) && c.id !== excludeId);
    const questionPool = unseen.length > 0 ? unseen : freshPool.filter(c => c.id !== excludeId);
    setQ(buildQuestion(freshPool, questionPool, updatedProgress || progress, enabledModesRef.current));
    setSelected(null);
  }

  function handleForwardAnswer(choice) {
    if (selected !== null) return;
    setSelected(choice);
    const wasCorrect = choice === q.char.romanization;
    setSessionLog(log => [...log, { charId: q.char.id, char: q.char.char, romanization: q.char.romanization, wasCorrect }]);
    setSeenInSession(s => { const n = new Set(s); n.add(q.char.id); return n; });
    const updated = recordAnswer(progress, q.char.id, wasCorrect);
    onProgressUpdate(updated);
    if (wasCorrect) playCharAudio(q.char, progress.settings);
  }

  function handleCharAnswer(charObj) {
    if (selected !== null) return;
    setSelected(charObj.id);
    const wasCorrect = charObj.id === q.char.id;
    setSessionLog(log => [...log, { charId: q.char.id, char: q.char.char, romanization: q.char.romanization, wasCorrect }]);
    setSeenInSession(s => { const n = new Set(s); n.add(q.char.id); return n; });
    const updated = recordAnswer(progress, q.char.id, wasCorrect);
    onProgressUpdate(updated);
    if (wasCorrect) playCharAudio(q.char, progress.settings);
  }

  function handleNext() {
    if (sessionLog.length >= SESSION_SIZE) { setShowSummary(true); return; }
    nextQuestion(undefined, q.char.id);
  }

  function toggleMode(m) {
    if (enabledModes.has(m) && enabledModes.size === 1) return;
    const next = new Set(enabledModes);
    if (next.has(m)) next.delete(m); else next.add(m);
    enabledModesRef.current = next;
    setEnabledModes(next);
    const freshPool = buildPool(selectedLevelsRef.current, sessionUnlockedRef.current, settingsRef.current?.extendedChars || false);
    const seen = seenInSessionRef.current;
    const unseen = freshPool.filter(c => !seen.has(c.id));
    const questionPool = unseen.length > 0 ? unseen : freshPool;
    setQ(buildQuestion(freshPool, questionPool, progress, next));
    setSelected(null);
  }

  function toggleLevel(lvl) {
    setSelectedLevels(prev => {
      const next = new Set(prev);
      if (next.has(lvl)) next.delete(lvl); else next.add(lvl);
      const freshPool = buildPool(next, sessionUnlockedRef.current, settingsRef.current?.extendedChars || false);
      setQ(buildQuestion(freshPool, freshPool, progress, enabledModesRef.current));
      setSelected(null);
      setSeenInSession(new Set());
      return next;
    });
  }

  function selectAll() {
    const empty = new Set();
    setSelectedLevels(empty);
    const freshPool = buildPool(empty, sessionUnlockedRef.current, settingsRef.current?.extendedChars || false);
    setQ(buildQuestion(freshPool, freshPool, progress, enabledModesRef.current));
    setSelected(null);
    setSeenInSession(new Set());
  }

  const currentType = q?.type;
  const answered = selected !== null;
  const wasCorrect = answered && (
    currentType === 'forward' ? selected === q.char.romanization : selected === q.char.id
  );
  const isLastQuestion = sessionLog.length >= SESSION_SIZE;

  useEnterKey(answered && !showChart && !showSummary, handleNext);
  useChoiceKeys(!answered && !!q, q?.choices?.length ?? 0, i => {
    const choice = q.choices[i];
    if (currentType === 'forward') handleForwardAnswer(choice);
    else handleCharAnswer(choice);
  });

  if (!q) {
    return (
      <div className="page">
        <h2 className="page-title"><HelpCircle size={22} className="page-title-icon" /> Quiz</h2>
        <div className="empty-state">
          Not enough characters unlocked yet.<br />
          Complete Learn mode first!
        </div>
      </div>
    );
  }

  if (showSummary) {
    const newlyUnlockedLevels = LEVELS
      .filter(l => !sessionUnlockedRef.current.some(s => s.level === l.level) && isLevelUnlocked(progress, l.level))
      .map(l => l.level);
    return (
      <SessionSummary
        sessionLog={sessionLog}
        preSessionProgress={preSessionProgress}
        currentProgress={progress}
        newlyUnlockedLevels={newlyUnlockedLevels}
        onKeepGoing={() => {
          // Reset session snapshot so next session detects future unlocks correctly
          sessionUnlockedRef.current = LEVELS.filter(l => isLevelUnlocked(progress, l.level));
          setPreSessionProgress(progress);
          setSessionLog([]);
          setShowSummary(false);
          setSeenInSession(new Set());
          nextQuestion(progress, q.char.id);
        }}
        onDone={onDone}
      />
    );
  }

  return (
    <div className="page quiz-page">
      {showChart && <ChartModal progress={progress} onClose={() => setShowChart(false)} />}
      <div className="page-title-row">
        <h2 className="page-title"><HelpCircle size={22} className="page-title-icon" /> Quiz</h2>
        {answered && <button className="chart-peek-btn" onClick={() => setShowChart(true)}><Grid3x3 size={15} strokeWidth={2.25} /> Chart</button>}
      </div>

      {/* Mode toggles */}
      <div className="level-selector">
        {QUIZ_MODES.map(m => {
          const ModeIcon = m.icon;
          return (
            <button
              key={m.id}
              className={`level-pill ${enabledModes.has(m.id) ? 'active' : ''}`}
              onClick={() => toggleMode(m.id)}
            >
              <ModeIcon size={15} strokeWidth={2.25} /> {m.label}
            </button>
          );
        })}
      </div>

      {/* Level filter */}
      <div className="level-selector">
        <button
          className={`level-pill ${selectedLevels.size === 0 ? 'active' : ''}`}
          onClick={selectAll}
        >All</button>
        {sessionUnlockedRef.current.map(l => (
          <button
            key={l.level}
            className={`level-pill ${selectedLevels.has(l.level) ? 'active' : ''}`}
            onClick={() => toggleLevel(l.level)}
          >Lv {l.level}</button>
        ))}
      </div>

      {/* Score bar */}
      <div className="score-bar">
        <span className="score-correct">{sessionCorrect} <Check size={14} strokeWidth={2.5} style={{ verticalAlign: 'middle' }} /></span>
        <span className="score-total">/ {sessionTotal}</span>
        {sessionTotal > 0 && (
          <span className="score-pct">{Math.round((sessionCorrect / sessionTotal) * 100)}%</span>
        )}
        <span className="session-progress-pill">{sessionTotal}/{SESSION_SIZE}</span>
      </div>

      {/* Forward: show fidel → pick romanization */}
      {currentType === 'forward' && (
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
          {answered && (
            <div className={`feedback-box ${wasCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
              {wasCorrect
                ? <><CheckCircle2 size={17} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /> Correct! {q.char.char} = {q.char.romanization}</>
                : <><XCircle size={17} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /> Not quite. {q.char.char} = {q.char.romanization} (you chose "{selected}")</>
              }
              {q.char.note && <p className="feedback-note">{q.char.note}</p>}
            </div>
          )}
        </>
      )}

      {/* Audio: hear sound → pick fidel */}
      {currentType === 'audio' && (
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
          <div className="choice-grid choice-grid-fidel">
            {q.choices.map(c => {
              let cls = 'choice-btn choice-fidel';
              if (answered) {
                if (c.id === q.char.id) cls += ' choice-correct';
                else if (c.id === selected) cls += ' choice-wrong';
                else cls += ' choice-dim';
              }
              return (
                <button key={c.id} className={cls} onClick={() => handleCharAnswer(c)} disabled={answered}>
                  <span className="choice-fidel-char">{c.char}</span>
                  {answered && <span className="choice-fidel-rom">{c.romanization}</span>}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className={`feedback-box ${wasCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
              {wasCorrect
                ? <><CheckCircle2 size={17} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /> Correct! "{q.char.romanization}" = {q.char.char}</>
                : <><XCircle size={17} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /> Not quite. "{q.char.romanization}" = {q.char.char}</>
              }
              {q.char.note && <p className="feedback-note">{q.char.note}</p>}
            </div>
          )}
        </>
      )}

      {answered && (
        <div className="quiz-next-bar">
          <button className="btn btn-primary btn-next" onClick={handleNext}>
            {isLastQuestion ? <><Grid3x3 size={16} strokeWidth={2.25} /> See Results</> : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}
