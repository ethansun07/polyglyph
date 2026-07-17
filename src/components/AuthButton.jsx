import { signInWithGoogle, signOutUser } from '../utils/firebase.js';

export default function AuthButton({ user }) {
  if (!user || user.isAnonymous) {
    return (
      <button className="auth-signin-btn" onClick={signInWithGoogle}>
        Sign in
      </button>
    );
  }
  // Firebase only backfills the top-level displayName/photoURL onto a user
  // record when that account is first created — an account that ended up
  // signed into later via the credential-already-in-use fallback (see
  // signInWithGoogle) can have those come back null even though the Google
  // account genuinely has a name/photo. providerData reflects the linked
  // Google provider's info directly, so fall back to it.
  const google = user.providerData?.find(p => p.providerId === 'google.com');
  const displayName = user.displayName || google?.displayName;
  const photoURL = user.photoURL || google?.photoURL;

  return (
    <div className="auth-user-pill">
      {photoURL && (
        <img src={photoURL} className="auth-avatar" alt="" referrerPolicy="no-referrer" />
      )}
      <span className="auth-display-name">{displayName?.split(' ')[0]}</span>
      <button className="auth-signout-btn" onClick={signOutUser}>Sign out</button>
    </div>
  );
}
