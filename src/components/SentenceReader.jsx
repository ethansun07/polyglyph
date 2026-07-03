import { useState } from 'react';
import { SENTENCES, DIALOGUES, CONNECTOR_NOTE } from '../data/readingSentences.js';
import { isReadModeUnlocked, isLevel7Mastered } from '../utils/progress.js';
import { auth, ADMIN_EMAIL } from '../utils/firebase.js';
import { PUNCTUATION } from '../data/fidel.js';
import { playSentenceAudio, playDialogueLineAudio } from '../utils/audio.js';

// ─── Grammar Note (collapsible) ───────────────────────────────────────────────
function GrammarNote() {
  const [open, setOpen] = useState(false);
  return (
    <div className="grammar-note">
      <button className="grammar-note-toggle" onClick={() => setOpen(o => !o)}>
        {CONNECTOR_NOTE.title} {open ? '▲' : '▼'}
      </button>
      {open && (
        <ul className="grammar-note-body">
          {CONNECTOR_NOTE.body.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Punctuation Note (collapsible) ──────────────────────────────────────────
function PunctuationNote() {
  const [open, setOpen] = useState(false);
  return (
    <div className="grammar-note">
      <button className="grammar-note-toggle" onClick={() => setOpen(o => !o)}>
        ፣ Punctuation {open ? '▲' : '▼'}
      </button>
      {open && (
        <ul className="grammar-note-body">
          {PUNCTUATION.map(p => (
            <li key={p.char}>
              <span style={{ fontFamily: 'serif', fontSize: '1.1em', marginRight: '0.4em' }}>{p.char}</span>
              <strong>{p.name}</strong> — {p.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Individual Sentence Card (word-by-word reveal) ───────────────────────────
function SentenceCard({ sentence, settings }) {
  const [revealed, setRevealed]   = useState(new Set());
  const [showMeaning, setMeaning] = useState(false);

  function toggleWord(i) {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  const anyRevealed = revealed.size > 0 || showMeaning;

  return (
    <div className="sentence-card">
      <div className="sentence-words">
        {sentence.words.map((word, i) => {
          const isOpen = revealed.has(i);
          return (
            <button
              key={i}
              className={`sentence-word-btn ${isOpen ? 'word-open' : ''}`}
              onClick={() => toggleWord(i)}
            >
              <span className="sentence-word-amharic">{word.amharic}</span>
              {isOpen && <span className="sentence-word-meaning">{word.meaning}</span>}
            </button>
          );
        })}
      </div>

      {showMeaning && (
        <div className="sentence-full-meaning">{sentence.meaning}</div>
      )}

      <div className="sentence-card-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setMeaning(m => !m)}
        >
          {showMeaning ? 'Hide translation' : 'Show translation'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => playSentenceAudio(sentence, settings)}
          title="Play audio"
        >🔊</button>
        {anyRevealed && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setRevealed(new Set()); setMeaning(false); }}
          >Reset</button>
        )}
      </div>
    </div>
  );
}

// ─── Dialogue Card (line-by-line reveal, chat-bubble style) ──────────────────
function DialogueCard({ dialogue, settings }) {
  const [revealed, setRevealed] = useState(new Set());
  const [showAll, setShowAll]   = useState(false);

  function toggleLine(i) {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  const anyRevealed = revealed.size > 0 || showAll;

  return (
    <div className="dialogue-card">
      <div className="dialogue-card-title">
        <span className="para-title-amharic">{dialogue.title}</span>
        <span className="para-title-meaning">{dialogue.titleMeaning}</span>
      </div>

      <div className="dialogue-lines">
        {dialogue.lines.map((line, i) => {
          const isOpen = showAll || revealed.has(i);
          return (
            <div key={i} className={`dialogue-line dialogue-line-${line.speaker.toLowerCase()}`}>
              <span className="dialogue-speaker">{line.speaker}</span>
              <div className="dialogue-bubble-wrap">
                <button
                  className={`dialogue-bubble ${isOpen ? 'bubble-open' : ''}`}
                  onClick={() => toggleLine(i)}
                >
                  <span className="dialogue-amharic">{line.amharic}</span>
                  {isOpen && <span className="dialogue-translation">{line.meaning}</span>}
                </button>
                <button
                  className="btn btn-ghost btn-sm dialogue-audio-btn"
                  onClick={() => playDialogueLineAudio(dialogue.id, i, line.amharic, settings)}
                  title="Play audio"
                >🔊</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sentence-card-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowAll(a => !a)}
        >
          {showAll ? 'Hide all translations' : 'Show all translations'}
        </button>
        {anyRevealed && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setRevealed(new Set()); setShowAll(false); }}
          >Reset</button>
        )}
      </div>
    </div>
  );
}

// ─── Locked Screen ────────────────────────────────────────────────────────────
function LockedScreen({ progress, onAdminUnlock }) {
  const isAdmin      = auth.currentUser?.email === ADMIN_EMAIL;
  const level7Done   = isLevel7Mastered(progress);
  const testDone     = !!progress.phraseTestPassed;

  return (
    <div className="read-locked">
      <div className="read-locked-icon">🔒</div>
      <h3 className="read-locked-title">Read Mode Locked</h3>
      <p className="read-locked-sub">Complete both steps to unlock:</p>

      <ul className="read-locked-checklist">
        <li className={level7Done ? 'check-done' : 'check-todo'}>
          {level7Done ? '✓' : '○'} Master all Level 7 characters (85% threshold)
        </li>
        <li className={testDone ? 'check-done' : 'check-todo'}>
          {testDone ? '✓' : '○'} Pass the Common Phrases final test (85% score)
        </li>
      </ul>

      {!testDone && (
        <p className="read-locked-hint">
          Head to 🗣️ Phrases → browse all phrases → take the Final Test.
        </p>
      )}

      {isAdmin && (
        <button className="btn btn-secondary read-admin-unlock" onClick={onAdminUnlock}>
          🛠 Admin: unlock now
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SentenceReader({ progress, onProgressUpdate }) {
  const [tab, setTab] = useState('sentences');
  const unlocked = isReadModeUnlocked(progress);
  const isAdmin  = auth.currentUser?.email === ADMIN_EMAIL;

  function handleAdminUnlock() {
    if (onProgressUpdate) {
      onProgressUpdate({ ...progress, readUnlockedByAdmin: true });
    }
  }

  function handleAdminRelock() {
    if (onProgressUpdate) {
      onProgressUpdate({ ...progress, readUnlockedByAdmin: false });
    }
  }

  if (!unlocked) {
    return (
      <div className="page">
        <h2 className="page-title">📜 Read</h2>
        <LockedScreen progress={progress} onAdminUnlock={handleAdminUnlock} />
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="page-title">📜 Read</h2>
      <p className="page-sub">
        Tap any word or sentence to reveal its meaning. Try reading aloud first.
      </p>

      {isAdmin && progress.readUnlockedByAdmin && (
        <button className="btn btn-secondary read-admin-unlock" onClick={handleAdminRelock}>
          🛠 Admin: relock Read mode
        </button>
      )}

      <GrammarNote />
      <PunctuationNote />

      <div className="writing-mode-tabs" style={{ marginBottom: '1rem' }}>
        <button
          className={`writing-mode-tab ${tab === 'sentences' ? 'active' : ''}`}
          onClick={() => setTab('sentences')}
        >Sentences</button>
        <button
          className={`writing-mode-tab ${tab === 'dialogues' ? 'active' : ''}`}
          onClick={() => setTab('dialogues')}
        >Dialogues</button>
      </div>

      {tab === 'sentences' && (
        <div className="sentence-list">
          {SENTENCES.map(s => (
            <SentenceCard key={s.id} sentence={s} settings={progress.settings} />
          ))}
        </div>
      )}

      {tab === 'dialogues' && (
        <div className="dialogue-list">
          {DIALOGUES.map(d => (
            <DialogueCard key={d.id} dialogue={d} settings={progress.settings} />
          ))}
        </div>
      )}
    </div>
  );
}
