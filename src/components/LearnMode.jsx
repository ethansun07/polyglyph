import { useState } from 'react';
import { LEVELS, getLevelRows, VOWEL_ORDERS } from '../data/fidel.js';
import { isLevelUnlocked, getCharState, isCharMastered } from '../utils/progress.js';
import { playCharAudio } from '../utils/audio.js';
import RowDrill from './RowDrill.jsx';

export default function LearnMode({ progress, onProgressUpdate, initialLevel }) {
  const unlockedLevels = LEVELS.filter(l => isLevelUnlocked(progress, l.level));
  const defaultLevel = initialLevel || unlockedLevels[unlockedLevels.length - 1]?.level || 1;

  const [selectedLevel, setSelectedLevel] = useState(defaultLevel);
  const [rowIndex, setRowIndex] = useState(0);
  const [drillRow, setDrillRow] = useState(null);

  const includeExtended = progress?.settings?.extendedChars || false;
  const rows = getLevelRows(selectedLevel, includeExtended);
  const currentRow = rows[rowIndex] || rows[0];
  const chars = currentRow
    ? currentRow.chars.flatMap((char, i) => {
        if (char == null) return [];
        return [{
          id: `${currentRow.id}_${i + 1}`,
          char,
          romanization: currentRow.romanizations[i],
          order: i + 1,
          rowId: currentRow.id,
          rowBaseName: currentRow.baseName,
          note: currentRow.note,
          vowelHint: VOWEL_ORDERS[i]?.hint || '',
          vowelSymbol: VOWEL_ORDERS[i]?.symbol || '',
        }];
      })
    : [];

  function handleLevelChange(lvl) {
    setSelectedLevel(lvl);
    setRowIndex(0);
  }

  return (
    <div className="page">
      {drillRow && (
        <RowDrill
          row={drillRow.row}
          chars={drillRow.chars}
          progress={progress}
          onProgressUpdate={onProgressUpdate}
          onClose={() => setDrillRow(null)}
        />
      )}
      <h2 className="page-title">📖 Learn Mode</h2>

      {/* Level selector */}
      <div className="level-selector">
        {unlockedLevels.map(l => (
          <button
            key={l.level}
            className={`level-pill ${selectedLevel === l.level ? 'active' : ''}`}
            onClick={() => handleLevelChange(l.level)}
          >
            Lv {l.level}
          </button>
        ))}
      </div>

      {/* Vowel orders explainer */}
      <details className="tip-box">
        <summary>ℹ️ How the 7 orders work</summary>
        <p>
          Every Fidel row shows the same consonant paired with each of 7 vowels, in this order:
        </p>
        <div className="vowel-order-grid">
          {VOWEL_ORDERS.map(vo => (
            <div key={vo.order} className="vowel-order-cell">
              <span className="vo-num">{vo.order}.</span>
              <span className="vo-sym">{vo.symbol}</span>
              <span className="vo-hint">{vo.hint}</span>
            </div>
          ))}
        </div>
      </details>

      {/* Row navigation */}
      {rows.length > 0 && (
        <div className="row-nav">
          <button
            className="row-nav-btn"
            disabled={rowIndex === 0}
            onClick={() => setRowIndex(i => i - 1)}
          >
            ← Prev row
          </button>
          <span className="row-nav-info">
            Row {rowIndex + 1} of {rows.length}
            <br />
            <span className="row-nav-base">{currentRow.baseName} — {currentRow.romanizations[0]} family</span>
          </span>
          <button
            className="row-nav-btn"
            disabled={rowIndex === rows.length - 1}
            onClick={() => setRowIndex(i => i + 1)}
          >
            Next row →
          </button>
        </div>
      )}

      {/* Drill button */}
      {currentRow && (
        <button
          className="btn btn-lesson row-drill-btn"
          onClick={() => setDrillRow({ row: currentRow, chars })}
        >
          🎯 Drill this row
        </button>
      )}

      {/* Note for the row */}
      {currentRow?.note && (
        <div className="row-note">{currentRow.note}</div>
      )}

      {/* Character cards */}
      <div className="char-cards-grid">
        {chars.map(c => {
          const state = getCharState(progress, c.id);
          const mastered = isCharMastered(progress, c.id);
          return (
            <div
              key={c.id}
              className={`char-card ${mastered ? 'char-mastered' : ''}`}
            >
              <div className="cc-order-badge">
                {c.order}
              </div>
              {mastered && <div className="cc-mastery-star">⭐</div>}
              <div className="cc-char">{c.char}</div>
              <div className="cc-rom">{c.romanization}</div>
              <div className="cc-hint">{c.vowelSymbol} · {c.vowelHint}</div>
              <button
                className="cc-audio-btn"
                title="Hear pronunciation"
                onClick={() => playCharAudio(c, progress.settings)}
              >
                🔊
              </button>
            </div>
          );
        })}
      </div>

      {/* Row progress through level */}
      <div className="row-dots">
        {rows.map((_, i) => (
          <button
            key={i}
            className={`row-dot ${i === rowIndex ? 'active' : ''}`}
            onClick={() => setRowIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
