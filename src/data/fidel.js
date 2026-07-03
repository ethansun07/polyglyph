// ─── Vowel Orders ────────────────────────────────────────────────────────────
// The 7 orders that every Fidel row follows.
export const VOWEL_ORDERS = [
  { order: 1, label: '1st',  symbol: 'ä',  hint: 'a-ish (like "u" in "up")' },
  { order: 2, label: '2nd',  symbol: 'u',  hint: 'oo (like "oo" in "food")' },
  { order: 3, label: '3rd',  symbol: 'i',  hint: 'ee (like "ee" in "feet")' },
  { order: 4, label: '4th',  symbol: 'a',  hint: 'ah (like "a" in "father")' },
  { order: 5, label: '5th',  symbol: 'e',  hint: 'ay (like "ay" in "say")' },
  { order: 6, label: '6th',  symbol: 'ə',  hint: 'uh / consonant alone (like "a" in "about")' },
  { order: 7, label: '7th',  symbol: 'o',  hint: 'oh (like "o" in "go")' },
];

// ─── Fidel Rows ───────────────────────────────────────────────────────────────
// Each row has:
//   id            unique slug used in progress keys and audio file names
//   baseName      the 1st-order character (the "root" of the row)
//   chars         array of 7 Ethiopic characters in order 1–7
//   romanizations array of 7 romanization strings
//   note          optional cultural/linguistic note shown in Learn mode
//
// Audio file path convention: /audio/{id}_{order}.mp3
//   e.g.  ሀ → /audio/ha_1.mp3   ሁ → /audio/ha_2.mp3   ... ሆ → /audio/ha_7.mp3

