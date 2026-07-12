import { useState, useEffect, useRef } from 'react';
import { loadProgress, saveProgress, updateStreak, makeDefaultProgress, mergeProgress } from './utils/progress.js';
import {
  onAuthChange,
  loadMainProgressFromCloud, saveMainProgressToCloud,
  upsertUserDoc, ADMIN_EMAIL,
} from './utils/firebase.js';
import AuthButton from './components/AuthButton.jsx';
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
  const [progress, setProgress] = useState(() => {
    const p = loadProgress();
    return updateStreak(p);
  });
  const [user, setUser] = useState(null);
  const [wordDrillLevel, setWordDrillLevel]     = useState(null);
  const [wordDrillScope, setWordDrillScope]     = useState('level');
  const [lessonLevel, setLessonLevel]           = useState(null);
  const [writeInitialMode, setWriteInitialMode] = useState(null);
  const [phrasesInitialMode, setPhrasesInitialMode] = useState(null);
  const prevHighestLevel  = useRef(getHighestUnlockedLevel(progress));
  const pendingDrillLevel = useRef(null);

  // Persist streak update on mount
  useEffect(() => {
    saveProgress(progress);
  }, []); // eslint-disable-line

  // Auth state + cloud sync on login
  useEffect(() => {
    return onAuthChange(async firebaseUser => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        // Signed out — reset UI; localStorage untouched (guest progress stays)
        setProgress(makeDefaultProgress());
        return;
      }

      upsertUserDoc(firebaseUser.uid, {
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        lastSeen: new Date().toISOString(),
      });

      // Merge cloud with local cache — a stale or unreachable cloud must never
      // clobber more-advanced progress sitting in this browser (see localStorage
      // rescue incident: backend was silently unreachable for weeks, so cloud
      // was returning a snapshot from before that outage started).
      let cloud = null;
      try {
        cloud = await loadMainProgressFromCloud(firebaseUser.uid);
      } catch {
        // backend unreachable on sign-in — fall back to local cache below
      }
      const local = loadProgress();
      const loaded = updateStreak(mergeProgress(local, cloud));
      setProgress(loaded);
      saveProgress(loaded);
      prevHighestLevel.current = getHighestUnlockedLevel(loaded);
      saveMainProgressToCloud(firebaseUser.uid, loaded).catch(() => {});
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
    saveProgress(toSave); // always cache locally, signed-in or not
    if (user) {
      saveMainProgressToCloud(user.uid, toSave).catch(() => {});
    }

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

    if (newPage === 'write')   { setWriteInitialMode(initialMode);   localStorage.setItem('amharic_write_visited', '1'); }
    if (newPage === 'phrases') { setPhrasesInitialMode(initialMode); localStorage.setItem('amharic_phrases_visited', '1'); }
    if (newPage === 'wordread') {
      const highestUnlocked = getHighestUnlockedLevel(progress);
      if (initialMode === 'all') {
        // Quick Start: jump straight into an all-levels drill covering every unlocked level.
        const lvl = Object.keys(LEVEL_WORDS).map(Number).filter(l => isDrillEligible(l, highestUnlocked, progress)).pop();
        if (lvl) { setWordDrillLevel(lvl); setWordDrillScope('all'); setPage('dashboard'); }
        return;
      }
      const seenDrills = getSeenDrills();
      const lvl = Object.keys(LEVEL_WORDS).map(Number).find(l => isDrillEligible(l, highestUnlocked, progress) && !seenDrills.includes(l));
      if (lvl) { setWordDrillLevel(lvl); setWordDrillScope('level'); setPage('dashboard'); }
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

  function computeBadges() {
    const highestUnlocked = getHighestUnlockedLevel(progress);
    const hasSeen = Object.values(progress.chars || {}).some(c => c.seen > 0);
    const seenDrills = getSeenDrills();
    const readPending = Object.keys(LEVEL_WORDS).some(lvl => {
      const l = Number(lvl);
      return isDrillEligible(l, highestUnlocked, progress) && !seenDrills.includes(l);
    });
    return {
      write:     hasSeen && !localStorage.getItem('amharic_write_visited'),
      wordDrill: readPending, // Dashboard "new word drill" nudge — independent of Read mode's own unlock state
      read:      readPending && isReadModeUnlocked(progress), // 📜 Read nav-tab dot — only meaningful once that page is actually unlocked
      phrases:   hasSeen && !localStorage.getItem('amharic_phrases_visited'),
    };
  }

  const badges = computeBadges();

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard
            progress={progress}
            onNavigate={navigate}
            onLevelAction={handleLevelAction}
            badges={badges}
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
                {badges[item.id] && <span className="nav-dot" />}
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
        {renderPage()}
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
