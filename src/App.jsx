import { useState, useEffect, useRef } from 'react';
import { loadProgress, saveProgress, updateStreak, resetProgress } from './utils/progress.js';
import { resetWritingProgress } from './utils/writingProgress.js';
import { resetPhraseProgress } from './utils/phraseProgress.js';
import { resetNumberProgress } from './utils/numberProgress.js';
import {
  auth, onAuthChange, signInAsGuest,
  loadMainProgressFromCloud, saveMainProgressToCloud,
  upsertUserDoc, ADMIN_EMAIL,
} from './utils/firebase.js';
import AuthButton from './components/AuthButton.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Dashboard from './components/Dashboard.jsx';
import LearnMode from './components/LearnMode.jsx';
import QuizMode from './components/QuizMode.jsx';
import FullChart from './components/FullChart.jsx';
import Settings from './components/Settings.jsx';
import WritingPractice from './components/WritingPractice.jsx';
import CommonPhrases from './components/CommonPhrases.jsx';
import EthiopicNumbers from './components/EthiopicNumbers.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import WordReadingExercise from './components/WordReadingExercise.jsx';
import LessonMode from './components/LessonMode.jsx';
import SentenceReader from './components/SentenceReader.jsx';
import { LEVEL_WORDS } from './data/levelWords.js';
import { getHighestUnlockedLevel, isReadModeUnlocked, isLevel7Mastered } from './utils/progress.js';

// Levels 1-6 finish their word drill when the next level unlocks. Level 7 has
// no level 8 to unlock, so it's eligible once level 7 mastery itself is hit.
function isDrillEligible(level, highestUnlocked, progress) {
  return level < highestUnlocked || (level === 7 && isLevel7Mastered(progress));
}

