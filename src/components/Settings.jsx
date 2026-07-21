import { useState } from 'react';
import { Settings as SettingsIcon, Type, MessageCircle, AlertTriangle, Info, Star, Check } from 'lucide-react';
import { resetProgress } from '../utils/progress.js';
import { resetWritingProgress } from '../utils/writingProgress.js';
import { resetPhraseProgress } from '../utils/phraseProgress.js';
import { resetNumberProgress } from '../utils/numberProgress.js';
import { deleteMainProgressFromCloud, submitFeedback } from '../utils/firebase.js';

export default function Settings({ progress, onProgressUpdate, user }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  async function handleSendFeedback() {
    const message = feedbackText.trim();
    if (!message) return;
    setFeedbackStatus('sending');
    try {
      await submitFeedback(message);
      setFeedbackText('');
      setFeedbackStatus('sent');
    } catch {
      setFeedbackStatus('error');
    }
  }

  function toggleSetting(key) {
    onProgressUpdate({
      ...progress,
      settings: { ...progress.settings, [key]: !progress.settings?.[key] },
    });
  }

  async function handleReset() {
    setResetting(true);
    resetProgress();
    resetWritingProgress();
    resetPhraseProgress();
    resetNumberProgress();
    if (user) {
      // Single endpoint wipes char/phrase/number/writing progress + settings
      // server-side. Local state is already cleared above regardless, so a
      // failed request here (e.g. a cold-starting backend) shouldn't block
      // the reload below — otherwise the page never refreshes and every
      // screen keeps showing stale in-memory state (progress, "already
      // read" checkmarks, etc.) even though localStorage is already empty.
      try { await deleteMainProgressFromCloud(); } catch { /* local reset already happened */ }
    }
    window.location.reload();
  }

  return (
    <div className="page">
      <h2 className="page-title"><SettingsIcon size={22} className="page-title-icon" /> Settings</h2>

      {/* Extended characters */}
      <div className="settings-section">
        <h3 className="settings-section-title"><Type size={16} /> Characters</h3>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Extended characters</div>
            <div className="settings-row-desc">Adds labiovelar (ቋ, ጓ, ኋ, ኳ) and archaic (ኸ) character families to lessons and quizzes. Each labiovelar family has 5 orders: only the wa-form appears in common words; the other orders are rare. Off by default.</div>
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
        <h3 className="settings-section-title"><Info size={16} /> About Mastery</h3>
        <div className="settings-info-box">
          <p><strong>Reading mastery <Star size={13} strokeWidth={2.25} style={{ verticalAlign: 'middle', color: 'var(--gold)' }} /></strong>: net score (correct − wrong) reaches <strong>5</strong>. Affects level unlocks.</p>
          <p><strong>Writing mastery <Star size={13} strokeWidth={2.25} style={{ verticalAlign: 'middle', color: 'var(--gold)' }} /></strong>: net score reaches <strong>3</strong>. Tracked separately, does not affect level unlocks.</p>
          <p><strong>Number mastery <Star size={13} strokeWidth={2.25} style={{ verticalAlign: 'middle', color: 'var(--gold)' }} /></strong>: net score reaches <strong>5</strong>. Tracked separately, does not affect level unlocks.</p>
          <p>Mastery can be lost: getting enough wrong answers drops your net score below the threshold.</p>
          <p>A level <strong>unlocks</strong> when 85% of the previous level's characters reach reading mastery.</p>
          <p>Weak characters appear more often in quizzes; mastered ones appear occasionally for review.</p>
        </div>
      </div>

      {/* Feedback */}
      <div className="settings-section">
        <h3 className="settings-section-title"><MessageCircle size={16} /> Feedback</h3>
        <p className="settings-row-desc">
          Found a bug, or something you wish worked differently? Let me know.
        </p>
        <textarea
          className="feedback-textarea"
          placeholder="What's on your mind?"
          value={feedbackText}
          onChange={e => { setFeedbackText(e.target.value); if (feedbackStatus) setFeedbackStatus(null); }}
          rows={4}
        />
        <button
          className="btn btn-primary"
          onClick={handleSendFeedback}
          disabled={!feedbackText.trim() || feedbackStatus === 'sending'}
        >
          {feedbackStatus === 'sending' ? 'Sending…' : 'Send feedback'}
        </button>
        {feedbackStatus === 'sent'  && <p className="feedback-status feedback-status-ok"><Check size={14} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /> Thanks, feedback sent!</p>}
        {feedbackStatus === 'error' && <p className="feedback-status feedback-status-err">Couldn't send that, try again in a bit.</p>}
      </div>

      {/* Reset */}
      <div className="settings-section settings-danger">
        <h3 className="settings-section-title"><AlertTriangle size={16} /> Reset Progress</h3>
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
              <button className="btn btn-danger" onClick={handleReset} disabled={resetting}>
                {resetting ? 'Resetting…' : 'Yes, reset everything'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)} disabled={resetting}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
