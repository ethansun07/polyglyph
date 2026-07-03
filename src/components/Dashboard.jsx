import { getTotalStats, getHighestUnlockedLevel, getDueCount } from '../utils/progress.js';
import { LEVELS, FIDEL_ROWS } from '../data/fidel.js';

const coreCharCount = FIDEL_ROWS.filter(r => !r.archaic && !r.labiovelar)
  .reduce((sum, r) => sum + r.chars.filter(Boolean).length, 0);
const extCharCount = FIDEL_ROWS.filter(r => r.archaic || r.labiovelar)
  .reduce((sum, r) => sum + r.chars.filter(Boolean).length, 0);
import LevelCard from './LevelCard.jsx';

export default function Dashboard({ progress, onNavigate, onLevelAction, badges = {} }) {
  const stats = getTotalStats(progress);
  const highestUnlocked = getHighestUnlockedLevel(progress);
  const streak = progress.streak?.count || 0;
  const dueCount = getDueCount(progress);

  const accuracyPct = Math.round(stats.accuracy * 100);

  return (
    <div className="page dashboard-page">
      <div className="dashboard-hero">
        <h1 className="hero-title">🇪🇹 Polyglyph</h1>
        <p className="hero-sub">Learn the Ethiopian script, one row at a time.</p>
        <div className="hero-flag-stripe">
          <span /><span /><span />
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{streak}</span>
          <span className="stat-label">Day streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <span className="stat-value">{stats.mastered}</span>
          <span className="stat-label">Mastered</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">👁️</span>
          <span className="stat-value">{stats.seen}</span>
          <span className="stat-label">Seen</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">{stats.seen > 0 ? `${accuracyPct}%` : '—'}</span>
          <span className="stat-label">Accuracy</span>
        </div>
      </div>

      {/* Quick-start buttons */}
      <div className="quickstart">
        <h2 className="section-title">Quick Start</h2>
        <div className="quickstart-btns">
          <button className="btn btn-xl btn-eth-green" onClick={() => onLevelAction('lesson', highestUnlocked)}>
            🎯 Lesson
            <span className="btn-sub">Level {highestUnlocked}</span>
          </button>
          <button className="btn btn-xl btn-eth-yellow" onClick={() => onNavigate('write', 'quiz')}>
            ✏️ Writing Quiz
            <span className="btn-sub">Write from memory</span>
          </button>
          <button className="btn btn-xl btn-eth-red" onClick={() => onNavigate('wordread', 'all')}>
            📖 Read Practice
            <span className="btn-sub">Word drill, all levels</span>
          </button>
          <button className="btn btn-xl btn-eth-blue" onClick={() => onNavigate('phrases', 'type')}>
            ⌨️ Typing
            <span className="btn-sub">Type in Amharic</span>
          </button>
        </div>
      </div>

      {/* Nudge cards */}
      {(badges.write || badges.read || badges.phrases) && (
        <div className="nudge-cards">
          {badges.write && (
            <button className="nudge-card" onClick={() => onNavigate('write')}>
              <span className="nudge-icon">✏️</span>
              <span className="nudge-text">
                <strong>Try writing practice</strong>
                <span>Reinforce characters by drawing them</span>
              </span>
              <span className="nudge-arrow">→</span>
            </button>
          )}
          {badges.read && (
            <button className="nudge-card" onClick={() => onNavigate('wordread')}>
              <span className="nudge-icon">📖</span>
              <span className="nudge-text">
                <strong>New word drill</strong>
                <span>Practice recognising full Amharic words</span>
              </span>
              <span className="nudge-arrow">→</span>
            </button>
          )}
          {badges.phrases && (
            <button className="nudge-card" onClick={() => onNavigate('phrases')}>
              <span className="nudge-icon">🗣️</span>
              <span className="nudge-text">
                <strong>Explore common phrases</strong>
                <span>Learn everyday Amharic expressions</span>
              </span>
              <span className="nudge-arrow">→</span>
            </button>
          )}
        </div>
      )}

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
