// Reading content for the Read mode.
//
// All amharic words come from Common Phrases vocabulary ONLY (+ English cognates
// like ሆቴል, ሚኒባስ, ታክሲ).  Connector words are permitted: ነው / ናት (is),
// ነኝ (I am), -ው / -ቱ / -ሉ definite suffix ("the"), -ን object marker, እና (and),
// ግን (but).  These are explained in the grammar note shown at the top of Read mode.
//
// phraseIds[] lists every Common Phrase ID whose amharic word appears in the item.
// RULE: if a phrase is deleted from amharicPhrases.js, delete any item here that
//       lists its id in phraseIds.  If a phrase is added, consider adding a new item
//       that uses its word and adds its id to phraseIds.
//
// type: 'sentence' — word-by-word reveal (tap each chip)
// type: 'paragraph' — sentence-by-sentence reveal (tap each line)

// ─── Connector words note (shown at top of Read page) ────────────────────────
export const CONNECTOR_NOTE = {
  title: 'A note on connectors & word order',
  body: [
    'Amharic is Subject–Object–Verb (SOV). "I want water" = ውሃ እፈልጋለሁ (water I-want). The verb always comes last.',
    'ነው / ናት — "is/it is." ነው is used for things and men; ናት for women, cities, and countries (treated as feminine). Example: ሆቴሉ ጥሩ ነው (the hotel is good) · ኢትዮጵያ ቆንጆ ናት (Ethiopia is beautiful).',
    '‑ው / ‑ቱ / ‑ሉ — definite suffix meaning "the." ቡና → ቡናው (the coffee), ሆቴል → ሆቴሉ (the hotel), ሂሳብ → ሂሳቡ (the bill).',
    'እና — and.  ግን — but.  ‑ን — object marker added to a noun when it is the direct object of a verb.',
  ],
};

// ─── Standalone sentences ─────────────────────────────────────────────────────

