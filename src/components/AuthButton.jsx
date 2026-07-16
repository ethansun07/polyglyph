import { signInWithGoogle, signOutUser } from '../utils/firebase.js';

export default function AuthButton({ user }) {
  if (!user || user.isAnonymous) {
    return (
      <button className="auth-signin-btn" onClick={signInWithGoogle}>
        Sign in
      </button>
    );
  }
  return (
    <div className="auth-user-pill">
      {user.photoURL && (
        <img src={user.photoURL} className="auth-avatar" alt="" referrerPolicy="no-referrer" />
      )}
      <span className="auth-display-name">{user.displayName?.split(' ')[0]}</span>
      <button className="auth-signout-btn" onClick={signOutUser}>Sign out</button>
    </div>
  );
}
