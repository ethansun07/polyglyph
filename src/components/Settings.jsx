import { useState } from 'react';
import { resetProgress } from '../utils/progress.js';
import { resetWritingProgress } from '../utils/writingProgress.js';
import { resetPhraseProgress } from '../utils/phraseProgress.js';
import { resetNumberProgress } from '../utils/numberProgress.js';
import { deleteMainProgressFromCloud } from '../utils/firebase.js';

export default function Settings({ progress, onProgressUpdate, user }) {
  const [showConfirm, setShowConfirm] = useState(false);

  function toggleSetting(key) {
    onProgressUpdate({
      ...progress,
      settings: { ...progress.settings, [key]: !progress.settings?.[key] },
    });
  }

  async function handleReset() {
    resetProgress();
    resetWritingProgress();
    resetPhraseProgress();
    resetNumberProgress();
    if (user) {
      // Single endpoint wipes char/phrase/number/writing progress + settings server-side
      await deleteMainProgressFromCloud();
    }
    window.location.reload();
  }

  return (
    <div className="page">
      <h2 className="page-title">⚙️ Settings</h2>

      {/* Extended characters */}
      <div className="settings-section">
        <h3 className="settings-section-title">🔤 Characters</h3>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Extended characters</div>
            <div className="settings-row-desc">Adds labiovelar (ቋ, ጓ, ኋ, ኳ) and archaic (ኸ) character families to lessons and quizzes. Each labiovelar family has 5 orders — only the wa-form appears in common words; the other orders are rare. Off by default.</div>
          </div>
          <button
            className={`toggle-btn ${progress.settings?.extendedChars ? 'toggle-on' : ''}`}
            onClick={() => toggleSetting('extendedChars')}
          >
            {progress.settings?.extendedChars ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Mastery */}
      <div className="settings-section">
        <h3 className="settings-section-title">ℹ️ About Mastery</h3>
        <div className="settings-info-box">
          <p><strong>Reading mastery ⭐</strong> — net score (correct − wrong) reaches <strong>5</strong>. Affects level unlocks.</p>
          <p><strong>Writing mastery ⭐</strong> — net score reaches <strong>3</strong>. Tracked separately, does not affect level unlocks.</p>
          <p><strong>Number mastery ⭐</strong> — net score reaches <strong>5</strong>. Tracked separately, does not affect level unlocks.</p>
          <p>Mastery can be lost — getting enough wrong answers drops your net score below the threshold.</p>
          <p>A level <strong>unlocks</strong> when 85% of the previous level's characters reach reading mastery.</p>
          <p>Weak characters appear more often in quizzes; mastered ones appear occasionally for review.</p>
        </div>
      </div>

      {/* Reset */}
      <div className="settings-section settings-danger">
        <h3 className="settings-section-title">⚠️ Reset Progress</h3>
        <p className="settings-row-desc">
          Deletes all progress, streak, and mastery data. Cannot be undone.
        </p>
        {!showConfirm ? (
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>
            Reset all progress
          </button>
        ) : (
          <div className="confirm-box">
            <p>Are you sure? All progress will be lost.</p>
            <div className="confirm-btns">
              <button className="btn btn-danger" onClick={handleReset}>
                Yes, reset everything
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
