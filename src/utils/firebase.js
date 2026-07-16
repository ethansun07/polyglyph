import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  signInAnonymously, linkWithPopup,
  signOut, onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyAp1t8bisFVxFm6no6u_3VcTG_V0SIj640',
  authDomain:        'amharic-fidel.firebaseapp.com',
  projectId:         'amharic-fidel',
  storageBucket:     'amharic-fidel.firebasestorage.app',
  messagingSenderId: '519826179599',
  appId:             '1:519826179599:web:65f10230cd69500675c57a',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// A "guest" is a real anonymous Firebase user from the moment the app loads —
// every visitor has a permanent, backend-tracked uid. Signing in with Google
// upgrades that same identity in place (see signInWithGoogle below) rather
// than creating a separate account that needs merging later.
export function signInAsGuest() {
  return signInAnonymously(auth);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  if (auth.currentUser?.isAnonymous) {
    try {
      return await linkWithPopup(auth.currentUser, provider);
    } catch (err) {
      if (err.code === 'auth/credential-already-in-use') {
        // This Google account already has its own history elsewhere —
        // sign into that existing account instead of forcing a merge.
        return signInWithPopup(auth, provider);
      }
      throw err;
    }
  }
  return signInWithPopup(auth, provider);
}

export function signOutUser() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── API helper ────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function apiFetch(path, options = {}) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── User ──────────────────────────────────────────────────────────────────────
export const ADMIN_EMAIL = 'ethansun2018@gmail.com';

export function upsertUserDoc() {
  return apiFetch('/users/me', { method: 'POST' });
}

export function loadAllUsersWithProgress() {
  return apiFetch('/users/all');
}

// ── Feedback ────────────────────────────────────────────────────────────────────
export const submitFeedback  = (message) => apiFetch('/feedback', { method: 'POST', body: JSON.stringify({ message }) });
export const loadAllFeedback = ()        => apiFetch('/feedback/all');

// ── Progress ──────────────────────────────────────────────────────────────────
// uid is never passed explicitly — the server derives it from the verified
// auth token, so every call here always acts on whoever's currently signed
// in (guest or not).
export const loadMainProgressFromCloud   = ()     => apiFetch('/progress');
export const saveMainProgressToCloud     = (data) => apiFetch('/progress', { method: 'PUT', body: JSON.stringify(data) });
export const deleteMainProgressFromCloud = ()     => apiFetch('/progress', { method: 'DELETE' });

export const loadPhraseProgressFromCloud = ()     => apiFetch('/phrase-progress');
export const savePhraseProgressToCloud   = (data) => apiFetch('/phrase-progress', { method: 'PUT', body: JSON.stringify(data) });

export const loadNumberProgressFromCloud  = ()     => apiFetch('/number-progress');
export const saveNumberProgressToCloud    = (data) => apiFetch('/number-progress',  { method: 'PUT', body: JSON.stringify(data) });

export const loadWritingProgressFromCloud = ()     => apiFetch('/writing-progress');
export const saveWritingProgressFromCloud = (data) => apiFetch('/writing-progress', { method: 'PUT', body: JSON.stringify(data) });
