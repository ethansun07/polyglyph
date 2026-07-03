import { useState, useEffect } from 'react';
import { shuffle } from '../utils/quiz.js';
import { playCharAudio } from '../utils/audio.js';

function buildColumns(chars, audioMode) {
  const picked     = shuffle(chars).slice(0, 4);
  const leftCards  = audioMode
    ? shuffle(picked.map((c, i) => ({ id: `a${i}`, pairId: i, charObj: c })))
    : shuffle(picked.map((c, i) => ({ id: `a${i}`, pairId: i, text: c.char })));
  const rightCards = audioMode
    ? shuffle(picked.map((c, i) => ({ id: `r${i}`, pairId: i, text: c.char })))
    : shuffle(picked.map((c, i) => ({ id: `r${i}`, pairId: i, text: c.romanization })));
  return { picked, leftCards, rightCards };
}

export default function MatchingGame({ chars, progress, onComplete, audioMode = false, cantListen = false }) {
  const [{ picked, leftCards, rightCards }] = useState(() => buildColumns(chars, audioMode));
  const [selected, setSelected] = useState(null); // { id, side: 'left'|'right' }
  const [matched, setMatched]   = useState(new Set());
  const [flash, setFlash]       = useState({});
  const [errors, setErrors]     = useState(0);

  const pairs = picked.length;

  useEffect(() => {
    if (matched.size === pairs && pairs > 0) {
      const t = setTimeout(() => onComplete?.(errors), 400);
      return () => clearTimeout(t);
    }
  }, [matched.size, pairs, errors, onComplete]);

  function tap(card, side) {
    if (matched.has(card.pairId)) return;
    // Only block re-tapping a card that's mid-flash — a fresh tap on some
    // other, unrelated card should register immediately rather than being
    // silently swallowed for the whole flash animation.
    if (flash[card.id]) return;

    if (!selected) {
      setSelected({ id: card.id, side });
      return;
    }

    // Tap same side → reselect
    if (selected.side === side) {
      setSelected({ id: card.id, side });
      return;
    }

    // Tap opposite side → attempt match
    const firstCard = (selected.side === 'left' ? leftCards : rightCards)
      .find(c => c.id === selected.id);

    if (firstCard.pairId === card.pairId) {
      playCharAudio(picked[card.pairId], progress?.settings);
      setSelected(null);
      setFlash({ [firstCard.id]: 'correct', [card.id]: 'correct' });
      setTimeout(() => {
        setMatched(m => new Set([...m, card.pairId]));
        setFlash({});
      }, 350);
    } else {
      setErrors(e => e + 1);
      setSelected(null);
      setFlash({ [firstCard.id]: 'wrong', [card.id]: 'wrong' });
      const restoreId   = firstCard.id;
      const restoreSide = selected.side;
      setTimeout(() => {
        setFlash({});
        // Only restore the old selection if the user hasn't already picked
        // something new in the meantime — don't clobber a fresh choice.
        setSelected(prev => (prev === null ? { id: restoreId, side: restoreSide } : prev));
      }, 500);
    }
  }

  function cardClass(card, side) {
    if (matched.has(card.pairId)) return 'mg-card mg-gone';
    let cls = 'mg-card';
    const isAmharic = audioMode ? side === 'right' : side === 'left';
    if (isAmharic) cls += ' mg-amharic';
    if (selected?.id === card.id) cls += ' mg-selected';
    if (flash[card.id] === 'correct') cls += ' mg-flash-correct';
    if (flash[card.id] === 'wrong')   cls += ' mg-flash-wrong';
    return cls;
  }

  return (
    <div className="mg-columns">
      <div className="mg-column">
        {leftCards.map(card => (
          <button
            key={card.id}
            className={cardClass(card, 'left')}
            onClick={() => {
              if (audioMode && !cantListen && card.charObj) playCharAudio(card.charObj, progress?.settings);
              tap(card, 'left');
            }}
          >
            {matched.has(card.pairId) ? '' : (audioMode ? (cantListen ? card.charObj?.romanization : '🔊') : card.text)}
          </button>
        ))}
      </div>
      <div className="mg-column">
        {rightCards.map(card => (
          <button key={card.id} className={cardClass(card, 'right')} onClick={() => tap(card, 'right')}>
            {matched.has(card.pairId) ? '' : card.text}
          </button>
        ))}
      </div>
    </div>
  );
}
