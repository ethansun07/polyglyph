import { useState } from 'react';
import { Grid3x3, Star, Lock } from 'lucide-react';
import { FIDEL_ROWS, LEVELS, VOWEL_ORDERS } from '../data/fidel.js';
import { isLevelUnlocked, isCharMastered, getCharState } from '../utils/progress.js';
import { playCharAudio } from '../utils/audio.js';

const coreRows = FIDEL_ROWS.filter(r => !r.archaic && !r.labiovelar);
const extRows  = FIDEL_ROWS.filter(r => r.archaic || r.labiovelar);
const coreCharCount = coreRows.reduce((sum, r) => sum + r.chars.filter(Boolean).length, 0);
const extCharCount  = extRows.reduce((sum, r) => sum + r.chars.filter(Boolean).length, 0);

const LABIOVELAR_INFO = 'Labiovelar characters add a "w" rounding to their base consonant — ቋ (qwa) comes from ቀ (q). The wa-form (order 4) appears in common words: ቋንቋ (language), ጓደኛ (friend), ኋላ (after/later). Other orders are rare. Enable in Settings → Extended characters to include them in quizzes.';
const ARCHAIC_INFO = 'Archaic characters are Ge\'ez holdovers that sound identical to more common modern letters — ኸ sounds the same as ሀ. They appear mainly in religious texts and older literature. Enable in Settings → Extended characters to include them in quizzes.';

export default function FullChart({ progress }) {
  const [openInfoKey, setOpenInfoKey] = useState(null); // e.g. 'labiovelar-4' or 'archaic-4'
  function renderRow(row, unlocked) {
    const labelRom = row.labiovelar
      ? row.romanizations.find(r => r != null)
      : row.romanizations[0];
    return (
      <div key={row.id} className={`chart-row ${row.archaic || row.labiovelar ? 'chart-row-supplementary' : ''}`}>
        <div className="chart-row-label">
          <span className="chart-row-base">{row.baseName}</span>
          <span className="chart-row-id">{labelRom}</span>
        </div>
        <div className="chart-row-cells">
          {row.chars.map((char, i) => {
            if (char == null) return (
              <div key={`${row.id}_empty_${i}`} className="chart-cell chart-cell-empty" />
            );
            const charId = `${row.id}_${i + 1}`;
            const mastered = unlocked && isCharMastered(progress, charId);
            const state = unlocked ? getCharState(progress, charId) : null;
            const seen = state && state.seen > 0;
            return (
              <button
                key={charId}
                className={`chart-cell ${unlocked ? '' : 'chart-cell-locked'} ${mastered ? 'chart-cell-mastered' : ''} ${seen && !mastered ? 'chart-cell-seen' : ''}`}
                onClick={() => {
                  if (!unlocked) return;
                  playCharAudio(
                    { char, romanization: row.romanizations[i], rowId: row.id, order: i + 1, rowBaseName: row.baseName, note: row.note },
                    progress.settings
                  );
                }}
                title={unlocked
                  ? mastered
                    ? `${char} = ${row.romanizations[i]} · Mastered`
                    : state && state.seen > 0
                      ? `${char} = ${row.romanizations[i]} · ${Math.max(0, state.correct - state.wrong)}/5`
                      : `${char} = ${row.romanizations[i]}`
                  : 'Locked'}
                disabled={!unlocked}
              >
                <span className="chart-cell-char">{char}</span>
                <span className="chart-cell-rom">{row.romanizations[i]}</span>
                {mastered && <span className="chart-cell-star"><Star size={11} strokeWidth={2.25} fill="currentColor" /></span>}
                {seen && !mastered && (
                  <div className="chart-cell-bar">
                    <div
                      className="chart-cell-bar-fill"
                      style={{ width: `${Math.min((Math.max(0, state.correct - state.wrong) / 5) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="page-title"><Grid3x3 size={22} className="page-title-icon" /> Full Fidel Chart</h2>
      <p className="page-sub">
        {coreRows.length} core rows · {coreCharCount} characters + {extCharCount} extended. Locked levels are shown dimmed.
      </p>

      {/* Vowel order header key */}
      <div className="chart-order-key">
        <span className="chart-key-label">Order:</span>
        {VOWEL_ORDERS.map(vo => (
          <span key={vo.order} className="chart-key-cell">
            <strong>{vo.order}</strong> {vo.symbol}
          </span>
        ))}
      </div>

      {LEVELS.map(lvl => {
        const unlocked = isLevelUnlocked(progress, lvl.level);
        const lvlRows = FIDEL_ROWS.filter(r => lvl.rowIds.includes(r.id));
        const coreRows = lvlRows.filter(r => !r.archaic && !r.labiovelar);
        const suppRows = lvlRows.filter(r => r.archaic || r.labiovelar);
        return (
          <div key={lvl.level} className={`chart-level ${unlocked ? '' : 'chart-level-locked'}`}>
            <div className="chart-level-header">
              <span className="chart-level-badge">
                {unlocked ? `Level ${lvl.level}` : <><Lock size={13} strokeWidth={2.25} /> Level {lvl.level}</>}
              </span>
              {!unlocked && (
                <span className="chart-locked-msg">
                  Master Level {lvl.level - 1} to unlock
                </span>
              )}
            </div>
            <div className="chart-rows">
              {coreRows.map(row => renderRow(row, unlocked))}
            </div>
            {suppRows.length > 0 && (() => {
              const labRows = suppRows.filter(r => r.labiovelar);
              const archRows = suppRows.filter(r => r.archaic);
              return (
                <>
                  {labRows.length > 0 && (
                    <>
                      <div className="chart-supp-divider">
                        Labiovelar
                        <button
                          className="chart-supp-info-btn"
                          onClick={() => { const k = `labiovelar-${lvl.level}`; setOpenInfoKey(openInfoKey === k ? null : k); }}
                          aria-label="What are labiovelar characters?"
                        >ⓘ</button>
                      </div>
                      {openInfoKey === `labiovelar-${lvl.level}` && (
                        <div className="chart-supp-info-box">{LABIOVELAR_INFO}</div>
                      )}
                      <div className="chart-rows">
                        {labRows.map(row => renderRow(row, unlocked))}
                      </div>
                    </>
                  )}
                  {archRows.length > 0 && (
                    <>
                      <div className="chart-supp-divider">
                        Archaic
                        <button
                          className="chart-supp-info-btn"
                          onClick={() => { const k = `archaic-${lvl.level}`; setOpenInfoKey(openInfoKey === k ? null : k); }}
                          aria-label="What are archaic characters?"
                        >ⓘ</button>
                      </div>
                      {openInfoKey === `archaic-${lvl.level}` && (
                        <div className="chart-supp-info-box">{ARCHAIC_INFO}</div>
                      )}
                      <div className="chart-rows">
                        {archRows.map(row => renderRow(row, unlocked))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        );
      })}

    </div>
  );
}