export const FIDEL_ROWS = [
  // ── Level 1 ──────────────────────────────────────────────────────────────
  {
    id: 'ha',
    baseName: 'ሀ',
    chars:         ['ሀ', 'ሁ', 'ሂ', 'ሃ', 'ሄ', 'ህ', 'ሆ'],
    romanizations: ['hä', 'hu', 'hi', 'ha', 'he', 'h',  'ho'],
    note: '💡 ሀ (1st order) is romanized hä. In modern Amharic, ሀ, ሐ (ḥ), and ኀ (ḫ) all sound the same — spelling still matters for writing!',
  },
  {
    id: 'le',
    baseName: 'ለ',
    chars:         ['ለ', 'ሉ', 'ሊ', 'ላ', 'ሌ', 'ል', 'ሎ'],
    romanizations: ['lä', 'lu', 'li', 'la', 'le', 'l',  'lo'],
  },
  {
    id: 'he',
    baseName: 'ሐ',
    chars:         ['ሐ', 'ሑ', 'ሒ', 'ሓ', 'ሔ', 'ሕ', 'ሖ'],
    romanizations: ['ḥä', 'ḥu', 'ḥi', 'ḥa', 'ḥe', 'ḥ',  'ḥo'],
    note: '💡 ሐ is romanized ḥ (h with dot below) — historically a deep pharyngeal "H". In modern spoken Amharic it sounds exactly like ሀ (h).',
  },
  {
    id: 'me',
    baseName: 'መ',
    chars:         ['መ', 'ሙ', 'ሚ', 'ማ', 'ሜ', 'ም', 'ሞ'],
    romanizations: ['mä', 'mu', 'mi', 'ma', 'me', 'm',  'mo'],
  },
  {
    id: 'se_old',
    baseName: 'ሠ',
    chars:         ['ሠ', 'ሡ', 'ሢ', 'ሣ', 'ሤ', 'ሥ', 'ሦ'],
    romanizations: ['śä', 'śu', 'śi', 'śa', 'śe', 'ś',  'śo'],
    note: '💡 ሠ is romanized ś — an older Ge\'ez "S". It now sounds exactly like ሰ (s) in modern Amharic. Still seen in traditional texts and names.',
  },

  // ── Level 2 ──────────────────────────────────────────────────────────────
  {
    id: 're',
    baseName: 'ረ',
    chars:         ['ረ', 'ሩ', 'ሪ', 'ራ', 'ሬ', 'ር', 'ሮ'],
    romanizations: ['rä', 'ru', 'ri', 'ra', 're', 'r',  'ro'],
  },
  {
    id: 'se',
    baseName: 'ሰ',
    chars:         ['ሰ', 'ሱ', 'ሲ', 'ሳ', 'ሴ', 'ስ', 'ሶ'],
    romanizations: ['sä', 'su', 'si', 'sa', 'se', 's',  'so'],
    note: '💡 ሰ and ሠ (ś) are pronounced the same in modern Amharic. ሰ is the modern standard form.',
  },
  {
    id: 'she',
    baseName: 'ሸ',
    chars:         ['ሸ', 'ሹ', 'ሺ', 'ሻ', 'ሼ', 'ሽ', 'ሾ'],
    romanizations: ['šä', 'šu', 'ši', 'ša', 'še', 'š', 'šo'],
    note: '💡 ሸ is romanized š — the "sh" sound, as in "show".',
  },
  {
    id: 'qe',
    baseName: 'ቀ',
    chars:         ['ቀ', 'ቁ', 'ቂ', 'ቃ', 'ቄ', 'ቅ', 'ቆ'],
    romanizations: ['qä', 'qu', 'qi', 'qa', 'qe', 'q',  'qo'],
    note: '💡 Q in Amharic is a "uvular K" — a deeper K sound made at the back of the throat, further back than a normal K.',
  },
  {
    id: 'be',
    baseName: 'በ',
    chars:         ['በ', 'ቡ', 'ቢ', 'ባ', 'ቤ', 'ብ', 'ቦ'],
    romanizations: ['bä', 'bu', 'bi', 'ba', 'be', 'b',  'bo'],
  },

  // ── Level 3 ──────────────────────────────────────────────────────────────
  {
    id: 've',
    baseName: 'ቨ',
    chars:         ['ቨ', 'ቩ', 'ቪ', 'ቫ', 'ቬ', 'ቭ', 'ቮ'],
    romanizations: ['vä', 'vu', 'vi', 'va', 've', 'v',  'vo'],
    note: '💡 V is mainly used in borrowed words (from English, Italian, etc.). Some Amharic speakers pronounce it as B.',
  },
  {
    id: 'te',
    baseName: 'ተ',
    chars:         ['ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ'],
    romanizations: ['tä', 'tu', 'ti', 'ta', 'te', 't',  'to'],
  },
  {
    id: 'che',
    baseName: 'ቸ',
    chars:         ['ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ'],
    romanizations: ['čä', 'ču', 'či', 'ča', 'če', 'č', 'čo'],
    note: '💡 ቸ is romanized č — the "ch" sound, as in "chair".',
  },
  {
    id: 'khe',
    baseName: 'ኀ',
    chars:         ['ኀ', 'ኁ', 'ኂ', 'ኃ', 'ኄ', 'ኅ', 'ኆ'],
    romanizations: ['ḫä', 'ḫu', 'ḫi', 'ḫa', 'ḫe', 'ḫ',  'ḫo'],
    note: '💡 ኀ is romanized ḫ (h with breve below) — a third H row from Ge\'ez. Sounds like ሀ (h) in modern Amharic. Spelling still matters!',
  },
  {
    id: 'ne',
    baseName: 'ነ',
    chars:         ['ነ', 'ኑ', 'ኒ', 'ና', 'ኔ', 'ን', 'ኖ'],
    romanizations: ['nä', 'nu', 'ni', 'na', 'ne', 'n',  'no'],
  },

  // ── Level 4 ──────────────────────────────────────────────────────────────
  {
    id: 'nye',
    baseName: 'ኘ',
    chars:         ['ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ'],
    romanizations: ['ñä', 'ñu', 'ñi', 'ña', 'ñe', 'ñ', 'ño'],
    note: '💡 ኘ is romanized ñ — the "ny" sound, as in "canyon".',
  },
  {
    id: 'a',
    baseName: 'አ',
    chars:         ['አ', 'ኡ', 'ኢ', 'ኣ', 'ኤ', 'እ', 'ኦ'],
    romanizations: ['ä',  'u',  'i',  'a',  'e',  'ə',  'o'],
    note: '💡 The አ row is the pure vowel row — no consonant, just vowel sounds. አ starts with a soft glottal stop. In modern Amharic it sounds similar to ዐ.',
  },
  {
    id: 'ke',
    baseName: 'ከ',
    chars:         ['ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ'],
    romanizations: ['kä', 'ku', 'ki', 'ka', 'ke', 'k',  'ko'],
  },
  {
    id: 'hhe',
    baseName: 'ኸ',
    chars:         ['ኸ', 'ኹ', 'ኺ', 'ኻ', 'ኼ', 'ኽ', 'ኾ'],
    romanizations: ['ħä', 'ħu', 'ħi', 'ħa', 'ħe', 'ħ',  'ħo'],
    note: '💡 ኸ is romanized ħ (h-bar) — a fourth H variant, sounds exactly like ሀ (h), ሐ (ḥ), and ኀ (ḫ) in modern Amharic. Mainly seen in dialects and older writing.',
    archaic: true,
  },
  {
    id: 'we',
    baseName: 'ወ',
    chars:         ['ወ', 'ዉ', 'ዊ', 'ዋ', 'ዌ', 'ው', 'ዎ'],
    romanizations: ['wä', 'wu', 'wi', 'wa', 'we', 'w',  'wo'],
  },

  // ── Level 5 ──────────────────────────────────────────────────────────────
  {
    id: 'gha',
    baseName: 'ዐ',
    chars:         ['ዐ', 'ዑ', 'ዒ', 'ዓ', 'ዔ', 'ዕ', 'ዖ'],
    romanizations: ["ʿä", "ʿu", "ʿi", "ʿa", "ʿe", "ʿ",  "ʿo"],
    note: '💡 ዐ is romanized ʿ (the ayin sign) — historically a voiced pharyngeal consonant like Arabic ع. In modern Amharic it sounds the same as አ.',
  },
  {
    id: 'ze',
    baseName: 'ዘ',
    chars:         ['ዘ', 'ዙ', 'ዚ', 'ዛ', 'ዜ', 'ዝ', 'ዞ'],
    romanizations: ['zä', 'zu', 'zi', 'za', 'ze', 'z',  'zo'],
  },
  {
    id: 'zhe',
    baseName: 'ዠ',
    chars:         ['ዠ', 'ዡ', 'ዢ', 'ዣ', 'ዤ', 'ዥ', 'ዦ'],
    romanizations: ['žä', 'žu', 'ži', 'ža', 'že', 'ž', 'žo'],
    note: '💡 ዠ is romanized ž — the "zh" sound, like "s" in "measure" or "g" in French "genre".',
  },
  {
    id: 'ye',
    baseName: 'የ',
    chars:         ['የ', 'ዩ', 'ዪ', 'ያ', 'ዬ', 'ይ', 'ዮ'],
    romanizations: ['yä', 'yu', 'yi', 'ya', 'ye', 'y',  'yo'],
  },
  {
    id: 'de',
    baseName: 'ደ',
    chars:         ['ደ', 'ዱ', 'ዲ', 'ዳ', 'ዴ', 'ድ', 'ዶ'],
    romanizations: ['dä', 'du', 'di', 'da', 'de', 'd',  'do'],
  },

  // ── Level 6 ──────────────────────────────────────────────────────────────
  {
    id: 'je',
    baseName: 'ጀ',
    chars:         ['ጀ', 'ጁ', 'ጂ', 'ጃ', 'ጄ', 'ጅ', 'ጆ'],
    romanizations: ['jä', 'ju', 'ji', 'ja', 'je', 'j',  'jo'],
  },
  {
    id: 'ge',
    baseName: 'ገ',
    chars:         ['ገ', 'ጉ', 'ጊ', 'ጋ', 'ጌ', 'ግ', 'ጎ'],
    romanizations: ['gä', 'gu', 'gi', 'ga', 'ge', 'g',  'go'],
  },
  {
    id: 'tte',
    baseName: 'ጠ',
    chars:         ['ጠ', 'ጡ', 'ጢ', 'ጣ', 'ጤ', 'ጥ', 'ጦ'],
    romanizations: ['ṭä', 'ṭu', 'ṭi', 'ṭa', 'ṭe', 'ṭ',  'ṭo'],
    note: '💡 ጠ is romanized ṭ (t with dot below) — an emphatic ejective T, heavier and sharper than t.',
  },
  {
    id: 'cche',
    baseName: 'ጨ',
    chars:         ['ጨ', 'ጩ', 'ጪ', 'ጫ', 'ጬ', 'ጭ', 'ጮ'],
    romanizations: ['č̣ä', 'č̣u', 'č̣i', 'č̣a', 'č̣e', 'č̣', 'č̣o'],
    note: '💡 ጨ is romanized č̣ — an emphatic ejective CH, sharper than č.',
  },
  {
    id: 'ppe',
    baseName: 'ጰ',
    chars:         ['ጰ', 'ጱ', 'ጲ', 'ጳ', 'ጴ', 'ጵ', 'ጶ'],
    romanizations: ['pä', 'pu', 'pi', 'pa', 'pe', 'p',  'po'],
    note: '💡 ጰ is an ejective P — a sharp, popping P sound. Sounds like ፐ in modern Amharic.',
  },

  // ── Level 7 ──────────────────────────────────────────────────────────────
  {
    id: 'tse',
    baseName: 'ጸ',
    chars:         ['ጸ', 'ጹ', 'ጺ', 'ጻ', 'ጼ', 'ጽ', 'ጾ'],
    romanizations: ['ṣä', 'ṣu', 'ṣi', 'ṣa', 'ṣe', 'ṣ', 'ṣo'],
    note: '💡 ጸ is romanized ṣ (s with dot below) — an emphatic "ts" sound.',
  },
  {
    id: 'tse2',
    baseName: 'ፀ',
    chars:         ['ፀ', 'ፁ', 'ፂ', 'ፃ', 'ፄ', 'ፅ', 'ፆ'],
    romanizations: ['ṣ́ä', 'ṣ́u', 'ṣ́i', 'ṣ́a', 'ṣ́e', 'ṣ́', 'ṣ́o'],
    note: '💡 ፀ is romanized ṣ́ — an alternate form of ṣ. Same sound as ጸ in modern Amharic. Different spelling, same sound today.',
  },
  {
    id: 'fe',
    baseName: 'ፈ',
    chars:         ['ፈ', 'ፉ', 'ፊ', 'ፋ', 'ፌ', 'ፍ', 'ፎ'],
    romanizations: ['fä', 'fu', 'fi', 'fa', 'fe', 'f',  'fo'],
  },
  {
    id: 'pe',
    baseName: 'ፐ',
    chars:         ['ፐ', 'ፑ', 'ፒ', 'ፓ', 'ፔ', 'ፕ', 'ፖ'],
    romanizations: ['pä', 'pu', 'pi', 'pa', 'pe', 'p',  'po'],
    note: '💡 ፐ is mainly used in borrowed words. Sounds the same as ጰ in modern Amharic.',
  },

  // Labiovelar rows — null at orders 1 & 2 (those forms don't exist)
  // Aligned to standard order positions: [1, 2, 3(wi), 4(wa), 5(we), 6(wə), 7(wo)]
  {
    id: 'qwa',
    baseName: 'ቋ',
    labiovelar: true,
    chars:         [null, null, 'ቊ', 'ቋ', 'ቌ', 'ቍ', 'ቈ'],
    romanizations: [null, null, 'qwi', 'qwa', 'qwe', 'qwə', 'qwo'],
    note: '💡 ቋ (qwa) is a labiovelar — ቀ (q) with w-rounding. Only 5 of the 7 orders exist. The wa form ቋ is the most common.',
  },
  {
    id: 'khwa',
    baseName: 'ኋ',
    labiovelar: true,
    chars:         [null, null, 'ኊ', 'ኋ', 'ኌ', 'ኍ', 'ኈ'],
    romanizations: [null, null, 'ḫwi', 'ḫwa', 'ḫwe', 'ḫwə', 'ḫwo'],
    note: '💡 ኋ (ḫwa) is a labiovelar form of ኀ (ḫ). Sounds like h with w-rounding in modern Amharic.',
  },
  {
    id: 'kwa',
    baseName: 'ኳ',
    labiovelar: true,
    chars:         [null, null, 'ኲ', 'ኳ', 'ኴ', 'ኵ', 'ኰ'],
    romanizations: [null, null, 'kwi', 'kwa', 'kwe', 'kwə', 'kwo'],
    note: '💡 ኳ (kwa) is a labiovelar — ከ (k) with w-rounding. Appears in common words like እንኳን (enkwan, congratulations/welcome).',
  },
  {
    id: 'gwa',
    baseName: 'ጓ',
    labiovelar: true,
    chars:         [null, null, 'ጒ', 'ጓ', 'ጔ', 'ጕ', 'ጐ'],
    romanizations: [null, null, 'gwi', 'gwa', 'gwe', 'gwə', 'gwo'],
    note: '💡 ጓ (gwa) is a labiovelar — ገ (g) with w-rounding.',
  },
];

