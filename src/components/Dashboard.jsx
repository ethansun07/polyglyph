import { Flame, Star, Eye, Target, PenLine, BookOpen, Keyboard } from 'lucide-react';
import { getTotalStats, getHighestUnlockedLevel } from '../utils/progress.js';
import { LEVELS, FIDEL_ROWS } from '../data/fidel.js';

const coreCharCount = FIDEL_ROWS.filter(r => !r.archaic && !r.labiovelar)
  .reduce((sum, r) => sum + r.chars.filter(Boolean).length, 0);
const extCharCount = FIDEL_ROWS.filter(r => r.archaic || r.labiovelar)
  .reduce((sum, r) => sum + r.chars.filter(Boolean).length, 0);
import LevelCard from './LevelCard.jsx';

export default function Dashboard({ progress, onNavigate, onLevelAction }) {
  const stats = getTotalStats(progress);
  const highestUnlocked = getHighestUnlockedLevel(progress);
  const streak = progress.streak?.count || 0;

  const accuracyPct = Math.round(stats.accuracy * 100);

  return (
    <div className="page dashboard-page">
      <div className="dashboard-hero">
        <h1 className="hero-title">Polyglyph</h1>
        <p className="hero-sub">Learn the Ethiopian script, one row at a time.</p>
        <div className="hero-flag-stripe">
          <span /><span /><span />
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon"><Flame size={22} strokeWidth={2.25} /></span>
          <span className="stat-value">{streak}</span>
          <span className="stat-label">Day streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><Star size={22} strokeWidth={2.25} /></span>
          <span className="stat-value">{stats.mastered}</span>
          <span className="stat-label">Mastered</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><Eye size={22} strokeWidth={2.25} /></span>
          <span className="stat-value">{stats.seen}</span>
          <span className="stat-label">Seen</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><Target size={22} strokeWidth={2.25} /></span>
          <span className="stat-value">{stats.seen > 0 ? `${accuracyPct}%` : '—'}</span>
          <span className="stat-label">Accuracy</span>
        </div>
      </div>

      {/* Quick-start buttons */}
      <div className="quickstart">
        <h2 className="section-title">Quick Start</h2>
        <div className="quickstart-btns">
          <button className="btn btn-xl btn-eth-green" onClick={() => onLevelAction('lesson', highestUnlocked)}>
            <span className="btn-xl-label"><Target size={20} strokeWidth={2.25} /> Lesson</span>
            <span className="btn-sub">Level {highestUnlocked}</span>
          </button>
          <button className="btn btn-xl btn-eth-yellow" onClick={() => onNavigate('write', 'quiz')}>
            <span className="btn-xl-label"><PenLine size={20} strokeWidth={2.25} /> Writing Quiz</span>
            <span className="btn-sub">Write from memory</span>
          </button>
          <button className="btn btn-xl btn-eth-red" onClick={() => onNavigate('wordread', 'all')}>
            <span className="btn-xl-label"><BookOpen size={20} strokeWidth={2.25} /> Read Practice</span>
            <span className="btn-sub">Word drill, all levels</span>
          </button>
          <button className="btn btn-xl btn-eth-blue" onClick={() => onNavigate('phrases', 'type')}>
            <span className="btn-xl-label"><Keyboard size={20} strokeWidth={2.25} /> Typing</span>
            <span className="btn-sub">Type in Amharic</span>
          </button>
        </div>
      </div>

      {/* Level cards */}
      <h2 className="section-title">Levels</h2>
      <div className="level-cards-list">
        {LEVELS.map(lvl => (
          <LevelCard
            key={lvl.level}
            levelNum={lvl.level}
            progress={progress}
            onAction={onLevelAction}
          />
        ))}
      </div>

      <div className="dashboard-footer">
        <p>{coreCharCount} core + {extCharCount} extended characters in the Amharic Fidel · {LEVELS.length} levels</p>
      </div>
    </div>
  );
}
