export const ETHIOPIC_DIGITS = [
  { value: 1, symbol: '፩', name: 'and',    amharic: 'አንድ'   },
  { value: 2, symbol: '፪', name: 'hulet',  amharic: 'ሁለት'  },
  { value: 3, symbol: '፫', name: 'sost',   amharic: 'ሦስት'  },
  { value: 4, symbol: '፬', name: 'arat',   amharic: 'አራት'  },
  { value: 5, symbol: '፭', name: 'amist',  amharic: 'አምስት' },
  { value: 6, symbol: '፮', name: 'sidist', amharic: 'ስድስት' },
  { value: 7, symbol: '፯', name: 'sebat',  amharic: 'ሰባት'  },
  { value: 8, symbol: '፰', name: 'simint', amharic: 'ስምንት' },
  { value: 9, symbol: '፱', name: 'zetegn', amharic: 'ዘጠኝ'  },
];

export const ETHIOPIC_TENS = [
  { value: 10, symbol: '፲', name: 'asir',    amharic: 'አስር'   },
  { value: 20, symbol: '፳', name: 'haya',    amharic: 'ሃያ'    },
  { value: 30, symbol: '፴', name: 'selasa',  amharic: 'ሰላሳ'  },
  { value: 40, symbol: '፵', name: 'arba',    amharic: 'አርባ'   },
  { value: 50, symbol: '፶', name: 'hamsa',   amharic: 'ሃምሳ'  },
  { value: 60, symbol: '፷', name: 'silsa',   amharic: 'ስልሳ'  },
  { value: 70, symbol: '፸', name: 'seba',    amharic: 'ሰባ'    },
  { value: 80, symbol: '፹', name: 'semania', amharic: 'ሰማንያ' },
  { value: 90, symbol: '፺', name: 'zetena',  amharic: 'ዘጠና'  },
];

export const ETHIOPIC_HUNDREDS = [
  { value: 100, symbol: '፻',  name: 'meto',      amharic: 'መቶ'      },
  { value: 200, symbol: '፪፻', name: 'hulet meto', amharic: 'ሁለት መቶ' },
  { value: 300, symbol: '፫፻', name: 'sost meto',  amharic: 'ሦስት መቶ' },
  { value: 400, symbol: '፬፻', name: 'arat meto',  amharic: 'አራት መቶ' },
  { value: 500, symbol: '፭፻', name: 'amist meto', amharic: 'አምስት መቶ' },
  { value: 600, symbol: '፮፻', name: 'sidist meto', amharic: 'ስድስት መቶ' },
  { value: 700, symbol: '፯፻', name: 'sebat meto', amharic: 'ሰባት መቶ' },
  { value: 800, symbol: '፰፻', name: 'simint meto', amharic: 'ስምንት መቶ' },
  { value: 900, symbol: '፱፻', name: 'zetegn meto', amharic: 'ዘጠኝ መቶ' },
];

// 1000 has no dedicated Ge'ez glyph — the traditional system is base-100, so
// 1000 is written as the combined ፲ (ten) + ፻ (hundred), same as any other
// multiple of 100. The spoken word ሺህ (shih) is still its own thing.
export const ETHIOPIC_THOUSANDS = [
  { value: 1000, symbol: '፲፻', name: 'shih',        amharic: 'ሺህ'       },
  { value: 2000, symbol: '፳፻', name: 'hulet shi',   amharic: 'ሁለት ሺህ'  },
  { value: 3000, symbol: '፴፻', name: 'sost shi',    amharic: 'ሦስት ሺህ'  },
  { value: 4000, symbol: '፵፻', name: 'arat shi',    amharic: 'አራት ሺህ'  },
  { value: 5000, symbol: '፶፻', name: 'amist shi',   amharic: 'አምስት ሺህ' },
  { value: 6000, symbol: '፷፻', name: 'sidist shi',  amharic: 'ስድስት ሺህ' },
  { value: 7000, symbol: '፸፻', name: 'sebat shi',   amharic: 'ሰባት ሺህ'  },
  { value: 8000, symbol: '፹፻', name: 'simint shi',  amharic: 'ስምንት ሺህ' },
  { value: 9000, symbol: '፺፻', name: 'zetegn shi',  amharic: 'ዘጠኝ ሺህ'  },
];