// ─── Levels ───────────────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, rowIds: ['ha', 'le', 'he', 'me', 'se_old'] },
  { level: 2, rowIds: ['re', 'se', 'she', 'qe', 'be', 'qwa'] },
  { level: 3, rowIds: ['ve', 'te', 'che', 'khe', 'ne', 'khwa'] },
  { level: 4, rowIds: ['nye', 'a', 'ke', 'hhe', 'we', 'kwa'] },
  { level: 5, rowIds: ['gha', 'ze', 'zhe', 'ye', 'de'] },
  { level: 6, rowIds: ['je', 'ge', 'tte', 'cche', 'ppe', 'gwa'] },
  { level: 7, rowIds: ['tse', 'tse2', 'fe', 'pe'] },
];

// ─── Punctuation ──────────────────────────────────────────────────────────────
export const PUNCTUATION = [
  { char: '፡', name: 'Word separator', description: 'Separates words in traditional texts; modern Amharic uses spaces instead.' },
  { char: '።', name: 'Full stop', description: 'Ends a sentence, equivalent to a period.' },
  { char: '፣', name: 'Comma', description: 'Separates items in a list or clauses within a sentence.' },
  { char: '፤', name: 'Semicolon', description: 'Stronger pause than a comma; links related clauses.' },
  { char: '፥', name: 'Colon', description: 'Introduces a list or explanation.' },
  { char: '፦', name: 'Preface colon', description: 'Precedes quoted speech or dialogue.' },
  { char: '፧', name: 'Question mark', description: 'Marks a question; modern texts often use the Western ? instead.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flat array of every character object across all rows (nulls skipped). */
export function getAllChars(includeExtended = true) {
  return FIDEL_ROWS.flatMap(row => {
    if (!includeExtended && (row.archaic || row.labiovelar)) return [];
    return row.chars.flatMap((char, i) => {
      if (char == null) return [];
      return [{
        id: `${row.id}_${i + 1}`,
        char,
        romanization: row.romanizations[i],
        order: i + 1,
        rowId: row.id,
        rowBaseName: row.baseName,
        note: row.note || null,
        labiovelar: row.labiovelar || false,
        archaic: row.archaic || false,
      }];
    });
  });
}

/** All characters belonging to the given level number.
 *  Pass includeExtended=true to include archaic/labiovelar rows. */
export function getLevelChars(levelNum, includeExtended = false) {
  const lvl = LEVELS.find(l => l.level === levelNum);
  if (!lvl) return [];
  const all = getAllChars();
  return all.filter(c => {
    if (!lvl.rowIds.includes(c.rowId)) return false;
    if (!includeExtended && (c.archaic || c.labiovelar)) return false;
    return true;
  });
}

/** Characters for a specific row by rowId. */
export function getRowChars(rowId) {
  return getAllChars().filter(c => c.rowId === rowId);
}

/** The row object for a given rowId. */
export function getRowById(rowId) {
  return FIDEL_ROWS.find(r => r.id === rowId) || null;
}

/** Level number that contains the given rowId, or null. */
export function getLevelForRow(rowId) {
  const lvl = LEVELS.find(l => l.rowIds.includes(rowId));
  return lvl ? lvl.level : null;
}

/** All rows for a given level number.
 *  Pass includeExtended=true to include archaic/labiovelar rows. */
export function getLevelRows(levelNum, includeExtended = false) {
  const lvl = LEVELS.find(l => l.level === levelNum);
  if (!lvl) return [];
  return FIDEL_ROWS.filter(r => {
    if (!lvl.rowIds.includes(r.id)) return false;
    if (!includeExtended && (r.archaic || r.labiovelar)) return false;
    return true;
  });
}
