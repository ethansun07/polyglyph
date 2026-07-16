import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
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

const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
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

// ── Guest sessions (signed-out usage) ──────────────────────────────────────────
export const pingGuestSession    = (data) => apiFetch('/guests/ping', { method: 'POST', body: JSON.stringify(data) });
export const loadAllGuestSessions = ()    => apiFetch('/guests/all');

// ── Feedback ────────────────────────────────────────────────────────────────────
export const submitFeedback  = (message, anonId) => apiFetch('/feedback', { method: 'POST', body: JSON.stringify({ message, anonId }) });
export const loadAllFeedback = ()                => apiFetch('/feedback/all');

// ── Progress ──────────────────────────────────────────────────────────────────
export const loadMainProgressFromCloud   = ()       => apiFetch('/progress');
export const saveMainProgressToCloud     = (_, data) => apiFetch('/progress', { method: 'PUT', body: JSON.stringify(data) });
export const deleteMainProgressFromCloud = ()       => apiFetch('/progress', { method: 'DELETE' });

export const loadPhraseProgressFromCloud = ()       => apiFetch('/phrase-progress');
export const savePhraseProgressToCloud   = (_, data) => apiFetch('/phrase-progress', { method: 'PUT', body: JSON.stringify(data) });

export const loadNumberProgressFromCloud  = ()       => apiFetch('/number-progress');
export const saveNumberProgressToCloud    = (_, data) => apiFetch('/number-progress',  { method: 'PUT', body: JSON.stringify(data) });

export const loadWritingProgressFromCloud = ()       => apiFetch('/writing-progress');
export const saveWritingProgressFromCloud = (data)   => apiFetch('/writing-progress', { method: 'PUT', body: JSON.stringify(data) });