export const SENTENCES = [
  {
    id: 'greet_exchange',
    type: 'sentence',
    amharic: 'ሰላም! ደህና ነህ?',
    meaning: 'Hello! How are you?',
    phraseIds: ['selam', 'dehna_neh'],
    words: [
      { amharic: 'ሰላም',  meaning: 'hello / peace' },
      { amharic: 'ደህና', meaning: 'well / fine' },
      { amharic: 'ነህ',  meaning: 'are you? (to a man)' },
    ],
  },
  {
    id: 'fine_thanks',
    type: 'sentence',
    amharic: 'ደህና ነኝ፣ አመሰግናለሁ።',
    meaning: "I'm fine, thank you.",
    phraseIds: ['dehna_negn', 'ameseginalehu'],
    words: [
      { amharic: 'ደህና',         meaning: 'fine / well' },
      { amharic: 'ነኝ',          meaning: 'I am' },
      { amharic: 'አመሰግናለሁ',    meaning: 'thank you' },
    ],
  },
  {
    id: 'dont_understand',
    type: 'sentence',
    amharic: 'አልገባኝም። ቀስ ቀስ ሂድ።',
    meaning: "I don't understand. Please go slowly.",
    phraseIds: ['alegabagnim', 'qes_qes_hid'],
    words: [
      { amharic: 'አልገባኝም',  meaning: "I don't understand" },
      { amharic: 'ቀስ ቀስ ሂድ', meaning: 'go slowly' },
    ],
  },
  {
    id: 'want_taxi',
    type: 'sentence',
    amharic: 'ታክሲ እፈልጋለሁ።',
    meaning: 'I want a taxi.',
    phraseIds: ['taksi', 'ifelgalehu'],
    words: [
      { amharic: 'ታክሲ',       meaning: 'taxi' },
      { amharic: 'እፈልጋለሁ',   meaning: 'I want' },
    ],
  },
  {
    id: 'like_injera',
    type: 'sentence',
    amharic: 'እንጀራ እወዳለሁ።',
    meaning: 'I like injera.',
    phraseIds: ['injera', 'iwedalehu'],
    words: [
      { amharic: 'እንጀራ',    meaning: 'injera (Ethiopian flatbread)' },
      { amharic: 'እወዳለሁ',  meaning: 'I like' },
    ],
  },
  {
    id: 'no_problem_welcome',
    type: 'sentence',
    amharic: 'ችግር የለም። ምንም አይደለም።',
    meaning: "No problem. You're welcome.",
    phraseIds: ['cheger_yelem', 'minim_ayidelem'],
    words: [
      { amharic: 'ችግር የለም',     meaning: 'no problem' },
      { amharic: 'ምንም አይደለም',  meaning: "you're welcome / it's nothing" },
    ],
  },
  {
    id: 'speak_amharic',
    type: 'sentence',
    amharic: 'ትንሽ አማርኛ እናገራለሁ።',
    meaning: 'I speak a little Amharic.',
    phraseIds: ['amarenna'],
    words: [
      { amharic: 'ትንሽ',        meaning: 'a little' },
      { amharic: 'አማርኛ',      meaning: 'Amharic' },
      { amharic: 'እናገራለሁ',   meaning: 'I speak' },
    ],
  },
  {
    id: 'restroom_where',
    type: 'sentence',
    amharic: 'ሽንት ቤቱ የት ነው?',
    meaning: 'Where is the restroom?',
    phraseIds: ['shint_bet', 'wedet_new'],
    words: [
      { amharic: 'ሽንት ቤቱ', meaning: 'the restroom' },
      { amharic: 'የት',      meaning: 'where' },
      { amharic: 'ነው',      meaning: 'is?' },
    ],
  },
  {
    id: 'how_much_cost',
    type: 'sentence',
    amharic: 'ዋጋው ስንት ነው?',
    meaning: 'How much does it cost?',
    phraseIds: ['waga', 'sint_new'],
    words: [
      { amharic: 'ዋጋው', meaning: 'the price' },
      { amharic: 'ስንት', meaning: 'how much' },
      { amharic: 'ነው',  meaning: 'is?' },
    ],
  },
  {
    id: 'now_lets_go',
    type: 'sentence',
    amharic: 'አሁን እንሂድ።',
    meaning: "Now let's go.",
    phraseIds: ['ahun', 'inihed'],
    words: [
      { amharic: 'አሁን',   meaning: 'now' },
      { amharic: 'እንሂድ', meaning: "let's go" },
    ],
  },
  {
    id: 'family_well',
    type: 'sentence',
    amharic: 'ቤተሰቡ ደህና ነው?',
    meaning: 'Is the family well?',
    phraseIds: ['beteseb', 'dehna_neh'],
    words: [
      { amharic: 'ቤተሰቡ', meaning: 'the family' },
      { amharic: 'ደህና',  meaning: 'well / fine' },
      { amharic: 'ነው',   meaning: 'is?' },
    ],
  },
  {
    id: 'im_student',
    type: 'sentence',
    amharic: 'ተማሪ ነኝ።',
    meaning: 'I am a student.',
    phraseIds: ['temari'],
    words: [
      { amharic: 'ተማሪ', meaning: 'student' },
      { amharic: 'ነኝ',  meaning: 'I am' },
    ],
  },
  {
    id: 'khat_new',
    type: 'sentence',
    amharic: 'ጫት እፈልጋለሁ።',
    meaning: 'I want khat.',
    phraseIds: ['khat', 'ifelgalehu'],
    words: [
      { amharic: 'ጫት',      meaning: 'khat' },
      { amharic: 'እፈልጋለሁ', meaning: 'I want / I need' },
    ],
  },

  // ── Cognate sentences ──────────────────────────────────────────────────────
  {
    id: 'passport_where',
    type: 'sentence',
    amharic: 'ፓስፖርቴ ወዴት ነው?',
    meaning: 'Where is my passport?',
    phraseIds: [],
    words: [
      { amharic: 'ፓስፖርቴ', meaning: 'my passport' },
      { amharic: 'ወዴት',   meaning: 'where' },
      { amharic: 'ነው',    meaning: 'is?' },
    ],
  },
  {
    id: 'ticket_want',
    type: 'sentence',
    amharic: 'ቲኬት እፈልጋለሁ።',
    meaning: 'I need a ticket.',
    phraseIds: ['ifelgalehu'],
    words: [
      { amharic: 'ቲኬት',      meaning: 'ticket' },
      { amharic: 'እፈልጋለሁ', meaning: 'I want / I need' },
    ],
  },
  {
    id: 'hospital_where',
    type: 'sentence',
    amharic: 'ሆስፒታሉ ወዴት ነው?',
    meaning: 'Where is the hospital?',
    phraseIds: ['wedet_new'],
    words: [
      { amharic: 'ሆስፒታሉ', meaning: 'the hospital' },
      { amharic: 'ወዴት',    meaning: 'where' },
      { amharic: 'ነው',     meaning: 'is?' },
    ],
  },
  {
    id: 'airport_far',
    type: 'sentence',
    amharic: 'ኤርፖርቱ ሩቅ ነው?',
    meaning: 'Is the airport far?',
    phraseIds: ['ruq'],
    words: [
      { amharic: 'ኤርፖርቱ', meaning: 'the airport' },
      { amharic: 'ሩቅ',    meaning: 'far' },
      { amharic: 'ነው',    meaning: 'is?' },
    ],
  },
  {
    id: 'silk_want',
    type: 'sentence',
    amharic: 'ስልክ እፈልጋለሁ።',
    meaning: 'I need a phone.',
    phraseIds: ['silk', 'ifelgalehu'],
    words: [
      { amharic: 'ስልክ',     meaning: 'phone' },
      { amharic: 'እፈልጋለሁ', meaning: 'I want / I need' },
    ],
  },
  {
    id: 'sira_want',
    type: 'sentence',
    amharic: 'ስራ እፈልጋለሁ።',
    meaning: 'I want work.',
    phraseIds: ['sira', 'ifelgalehu'],
    words: [
      { amharic: 'ስራ',      meaning: 'work / job' },
      { amharic: 'እፈልጋለሁ', meaning: 'I want / I need' },
    ],
  },
  {
    id: 'you_want_water',
    type: 'sentence',
    amharic: 'ውሃ ትፈልጋለህ?',
    meaning: 'Do you want water?',
    phraseIds: ['you_want', 'wuha'],
    words: [
      { amharic: 'ውሃ',       meaning: 'water' },
      { amharic: 'ትፈልጋለህ', meaning: 'do you want? (to a man)' },
    ],
  },
  {
    id: 'he_wants_taxi',
    type: 'sentence',
    amharic: 'ታክሲ ይፈልጋል።',
    meaning: 'He wants a taxi.',
    phraseIds: ['he_wants', 'taksi'],
    words: [
      { amharic: 'ታክሲ',    meaning: 'taxi' },
      { amharic: 'ይፈልጋል', meaning: 'he wants' },
    ],
  },
  {
    id: 'she_wants_tea',
    type: 'sentence',
    amharic: 'ሻሂ ትፈልጋለች።',
    meaning: 'She wants tea.',
    phraseIds: ['she_wants', 'shahi'],
    words: [
      { amharic: 'ሻሂ',       meaning: 'tea' },
      { amharic: 'ትፈልጋለች', meaning: 'she wants' },
    ],
  },
  {
    id: 'wifi_good',
    type: 'sentence',
    amharic: 'ዋይፋይ ጥሩ ነው?',
    meaning: 'Is the wifi good?',
    phraseIds: [],
    words: [
      { amharic: 'ዋይፋይ', meaning: 'wifi' },
      { amharic: 'ጥሩ',   meaning: 'good' },
      { amharic: 'ነው',   meaning: 'is?' },
    ],
  },
  {
    id: 'photo_can',
    type: 'sentence',
    amharic: 'ፎቶ እችላለሁ?',
    meaning: 'Can I take a photo?',
    phraseIds: ['icalalehu'],
    words: [
      { amharic: 'ፎቶ',       meaning: 'photo' },
      { amharic: 'እችላለሁ',   meaning: 'can I?' },
    ],
  },
  {
    id: 'park_beautiful',
    type: 'sentence',
    amharic: 'ፓርኩ ቆንጆ ናት!',
    meaning: 'The park is beautiful!',
    phraseIds: ['konjo'],
    words: [
      { amharic: 'ፓርኩ',  meaning: 'the park' },
      { amharic: 'ቆንጆ',  meaning: 'beautiful' },
      { amharic: 'ናት',   meaning: 'it is (place)' },
    ],
  },
  {
    id: 'pizza_good',
    type: 'sentence',
    amharic: 'ፒዛ ጥሩ ነው?',
    meaning: 'Is the pizza good?',
    phraseIds: [],
    words: [
      { amharic: 'ፒዛ', meaning: 'pizza' },
      { amharic: 'ጥሩ', meaning: 'good' },
      { amharic: 'ነው', meaning: 'is?' },
    ],
  },

  // ── New standalone additions ───────────────────────────────────────────────
  {
    id: 'what_time',
    type: 'sentence',
    amharic: 'ሰዓቱ ስንት ነው?',
    meaning: 'What time is it?',
    phraseIds: ['saat', 'sint_new'],
    words: [
      { amharic: 'ሰዓቱ',      meaning: 'the time' },
      { amharic: 'ስንት ነው',  meaning: 'how much / what is it' },
    ],
  },
  {
    id: 'no_money',
    type: 'sentence',
    amharic: 'ገንዘብ የለኝም።',
    meaning: 'I have no money.',
    phraseIds: ['genzeb'],
    words: [
      { amharic: 'ገንዘብ',   meaning: 'money' },
      { amharic: 'የለኝም', meaning: "I don't have" },
    ],
  },
  {
    id: 'love_beautiful',
    type: 'sentence',
    amharic: 'ፍቅር በጣም ቆንጆ ነው።',
    meaning: 'Love is very beautiful.',
    phraseIds: ['feqer'],
    words: [
      { amharic: 'ፍቅር',       meaning: 'love' },
      { amharic: 'በጣም ቆንጆ', meaning: 'very beautiful' },
      { amharic: 'ነው',        meaning: 'is' },
    ],
  },
  {
    id: 'poor_thing',
    type: 'sentence',
    amharic: 'ምስኪን! ደህና ነህ?',
    meaning: 'Poor thing! Are you okay?',
    phraseIds: ['miskeen', 'dehna_neh'],
    words: [
      { amharic: 'ምስኪን',   meaning: 'poor thing / unfortunate one' },
      { amharic: 'ደህና ነህ', meaning: 'are you well? (to a man)' },
    ],
  },

  // ── Ethiopian cities tour (paragraph) ──────────────────────────────────────
  {
    id: 'ethiopia_cities',
    type: 'paragraph',
    amharic: 'ኢትዮጵያ ቆንጆ ናት። ላሊበላ በጣም ቆንጆ ናት፣ ግን ሩቅ ናት። ጎንደር ቅርብ ናት። ባህር ዳር ቆንጆ ናት! ሐረር ሩቅ ናት። አክሱም በጣም ቆንጆ ናት! መቀሌ ቅርብ ናት? ሐዋሳ ቆንጆ ናት። ጅማ ሩቅ ናት? ድሬ ዳዋ ቅርብ ናት። አዲስ አበባ በጣም ቆንጆ ናት!',
    meaning: 'A tour of Ethiopian cities: Ethiopia is beautiful. Lalibela is very beautiful, but far. Gondar is close. Bahir Dar is beautiful! Harar is far. Aksum is very beautiful! Is Mekele close? Hawassa is beautiful. Is Jimma far? Dire Dawa is close. Addis Ababa is very beautiful!',
    phraseIds: ['ityoppya', 'lalibela', 'gondar', 'bahir_dar', 'harar', 'aksum', 'mekele', 'hawassa', 'jimma', 'dire_dawa', 'addis_abeba', 'konjo', 'ruq', 'qərb'],
    words: [
      { amharic: 'ኢትዮጵያ ቆንጆ ናት።',              meaning: 'Ethiopia is beautiful.' },
      { amharic: 'ላሊበላ በጣም ቆንጆ ናት፣ ግን ሩቅ ናት።', meaning: "Lalibela is very beautiful, but it's far." },
      { amharic: 'ጎንደር ቅርብ ናት።',                 meaning: 'Gondar is close.' },
      { amharic: 'ባህር ዳር ቆንጆ ናት!',               meaning: 'Bahir Dar is beautiful!' },
      { amharic: 'ሐረር ሩቅ ናት።',                    meaning: "Harar is far." },
      { amharic: 'አክሱም በጣም ቆንጆ ናት!',            meaning: 'Aksum is very beautiful!' },
      { amharic: 'መቀሌ ቅርብ ናት?',                  meaning: 'Is Mekele close?' },
      { amharic: 'ሐዋሳ ቆንጆ ናት።',                   meaning: 'Hawassa is beautiful.' },
      { amharic: 'ጅማ ሩቅ ናት?',                     meaning: 'Is Jimma far?' },
      { amharic: 'ድሬ ዳዋ ቅርብ ናት።',                meaning: 'Dire Dawa is close.' },
      { amharic: 'አዲስ አበባ በጣም ቆንጆ ናት!',         meaning: 'Addis Ababa is very beautiful!' },
    ],
  },

  // ── More standalone additions ──────────────────────────────────────────────
  {
    id: 'wait_no_money',
    type: 'sentence',
    amharic: 'ቆይ! ገንዘብ የለኝም።',
    meaning: "Wait! I don't have money.",
    phraseIds: ['qoy', 'genzeb'],
    words: [
      { amharic: 'ቆይ',        meaning: 'wait' },
      { amharic: 'ገንዘብ የለኝም', meaning: "I don't have money" },
    ],
  },
  {
    id: 'hurry_taxi',
    type: 'sentence',
    amharic: 'ቶሎ! ታክሲ እፈልጋለሁ።',
    meaning: 'Quickly! I need a taxi.',
    phraseIds: ['tolo', 'taksi', 'ifelgalehu'],
    words: [
      { amharic: 'ቶሎ',       meaning: 'quickly / hurry' },
      { amharic: 'ታክሲ',      meaning: 'taxi' },
      { amharic: 'እፈልጋለሁ', meaning: 'I want / I need' },
    ],
  },
  {
    id: 'coffeehouse_good',
    type: 'sentence',
    amharic: 'ቡና ቤቱ ጥሩ ነው? አይ፣ ጥሩ አይደለም ግን ሻሂ ጥሩ ነው።',
    meaning: "Is the coffee house good? No, it's not good, but the tea is good.",
    phraseIds: ['buna_bet', 'ay', 'shahi'],
    words: [
      { amharic: 'ቡና ቤቱ ጥሩ ነው',   meaning: 'is the coffee house good' },
      { amharic: 'አይ፣ ጥሩ አይደለም', meaning: "no, it's not good" },
      { amharic: 'ግን ሻሂ ጥሩ ነው',  meaning: 'but the tea is good' },
    ],
  },
  {
    id: 'shop_far',
    type: 'sentence',
    amharic: 'ሱቁ ሩቅ ነው? ገበያው ቅርብ ነው!',
    meaning: 'Is the shop far? The market is close!',
    phraseIds: ['suq', 'ruq', 'gebeya', 'qərb'],
    words: [
      { amharic: 'ሱቁ ሩቅ ነው',   meaning: 'is the shop far' },
      { amharic: 'ገበያው ቅርብ ነው', meaning: 'the market is close' },
    ],
  },
];

