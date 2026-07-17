import { useState } from 'react';
import { X, Undo2, Volume2, Check } from 'lucide-react';
import { shuffleArray } from '../data/levelWords.js';
import { playWordAudio } from '../utils/audio.js';
import { useEnterKey } from '../utils/useEnterKey.js';

const SESSION_SIZE = 10;

function buildQueue(words) {
  return shuffleArray(words).slice(0, SESSION_SIZE);
}

export default function WordReadingExercise({ level, words, allWords, onClose, audioEnabled, initialScope = 'level' }) {
  const [scope, setScope]       = useState(initialScope);
  const [queue, setQueue]       = useState(() => buildQueue(initialScope === 'all' ? allWords : words));
  const [total, setTotal]       = useState(SESSION_SIZE);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);
  const [wrongIds, setWrongIds] = useState(() => new Set());

  const word = queue[0];

  function startSession(pool) {
    const q = buildQueue(pool);
    setQueue(q);
    setTotal(q.length);
    setRevealed(false);
    setScore(0);
    setDone(false);
    setWrongIds(new Set());
  }

  function handleScope(newScope) {
    setScope(newScope);
    startSession(newScope === 'all' ? allWords : words);
  }

  function reveal() {
    setRevealed(true);
    playWordAudio(word, { audioEnabled: audioEnabled !== false });
  }

  function grade(correct) {
    if (correct) {
      const firstTry = !wrongIds.has(word.amharic);
      if (firstTry) setScore(s => s + 1);
      if (queue.length === 1) { setDone(true); return; }
      setQueue(q => q.slice(1));
    } else {
      setWrongIds(prev => new Set([...prev, word.amharic]));
      setQueue(q => [...q.slice(1), q[0]]);
    }
    setRevealed(false);
  }

  function scoreLabel(s, t) {
    const pct = s / t;
    if (pct === 1)   return 'Perfect!';
    if (pct >= 0.8)  return 'Great reading!';
    if (pct >= 0.6)  return 'Good effort.';
    return 'Keep practicing.';
  }

  const pool = scope === 'all' ? allWords : words;

  useEnterKey(!done && !revealed, reveal);

  return (
    <div className="wr-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wr-modal">
        <div className="wr-header">
          <div>
            <div className="wr-title">
              {scope === 'all' ? 'All Levels' : `Level ${level}`} — Word Drill
            </div>
            <div className="wr-subtitle">Goal: practice sounding out the script, not memorizing meanings</div>
          </div>
          <button className="wr-close" onClick={onClose} aria-label="Close"><X size={18} strokeWidth={2.25} /></button>
        </div>

        <div className="wr-scope-toggle">
          <button
            className={`wr-scope-btn ${scope === 'level' ? 'active' : ''}`}
            onClick={() => handleScope('level')}
          >Level {level}</button>
          <button
            className={`wr-scope-btn ${scope === 'all' ? 'active' : ''}`}
            onClick={() => handleScope('all')}
          >All levels</button>
        </div>

        {done ? (
          <div className="wr-done">
            <div className="wr-score-big">{score}/{total}</div>
            <div className="wr-score-label">{scoreLabel(score, total)}</div>
            <div className="wr-done-btns">
              <button className="btn btn-primary" onClick={() => startSession(pool)}>Try again</button>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="wr-progress">
              <div className="wr-progress-fill" style={{ width: `${(score / total) * 100}%` }} />
            </div>
            <div className="wr-counter">{score} / {total}</div>

            <div className={`wr-card ${revealed ? 'wr-card-revealed' : ''}`}>
              {wrongIds.has(word.amharic) && <span className="retry-badge"><Undo2 size={11} strokeWidth={2.25} /> retry</span>}
              <div className="wr-word">{word.amharic}</div>

              {!revealed && (
                <p className="wr-flip-hint">say it aloud, then reveal</p>
              )}

              {revealed && (
                <div className="wr-reveal">
                  <div className="wr-correct">{word.correct}</div>
                  <div className="wr-meaning">{word.meaning}</div>
                  <button
                    className="phrase-audio-btn"
                    onClick={() => playWordAudio(word, { audioEnabled: audioEnabled !== false })}
                  ><Volume2 size={18} strokeWidth={2.25} /></button>
                </div>
              )}
            </div>

            {!revealed ? (
              <div className="wr-sticky-footer">
                <button className="btn btn-primary" onClick={reveal}>Reveal</button>
              </div>
            ) : (
              <div className="wr-sticky-footer">
                <div className="pfc-grade-btns">
                  <button className="pfc-btn-wrong"   onClick={() => grade(false)}><X size={16} strokeWidth={2.25} /> Wrong</button>
                  <button className="pfc-btn-correct" onClick={() => grade(true)}><Check size={16} strokeWidth={2.25} /> Got it</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