export const ETHIOPIC_TEN_THOUSANDS = [
  { value: 10000, symbol: '፼',  name: 'asir shi',    amharic: 'አስር ሺህ'   },
  { value: 20000, symbol: '፪፼', name: 'haya shi',    amharic: 'ሃያ ሺህ'    },
  { value: 30000, symbol: '፫፼', name: 'selasa shi',  amharic: 'ሰላሳ ሺህ'  },
  { value: 40000, symbol: '፬፼', name: 'arba shi',    amharic: 'አርባ ሺህ'  },
  { value: 50000, symbol: '፭፼', name: 'hamsa shi',   amharic: 'ሃምሳ ሺህ'  },
  { value: 60000, symbol: '፮፼', name: 'silsa shi',   amharic: 'ስልሳ ሺህ'  },
  { value: 70000, symbol: '፯፼', name: 'seba shi',    amharic: 'ሰባ ሺህ'    },
  { value: 80000, symbol: '፰፼', name: 'semania shi', amharic: 'ሰማንያ ሺህ' },
  { value: 90000, symbol: '፱፼', name: 'zetena shi',  amharic: 'ዘጠና ሺህ'  },
];

// Round milestones above 10,000 — deliberately discrete (not a full range),
// same idea as "1000" above: combined multiplier + ፼ for the symbol (e.g.
// 100,000 = ፲፼, "ten-myriad"; 1,000,000 = ፻፼, "hundred-myriad" — Ge'ez has
// no dedicated glyph for either), and the natural spoken phrase for words.
// ሚሊዮን (million) is a modern loanword, same category as ታክሲ/ሆቴል elsewhere.
export const ETHIOPIC_LARGE_ROUND = [
  { value: 100000,  symbol: '፲፼', name: 'meto shi',        amharic: 'መቶ ሺህ'        },
  { value: 200000,  symbol: '፳፼', name: 'hulet meto shi',  amharic: 'ሁለት መቶ ሺህ'   },
  { value: 300000,  symbol: '፴፼', name: 'sost meto shi',   amharic: 'ሦስት መቶ ሺህ'   },
  { value: 400000,  symbol: '፵፼', name: 'arat meto shi',   amharic: 'አራት መቶ ሺህ'   },
  { value: 500000,  symbol: '፶፼', name: 'amist meto shi',  amharic: 'አምስት መቶ ሺህ'  },
  { value: 600000,  symbol: '፷፼', name: 'sidist meto shi', amharic: 'ስድስት መቶ ሺህ'  },
  { value: 700000,  symbol: '፸፼', name: 'sebat meto shi',  amharic: 'ሰባት መቶ ሺህ'   },
  { value: 800000,  symbol: '፹፼', name: 'simint meto shi', amharic: 'ስምንት መቶ ሺህ'  },
  { value: 900000,  symbol: '፺፼', name: 'zetegn meto shi', amharic: 'ዘጠኝ መቶ ሺህ'   },
  { value: 1000000, symbol: '፻፼', name: 'milyon',          amharic: 'ሚሊዮን'          },
];

export const ALL_BASE_SYMBOLS = [
  ...ETHIOPIC_DIGITS,
  ...ETHIOPIC_TENS,
  ...ETHIOPIC_HUNDREDS,
  ...ETHIOPIC_THOUSANDS,
];

// ─── Symbol lookup maps ───────────────────────────────────────────────────────
const DIGIT_MAP   = new Map(ETHIOPIC_DIGITS.map(d => [d.value, d.symbol]));
const TENS_MAP    = new Map(ETHIOPIC_TENS.map(d => [d.value, d.symbol]));
const AMHARIC_MAP = new Map(ALL_BASE_SYMBOLS.map(d => [d.value, d.amharic]));

// Render a 1-99 value as combined Ethiopic symbols (tens + digit) — used
// wherever a multiplier count (e.g. "how many hundreds") can itself be a
// two-digit number, not just 1-9.
function countToSymbol(count) {
  let s = '';
  if (count >= 10) { s += TENS_MAP.get(Math.floor(count / 10) * 10) ?? ''; count %= 10; }
  if (count > 0) s += DIGIT_MAP.get(count) ?? '';
  return s;
}

