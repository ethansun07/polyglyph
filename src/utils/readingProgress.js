const READING_KEY = 'amharic_reading_v1';

// { [itemId]: { read: bool, bookmarked: bool } } — itemId is a sentence or
// dialogue id from readingSentences.js. Both flags live on the same record
// since they're both just a user's relationship to one reading item.

export function loadReadingProgress() {
  try {
    const raw = localStorage.getItem(READING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveReadingProgress(p) {
  localStorage.setItem(READING_KEY, JSON.stringify(p));
}

export function resetReadingProgress() {
  localStorage.removeItem(READING_KEY);
}

export function isRead(progress, itemId) {
  return !!progress[itemId]?.read;
}

export function isBookmarked(progress, itemId) {
  return !!progress[itemId]?.bookmarked;
}

export function markRead(progress, itemId) {
  if (isRead(progress, itemId)) return progress;
  return {
    ...progress,
    [itemId]: { bookmarked: false, ...progress[itemId], read: true },
  };
}

export function toggleBookmark(progress, itemId) {
  return {
    ...progress,
    [itemId]: { read: false, ...progress[itemId], bookmarked: !isBookmarked(progress, itemId) },
  };
}
