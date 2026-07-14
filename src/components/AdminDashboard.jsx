import { useState, useEffect } from 'react';
import { loadAllUsersWithProgress, loadAllGuestSessions } from '../utils/firebase.js';

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
  return { masteredCount, totalReviews, accuracy, phraseCount, writingCount, streak, highestLevel, joined, lastSeen };
}

function getGuestStats(guest) {
  const joined = guest.first_seen ? new Date(guest.first_seen).toLocaleDateString() : '—';
  const lastSeen = guest.last_seen ? new Date(guest.last_seen).toLocaleDateString() : '—';
  return { joined, lastSeen };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState(null);
  const [guests, setGuests] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadAllUsersWithProgress().catch(() => []),
      loadAllGuestSessions().catch(() => []),
    ]).then(([usersData, guestsData]) => {
      setUsers(usersData);
      setGuests(guestsData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page"><p>Loading users…</p></div>;
  if (!users?.length) return <div className="page"><p>No users yet.</p></div>;

  return (
    <div className="page">
      <section className="admin-section">
        <h2 className="page-title">🛠️ Admin — {users.length} user{users.length !== 1 ? 's' : ''}</h2>
        <p className="admin-section-sub">Signed-in users with saved progress.</p>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Joined</th>
                <th>Level</th>
                <th>Chars ⭐</th>
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
                    <td className="admin-center">{s.joined}</td>
                    <td className="admin-center">Lv {s.highestLevel}</td>
                    <td className="admin-center">{s.masteredCount}</td>
                    <td className="admin-center">{s.accuracy !== null ? `${s.accuracy}%` : '—'}</td>
                    <td className="admin-center">{s.totalReviews > 0 ? s.totalReviews.toLocaleString() : '—'}</td>
                    <td className="admin-center">{s.phraseCount > 0 ? s.phraseCount : '—'}</td>
                    <td className="admin-center">{s.writingCount > 0 ? s.writingCount : '—'}</td>
                    <td className="admin-center">{s.streak > 0 ? `🔥 ${s.streak}` : '—'}</td>
                    <td className="admin-center">{s.lastSeen}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="page-title">👤 Guests — {guests?.length || 0} session{guests?.length !== 1 ? 's' : ''}</h2>
        <p className="admin-section-sub">Signed-out visitors, tracked by browser only.</p>

        {!guests?.length ? <p>No guest sessions yet.</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Anon ID</th>
                  <th>First seen</th>
                  <th>Level</th>
                  <th>Chars seen</th>
                  <th>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {guests.map(guest => {
                  const s = getGuestStats(guest);
                  return (
                    <tr key={guest.anon_id}>
                      <td className="admin-anon-id">{guest.anon_id.slice(0, 8)}</td>
                      <td className="admin-center">{s.joined}</td>
                      <td className="admin-center">Lv {guest.highest_level}</td>
                      <td className="admin-center">{guest.chars_seen}</td>
                      <td className="admin-center">{s.lastSeen}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
