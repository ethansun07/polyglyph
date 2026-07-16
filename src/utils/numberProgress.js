const STORAGE_KEY = 'amharic_numbers_v1';
const MASTERY_NET = 5;

export function loadNumberProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveNumberProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function resetNumberProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getNumberState(progress, value) {
  const s = progress[value] || { seen: 0, correct: 0, wrong: 0 };
  return s.wrong > s.correct ? { ...s, wrong: s.correct } : s;
}

export function recordNumberAnswer(progress, value, wasCorrect) {
  const prev = getNumberState(progress, value);
  return {
    ...progress,
    [value]: {
      seen:    prev.seen    + 1,
      correct: prev.correct + (wasCorrect ? 1 : 0),
      wrong:   prev.wrong   + (wasCorrect ? 0 : 1),
    },
  };
}

export function isNumberMastered(progress, value) {
  const s = getNumberState(progress, value);
  return s.seen > 0 && getNumberNet(progress, value) >= MASTERY_NET;
}

export function getNumberNet(progress, value) {
  const s = getNumberState(progress, value);
  return Math.max(0, s.correct - s.wrong);
}

export function getNumberWeight(progress, value) {
  if (isNumberMastered(progress, value)) return 1;
  const s = getNumberState(progress, value);
  if (s.seen === 0) return 8;
  const net = getNumberNet(progress, value);
  if (net === 0) return 10;
  if (net <= 2) return 6;
  if (net <= 4) return 3;
  return 2;
}

export function weightedPickSymbol(symbols, progress) {
  const weights = symbols.map(s => getNumberWeight(progress, s.value));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < symbols.length; i++) {
    r -= weights[i];
    if (r <= 0) return symbols[i];
  }
  return symbols[symbols.length - 1];
}

export function getTotalNumberStats(symbols, progress) {
  const total    = symbols.length;
  const mastered = symbols.filter(s => isNumberMastered(progress, s.value)).length;
  const seen     = symbols.filter(s => getNumberState(progress, s.value).seen > 0).length;
  return { total, mastered, seen };
}