// Same idea, but as Amharic word(s).
function countToWords(count) {
  const parts = [];
  if (count >= 10) { parts.push(AMHARIC_MAP.get(Math.floor(count / 10) * 10)); count %= 10; }
  if (count > 0) parts.push(AMHARIC_MAP.get(count));
  return parts.filter(Boolean);
}

// ─── Convert an integer to its Ethiopic numeral string ────────────────────────
// Supports 1–99,999. Returns '' for out-of-range values.
// The traditional system is base-100 — there's no dedicated glyph for 1000,
// it's written as a combined multiplier + ፻ (e.g. 1000 = ፲፻, "ten-hundred"),
// same as any other multiple of 100 up to 9900.
export function toEthiopic(n) {
  if (!Number.isInteger(n) || n <= 0 || n > 99999) return '';

  let result = '';
  let rem = n;

  // Ten-thousands
  if (rem >= 10000) {
    const count = Math.floor(rem / 10000);
    if (count > 1) result += DIGIT_MAP.get(count) ?? '';
    result += '፼';
    rem = rem % 10000;
  }

  // Hundreds (count can be 1-99, e.g. 1000-9900 needs a two-digit multiplier)
  if (rem >= 100) {
    const count = Math.floor(rem / 100);
    if (count > 1) result += countToSymbol(count);
    result += '፻';
    rem = rem % 100;
  }

  // Tens
  if (rem >= 10) {
    result += TENS_MAP.get(Math.floor(rem / 10) * 10) ?? '';
    rem = rem % 10;
  }

  // Units
  if (rem > 0) {
    result += DIGIT_MAP.get(rem) ?? '';
  }

  return result;
}

// ─── Convert an integer to spoken Amharic words ───────────────────────────────
// e.g. 25 → "ሃያ አምስት",  110 → "መቶ አስር",  200 → "ሁለት መቶ",  2000 → "ሁለት ሺህ"
// Unlike the written glyph system, spoken Amharic treats 1000 (ሺህ) as its own
// unit rather than "ten hundred" — this also naturally covers 10,000+ as
// "N ሺህ" with a two-digit N, matching how ETHIOPIC_SPECIAL's 10,000 entry
// ("አስር ሺህ") is itself phrased.
export function toAmharicWords(n) {
  if (!Number.isInteger(n) || n <= 0 || n > 99999) return '';

  const parts = [];
  let rem = n;

  if (rem >= 1000) {
    const count = Math.floor(rem / 1000);
    if (count > 1) parts.push(...countToWords(count));
    parts.push(AMHARIC_MAP.get(1000));
    rem = rem % 1000;
  }

  if (rem >= 100) {
    const count = Math.floor(rem / 100);
    if (count > 1) parts.push(...countToWords(count));
    parts.push(AMHARIC_MAP.get(100));
    rem = rem % 100;
  }

  if (rem >= 10) {
    parts.push(AMHARIC_MAP.get(Math.floor(rem / 10) * 10));
    rem = rem % 10;
  }

  if (rem > 0) {
    parts.push(AMHARIC_MAP.get(rem));
  }

  return parts.filter(Boolean).join(' ');
}

// ─── Distractor generation for combo quiz ─────────────────────────────────────
export function generateComboQuestion(rangeKey) {
  const [min, max] = rangeKey === '2digit' ? [11, 99]
    : rangeKey === '3digit' ? [101, 999]
    : [1001, 9999]; // 4digit — starts just past 1000, which is its own base symbol

  // Avoid round multiples of base symbols (10, 20 … 90 for 2-digit; 100 for 3-digit)
  let value;
  do {
    value = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (value % 10 === 0 && rangeKey === '2digit');

  const symbol = toEthiopic(value);
  const spread = rangeKey === '2digit' ? 20 : rangeKey === '3digit' ? 120 : 800;

  const distractors = new Set();
  let attempts = 0;
  while (distractors.size < 3 && attempts < 150) {
    attempts++;
    let d = value + Math.floor(Math.random() * spread * 2) - spread;
    d = Math.max(min, Math.min(max, d));
    if (d !== value && d % 10 !== 0) distractors.add(d);
  }
  while (distractors.size < 3) {
    const d = Math.floor(Math.random() * (max - min + 1)) + min;
    if (d !== value) distractors.add(d);
  }

  const choices = [value, ...[...distractors].slice(0, 3)].sort((a, b) => a - b);
  return { value, symbol, choices, amharic: toAmharicWords(value) };
}
