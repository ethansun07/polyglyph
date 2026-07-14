import { useState, useRef } from 'react';
import { SENTENCES, DIALOGUES, CONNECTOR_NOTE } from '../data/readingSentences.js';
import { isReadModeUnlocked, isLevel7Mastered } from '../utils/progress.js';
import { auth, ADMIN_EMAIL } from '../utils/firebase.js';
import { PUNCTUATION } from '../data/fidel.js';
import { playSentenceAudio, playDialogueLineAudio } from '../utils/audio.js';

// ─── Read-seen tracking (local only, mirrors phrase browse-seen) ─────────────
const READ_SEEN_KEY = 'amharic_read_seen_v1';

function loadReadSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_SEEN_KEY) || '[]'));
  } catch { return new Set(); }
}

function markReadSeen(id, currentSet) {
  if (currentSet.has(id)) return currentSet;
  const next = new Set(currentSet);
  next.add(id);
  localStorage.setItem(READ_SEEN_KEY, JSON.stringify([...next]));
  return next;
}

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
function SentenceCard({ sentence, settings, read, onRead }) {
  const [revealed, setRevealed]   = useState(new Set());
  const [showMeaning, setMeaning] = useState(false);

  function toggleWord(i) {
    onRead();
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  const anyRevealed = revealed.size > 0 || showMeaning;

  return (
    <div className={`sentence-card ${read ? 'read-card-seen' : ''}`}>
      {read && <span className="read-seen-check" title="Already read">✓</span>}
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
          onClick={() => { onRead(); setMeaning(m => !m); }}
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
function DialogueCard({ dialogue, settings, read, onRead }) {
  const [revealed, setRevealed] = useState(new Set());
  const [showAll, setShowAll]   = useState(false);

  function toggleLine(i) {
    onRead();
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  const anyRevealed = revealed.size > 0 || showAll;

  return (
    <div className={`dialogue-card ${read ? 'read-card-seen' : ''}`}>
      {read && <span className="read-seen-check" title="Already read">✓</span>}
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
          onClick={() => { onRead(); setShowAll(a => !a); }}
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
  const [readSeen, setReadSeen] = useState(() => loadReadSeen());
  const unlocked = isReadModeUnlocked(progress);
  const isAdmin  = auth.currentUser?.email === ADMIN_EMAIL;

  function markRead(id) {
    setReadSeen(prev => markReadSeen(id, prev));
  }

  const sentencesReadCount = SENTENCES.filter(s => readSeen.has(s.id)).length;
  const dialoguesReadCount = DIALOGUES.filter(d => readSeen.has(d.id)).length;

  const cardRefs = useRef(new Map());

  function scrollToFirstUnread(list) {
    const target = list.find(item => !readSeen.has(item.id));
    if (!target) return;
    cardRefs.current.get(target.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

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
        >Sentences ({sentencesReadCount}/{SENTENCES.length})</button>
        <button
          className={`writing-mode-tab ${tab === 'dialogues' ? 'active' : ''}`}
          onClick={() => setTab('dialogues')}
        >Dialogues ({dialoguesReadCount}/{DIALOGUES.length})</button>
      </div>

      {tab === 'sentences' && (
        <>
          {sentencesReadCount < SENTENCES.length && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginBottom: '0.75rem' }}
              onClick={() => scrollToFirstUnread(SENTENCES)}
            >Continue → (skip to next unread)</button>
          )}
          <div className="sentence-list">
            {SENTENCES.map(s => (
              <div key={s.id} ref={el => { if (el) cardRefs.current.set(s.id, el); }}>
                <SentenceCard
                  sentence={s}
                  settings={progress.settings}
                  read={readSeen.has(s.id)}
                  onRead={() => markRead(s.id)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'dialogues' && (
        <>
          {dialoguesReadCount < DIALOGUES.length && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginBottom: '0.75rem' }}
              onClick={() => scrollToFirstUnread(DIALOGUES)}
            >Continue → (skip to next unread)</button>
          )}
          <div className="dialogue-list">
            {DIALOGUES.map(d => (
              <div key={d.id} ref={el => { if (el) cardRefs.current.set(d.id, el); }}>
                <DialogueCard
                  dialogue={d}
                  settings={progress.settings}
                  read={readSeen.has(d.id)}
                  onRead={() => markRead(d.id)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
