const ANON_ID_KEY = 'amharic_anon_id';

// Stable per-browser id for signed-out visitors — lets the admin dashboard see
// guest usage, which Firebase auth otherwise has no record of at all.
export function getAnonId() {
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}
