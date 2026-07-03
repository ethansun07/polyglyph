import { getLevelProgress, isLevelUnlocked } from '../utils/progress.js';
import { LEVELS, getLevelRows } from '../data/fidel.js';

export default function LevelCard({ levelNum, progress, onAction }) {
  const unlocked = isLevelUnlocked(progress, levelNum);
  const { total, mastered, seen, pct } = getLevelProgress(progress, levelNum);
  const includeExtended = progress?.settings?.extendedChars || false;
  const rows = getLevelRows(levelNum, includeExtended);
  const coreRows = getLevelRows(levelNum, false);
  const extRows = includeExtended ? rows.filter(r => r.archaic || r.labiovelar) : [];
  const extCharCount = extRows.reduce((sum, r) => sum + r.chars.filter(Boolean).length, 0);
  const pctDisplay = Math.round(pct * 100);

  return (
    <div className={`level-card ${unlocked ? 'level-unlocked' : 'level-locked'}`}>
      <div className="level-card-header">
        <div className="level-badge">
          {unlocked ? `Level ${levelNum}` : `🔒 Level ${levelNum}`}
        </div>
        <div className="level-row-samples">
          {rows.slice(0, 5).map(r => (
            <span key={r.id} className="level-sample-char">{r.baseName}</span>
          ))}
        </div>
      </div>

      <div className="level-card-body">
        <div className="level-meta">
          {coreRows.length} rows · {total} characters{extCharCount > 0 ? ` + ${extCharCount} extended` : ''}
        </div>

        <div className="progress-bar-wrap">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${pctDisplay}%` }}
            />
          </div>
          <span className="progress-label">
            {mastered}/{total} mastered
          </span>
        </div>

        {!unlocked && (
          <p className="locked-hint">
            Master {Math.ceil((getLevelProgress(progress, levelNum - 1).total * 0.85))} chars in Level {levelNum - 1} to unlock.
          </p>
        )}
      </div>

      {unlocked && onAction && (
        <div className="level-card-actions">
          <button className="btn btn-lesson" onClick={() => onAction('lesson', levelNum)}>
            🎯 Lesson
          </button>
          <button className="btn btn-primary" onClick={() => onAction('learn', levelNum)}>
            📖 Learn
          </button>
          <button className="btn btn-secondary" onClick={() => onAction('quiz', levelNum)}>
            ❓ Quiz
          </button>
          {levelNum >= 2 && (
            <button className="btn btn-read" onClick={() => onAction('read', levelNum)}>
              👁 Read
            </button>
          )}
        </div>
      )}
    </div>
  );
}