// ─── Dialogues ────────────────────────────────────────────────────────────────
// Each dialogue has lines: [{ speaker: 'A'|'B', amharic, meaning }]
// Speaker A is always the learner / visitor; B is the local / server / stranger.

export const DIALOGUES = [
  // ── ሰላምታ — Greeting a friend ─────────────────────────────────────────────
  {
    id: 'dial_greeting',
    type: 'dialogue',
    title: 'ሰላምታ',
    titleMeaning: 'Greeting a Friend',
    phraseIds: ['selam', 'dehna_neh', 'dehna_negn', 'ameseginalehu', 'antis', 'beteseb', 'dehna_hun'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም! ደህና ነህ?',                        meaning: 'Hello! How are you?' },
      { speaker: 'B', amharic: 'ደህና ነኝ፣ አመሰግናለሁ። አንተስ?',              meaning: "I'm fine, thank you. And you?" },
      { speaker: 'A', amharic: 'ደህና ነኝ። ቤተሰቡ ደህና ነው?',               meaning: "I'm fine. Is the family well?" },
      { speaker: 'B', amharic: 'አዎ፣ ቤተሰቡ ደህና ነው። አመሰግናለሁ።',          meaning: 'Yes, the family is well. Thank you.' },
      { speaker: 'A', amharic: 'ደህና ሁን!',                               meaning: 'Goodbye / be well!' },
      { speaker: 'B', amharic: 'ደህና ሁን!',                               meaning: 'Goodbye / be well!' },
    ],
  },

  // ── ቡና ቤቱ — At the coffee house ─────────────────────────────────────────
  {
    id: 'dial_coffee',
    type: 'dialogue',
    title: 'ቡና ቤቱ',
    titleMeaning: 'At the Coffee House',
    phraseIds: ['selam', 'buna_bet', 'konjo', 'shahi', 'betam_tiru', 'sambusa', 'awo', 'hisab', 'sint_new', 'bir', 'ameseginalehu', 'minim_ayidelem'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም። ቡና ቤቱ ቆንጆ ነው!',                 meaning: 'Hello. The coffee house is beautiful!' },
      { speaker: 'B', amharic: 'አመሰግናለሁ! ቡናው በጣም ጥሩ ነው።',            meaning: 'Thank you! The coffee is very good.' },
      { speaker: 'A', amharic: 'ሻሂ ጥሩ ነው?',                            meaning: 'Is the tea good?' },
      { speaker: 'B', amharic: 'አዎ፣ ሻሂ ጥሩ ነው። ሰምቡሳ በጣም ጥሩ ነው!',     meaning: 'Yes, the tea is good. The samboosa is very good!' },
      { speaker: 'A', amharic: 'ሂሳቡ ስንት ነው?',                          meaning: 'How much is the bill?' },
      { speaker: 'B', amharic: 'ሂሳቡ ብር ነው።',                           meaning: 'The bill is in birr.' },
      { speaker: 'A', amharic: 'አመሰግናለሁ!',                              meaning: 'Thank you!' },
      { speaker: 'B', amharic: 'ምንም አይደለም!',                            meaning: "You're welcome!" },
    ],
  },


  // ── ሆቴሉ የት ነው? — Finding the hotel ─────────────────────────────────────
  {
    id: 'dial_hotel',
    type: 'dialogue',
    title: 'ሆቴሉ የት ነው?',
    titleMeaning: 'Where Is the Hotel?',
    phraseIds: ['selam', 'hotel', 'wedet_new', 'qərb', 'ruq', 'misa_bet', 'buna_bet', 'taksi', 'awo', 'ameseginalehu', 'minim_ayidelem', 'betam_tiru'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም። ሆቴሉ የት ነው?',                     meaning: 'Hello. Where is the hotel?' },
      { speaker: 'B', amharic: 'ሆቴሉ ቅርብ ነው።',                          meaning: 'The hotel is close.' },
      { speaker: 'A', amharic: 'ዋይፋይ ጥሩ ነው?',                          meaning: 'Is the wifi good?' },
      { speaker: 'B', amharic: 'አዎ! ዋይፋይ ጥሩ ነው።',                     meaning: 'Yes! The wifi is good.' },
      { speaker: 'A', amharic: 'ምሳ ቤቱ ቅርብ ነው?',                        meaning: 'Is the restaurant close?' },
      { speaker: 'B', amharic: 'አይ፣ ምሳ ቤቱ ሩቅ ነው ግን ቡና ቤቱ ቅርብ ነው።',  meaning: 'No, the restaurant is far, but the coffee house is close.' },
      { speaker: 'A', amharic: 'ታክሲ ቅርብ ነው?',                          meaning: 'Is there a taxi nearby?' },
      { speaker: 'B', amharic: 'አዎ፣ ታክሲ ቅርብ ነው።',                     meaning: 'Yes, there is a taxi nearby.' },
      { speaker: 'A', amharic: 'አመሰግናለሁ!',                              meaning: 'Thank you!' },
      { speaker: 'B', amharic: 'ምንም አይደለም!',                            meaning: "You're welcome!" },
    ],
  },

  // ── ስምህ ማን ነው? — Meeting someone new ───────────────────────────────────
  {
    id: 'dial_intro',
    type: 'dialogue',
    title: 'ስምህ ማን ነው?',
    titleMeaning: 'What Is Your Name?',
    phraseIds: ['selam', 'simih_man_new', 'sime_new', 'antis', 'amarenna', 'betam_tiru', 'alegabagnim', 'qes_qes_hid', 'yikirta', 'eshi', 'cheger_yelem', 'dehna_hun'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም። ስምህ ማን ነው?',                     meaning: 'Hello. What is your name?' },
      { speaker: 'B', amharic: 'ስሜ ዮሐንስ ነው። አንተስ?',                   meaning: 'My name is Yohannes. And you?' },
      { speaker: 'A', amharic: 'ስሜ ሳራ ነው። ትንሽ አማርኛ እናገራለሁ።',         meaning: 'My name is Sara. I speak a little Amharic.' },
      { speaker: 'B', amharic: 'በጣም ጥሩ!',                              meaning: 'Very good!' },
      { speaker: 'A', amharic: 'አልገባኝም። ቀስ ቀስ ሂድ።',                  meaning: "I don't understand. Go slowly." },
      { speaker: 'B', amharic: 'ይቅርታ! እሺ፣ ቀስ ቀስ።',                   meaning: 'Sorry! Okay, slowly.' },
      { speaker: 'A', amharic: 'ፎቶ እችላለሁ?',                             meaning: 'Can I take a photo?' },
      { speaker: 'B', amharic: 'አዎ!',                                    meaning: 'Yes!' },
      { speaker: 'A', amharic: 'ችግር የለም። ደህና ሁን!',                    meaning: 'No problem. Goodbye!' },
      { speaker: 'B', amharic: 'ደህና ሁን!',                               meaning: 'Goodbye!' },
    ],
  },

  // ── ምሳ ቤቱ — At the restaurant ───────────────────────────────────────────
  {
    id: 'dial_restaurant',
    type: 'dialogue',
    title: 'ምሳ ቤቱ',
    titleMeaning: 'At the Restaurant',
    phraseIds: ['selam', 'misa_bet', 'migib', 'doro_wot', 'injera', 'betam_tiru', 'awo', 'tej', 'iwedalehu', 'hisab', 'sint_new', 'ameseginalehu', 'minim_ayidelem'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም። ምግቡ ጥሩ ነው?',                     meaning: 'Hello. Is the food good?' },
      { speaker: 'B', amharic: 'አዎ! ዶሮ ወጥ በጣም ጥሩ ነው።',               meaning: 'Yes! The doro wat is very good.' },
      { speaker: 'A', amharic: 'ፒዛ ጥሩ ነው?',                            meaning: 'Is the pizza good?' },
      { speaker: 'B', amharic: 'አዎ፣ ፒዛ ጥሩ ነው ግን እንጀራ በጣም ጥሩ ነው!',  meaning: 'Yes, the pizza is good, but injera is very good!' },
      { speaker: 'A', amharic: 'ዶሮ ወጥ እወዳለሁ!',                         meaning: 'I like doro wat!' },
      { speaker: 'B', amharic: 'በጣም ጥሩ!',                              meaning: 'Very good!' },
      { speaker: 'A', amharic: 'ሂሳቡ ስንት ነው?',                          meaning: 'How much is the bill?' },
      { speaker: 'B', amharic: 'ሂሳቡ ብር ነው።',                           meaning: 'The bill is in birr.' },
      { speaker: 'A', amharic: 'አመሰግናለሁ!',                              meaning: 'Thank you!' },
      { speaker: 'B', amharic: 'ምንም አይደለም!',                            meaning: "You're welcome!" },
    ],
  },

  // ── ዶክተር — Medical emergency ───────────────────────────────────────────
  {
    id: 'dial_medical',
    type: 'dialogue',
    title: 'ዶክተር እፈልጋለሁ',
    titleMeaning: 'I Need a Doctor',
    phraseIds: ['selam', 'ifelgalehu', 'qərb', 'wedet_new', 'taksi', 'awo', 'ameseginalehu', 'minim_ayidelem', 'tolo', 'cheger_yelem'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም። ዶክተር እፈልጋለሁ!',                   meaning: 'Hello. I need a doctor!' },
      { speaker: 'B', amharic: 'ዶክተር? ሆስፒታሉ ቅርብ ነው።',                 meaning: 'A doctor? The hospital is close.' },
      { speaker: 'A', amharic: 'ሆስፒታሉ ወዴት ነው?',                        meaning: 'Where is the hospital?' },
      { speaker: 'B', amharic: 'ቅርብ ነው። ታክሲ ቅርብ ነው።',                 meaning: "It's close. There's a taxi close by." },
      { speaker: 'A', amharic: 'ፋርማሲ ቅርብ ነው?',                         meaning: 'Is there a pharmacy nearby?' },
      { speaker: 'B', amharic: 'አዎ፣ ፋርማሲ ቅርብ ነው።',                    meaning: 'Yes, there is a pharmacy nearby.' },
      { speaker: 'A', amharic: 'አመሰግናለሁ!',                              meaning: 'Thank you!' },
      { speaker: 'B', amharic: 'ምንም አይደለም! ቶሎ ሂድ!',                   meaning: "You're welcome! Go quickly!" },
    ],
  },

  // ── ኤርፖርቱ — At the airport ─────────────────────────────────────────────
  {
    id: 'dial_airport',
    type: 'dialogue',
    title: 'ኤርፖርቱ',
    titleMeaning: 'At the Airport',
    phraseIds: ['selam', 'wedet_new', 'ruq', 'qərb', 'taksi', 'waga', 'sint_new', 'bir', 'alwukim', 'yikirta', 'qoy', 'yihonahal', 'minim_ayidelem', 'dehna_hun'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም። ኤርፖርቱ ወዴት ነው?',                  meaning: 'Hello. Where is the airport?' },
      { speaker: 'B', amharic: 'ኤርፖርቱ ሩቅ ነው። ታክሲ ቅርብ ነው።',           meaning: 'The airport is far. There is a taxi close by.' },
      { speaker: 'A', amharic: 'ዋጋው ስንት ነው?',                          meaning: 'How much does it cost?' },
      { speaker: 'B', amharic: 'ዋጋው ብር ነው።',                           meaning: 'The cost is in birr.' },
      { speaker: 'A', amharic: 'ፓስፖርቴ ወዴት ነው?',                        meaning: 'Where is my passport?' },
      { speaker: 'B', amharic: 'አላውቅም። ይቅርታ።',                         meaning: "I don't know. Sorry." },
      { speaker: 'A', amharic: 'ቲኬቴ ወዴት ነው?',                          meaning: 'Where is my ticket?' },
      { speaker: 'B', amharic: 'ቆይ! ይሆናል።',                            meaning: 'Wait! It will be fine.' },
      { speaker: 'A', amharic: 'አመሰግናለሁ! ደህና ሁን!',                     meaning: 'Thank you! Goodbye!' },
      { speaker: 'B', amharic: 'ምንም አይደለም! ደህና ሁን!',                   meaning: "You're welcome! Goodbye!" },
    ],
  },

  // ── ሚኒባሱ — On the minibus ──────────────────────────────────────────────
  {
    id: 'dial_minibus',
    type: 'dialogue',
    title: 'ሚኒባሱ',
    titleMeaning: 'On the Minibus',
    phraseIds: ['selam', 'minibus', 'ruq', 'qərb', 'hotel', 'wedet_new', 'alegabagnim', 'yikirta', 'qes_qes_hid', 'qom', 'ameseginalehu', 'minim_ayidelem', 'yihonahal'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም። ሚኒባሱ ቅርብ ነው?',                   meaning: 'Hello. Is the minibus close?' },
      { speaker: 'B', amharic: 'አዎ፣ ሚኒባሱ ቅርብ ነው።',                    meaning: 'Yes, the minibus is close.' },
      { speaker: 'A', amharic: 'ሆቴሉ የት ነው?',                            meaning: 'Where is the hotel?' },
      { speaker: 'B', amharic: 'አልገባኝም። ይቅርታ። ቀስ ቀስ ሂድ።',            meaning: "I don't understand. Sorry. Go slowly." },
      { speaker: 'A', amharic: 'ይሆናል። ሆቴሉ ሩቅ ነው?',                   meaning: 'Okay. Is the hotel far?' },
      { speaker: 'B', amharic: 'አዎ፣ ሆቴሉ ሩቅ ነው።',                      meaning: 'Yes, the hotel is far.' },
      { speaker: 'A', amharic: 'ቆም!',                                    meaning: 'Stop!' },
      { speaker: 'A', amharic: 'አመሰግናለሁ!',                              meaning: 'Thank you!' },
      { speaker: 'B', amharic: 'ምንም አይደለም!',                            meaning: "You're welcome!" },
    ],
  },

  // ── ጤና ይስጥልዎ — A respectful greeting ────────────────────────────────────
  {
    id: 'dial_formal_greeting',
    type: 'dialogue',
    title: 'ጤና ይስጥልዎ',
    titleMeaning: 'A Respectful Greeting',
    phraseIds: ['tena_yistilignh', 'where_from', 'im_from', 'englizgna_yinageralu', 'ay', 'minim_ayidelem', 'amarenna', 'betam_tiru', 'icalalehu', 'ibakih', 'awo', 'ameseginalehu', 'dehna_hun'],
    lines: [
      { speaker: 'A', amharic: 'ጤና ይስጥልዎ።',                        meaning: 'Hello (respectful).' },
      { speaker: 'B', amharic: 'ጤና ይስጥልህ! ከየት ነህ?',                meaning: 'Hello! Where are you from?' },
      { speaker: 'A', amharic: 'ከአሜሪካ ነኝ። እንግሊዝኛ ይናገራሉ?',         meaning: "I'm from America. Do you speak English?" },
      { speaker: 'B', amharic: 'አይ።',                                meaning: 'No.' },
      { speaker: 'A', amharic: 'ምንም አይደለም! ትንሽ አማርኛ እናገራለሁ።',    meaning: 'No problem! I speak a little Amharic.' },
      { speaker: 'B', amharic: 'በጣም ጥሩ!',                           meaning: 'Very good!' },
      { speaker: 'A', amharic: 'ፎቶ እችላለሁ? እባክዎ።',                  meaning: 'Can I take a photo? Please.' },
      { speaker: 'B', amharic: 'አዎ! ካሜራው ቆንጆ ነው።',                meaning: 'Yes! The camera is beautiful.' },
      { speaker: 'A', amharic: 'አመሰግናለሁ! ደህና ሁን።',                 meaning: 'Thank you! Goodbye.' },
      { speaker: 'B', amharic: 'ደህና ሁን!',                            meaning: 'Goodbye!' },
    ],
  },

  // ── እንኳን ደስ አለህ — Good news ───────────────────────────────────────────
  {
    id: 'dial_good_news',
    type: 'dialogue',
    title: 'እንኳን ደስ አለህ',
    titleMeaning: 'Congratulations!',
    phraseIds: ['selam', 'endet_neh', 'dehna_negn', 'inkuan_des_aleh', 'ameseginalehu', 'betam_tiru', 'chaw'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም! እንዴት ነህ?',                      meaning: 'Hi! How are you?' },
      { speaker: 'B', amharic: 'ደህና ነኝ፣ አመሰግናለሁ! እንኳን ደስ አለህ!',    meaning: "I'm fine, thanks! Congratulations!" },
      { speaker: 'A', amharic: 'አመሰግናለሁ! በጣም ጥሩ ነው!',              meaning: "Thank you! It's very good!" },
      { speaker: 'B', amharic: 'ቻው!',                                  meaning: 'Bye!' },
      { speaker: 'A', amharic: 'ቻው!',                                  meaning: 'Bye!' },
    ],
  },

  // ── ገበያው ቅርብ ነው? — Market day ──────────────────────────────────────────
  {
    id: 'dial_market',
    type: 'dialogue',
    title: 'ገበያው ቅርብ ነው?',
    titleMeaning: 'Market Day',
    phraseIds: ['gebeya', 'suq', 'awo', 'ay', 'ruq', 'qərb', 'sint_new', 'bir', 'yihonahal', 'ameseginalehu', 'minim_ayidelem'],
    lines: [
      { speaker: 'A', amharic: 'ገበያው ቅርብ ነው?',                       meaning: 'Is the market close?' },
      { speaker: 'B', amharic: 'አዎ፣ ቅርብ ነው።',                        meaning: "Yes, it's close." },
      { speaker: 'A', amharic: 'ሱቁ ቅርብ ነው?',                          meaning: 'Is the shop close?' },
      { speaker: 'B', amharic: 'አይ፣ ሱቁ ሩቅ ነው ግን ገበያው ቅርብ ነው።',    meaning: 'No, the shop is far, but the market is close.' },
      { speaker: 'A', amharic: 'ራዲዮ ስንት ነው?',                        meaning: 'How much is the radio?' },
      { speaker: 'B', amharic: 'ራዲዮው ብር ነው።',                       meaning: 'The radio is priced in birr.' },
      { speaker: 'A', amharic: 'ይሆናል፣ አመሰግናለሁ!',                    meaning: 'Okay, thank you!' },
      { speaker: 'B', amharic: 'ምንም አይደለም!',                          meaning: "You're welcome!" },
    ],
  },

  // ── ዳቦ እና ሻሂ — Bread and tea ───────────────────────────────────────────
  {
    id: 'dial_breakfast',
    type: 'dialogue',
    title: 'ዳቦ እና ሻሂ',
    titleMeaning: 'Bread and Tea',
    phraseIds: ['selam', 'dabo', 'you_want', 'awo', 'shahi', 'ifelgalehu', 'shiro', 'misir', 'betam_tiru', 'injera', 'iwedalehu', 'egzabihir_yemisgen'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም! ዳቦ ትፈልጋለህ?',                    meaning: 'Hi! Do you want bread?' },
      { speaker: 'B', amharic: 'አዎ! ሻሂ እፈልጋለሁ።',                     meaning: 'Yes! I want tea.' },
      { speaker: 'A', amharic: 'ሽሮ ጥሩ ነው?',                           meaning: 'Is the shiro good?' },
      { speaker: 'B', amharic: 'አዎ፣ ሚስር በጣም ጥሩ ነው!',                meaning: 'Yes, the misir is very good!' },
      { speaker: 'A', amharic: 'እንጀራ እወዳለሁ!',                         meaning: 'I like injera!' },
      { speaker: 'B', amharic: 'እግዚአብሔር ይመስገን!',                     meaning: 'Thank God!' },
    ],
  },

  // ── ካፌ ቅርብ ነው? — Around town ───────────────────────────────────────────
  {
    id: 'dial_around_town',
    type: 'dialogue',
    title: 'ካፌ ቅርብ ነው?',
    titleMeaning: 'Around Town',
    phraseIds: ['qərb', 'ruq', 'ay', 'awo'],
    lines: [
      { speaker: 'A', amharic: 'ካፌ ቅርብ ነው?',                          meaning: 'Is there a cafe nearby?' },
      { speaker: 'B', amharic: 'አዎ፣ ቅርብ ነው። ዋይፋይ ጥሩ ነው!',          meaning: "Yes, it's close. The wifi is good!" },
      { speaker: 'A', amharic: 'ፖሊስ ቅርብ ነው?',                         meaning: 'Is the police close?' },
      { speaker: 'B', amharic: 'አይ፣ ፖሊስ ሩቅ ነው ግን ባንኩ ቅርብ ነው።',    meaning: 'No, the police is far, but the bank is close.' },
      { speaker: 'A', amharic: 'ፋርማሲ ቅርብ ነው?',                        meaning: 'Is the pharmacy close?' },
      { speaker: 'B', amharic: 'አዎ! ፋርማሲ ቅርብ ነው ግን ሲኒማ ሩቅ ነው።',   meaning: 'Yes! The pharmacy is close but the cinema is far.' },
      { speaker: 'A', amharic: 'ሳንዱዊቹ ጥሩ ነው?',                        meaning: 'Is the sandwich good?' },
      { speaker: 'B', amharic: 'አዎ፣ ሳንዱዊቹ ጥሩ ነው።',                   meaning: 'Yes, the sandwich is good.' },
      { speaker: 'A', amharic: 'ኢንተርኔቱ ጥሩ ነው?',                       meaning: 'Is the internet good?' },
      { speaker: 'B', amharic: 'አዎ! ቡፌ በጣም ጥሩ ነው!',                  meaning: 'Yes! The buffet is very good!' },
    ],
  },

  // ── ሲኒማ ቅርብ ነው? — Cinema night ─────────────────────────────────────────
  {
    id: 'dial_cinema',
    type: 'dialogue',
    title: 'ሲኒማ ቅርብ ነው?',
    titleMeaning: 'Cinema Night',
    phraseIds: ['selam', 'qərb', 'iwedalehu', 'betam_tiru', 'eshi', 'inihed', 'ameseginalehu', 'minim_ayidelem'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም! ሲኒማ ቅርብ ነው?',                   meaning: 'Hi! Is the cinema close?' },
      { speaker: 'B', amharic: 'አዎ፣ ቅርብ ነው።',                         meaning: "Yes, it's close." },
      { speaker: 'A', amharic: 'ፒዛ እወዳለሁ! በጣም ጥሩ ነው።',              meaning: 'I like pizza! It\'s very good.' },
      { speaker: 'B', amharic: 'እሺ! እንሂድ።',                            meaning: "Okay! Let's go." },
      { speaker: 'A', amharic: 'አመሰግናለሁ!',                             meaning: 'Thank you!' },
      { speaker: 'B', amharic: 'ምንም አይደለም!',                           meaning: "You're welcome!" },
    ],
  },

  // ── ስልክ እችላለሁ? — Borrowing a phone ──────────────────────────────────
  {
    id: 'dial_phone',
    type: 'dialogue',
    title: 'ስልክ እችላለሁ?',
    titleMeaning: 'Borrowing a Phone',
    phraseIds: ['silk', 'icalalehu', 'ibakih', 'qoy', 'wuha', 'awo', 'ameseginalehu', 'cheger_yelem'],
    lines: [
      { speaker: 'A', amharic: 'ስልክ እችላለሁ? እባክህ።',                    meaning: 'Can I use the phone? Please.' },
      { speaker: 'B', amharic: 'አዎ! ቆይ።',                               meaning: 'Yes! Wait.' },
      { speaker: 'A', amharic: 'ውሃ እችላለሁ?',                            meaning: 'Can I have water?' },
      { speaker: 'B', amharic: 'አዎ!',                                    meaning: 'Yes!' },
      { speaker: 'A', amharic: 'አመሰግናለሁ!',                              meaning: 'Thank you!' },
      { speaker: 'B', amharic: 'ችግር የለም!',                              meaning: 'No problem!' },
    ],
  },
];
