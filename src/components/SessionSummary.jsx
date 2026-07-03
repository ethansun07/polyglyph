import { isCharMastered, getCharState } from '../utils/progress.js';
import { isWritingMastered, getWritingState } from '../utils/writingProgress.js';

export const SESSION_SIZE = 20;

export default function SessionSummary({
  sessionLog,
  preSessionProgress,
  currentProgress,
  newlyUnlockedLevels = [],
  writeLog = null,
  preWritingProgress = null,
  currentWritingProgress = null,
  onKeepGoing,
  onDone,
}) {
  const sessionCorrect = sessionLog.filter(e => e.wasCorrect).length;
  const sessionTotal   = sessionLog.length;
  const pct = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

  // Unique chars seen this session (first occurrence carries char/romanization)
  const seenMap = new Map();
  for (const entry of sessionLog) {
    if (!seenMap.has(entry.charId)) seenMap.set(entry.charId, entry);
  }
  const seenEntries = [...seenMap.values()];

  const newlyMastered = seenEntries.filter(({ charId }) =>
    !isCharMastered(preSessionProgress, charId) &&
    isCharMastered(currentProgress, charId)
  );

  // All chars practiced this session that aren't (yet) mastered, sorted by correct desc
  const inProgress = seenEntries
    .filter(({ charId }) => !isCharMastered(currentProgress, charId))
    .sort((a, b) => {
      const sa = getCharState(currentProgress, a.charId);
      const sb = getCharState(currentProgress, b.charId);
      return sb.correct - sa.correct;
    });

  const scoreClass = pct >= 80 ? 'score-great' : pct >= 60 ? 'score-ok' : 'score-low';

  return (
    <div className="page session-summary">
      <h2 className="session-summary-title">Session Complete!</h2>

      {newlyUnlockedLevels.length > 0 && (
        <div className="summary-level-unlock">
          {newlyUnlockedLevels.map(lvl => (
            <div key={lvl} className="level-unlock-banner">
              🔓 Level {lvl} unlocked!
            </div>
          ))}
        </div>
      )}

      <div className={`summary-score-display ${scoreClass}`}>
        <div className="summary-pct">{pct}%</div>
        <div className="summary-fraction">{sessionCorrect} / {sessionTotal} correct</div>
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
          <p className="summary-section-sub">Each dot = 1 correct answer · need 5 at 85%+ to master</p>
          <div className="summary-char-grid">
            {inProgress.map(({ charId, char, romanization }) => {
              const s = getCharState(currentProgress, charId);
              const net = Math.max(0, s.correct - s.wrong);
              const filled = Math.min(net, 5);
              const badgeCls = filled >= 4 ? 'badge-almost' : filled >= 2 ? 'badge-midway' : 'badge-new';
              return (
                <div key={charId} className={`summary-char-badge ${badgeCls}`}>
                  <span className="badge-fidel">{char}</span>
                  <span className="badge-rom">{romanization}</span>
                  <div className="badge-dots">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} className={`badge-dot${i <= filled ? ' dot-filled' : ''}`} />
                    ))}
                  </div>
                  <span className="badge-count">{net}/5</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {writeLog && writeLog.length > 0 && (() => {
        const writeSeenMap = new Map();
        for (const e of writeLog) {
          if (!writeSeenMap.has(e.charId)) writeSeenMap.set(e.charId, e);
        }
        const writeSeen = [...writeSeenMap.values()];
        const newlyWritingMastered = preWritingProgress
          ? writeSeen.filter(({ charId }) =>
              !isWritingMastered(preWritingProgress, charId) &&
              isWritingMastered(currentWritingProgress, charId))
          : [];
        const writingInProgress = writeSeen.filter(({ charId }) =>
          !isWritingMastered(currentWritingProgress, charId));
        return (
          <>
            {newlyWritingMastered.length > 0 && (
              <div className="summary-section">
                <h3 className="summary-section-title">✏️ Writing Mastered</h3>
                <div className="summary-char-grid">
                  {newlyWritingMastered.map(({ charId, char, romanization }) => (
                    <div key={charId} className="summary-char-badge badge-mastered">
                      <span className="badge-fidel">{char}</span>
                      <span className="badge-rom">{romanization}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {writingInProgress.length > 0 && (
              <div className="summary-section">
                <h3 className="summary-section-title">✏️ Writing progress</h3>
                <p className="summary-section-sub">Need net +3 correct to master writing</p>
                <div className="summary-char-grid">
                  {writingInProgress.map(({ charId, char, romanization }) => {
                    const ws = getWritingState(currentWritingProgress, charId);
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
          </>
        );
      })()}

      <div className="summary-actions">
        <button className="btn btn-primary" onClick={onKeepGoing}>
          Keep Going →
        </button>
        <button className="btn btn-secondary" onClick={onDone}>
          Done for Now
        </button>
      </div>
    </div>
  );
}
