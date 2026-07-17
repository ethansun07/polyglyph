import { useState, useEffect } from 'react';
import { Wrench, Users, MessageCircle, Flame, Star } from 'lucide-react';
import { loadAllUsersWithProgress, loadAllFeedback } from '../utils/firebase.js';

function getStats(user) {
  const masteredCount  = Number(user.mastered_chars)  || 0;
  const totalReviews   = Number(user.total_reviews)   || 0;
  const totalCorrect   = Number(user.total_correct)   || 0;
  const totalWrong     = Number(user.total_wrong)     || 0;
  const phraseCount    = Number(user.phrases_seen)    || 0;
  const writingCount   = Number(user.writing_chars)   || 0;
  const streak         = Number(user.streak_count)    || 0;
  const accuracy       = (totalCorrect + totalWrong) > 0
    ? Math.round(100 * totalCorrect / (totalCorrect + totalWrong))
    : null;
  const highestLevel   = Math.min(8, Math.floor(masteredCount / 30) + 1);
  const joined         = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : '—';
  const lastSeen       = user.last_seen
    ? new Date(user.last_seen).toLocaleDateString()
    : '—';
  const location       = user.city && user.country
    ? `${user.city}, ${user.country}`
    : user.country || '—';
  return { masteredCount, totalReviews, accuracy, phraseCount, writingCount, streak, highestLevel, joined, lastSeen, location };
}

export default function AdminDashboard() {
  const [allUsers, setAllUsers] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadAllUsersWithProgress().catch(() => []),
      loadAllFeedback().catch(() => []),
    ]).then(([usersData, feedbackData]) => {
      setAllUsers(usersData);
      setFeedback(feedbackData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page"><p>Loading users…</p></div>;
  if (!allUsers?.length) return <div className="page"><p>No users yet.</p></div>;

  // Guests are real anonymous Firebase accounts now, not a separate ping
  // system — same table, just split by is_anonymous.
  const users  = allUsers.filter(u => !u.is_anonymous);
  const guests = allUsers.filter(u => u.is_anonymous);

  return (
    <div className="page">
      <section className="admin-section">
        <h2 className="page-title"><Wrench size={22} className="page-title-icon" /> Admin — {users.length} user{users.length !== 1 ? 's' : ''}</h2>
        <p className="admin-section-sub">Signed-in users with saved progress.</p>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Location</th>
                <th>Joined</th>
                <th>Level</th>
                <th>Chars <Star size={12} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /></th>
                <th>Accuracy</th>
                <th>Reviews</th>
                <th>Phrases</th>
                <th>Writing</th>
                <th>Streak</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const s = getStats(user);
                return (
                  <tr key={user.uid}>
                    <td className="admin-user-cell">
                      <div>
                        <div className="admin-name">{user.display_name || '—'}</div>
                        <div className="admin-email">{user.email || '—'}</div>
                      </div>
                    </td>
                    <td className="admin-center">{s.location}</td>
                    <td className="admin-center">{s.joined}</td>
                    <td className="admin-center">Lv {s.highestLevel}</td>
                    <td className="admin-center">{s.masteredCount}</td>
                    <td className="admin-center">{s.accuracy !== null ? `${s.accuracy}%` : '—'}</td>
                    <td className="admin-center">{s.totalReviews > 0 ? s.totalReviews.toLocaleString() : '—'}</td>
                    <td className="admin-center">{s.phraseCount > 0 ? s.phraseCount : '—'}</td>
                    <td className="admin-center">{s.writingCount > 0 ? s.writingCount : '—'}</td>
                    <td className="admin-center">{s.streak > 0 ? <><Flame size={14} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /> {s.streak}</> : '—'}</td>
                    <td className="admin-center">{s.lastSeen}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="page-title"><Users size={22} className="page-title-icon" /> Guests — {guests.length} session{guests.length !== 1 ? 's' : ''}</h2>
        <p className="admin-section-sub">Anonymous accounts (real, backend-tracked) that just never signed in with Google.</p>

        {!guests.length ? <p>No guest sessions yet.</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Anon ID</th>
                  <th>Location</th>
                  <th>Joined</th>
                  <th>Level</th>
                  <th>Chars <Star size={12} strokeWidth={2.25} style={{ verticalAlign: 'middle' }} /></th>
                  <th>Reviews</th>
                  <th>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {guests.map(guest => {
                  const s = getStats(guest);
                  return (
                    <tr key={guest.uid}>
                      <td className="admin-anon-id">{guest.uid.slice(0, 8)}</td>
                      <td className="admin-center">{s.location}</td>
                      <td className="admin-center">{s.joined}</td>
                      <td className="admin-center">Lv {s.highestLevel}</td>
                      <td className="admin-center">{s.masteredCount}</td>
                      <td className="admin-center">{s.totalReviews > 0 ? s.totalReviews.toLocaleString() : '—'}</td>
                      <td className="admin-center">{s.lastSeen}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section">
        <h2 className="page-title"><MessageCircle size={22} className="page-title-icon" /> Feedback — {feedback?.length || 0} submission{feedback?.length !== 1 ? 's' : ''}</h2>
        <p className="admin-section-sub">From the Settings page, guests and signed-in users alike.</p>

        {!feedback?.length ? <p>No feedback yet.</p> : (
          <div className="admin-feedback-list">
            {feedback.map(f => (
              <div key={f.id} className="admin-feedback-card">
                <p className="admin-feedback-message">{f.message}</p>
                <div className="admin-feedback-meta">
                  <span>{f.display_name || f.email || (f.anon_id ? `guest ${f.anon_id.slice(0, 8)}` : 'guest')}</span>
                  <span>{new Date(f.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
