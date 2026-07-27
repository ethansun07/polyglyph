// English loanwords and proper nouns used in Read mode (src/data/readingSentences.js)
// that are NOT taught Common Phrases (src/data/amharicPhrases.js).
//
// These are allowed in Read mode content because they're either borrowed
// words close enough to English to be guessable (COGNATES) or names/places
// that don't need to be pre-taught the way native Amharic vocabulary does
// (PROPER_NOUNS). scripts/validate-reading-vocab.js checks against this list
// alongside the Common Phrases and Ethiopic number words.
//
// RULE: when Read-mode content introduces a new loanword or name not already
// covered by amharicPhrases.js, add it here in the same pass. This list is
// the source of truth the validator checks against.

export const COGNATES = [
  { amharic: 'ፓስፖርት',   meaning: 'passport' },
  { amharic: 'ፓስፖርቴ',   meaning: 'my passport' },
  { amharic: 'ቲኬት',      meaning: 'ticket' },
  { amharic: 'ቲኬቴ',      meaning: 'my ticket' },
  { amharic: 'ሆስፒታል',   meaning: 'hospital' },
  { amharic: 'ኤርፖርት',   meaning: 'airport' },
  { amharic: 'ዋይፋይ',     meaning: 'wifi' },
  { amharic: 'ፎቶ',       meaning: 'photo' },
  { amharic: 'ፓርክ',      meaning: 'park' },
  { amharic: 'ፒዛ',       meaning: 'pizza' },
  { amharic: 'ራዲዮ',      meaning: 'radio' },
  { amharic: 'ካሜራ',      meaning: 'camera' },
  { amharic: 'ፋርማሲ',     meaning: 'pharmacy' },
  { amharic: 'ዶክተር',     meaning: 'doctor' },
  { amharic: 'ባንክ',      meaning: 'bank' },
  { amharic: 'ፖሊስ',      meaning: 'police' },
  { amharic: 'ሲኒማ',      meaning: 'cinema' },
  { amharic: 'ካፌ',       meaning: 'cafe' },
  { amharic: 'ሳንዱዊች',    meaning: 'sandwich' },
  { amharic: 'ሳንዱዊቹ',    meaning: 'the sandwich' },
  { amharic: 'ኢንተርኔት',   meaning: 'internet' },
  { amharic: 'ቡፌ',       meaning: 'buffet' },
];

export const PROPER_NOUNS = [
  { amharic: 'ዮሐንስ', meaning: 'Yohannes (name)' },
  { amharic: 'ሳራ',   meaning: 'Sara (name)' },
];
