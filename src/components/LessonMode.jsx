import { useState, useRef, useEffect, useCallback } from 'react';
import { getLevelChars, getLevelRows, VOWEL_ORDERS } from '../data/fidel.js';
import { weightedRandomPick, buildQuizChoices, shuffle } from '../utils/quiz.js';
import { playCharAudio } from '../utils/audio.js';
import { useEnterKey } from '../utils/useEnterKey.js';
import ChartModal from './ChartModal.jsx';
import MatchingGame from './MatchingGame.jsx';

// ─── Lesson structure ─────────────────────────────────────────────────────────
// intro → match (2 rounds) → quiz (10q) → audio (8q) → words → done
// audio step is skipped if no audio is available

const QUIZ_Q  = 5;
const AUDIO_Q = 5;

// ─── Audio availability check ─────────────────────────────────────────────────
function canPlayAudio(char) {
  return new Promise(resolve => {
    const audio = new Audio(`/audio/${char.rowId}_${char.order}.mp3`);
    audio.oncanplaythrough = () => resolve(true);
    audio.onerror          = () => resolve(false);
    setTimeout(() => resolve(false), 800);
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function IntroStep({ level, progress, onStart }) {
  const includeExtended = progress?.settings?.extendedChars || false;
  const rows = getLevelRows(level, includeExtended);
  const [rowIdx,  setRowIdx]  = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const settingsRef = useRef(progress?.settings);
  settingsRef.current = progress?.settings;

  const currentRow = rows[rowIdx];
  const rowChars   = currentRow
    ? currentRow.chars.flatMap((c, i) => {
        if (c == null) return [];
        return [{
          id:           `${currentRow.id}_${i + 1}`,
          char:         c,
          romanization: currentRow.romanizations[i],
          order:        i + 1,
          rowId:        currentRow.id,
          rowBaseName:  currentRow.baseName,
          vowelHint:    VOWEL_ORDERS[i]?.hint   || '',
          vowelSymbol:  VOWEL_ORDERS[i]?.symbol || '',
        }];
      })
    : [];

  const currentChar = rowChars[charIdx];
  const isLastInRow = charIdx === rowChars.length - 1;
  const isLastRow   = rowIdx  === rows.length - 1;

  // Auto-play audio whenever the shown character changes
  useEffect(() => {
    if (currentChar) playCharAudio(currentChar, settingsRef.current ?? { audioEnabled: true });
  }, [currentChar?.id]); // eslint-disable-line

  function goToChar(rIdx, cIdx) {
    setRowIdx(rIdx);
    setCharIdx(cIdx);
  }

  const isFirst = rowIdx === 0 && charIdx === 0;

  function prev() {
    if (charIdx > 0)  { goToChar(rowIdx, charIdx - 1);          return; }
    if (rowIdx > 0)   { goToChar(rowIdx - 1, rowChars.length - 1); return; }
  }

  function next() {
    if (!isLastInRow) { goToChar(rowIdx, charIdx + 1); return; }
    if (!isLastRow)   { goToChar(rowIdx + 1, 0);       return; }
    onStart();
  }

  if (!currentChar) return null;

  const nextLabel = isLastInRow && isLastRow ? 'Start Practice →'
    : isLastInRow ? 'Next Row →'
    : 'Next →';

  return (
    <div className="lesson-teach">
      <div className="lesson-teach-header">
        <span className="lesson-teach-level">Level {level} · Row {rowIdx + 1}/{rows.length}</span>
        <span className="lesson-teach-family">{currentRow.baseName} family</span>
      </div>

      <div className="lesson-teach-card">
        <div className="lesson-teach-char">{currentChar.char}</div>
        <div className="lesson-teach-rom">{currentChar.romanization}</div>
        <div className="lesson-teach-hint">
          {currentChar.vowelSymbol} · {currentChar.vowelHint}
        </div>
        <button
          className="lesson-teach-audio"
          onClick={() => playCharAudio(currentChar, settingsRef.current ?? { audioEnabled: true })}
        >
          🔊 Play sound
        </button>
      </div>

      {/* Row strip — all 7 chars, tap any to jump */}
      {currentRow?.note && (
        <div className="row-note">{currentRow.note}</div>
      )}

      <div className="lesson-teach-strip">
        {rowChars.map((c, i) => (
          <button
            key={c.id}
            className={`lesson-teach-strip-btn ${i === charIdx ? 'lts-active' : i < charIdx ? 'lts-seen' : ''}`}
            onClick={() => goToChar(rowIdx, i)}
          >
            {c.char}
          </button>
        ))}
      </div>

      {/* Row progress dots */}
      <div className="lesson-teach-rows-dots">
        {rows.map((_, i) => (
          <span
            key={i}
            className={`lesson-teach-row-dot ${i < rowIdx ? 'ltd-done' : i === rowIdx ? 'ltd-active' : 'ltd-upcoming'}`}
          />
        ))}
      </div>

      <div className="lesson-teach-actions">
        <button className="btn btn-secondary" onClick={prev} disabled={isFirst}>← Back</button>
        <button className="btn btn-primary" onClick={next}>{nextLabel}</button>
      </div>
      <button className="lesson-skip-intro-link" onClick={onStart}>Skip intro</button>
    </div>
  );
}

function MatchStep({ chars, progress, round, totalRounds, audioMode, onComplete }) {
  const [cantListen, setCantListen] = useState(false);
  const sub = audioMode && !cantListen
    ? 'Tap 🔊 to hear the sound, then tap the matching character on the right.'
    : audioMode
    ? 'Tap the romanization, then tap the matching character on the right.'
    : 'Tap a character and then its romanization to match them.';
  return (
    <div className="lesson-step">
      <div className="page-title-row">
        <h2 className="page-title">Match the pairs</h2>
        <span className="lesson-step-round">Round {round} of {totalRounds}</span>
      </div>
      <p className="page-sub">{sub}</p>
      <MatchingGame chars={chars} progress={progress} onComplete={onComplete} audioMode={audioMode} cantListen={cantListen} />
      {audioMode && (
        <button className="cant-listen-btn" onClick={() => setCantListen(v => !v)}>
          {cantListen ? '🔊 I can listen now' : "🔇 Can't listen now"}
        </button>
      )}
    </div>
  );
}

function QuizStep({ chars, progress, onComplete }) {
  const [seenIds, setSeenIds] = useState(() => new Set());
  const [q, setQ]             = useState(() => buildQ(chars, progress, new Set()));
  const [chosen, setChosen]   = useState(null);
  const [count, setCount]     = useState(0);
  const [score, setScore]     = useState(0);
  const [showChart, setShowChart] = useState(false);
  const progressRef           = useRef(progress);

  progressRef.current = progress;

  function buildQ(pool, prog, excludeIds) {
    const unseen  = pool.filter(c => !excludeIds.has(c.id));
    const pickFrom = unseen.length > 0 ? unseen : pool;
    const char    = weightedRandomPick(pickFrom, prog);
    const choices = buildQuizChoices(char, pool);
    return { char, choices };
  }

  function handleAnswer(choice) {
    if (chosen !== null) return;
    setChosen(choice);
    const isCorrect = choice === q.char.romanization;
    if (isCorrect) playCharAudio(q.char, progressRef.current.settings);
    if (isCorrect) setScore(s => s + 1);
  }

  function handleNext() {
    const newCount = count + 1;
    if (newCount >= QUIZ_Q) { onComplete(score, QUIZ_Q); return; }
    setCount(newCount);
    const newSeen = new Set([...seenIds, q.char.id]);
    setSeenIds(newSeen);
    setQ(buildQ(chars, progressRef.current, newSeen));
    setChosen(null);
  }

  const answered   = chosen !== null;
  const isCorrect  = answered && chosen === q.char.romanization;

  useEnterKey(answered && !showChart, handleNext);

  return (
    <div className="lesson-step">
      {showChart && <ChartModal progress={progress} onClose={() => setShowChart(false)} />}
      <div className="page-title-row">
        <h2 className="page-title">Read the character</h2>
        {answered && <button className="chart-peek-btn" onClick={() => setShowChart(true)}>📊 Chart</button>}
      </div>
      <div className="score-bar">
        <span className="score-correct">{score} ✓</span>
        <span className="score-total">/ {count + (answered ? 1 : 0)}</span>
        <span className="session-progress-pill">{count + (answered ? 1 : 0)}/{QUIZ_Q}</span>
      </div>

      <div className={`quiz-card ${answered ? (isCorrect ? 'quiz-correct' : 'quiz-wrong') : ''}`}>
        <p className="quiz-prompt">What sound does this character make?</p>
        <div className="quiz-char">{q.char.char}</div>

        {answered && <button className="quiz-audio-btn" onClick={() => playCharAudio(q.char, progressRef.current.settings)}>🔊</button>}
      </div>

      <div className="choice-grid">
        {q.choices.map(c => {
          let cls = 'choice-btn';
          if (answered) {
            if (c === q.char.romanization) cls += ' choice-correct';
            else if (c === chosen)         cls += ' choice-wrong';
            else                           cls += ' choice-dim';
          }
          return (
            <button key={c} className={cls} onClick={() => handleAnswer(c)} disabled={answered}>
              {c}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          {isCorrect
            ? `✅ ${q.char.char} = ${q.char.romanization}`
            : `❌ ${q.char.char} = ${q.char.romanization} (you chose "${chosen}")`}
        </div>
      )}
      {answered && (
        <button className="btn btn-primary btn-next" onClick={handleNext}>
          {count + 1 >= QUIZ_Q ? 'Continue →' : 'Next →'}
        </button>
      )}
    </div>
  );
}

function AudioStep({ chars, progress, onComplete }) {
  const available  = chars.filter(c => c.rowId && c.order);
  const [seenIds, setSeenIds]     = useState(() => new Set());
  const [q, setQ]                 = useState(() => buildAudioQ(available, progress, new Set()));
  const [chosen, setChosen]       = useState(null);
  const [count, setCount]         = useState(0);
  const [score, setScore]         = useState(0);
  const [cantListen, setCantListen] = useState(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  function buildAudioQ(pool, prog, excludeIds) {
    const unseen = pool.filter(c => !excludeIds.has(c.id));
    const pickFrom = unseen.length > 0 ? unseen : pool;
    const char = weightedRandomPick(pickFrom, prog);
    if (!char) return null;
    const sameRow = pool.filter(c => c.rowId === char.rowId && c.id !== char.id);
    const others  = pool.filter(c => c.rowId !== char.rowId && c.id !== char.id);
    const picks   = [...shuffle(sameRow).slice(0, 2), ...shuffle(others)].slice(0, 3);
    const choices = shuffle([char, ...picks]);
    return { char, choices };
  }

  // Auto-play audio when question changes, but only if not in cantListen mode.
  // isFirstQ flips inside the timeout callback (not when scheduling it) so that
  // React StrictMode's dev-only mount→cleanup→remount cycle can't cancel the
  // delayed timeout and then silently fall through to a 0ms one on remount.
  const isFirstQ = useRef(true);
  useEffect(() => {
    if (!q || cantListen) return;
    const delay = isFirstQ.current ? 800 : 0;
    const t = setTimeout(() => {
      isFirstQ.current = false;
      playCharAudio(q.char, progressRef.current?.settings);
    }, delay);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line

  function replay() {
    playCharAudio(q.char, progressRef.current.settings);
  }

  function handleAnswer(choice) {
    if (chosen !== null) return;
    setChosen(choice.id);
    const isCorrect = choice.id === q.char.id;
    if (isCorrect) setScore(s => s + 1);
  }

  function handleNext() {
    const newCount = count + 1;
    if (newCount >= AUDIO_Q) { onComplete(score, AUDIO_Q); return; }
    setCount(newCount);
    const newSeen = new Set([...seenIds, q.char.id]);
    setSeenIds(newSeen);
    setQ(buildAudioQ(available, progressRef.current, newSeen) ?? q);
    setChosen(null);
  }

  const answered  = chosen !== null;
  const isCorrect = answered && chosen === q.char.id;

  useEnterKey(answered, handleNext);

  return (
    <div className="lesson-step">
      <div className="page-title-row">
        <h2 className="page-title">{cantListen ? 'Read & identify' : 'Listen & identify'}</h2>
      </div>
      <div className="score-bar">
        <span className="score-correct">{score} ✓</span>
        <span className="score-total">/ {count + (answered ? 1 : 0)}</span>
        <span className="session-progress-pill">{count + (answered ? 1 : 0)}/{AUDIO_Q}</span>
      </div>

      <div className={`quiz-card ${answered ? (isCorrect ? 'quiz-correct' : 'quiz-wrong') : ''}`}>
        {cantListen ? (
          <>
            <p className="quiz-prompt">Which character makes this sound?</p>
            <div className="audio-step-romanization">{q.char.romanization}</div>
          </>
        ) : (
          <>
            <p className="quiz-prompt">Which character makes this sound?</p>
            <button className="audio-step-play" onClick={replay}>🔊 Play again</button>
          </>
        )}
        {answered && (
          <div className="audio-step-reveal">
            {q.char.char} = {q.char.romanization}
          </div>
        )}
      </div>

      <div className="choice-grid">
        {q.choices.map(c => {
          let cls = 'choice-btn choice-btn-char';
          if (answered) {
            if (c.id === q.char.id) cls += ' choice-correct';
            else if (c.id === chosen) cls += ' choice-wrong';
            else cls += ' choice-dim';
          }
          return (
            <button key={c.id} className={cls} onClick={() => handleAnswer(c)} disabled={answered}>
              {c.char}
            </button>
          );
        })}
      </div>

      {answered && (
        <button className="btn btn-primary btn-next" onClick={handleNext}>
          {count + 1 >= AUDIO_Q ? 'Continue →' : 'Next →'}
        </button>
      )}

      <button className="cant-listen-btn" onClick={() => setCantListen(v => !v)}>
        {cantListen ? '🔊 I can listen now' : "🔇 Can't listen now"}
      </button>
    </div>
  );
}

function DoneStep({ scores, onDone }) {
  const total  = scores.reduce((s, x) => s + x.total, 0);
  const correct = scores.reduce((s, x) => s + x.score, 0);
  const pct    = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="lesson-done">
      <div className="lesson-done-icon">🎉</div>
      <div className="lesson-done-title">Lesson complete!</div>
      <div className="lesson-done-score">{correct}/{total} correct ({pct}%)</div>
      <div className="lesson-done-breakdown">
        {scores.map(s => (
          <div key={s.label} className="lesson-done-row">
            <span>{s.label}</span>
            <span>{s.score}/{s.total}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-xl" onClick={onDone}>Back to home</button>
    </div>
  );
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export default function LessonMode({ level, progress, onProgressUpdate, onDone }) {
  const includeExtended = progress?.settings?.extendedChars || false;
  const chars = getLevelChars(level, includeExtended);

  const [phase, setPhase]   = useState('intro');
  const [scores, setScores] = useState([]);

  const [matchBatches] = useState(() => {
    const s = shuffle([...chars]);
    return [s.slice(0, 4), s.slice(4, 8).length >= 4 ? s.slice(4, 8) : s.slice(0, 4)];
  });

  const steps = ['intro', 'match1', 'match2', 'quiz', 'audio', 'done'];

  function stepLabel(p) {
    switch (p) {
      case 'match1':
      case 'match2': return 'Matching';
      case 'quiz':   return 'Quiz';
      case 'audio':  return 'Listen';
      case 'words':  return 'Reading';
      default:       return '';
    }
  }

  const practiceSteps = steps.filter(s => !['intro', 'done'].includes(s));
  const currentIdx    = practiceSteps.indexOf(phase);

  function addScore(label, score, total) {
    setScores(prev => [...prev, { label, score, total }]);
  }

  function advance(nextPhase) { setPhase(nextPhase); }

  if (phase === 'intro') {
    return (
      <div className="page">
        <IntroStep level={level} progress={progress} onStart={() => advance('match1')} />
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="page">
        <DoneStep scores={scores} onDone={onDone} />
      </div>
    );
  }

  return (
    <div className="page">
      {/* Step progress bar */}
      <div className="lesson-steps-bar">
        {practiceSteps.map((s, i) => (
          <div
            key={s}
            className={`lesson-step-dot ${i < currentIdx ? 'lsd-done' : i === currentIdx ? 'lsd-active' : 'lsd-upcoming'}`}
            title={stepLabel(s)}
          />
        ))}
      </div>
      {phase === 'match1' && (
        <MatchStep
          chars={matchBatches[0]}
          progress={progress}
          round={1}
          totalRounds={2}
          onComplete={(errors) => {
            addScore('Match round 1', Math.max(0, 4 - errors), 4);
            advance('match2');
          }}
        />
      )}

      {phase === 'match2' && (
        <MatchStep
          chars={matchBatches[1]}
          progress={progress}
          round={2}
          totalRounds={2}
          audioMode
          onComplete={(errors) => {
            addScore('Match round 2', Math.max(0, 4 - errors), 4);
            advance('quiz');
          }}
        />
      )}

      {phase === 'quiz' && (
        <QuizStep
          chars={chars}
          progress={progress}
          onComplete={(score, total) => {
            addScore('Read', score, total);
            advance('audio');
          }}
        />
      )}

      {phase === 'audio' && (
        <AudioStep
          chars={chars}
          progress={progress}
          onComplete={(score, total) => {
            addScore('Listen', score, total);
            advance('done');
          }}
        />
      )}
    </div>
  );
}
