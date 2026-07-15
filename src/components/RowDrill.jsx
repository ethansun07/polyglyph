import { useState } from 'react';
import { shuffle } from '../utils/quiz.js';
import { playCharAudio } from '../utils/audio.js';
import { useEnterKey } from '../utils/useEnterKey.js';
import { useChoiceKeys } from '../utils/useChoiceKeys.js';

function buildRounds(chars) {
  return shuffle([...chars]).map(char => {
    return { char, choices: chars.map(c => c.romanization) };
  });
}

export default function RowDrill({ row, chars, progress, onClose }) {
  const [rounds]            = useState(() => buildRounds(chars));
  const [idx, setIdx]       = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore]   = useState(0);
  const [done, setDone]     = useState(false);

  const total = rounds.length;
  const round = rounds[idx];

  function advance() {
    if (idx + 1 >= total) setDone(true);
    else { setIdx(i => i + 1); setChosen(null); }
  }

  function handleChoice(choice) {
    if (chosen !== null) return;
    const isCorrect = choice === round.char.romanization;
    setChosen(choice);
    if (isCorrect) setScore(s => s + 1);
    playCharAudio(round.char, progress?.settings);
  }

  function getClass(choice) {
    if (chosen === null) return 'choice-btn';
    if (choice === round.char.romanization) return 'choice-btn choice-correct';
    if (choice === chosen)                  return 'choice-btn choice-wrong';
    return 'choice-btn choice-dim';
  }

  useEnterKey(!done && chosen !== null, advance);
  useChoiceKeys(!done && chosen === null, round?.choices.length ?? 0, i => handleChoice(round.choices[i]));

  function scoreLabel(s, t) {
    const pct = s / t;
    if (pct === 1)   return 'Perfect!';
    if (pct >= 0.8)  return 'Great!';
    if (pct >= 0.6)  return 'Good effort.';
    return 'Keep drilling — this row is tricky.';
  }

  return (
    <div className="wr-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wr-modal">
        <div className="wr-header">
          <div>
            <div className="wr-title">{row.baseName} — row drill</div>
            <div className="wr-subtitle">All choices come from the same row — train your eye on the differences</div>
          </div>
          <button className="wr-close" onClick={onClose}>✕</button>
        </div>

        {done ? (
          <div className="wr-done">
            <div className="wr-score-big">{score}/{total}</div>
            <div className="wr-score-label">{scoreLabel(score, total)}</div>
            <div className="wr-done-btns">
              <button className="btn btn-primary" onClick={() => { setIdx(0); setChosen(null); setScore(0); setDone(false); }}>
                Try again
              </button>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="wr-progress">
              <div className="wr-progress-fill" style={{ width: `${(idx / total) * 100}%` }} />
            </div>
            <div className="wr-counter">{idx + 1} / {total}</div>

            <div className={`wr-card ${chosen !== null ? 'wr-card-revealed' : ''}`}>
              <div className="wr-word">{round.char.char}</div>
              {chosen !== null && (
                <div className="wr-reveal">
                  <div className="wr-correct">{round.char.romanization}</div>
                  <div className="wr-meaning">order {round.char.order} · {round.char.vowelHint}</div>
                </div>
              )}
            </div>

            <div className="choice-grid rd-choice-grid wr-modal-choices">
              {round.choices.map(choice => (
                <button key={choice} className={getClass(choice)} onClick={() => handleChoice(choice)} disabled={chosen !== null}>
                  {choice}
                </button>
              ))}
            </div>

            {chosen !== null && (
              <div className="wr-sticky-footer">
                <button className="btn btn-primary" onClick={advance}>
                  {idx + 1 >= total ? '📊 See Results' : 'Next →'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