const NAV = [
  { id: 'dashboard', label: 'Home',    icon: '🏠' },
  { id: 'learn',     label: 'Learn',   icon: '📖' },
  { id: 'quiz',      label: 'Quiz',    icon: '❓' },
  { id: 'write',     label: 'Write',   icon: '✏️' },
  { id: 'phrases',   label: 'Phrases', icon: '🗣️' },
  { id: 'read',      label: 'Read',    icon: '📜'  },
  { id: 'numbers',   label: 'Numbers', icon: '፩'  },
  { id: 'chart',     label: 'Chart',   icon: '📊' },
  { id: 'settings',  label: 'Settings',icon: '⚙️' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [learnLevel, setLearnLevel] = useState(null);
  const [quizLevel, setQuizLevel] = useState(null);
  // Streak is deliberately NOT computed here — doing so from local-only data
  // before we know the real auth state let a stale/empty local cache race
  // against onAuthChange's cloud-merged (correct) streak and sometimes win,
  // freezing the count. onAuthChange below is the single source of truth.
  const [progress, setProgress] = useState(() => loadProgress());
  const [user, setUser] = useState(null);
  const [wordDrillLevel, setWordDrillLevel]     = useState(null);
  const [wordDrillScope, setWordDrillScope]     = useState('level');
  const [lessonLevel, setLessonLevel]           = useState(null);
  const [writeInitialMode, setWriteInitialMode] = useState(null);
  const [phrasesInitialMode, setPhrasesInitialMode] = useState(null);
  const prevHighestLevel  = useRef(getHighestUnlockedLevel(progress));
  const pendingDrillLevel = useRef(null);
  // Tracks the previously signed-in uid (or null), so we can tell a real
  // sign-out or a direct switch to a different account (clear everything —
  // this device's cache must not keep re-attaching one account's history to
  // whichever account is active next) apart from the very first load of a
  // guest who's never signed in.
  const prevUid = useRef(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  function showToast(message) {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  // Auth state + cloud sync. Every visitor — guest or not — has a real,
  // permanent Firebase uid: guests are signed in anonymously the instant no
  // session exists, and progress always syncs through that uid. There's no
  // separate "local guest data" to merge in anymore, which is what used to
  // let one account's history leak onto another (see the cross-account data
  // leak incident this replaced).
  useEffect(() => {
    return onAuthChange(async firebaseUser => {
      if (!firebaseUser) {
        // No session at all (very first load, or just signed out) — bootstrap
        // a fresh anonymous identity. The next firing of this callback (with
        // that anonymous user) does the actual sync.
        signInAsGuest().catch(() => {});
        return;
      }

      if (prevUid.current && prevUid.current !== firebaseUser.uid) {
        // Switched to a different identity (sign-out then in, or a direct
        // switch) — this device's cache belongs to whichever account was
        // active before. Clear it so it can't attach to the new one.
        resetProgress();
        resetWritingProgress();
        resetPhraseProgress();
        resetNumberProgress();
      }
      prevUid.current = firebaseUser.uid;
      setUser(firebaseUser);
      upsertUserDoc();

      let cloud = null;
      try {
        cloud = await loadMainProgressFromCloud();
      } catch {
        // backend unreachable — fall back to whatever's cached locally
      }
      // The signed-in identity can change while the fetch above was in
      // flight. If so, this stale response is for the WRONG account —
      // applying it would leak one user's progress onto another's.
      if (auth.currentUser?.uid !== firebaseUser.uid) return;
      const loaded = updateStreak(cloud || loadProgress());
      setProgress(loaded);
      saveProgress(loaded);
      prevHighestLevel.current = getHighestUnlockedLevel(loaded);
    });
  }, []);

  function getSeenDrills() {
    try { return JSON.parse(localStorage.getItem('amharic_word_drills_seen') || '[]'); }
    catch { return []; }
  }

  function markDrillSeen(level) {
    const seen = getSeenDrills();
    if (!seen.includes(level)) {
      localStorage.setItem('amharic_word_drills_seen', JSON.stringify([...seen, level]));
    }
  }

  function handleProgressUpdate(newProgress) {
    const newHighest = getHighestUnlockedLevel(newProgress);
    const prevHighest = prevHighestLevel.current;

    // Persist the high water mark so levels never lock back down
    const toSave = newHighest > (newProgress.highestUnlockedLevel || 1)
      ? { ...newProgress, highestUnlockedLevel: newHighest }
      : newProgress;

    setProgress(toSave);
    saveProgress(toSave); // local cache, for a fast initial render on reload
    saveMainProgressToCloud(toSave).catch(() => {});

    // Levels 1-6 finish their drill when the next level unlocks. Level 7 has
    // no level 8 to unlock, so it triggers off level 7 mastery itself instead.
    const justFinishedLevel = newHighest > prevHighest
      ? prevHighest
      : (!isLevel7Mastered(progress) && isLevel7Mastered(newProgress)) ? 7 : null;

    if (justFinishedLevel && LEVEL_WORDS[justFinishedLevel]) {
      const seen = getSeenDrills();
      if (!seen.includes(justFinishedLevel)) {
        markDrillSeen(justFinishedLevel);
        if (page === 'dashboard') {
          setWordDrillLevel(justFinishedLevel);
        } else {
          pendingDrillLevel.current = justFinishedLevel;
        }
      }
    }
    prevHighestLevel.current = newHighest;
  }

  // Called from Dashboard level cards
  function handleLevelAction(action, levelNum) {
    if (action === 'learn') {
      setLearnLevel(levelNum);
      setPage('learn');
    } else if (action === 'quiz') {
      setQuizLevel(levelNum);
      setPage('quiz');
    } else if (action === 'read') {
      setWordDrillLevel(levelNum);
    } else if (action === 'lesson') {
      setLessonLevel(levelNum);
      setPage('lesson');
    }
  }

  function navigate(newPage, initialMode = null) {
    if (newPage !== 'learn')   setLearnLevel(null);
    if (newPage !== 'quiz')    setQuizLevel(null);
    if (newPage !== 'lesson')  setLessonLevel(null);
    setPage(newPage);

    if (newPage === 'write')   setWriteInitialMode(initialMode);
    if (newPage === 'phrases') setPhrasesInitialMode(initialMode);
    if (newPage === 'wordread') {
      const highestUnlocked = getHighestUnlockedLevel(progress);
      setPage('dashboard');
      if (initialMode === 'all') {
        // Quick Start: jump straight into an all-levels drill covering every unlocked level.
        const lvl = Object.keys(LEVEL_WORDS).map(Number).filter(l => isDrillEligible(l, highestUnlocked, progress)).pop();
        if (lvl) { setWordDrillLevel(lvl); setWordDrillScope('all'); }
        else showToast('📖 Finish Level 1 to unlock Read Practice');
        return;
      }
      const seenDrills = getSeenDrills();
      const lvl = Object.keys(LEVEL_WORDS).map(Number).find(l => isDrillEligible(l, highestUnlocked, progress) && !seenDrills.includes(l));
      if (lvl) { setWordDrillLevel(lvl); setWordDrillScope('level'); }
      else showToast('📖 Finish a level to unlock its Read Practice drill');
      return;
    }

    if (newPage === 'dashboard') {
      if (pendingDrillLevel.current) {
        setWordDrillLevel(pendingDrillLevel.current);
        pendingDrillLevel.current = null;
      }
    } else if (wordDrillLevel) {
      // Navigating away mid-drill — preserve it for when user returns to dashboard
      pendingDrillLevel.current = wordDrillLevel;
      setWordDrillLevel(null);
    }
  }

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard
            progress={progress}
            onNavigate={navigate}
            onLevelAction={handleLevelAction}
          />
        );
      case 'learn':
        return (
          <LearnMode
            key={learnLevel}
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
            initialLevel={learnLevel}
          />
        );
      case 'quiz':
        return (
          <QuizMode
            key={quizLevel}
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
            initialLevel={quizLevel}
            onDone={() => navigate('dashboard')}
          />
        );
      case 'lesson':
        return (
          <LessonMode
            key={lessonLevel}
            level={lessonLevel}
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
            onDone={() => navigate('dashboard')}
          />
        );
      case 'read':
        return <SentenceReader progress={progress} onProgressUpdate={handleProgressUpdate} />;
      case 'write':
        return <WritingPractice key={writeInitialMode} progress={progress} initialMode={writeInitialMode || 'copy'} />;
      case 'phrases':
        return <CommonPhrases key={phrasesInitialMode} progress={progress} initialMode={phrasesInitialMode || 'browse'} onProgressUpdate={handleProgressUpdate} />;
      case 'numbers':
        return (
          <EthiopicNumbers settings={progress.settings} />
        );
      case 'chart':
        return <FullChart progress={progress} />;
      case 'settings':
        return (
          <Settings
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
            user={user}
          />
        );
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Dashboard progress={progress} onNavigate={navigate} onLevelAction={handleLevelAction} />;
    }
  }

  const streak = progress.streak?.count || 0;
  const readUnlocked = isReadModeUnlocked(progress);

  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-brand">
          <span className="header-flag">🇪🇹</span>
          <span className="header-title">Polyglyph</span>
        </div>
        <div className="header-right">
          {streak > 0 && <div className="header-streak">🔥 {streak}</div>}
          <AuthButton user={user} />
        </div>
      </header>

      {/* ── Nav bar ── */}
      <nav className="app-nav">
        {NAV.map(item => {
          const isReadLocked = item.id === 'read' && !readUnlocked;
          return (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'nav-active' : ''} ${isReadLocked ? 'nav-locked' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon-wrap">
                <span className="nav-icon">{isReadLocked ? '🔒' : item.icon}</span>
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
        {user?.email === ADMIN_EMAIL && (
          <button
            className={`nav-item ${page === 'admin' ? 'nav-active' : ''}`}
            onClick={() => navigate('admin')}
          >
            <span className="nav-icon">🛠️</span>
            <span className="nav-label">Admin</span>
          </button>
        )}
      </nav>

      {/* ── Page content ── */}
      <main className="app-main">
        <ErrorBoundary key={page}>
          {renderPage()}
        </ErrorBoundary>
      </main>

      {/* ── Word reading drill modal — only on dashboard, never mid-lesson/quiz ── */}
      {wordDrillLevel && LEVEL_WORDS[wordDrillLevel] && page === 'dashboard' && (
        <WordReadingExercise
          level={wordDrillLevel}
          words={LEVEL_WORDS[wordDrillLevel]}
          allWords={Object.entries(LEVEL_WORDS)
            .filter(([l]) => Number(l) <= getHighestUnlockedLevel(progress))
            .flatMap(([, ws]) => ws)}
          audioEnabled={progress.settings?.audioEnabled}
          initialScope={wordDrillScope}
          onClose={() => { setWordDrillLevel(null); setWordDrillScope('level'); }}
        />
      )}
    </div>
  );
}
