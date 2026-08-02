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

  // ── Cognate sentences ──────────────────────────────────────────────────────
  {
    id: 'passport_where',
    type: 'sentence',
    amharic: 'ፓስፖርቴ የት ነው?',
    meaning: 'Where is my passport?',
    phraseIds: ['wedet_new'],
    words: [
      { amharic: 'ፓስፖርቴ', meaning: 'my passport' },
      { amharic: 'የት',    meaning: 'where' },
      { amharic: 'ነው',    meaning: 'is?' },
    ],
  },
  {
    id: 'hospital_where',
    type: 'sentence',
    amharic: 'ሆስፒታሉ የት ነው?',
    meaning: 'Where is the hospital?',
    phraseIds: ['wedet_new'],
    words: [
      { amharic: 'ሆስፒታሉ', meaning: 'the hospital' },
      { amharic: 'የት',     meaning: 'where' },
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
    amharic: 'ቆይ! ገንዘብ እፈልጋለሁ።',
    meaning: "Wait! I need money.",
    phraseIds: ['qoy', 'genzeb', 'ifelgalehu'],
    words: [
      { amharic: 'ቆይ',         meaning: 'wait' },
      { amharic: 'ገንዘብ እፈልጋለሁ', meaning: "I need money" },
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
  // ── Consolidated (was 10 separate near-duplicate sentences) ────────────────
  // The original set repeated "X እፈልጋለሁ" (I want X) and "X ነው?" (is X...?)
  // templates far more than needed, same grammar, different noun, no real
  // variety. Merged pairs that were testing similar/adjacent vocabulary
  // under the exact same construction into one denser sentence each.
  {
    id: 'taxi_phone_want',
    type: 'sentence',
    amharic: 'ታክሲ እና ስልክ እፈልጋለሁ።',
    meaning: 'I want a taxi and a phone.',
    phraseIds: ['taksi', 'silk', 'ifelgalehu'],
    words: [
      { amharic: 'ታክሲ እና ስልክ', meaning: 'taxi and phone' },
      { amharic: 'እፈልጋለሁ',     meaning: 'I want' },
    ],
  },
  {
    id: 'work_money_want',
    type: 'sentence',
    amharic: 'ስራ እና ገንዘብ እፈልጋለሁ።',
    meaning: 'I want work and money.',
    phraseIds: ['sira', 'genzeb', 'ifelgalehu'],
    words: [
      { amharic: 'ስራ እና ገንዘብ', meaning: 'work and money' },
      { amharic: 'እፈልጋለሁ',      meaning: 'I want' },
    ],
  },
  {
    id: 'ticket_khat_want',
    type: 'sentence',
    amharic: 'ቲኬት እና ጫት እፈልጋለሁ።',
    meaning: 'I want a ticket and khat.',
    phraseIds: ['khat', 'ifelgalehu'],
    words: [
      { amharic: 'ቲኬት እና ጫት', meaning: 'ticket and khat' },
      { amharic: 'እፈልጋለሁ',     meaning: 'I want' },
    ],
  },
  {
    id: 'wifi_pizza_good',
    type: 'sentence',
    amharic: 'ዋይፋይ ጥሩ ነው? ፒዛ ጥሩ ነው?',
    meaning: 'Is the wifi good? Is the pizza good?',
    phraseIds: ['betam_tiru'],
    words: [
      { amharic: 'ዋይፋይ ጥሩ ነው', meaning: 'is the wifi good?' },
      { amharic: 'ፒዛ ጥሩ ነው',   meaning: 'is the pizza good?' },
    ],
  },
  {
    id: 'family_brother_well',
    type: 'sentence',
    amharic: 'ቤተሰቡ ደህና ነው? ወንድሜ ደህና ነው?',
    meaning: 'Is the family well? Is my brother well?',
    phraseIds: ['beteseb', 'wendeme', 'dehna_neh'],
    words: [
      { amharic: 'ቤተሰቡ ደህና ነው', meaning: 'is the family well?' },
      { amharic: 'ወንድሜ ደህና ነው', meaning: 'is my brother well?' },
    ],
  },

  // ── Full phrase-coverage additions ──────────────────────────────────────────
  // Every Common Phrase from amharicPhrases.js now appears in at least one
  // SENTENCES entry (previously some were only used in DIALOGUES), so the
  // Sentences tab alone is a complete standalone unit for the "Generate a
  // sentence" button's static-first fallback. Kept dense (multiple phrase
  // pairs per entry) rather than one phrase per sentence, to cover the same
  // ground without ballooning the total count.
  {
    id: 'name_intro',
    type: 'sentence',
    amharic: 'ስምህ ማን ነው? ስሜ ዮሐንስ ነው።',
    meaning: 'What is your name? My name is Yohannes.',
    phraseIds: ['simih_man_new', 'sime_new'],
    words: [
      { amharic: 'ስምህ ማን ነው',   meaning: 'what is your name?' },
      { amharic: 'ስሜ ዮሐንስ ነው', meaning: 'my name is Yohannes' },
    ],
  },
  {
    id: 'how_where_from',
    type: 'sentence',
    amharic: 'እንዴት ነህ? ደህና ነኝ። ከየት ነህ? ከአሜሪካ ነኝ።',
    meaning: "How are you? I'm fine. Where are you from? I'm from America.",
    phraseIds: ['endet_neh', 'dehna_negn', 'where_from', 'im_from'],
    words: [
      { amharic: 'እንዴት ነህ',   meaning: 'how are you?' },
      { amharic: 'ደህና ነኝ',    meaning: "I'm fine" },
      { amharic: 'ከየት ነህ',    meaning: 'where are you from?' },
      { amharic: 'ከአሜሪካ ነኝ', meaning: "I'm from America" },
    ],
  },
  {
    id: 'formal_language',
    type: 'sentence',
    amharic: 'ጤና ይስጥልህ! እንግሊዝኛ ትናገራለህ? ትንሽ አማርኛ እናገራለሁ። በጣም ጥሩ!',
    meaning: 'Hello! Do you speak English? I speak a little Amharic. Very good!',
    phraseIds: ['tena_yistilignh', 'englizgna_yinageralu', 'amarenna', 'betam_tiru'],
    words: [
      { amharic: 'ጤና ይስጥልህ',          meaning: 'hello (formal)' },
      { amharic: 'እንግሊዝኛ ትናገራለህ',    meaning: 'do you speak English?' },
      { amharic: 'ትንሽ አማርኛ እናገራለሁ', meaning: 'I speak a little Amharic' },
      { amharic: 'በጣም ጥሩ',            meaning: 'very good' },
    ],
  },
  {
    id: 'okay_yes_work',
    type: 'sentence',
    amharic: 'እሺ! አንተስ? አዎ! ይሆናል።',
    meaning: "Okay! And you? Yes! It'll work.",
    phraseIds: ['eshi', 'antis', 'awo', 'yihonahal'],
    words: [
      { amharic: 'እሺ',   meaning: 'okay' },
      { amharic: 'አንተስ', meaning: 'and you?' },
      { amharic: 'አዎ',   meaning: 'yes' },
      { amharic: 'ይሆናል', meaning: "it'll work" },
    ],
  },
  {
    id: 'sorry_congrats',
    type: 'sentence',
    amharic: 'ይቅርታ! አላውቅም። እንኳን ደስ አለህ! ደህና ሁን!',
    meaning: "Sorry! I don't know. Congratulations! Goodbye!",
    phraseIds: ['yikirta', 'alwukim', 'inkuan_des_aleh', 'dehna_hun'],
    words: [
      { amharic: 'ይቅርታ',        meaning: 'sorry' },
      { amharic: 'አላውቅም',       meaning: "I don't know" },
      { amharic: 'እንኳን ደስ አለህ', meaning: 'congratulations' },
      { amharic: 'ደህና ሁን',      meaning: 'goodbye' },
    ],
  },
  {
    id: 'bill_minibus',
    type: 'sentence',
    amharic: 'ሂሳብ እባክህ! ስንት ነው? ሚኒባሱ! ቆም!',
    meaning: 'The bill, please! How much is it? Minibus! Stop!',
    phraseIds: ['hisab', 'ibakih', 'sint_new', 'minibus', 'qom'],
    words: [
      { amharic: 'ሂሳብ እባክህ', meaning: 'the bill, please' },
      { amharic: 'ስንት ነው',   meaning: 'how much is it?' },
      { amharic: 'ሚኒባሱ',     meaning: 'the minibus' },
      { amharic: 'ቆም',        meaning: 'stop' },
    ],
  },
  {
    id: 'hotel_restaurant_cost',
    type: 'sentence',
    amharic: 'ሆቴሉ ቅርብ ነው፣ ምሳ ቤቱ ሩቅ ነው። ብር ስንት ነው?',
    meaning: 'The hotel is close, the restaurant is far. How much is it, in birr?',
    phraseIds: ['hotel', 'qərb', 'misa_bet', 'ruq', 'bir', 'sint_new'],
    words: [
      { amharic: 'ሆቴሉ ቅርብ ነው',   meaning: 'the hotel is close' },
      { amharic: 'ምሳ ቤቱ ሩቅ ነው', meaning: 'the restaurant is far' },
      { amharic: 'ብር ስንት ነው',    meaning: 'how much is it, in birr?' },
    ],
  },
  {
    id: 'doro_misir_food',
    type: 'sentence',
    amharic: 'ዶሮ ወጥ እና ሽሮ በጣም ጥሩ ነው። ሚስር እና ሰምቡሳ እወዳለሁ።',
    meaning: 'Doro wat and shiro are very good. I like misir and samboosa.',
    phraseIds: ['doro_wot', 'shiro', 'betam_tiru', 'misir', 'sambusa', 'iwedalehu'],
    words: [
      { amharic: 'ዶሮ ወጥ እና ሽሮ', meaning: 'doro wat and shiro' },
      { amharic: 'በጣም ጥሩ ነው',   meaning: 'is very good' },
      { amharic: 'ሚስር እና ሰምቡሳ', meaning: 'misir and samboosa' },
      { amharic: 'እወዳለሁ',        meaning: 'I like' },
    ],
  },
  {
    id: 'food_tej_injera',
    type: 'sentence',
    amharic: 'ምግብ እና ጠጅ እፈልጋለሁ። እንጀራ በጣም ጥሩ ነው! እግዚአብሔር ይመስገን!',
    meaning: 'I want food and tej. The injera is very good! Thank God!',
    phraseIds: ['migib', 'tej', 'ifelgalehu', 'injera', 'betam_tiru', 'egzabihir_yemisgen'],
    words: [
      { amharic: 'ምግብ እና ጠጅ',        meaning: 'food and tej' },
      { amharic: 'እፈልጋለሁ',           meaning: 'I want' },
      { amharic: 'እንጀራ በጣም ጥሩ ነው', meaning: 'the injera is very good' },
      { amharic: 'እግዚአብሔር ይመስገን', meaning: 'thank God' },
    ],
  },
  {
    id: 'bye_brother',
    type: 'sentence',
    amharic: 'ቻው ወንድሜ!',
    meaning: 'Bye, my brother!',
    phraseIds: ['chaw', 'wendeme'],
    words: [
      { amharic: 'ቻው',   meaning: 'bye' },
      { amharic: 'ወንድሜ', meaning: 'my brother' },
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
      { speaker: 'A', amharic: 'ከአሜሪካ ነኝ። እንግሊዝኛ ትናገራለህ?',         meaning: "I'm from America. Do you speak English?" },
      { speaker: 'B', amharic: 'አይ።',                                meaning: 'No.' },
      { speaker: 'A', amharic: 'ምንም አይደለም! ትንሽ አማርኛ እናገራለሁ።',    meaning: 'No problem! I speak a little Amharic.' },
      { speaker: 'B', amharic: 'በጣም ጥሩ!',                           meaning: 'Very good!' },
      { speaker: 'A', amharic: 'ፎቶ እችላለሁ? እባክህ።',                  meaning: 'Can I take a photo? Please.' },
      { speaker: 'B', amharic: 'አዎ! ካሜራው ቆንጆ ነው።',                meaning: 'Yes! The camera is beautiful.' },
      { speaker: 'A', amharic: 'አመሰግናለሁ! ደህና ሁን።',                 meaning: 'Thank you! Goodbye.' },
      { speaker: 'B', amharic: 'ደህና ሁን!',                            meaning: 'Goodbye!' },
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

  // ── ቡና ቤቱ — At the coffee house ─────────────────────────────────────────
  {
    id: 'dial_coffee',
    type: 'dialogue',
    title: 'ቡና ቤቱ',
    titleMeaning: 'At the Coffee House',
    phraseIds: ['buna_bet', 'konjo', 'shahi', 'betam_tiru', 'sambusa', 'awo', 'hisab', 'sint_new', 'bir', 'yihonahal', 'ameseginalehu'],
    lines: [
      { speaker: 'A', amharic: 'ቡና ቤቱ ቆንጆ ነው!',                        meaning: 'The coffee house is beautiful!' },
      { speaker: 'B', amharic: 'አመሰግናለሁ! ቡናው በጣም ጥሩ ነው።',            meaning: 'Thank you! The coffee is very good.' },
      { speaker: 'A', amharic: 'ሻሂ ጥሩ ነው?',                            meaning: 'Is the tea good?' },
      { speaker: 'B', amharic: 'አዎ፣ ሻሂ ጥሩ ነው። ሰምቡሳ በጣም ጥሩ ነው!',     meaning: 'Yes, the tea is good. The samboosa is very good!' },
      { speaker: 'A', amharic: 'ሂሳቡ ስንት ነው?',                          meaning: 'How much is the bill?' },
      { speaker: 'B', amharic: 'ሂሳቡ ሁለት መቶ ሃምሳ ብር ነው።',              meaning: 'The bill is 250 birr.' },
      { speaker: 'A', amharic: 'ይሆናል፣ አመሰግናለሁ!',                       meaning: 'Okay, thank you!' },
    ],
  },

  // ── ምሳ ቤቱ — At the restaurant ───────────────────────────────────────────
  {
    id: 'dial_restaurant',
    type: 'dialogue',
    title: 'ምሳ ቤቱ',
    titleMeaning: 'At the Restaurant',
    phraseIds: ['misa_bet', 'migib', 'doro_wot', 'injera', 'betam_tiru', 'awo', 'iwedalehu', 'hisab', 'sint_new', 'bir', 'egzabihir_yemisgen'],
    lines: [
      { speaker: 'A', amharic: 'ምግቡ ጥሩ ነው?',                          meaning: 'Is the food good?' },
      { speaker: 'B', amharic: 'አዎ! ዶሮ ወጥ በጣም ጥሩ ነው።',               meaning: 'Yes! The doro wat is very good.' },
      { speaker: 'A', amharic: 'ፒዛ ጥሩ ነው?',                            meaning: 'Is the pizza good?' },
      { speaker: 'B', amharic: 'አዎ፣ ፒዛ ጥሩ ነው ግን እንጀራ በጣም ጥሩ ነው!',  meaning: 'Yes, the pizza is good, but injera is very good!' },
      { speaker: 'A', amharic: 'ዶሮ ወጥ እወዳለሁ!',                         meaning: 'I like doro wat!' },
      { speaker: 'B', amharic: 'በጣም ጥሩ!',                              meaning: 'Very good!' },
      { speaker: 'A', amharic: 'ሂሳቡ ስንት ነው?',                          meaning: 'How much is the bill?' },
      { speaker: 'B', amharic: 'ሂሳቡ ስምንት መቶ ሃምሳ ብር ነው።',             meaning: 'The bill is 850 birr.' },
      { speaker: 'A', amharic: 'እግዚአብሔር ይመስገን!',                       meaning: 'Thanks be to God!' },
    ],
  },

  // ── ወንድሜ — Breakfast with my brother ────────────────────────────────────
  {
    id: 'dial_breakfast',
    type: 'dialogue',
    title: 'ወንድሜ',
    titleMeaning: 'My Brother',
    phraseIds: ['selam', 'wendeme', 'you_want', 'awo', 'shahi', 'ifelgalehu', 'shiro', 'misir', 'betam_tiru', 'injera', 'iwedalehu'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም ወንድሜ! ሻሂ ትፈልጋለህ?',              meaning: 'Hi, my brother! Do you want tea?' },
      { speaker: 'B', amharic: 'አዎ! ሻሂ እፈልጋለሁ።',                     meaning: 'Yes! I want tea.' },
      { speaker: 'A', amharic: 'ሽሮ ጥሩ ነው?',                           meaning: 'Is the shiro good?' },
      { speaker: 'B', amharic: 'አዎ፣ ሚስር በጣም ጥሩ ነው!',                meaning: 'Yes, the misir is very good!' },
      { speaker: 'A', amharic: 'እንጀራ እወዳለሁ!',                         meaning: 'I like injera!' },
    ],
  },

  // ── ሆቴሉ የት ነው? — Finding your way ───────────────────────────────────────
  {
    id: 'dial_directions',
    type: 'dialogue',
    title: 'ሆቴሉ የት ነው?',
    titleMeaning: 'Finding Your Way',
    phraseIds: ['selam', 'hotel', 'wedet_new', 'qərb', 'ruq', 'minibus', 'alegabagnim', 'qes_qes_hid', 'yikirta', 'betam_tiru', 'awo', 'taksi', 'eshi', 'ameseginalehu', 'cheger_yelem'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም። ሆቴሉ የት ነው?',                     meaning: 'Hello. Where is the hotel?' },
      { speaker: 'B', amharic: 'ሆቴሉ ቅርብ ነው። ግን ሚኒባሱ ሩቅ ነው።',        meaning: 'The hotel is close. But the minibus is far.' },
      { speaker: 'A', amharic: 'አልገባኝም። ቀስ ቀስ ሂድ።',                  meaning: "I don't understand. Go slowly." },
      { speaker: 'B', amharic: 'ይቅርታ! ሆቴሉ ቅርብ ነው፣ ሚኒባሱ ሩቅ ነው።',      meaning: 'Sorry! The hotel is close, the minibus is far.' },
      { speaker: 'A', amharic: 'ዋይፋይ ጥሩ ነው?',                          meaning: 'Is the wifi good?' },
      { speaker: 'B', amharic: 'አዎ! ዋይፋይ ጥሩ ነው።',                     meaning: 'Yes! The wifi is good.' },
      { speaker: 'A', amharic: 'ታክሲ ቅርብ ነው?',                          meaning: 'Is there a taxi nearby?' },
      { speaker: 'B', amharic: 'አዎ፣ ታክሲ ቅርብ ነው።',                     meaning: 'Yes, there is a taxi nearby.' },
      { speaker: 'A', amharic: 'እሺ፣ አመሰግናለሁ!',                          meaning: 'Okay, thank you!' },
      { speaker: 'B', amharic: 'ችግር የለም!',                             meaning: 'No problem!' },
    ],
  },

  // ── ገበያው ቅርብ ነው? — Running errands ──────────────────────────────────────
  {
    id: 'dial_errands',
    type: 'dialogue',
    title: 'ገበያው ቅርብ ነው?',
    titleMeaning: 'Running Errands',
    phraseIds: ['qərb', 'ruq', 'ay', 'awo', 'iwedalehu', 'eshi', 'gebeya', 'sint_new', 'bir', 'inihed'],
    lines: [
      { speaker: 'A', amharic: 'ባንኩ ቅርብ ነው?',                          meaning: 'Is the bank close?' },
      { speaker: 'B', amharic: 'አይ፣ ባንኩ ሩቅ ነው ግን ፋርማሲው ቅርብ ነው።',    meaning: 'No, the bank is far, but the pharmacy is close.' },
      { speaker: 'A', amharic: 'ሲኒማ ቅርብ ነው?',                          meaning: 'Is the cinema close?' },
      { speaker: 'B', amharic: 'አዎ! ሲኒማ ቅርብ ነው። ፒዛ እወዳለሁ!',          meaning: 'Yes! The cinema is close. I like pizza!' },
      { speaker: 'A', amharic: 'እሺ! ገበያው ቅርብ ነው?',                    meaning: 'Okay! Is the market close?' },
      { speaker: 'B', amharic: 'አዎ፣ ገበያው ቅርብ ነው።',                    meaning: 'Yes, the market is close.' },
      { speaker: 'A', amharic: 'ራዲዮ ስንት ነው?',                          meaning: 'How much is the radio?' },
      { speaker: 'B', amharic: 'ራዲዮው ሰባት መቶ ሃምሳ ብር ነው።',             meaning: 'The radio is 750 birr.' },
      { speaker: 'A', amharic: 'እንሂድ!',                                  meaning: "Let's go!" },
      { speaker: 'B', amharic: 'እንሂድ!',                                  meaning: "Let's go!" },
    ],
  },

  // ── ዶክተር — Medical emergency ───────────────────────────────────────────
  {
    id: 'dial_medical',
    type: 'dialogue',
    title: 'ዶክተር እፈልጋለሁ',
    titleMeaning: 'I Need a Doctor',
    phraseIds: ['ifelgalehu', 'qərb', 'wedet_new', 'taksi', 'awo', 'ameseginalehu', 'minim_ayidelem', 'tolo'],
    lines: [
      { speaker: 'A', amharic: 'ዶክተር እፈልጋለሁ!',                        meaning: 'I need a doctor!' },
      { speaker: 'B', amharic: 'ዶክተር? ሆስፒታሉ ቅርብ ነው።',                 meaning: 'A doctor? The hospital is close.' },
      { speaker: 'A', amharic: 'ሆስፒታሉ የት ነው?',                          meaning: 'Where is the hospital?' },
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
    phraseIds: ['selam', 'wedet_new', 'ruq', 'qərb', 'taksi', 'waga', 'sint_new', 'bir', 'alwukim', 'yikirta', 'qoy', 'yihonahal', 'dehna_hun'],
    lines: [
      { speaker: 'A', amharic: 'ሰላም። ኤርፖርቱ የት ነው?',                    meaning: 'Hello. Where is the airport?' },
      { speaker: 'B', amharic: 'ኤርፖርቱ ሩቅ ነው። ታክሲ ቅርብ ነው።',           meaning: 'The airport is far. There is a taxi close by.' },
      { speaker: 'A', amharic: 'ዋጋው ስንት ነው?',                          meaning: 'How much does it cost?' },
      { speaker: 'B', amharic: 'ዋጋው ስድስት መቶ ብር ነው።',                  meaning: 'The cost is 600 birr.' },
      { speaker: 'A', amharic: 'ፓስፖርቴ የት ነው?',                          meaning: 'Where is my passport?' },
      { speaker: 'B', amharic: 'አላውቅም። ይቅርታ።',                         meaning: "I don't know. Sorry." },
      { speaker: 'A', amharic: 'ቲኬቴ የት ነው?',                            meaning: 'Where is my ticket?' },
      { speaker: 'B', amharic: 'ቆይ! ይሆናል።',                            meaning: 'Wait! It will be fine.' },
      { speaker: 'A', amharic: 'ደህና ሁን!',                                meaning: 'Goodbye!' },
      { speaker: 'B', amharic: 'ደህና ሁን!',                                meaning: 'Goodbye!' },
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
