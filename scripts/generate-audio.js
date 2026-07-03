#!/usr/bin/env node
/**
 * generate-audio.js
 *
 * Generates all 238 Amharic Fidel MP3 files using Google Cloud Text-to-Speech.
 * Sends the actual Ethiopic characters (e.g. ሀ ሁ ሂ …) to the am-ET voice
 * so pronunciation is native, not transliterated English.
 *
 * Usage:
 *   node scripts/generate-audio.js YOUR_GOOGLE_API_KEY
 *
 *   or set the env var and run without an argument:
 *   GOOGLE_API_KEY=your_key node scripts/generate-audio.js
 *
 * Output: public/audio/ha_1.mp3, public/audio/ha_2.mp3, … (238 core + 20 labiovelar files)
 *
 * Requirements:
 *   - Node.js 18+ (uses built-in fetch)
 *   - A Google Cloud API key with Text-to-Speech API enabled
 *     (free tier: 1 million characters/month — these 238 chars cost ~238 chars total)
 *
 * To get an API key:
 *   1. Go to https://console.cloud.google.com
 *   2. Create or select a project
 *   3. Enable "Cloud Text-to-Speech API"
 *   4. Go to APIs & Services → Credentials → Create Credentials → API Key
 *   5. (Optional) Restrict the key to the TTS API for safety
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config ───────────────────────────────────────────────────────────────────
const API_KEY        = process.argv[2] || process.env.GOOGLE_API_KEY;
const OUTPUT_DIR     = join(__dirname, '..', 'public', 'audio');
const NUMBERS_DIR    = join(OUTPUT_DIR, 'numbers');
const PHRASES_DIR    = join(OUTPUT_DIR, 'phrases');
const OVERWRITE      = process.argv.includes('--overwrite');
const NUMBERS_ONLY   = process.argv.includes('--numbers-only');
const PHRASES_ONLY   = process.argv.includes('--phrases-only');
const WORDS_ONLY     = process.argv.includes('--words-only');

// Voice options:
//   am-ET-Standard-A  female, free tier
//   am-ET-Standard-B  male,   free tier
//   am-ET-Wavenet-A   female, higher quality (small cost above free tier)
//   am-ET-Wavenet-B   male,   higher quality
const VOICE_NAME  = 'am-ET-Standard-A';
const LANGUAGE    = 'am-ET';

// Small delay between API calls to avoid rate-limit errors (ms)
const DELAY_MS    = 120;

if (!API_KEY) {
  console.error('❌  No API key found.');
  console.error('    Usage: node scripts/generate-audio.js YOUR_API_KEY');
  console.error('    Or:    GOOGLE_API_KEY=your_key node scripts/generate-audio.js');
  process.exit(1);
}

// ─── Fidel data (mirrors src/data/fidel.js — keep in sync if you edit rows) ──
const FIDEL_ROWS = [
  { id: 'ha',     chars: ['ሀ','ሁ','ሂ','ሃ','ሄ','ህ','ሆ'] },
  { id: 'le',     chars: ['ለ','ሉ','ሊ','ላ','ሌ','ል','ሎ'] },
  { id: 'he',     chars: ['ሐ','ሑ','ሒ','ሓ','ሔ','ሕ','ሖ'] },
  { id: 'me',     chars: ['መ','ሙ','ሚ','ማ','ሜ','ም','ሞ'] },
  { id: 'se_old', chars: ['ሠ','ሡ','ሢ','ሣ','ሤ','ሥ','ሦ'] },
  { id: 're',     chars: ['ረ','ሩ','ሪ','ራ','ሬ','ር','ሮ'] },
  { id: 'se',     chars: ['ሰ','ሱ','ሲ','ሳ','ሴ','ስ','ሶ'] },
  { id: 'she',    chars: ['ሸ','ሹ','ሺ','ሻ','ሼ','ሽ','ሾ'] },
  { id: 'qe',     chars: ['ቀ','ቁ','ቂ','ቃ','ቄ','ቅ','ቆ'] },
  { id: 'be',     chars: ['በ','ቡ','ቢ','ባ','ቤ','ብ','ቦ'] },
  { id: 've',     chars: ['ቨ','ቩ','ቪ','ቫ','ቬ','ቭ','ቮ'] },
  { id: 'te',     chars: ['ተ','ቱ','ቲ','ታ','ቴ','ት','ቶ'] },
  { id: 'che',    chars: ['ቸ','ቹ','ቺ','ቻ','ቼ','ች','ቾ'] },
  { id: 'khe',    chars: ['ኀ','ኁ','ኂ','ኃ','ኄ','ኅ','ኆ'] },
  { id: 'ne',     chars: ['ነ','ኑ','ኒ','ና','ኔ','ን','ኖ'] },
  { id: 'nye',    chars: ['ኘ','ኙ','ኚ','ኛ','ኜ','ኝ','ኞ'] },
  { id: 'a',      chars: ['አ','ኡ','ኢ','ኣ','ኤ','እ','ኦ'] },
  { id: 'ke',     chars: ['ከ','ኩ','ኪ','ካ','ኬ','ክ','ኮ'] },
  { id: 'hhe',    chars: ['ኸ','ኹ','ኺ','ኻ','ኼ','ኽ','ኾ'] },
  { id: 'we',     chars: ['ወ','ዉ','ዊ','ዋ','ዌ','ው','ዎ'] },
  { id: 'gha',    chars: ['ዐ','ዑ','ዒ','ዓ','ዔ','ዕ','ዖ'] },
  { id: 'ze',     chars: ['ዘ','ዙ','ዚ','ዛ','ዜ','ዝ','ዞ'] },
  { id: 'zhe',    chars: ['ዠ','ዡ','ዢ','ዣ','ዤ','ዥ','ዦ'] },
  { id: 'ye',     chars: ['የ','ዩ','ዪ','ያ','ዬ','ይ','ዮ'] },
  { id: 'de',     chars: ['ደ','ዱ','ዲ','ዳ','ዴ','ድ','ዶ'] },
  { id: 'je',     chars: ['ጀ','ጁ','ጂ','ጃ','ጄ','ጅ','ጆ'] },
  { id: 'ge',     chars: ['ገ','ጉ','ጊ','ጋ','ጌ','ግ','ጎ'] },
  { id: 'tte',    chars: ['ጠ','ጡ','ጢ','ጣ','ጤ','ጥ','ጦ'] },
  { id: 'cche',   chars: ['ጨ','ጩ','ጪ','ጫ','ጬ','ጭ','ጮ'] },
  { id: 'ppe',    chars: ['ጰ','ጱ','ጲ','ጳ','ጴ','ጵ','ጶ'] },
  { id: 'tse',    chars: ['ጸ','ጹ','ጺ','ጻ','ጼ','ጽ','ጾ'] },
  { id: 'tse2',   chars: ['ፀ','ፁ','ፂ','ፃ','ፄ','ፅ','ፆ'] },
  { id: 'fe',     chars: ['ፈ','ፉ','ፊ','ፋ','ፌ','ፍ','ፎ'] },
  { id: 'pe',     chars: ['ፐ','ፑ','ፒ','ፓ','ፔ','ፕ','ፖ'] },
  // Labiovelar rows (orders 1 & 2 don't exist — null-padded)
  { id: 'qwa',   chars: [null, null, 'ቊ','ቋ','ቌ','ቍ','ቈ'] },
  { id: 'khwa',  chars: [null, null, 'ኊ','ኋ','ኌ','ኍ','ኈ'] },
  { id: 'kwa',   chars: [null, null, 'ኲ','ኳ','ኴ','ኵ','ኰ'] },
  { id: 'gwa',   chars: [null, null, 'ጒ','ጓ','ጔ','ጕ','ጐ'] },
];

// ─── Number data (mirrors src/data/ethiopicNumbers.js) ────────────────────────
// File name = numeric value (e.g. 5.mp3), text = Amharic word spoken
const ETHIOPIC_NUMBERS = [
  { value: 1,     amharic: 'አንድ'    },
  { value: 2,     amharic: 'ሁለት'   },
  { value: 3,     amharic: 'ሦስት'   },
  { value: 4,     amharic: 'አራት'   },
  { value: 5,     amharic: 'አምስት'  },
  { value: 6,     amharic: 'ስድስት'  },
  { value: 7,     amharic: 'ሰባት'   },
  { value: 8,     amharic: 'ስምንት'  },
  { value: 9,     amharic: 'ዘጠኝ'   },
  { value: 10,    amharic: 'አስር'    },
  { value: 20,    amharic: 'ሃያ'     },
  { value: 30,    amharic: 'ሰላሳ'   },
  { value: 40,    amharic: 'አርባ'    },
  { value: 50,    amharic: 'ሃምሳ'   },
  { value: 60,    amharic: 'ስልሳ'   },
  { value: 70,    amharic: 'ሰባ'     },
  { value: 80,    amharic: 'ሰማንያ'  },
  { value: 90,    amharic: 'ዘጠና'   },
  { value: 100,   amharic: 'መቶ'     },
  { value: 10000, amharic: 'አስር ሺህ' },
];

// ─── Phrase data (mirrors src/data/amharicPhrases.js) ─────────────────────────
const PHRASES = [
  { id: 'selam',                  amharic: 'ሰላም'                },
  { id: 'suq',                    amharic: 'ሱቅ'                  },
  { id: 'bir',                    amharic: 'ብር'                  },
  { id: 'qom',                    amharic: 'ቆም'                  },
  { id: 'hisab',                  amharic: 'ሂሳብ'                },
  { id: 'lalibela',               amharic: 'ላሊበላ'               },
  { id: 'harar',                  amharic: 'ሐረር'                },
  { id: 'mekele',                 amharic: 'መቀሌ'                },
  { id: 'minibus',                amharic: 'ሚኒባስ'               },
  { id: 'buna_bet',               amharic: 'ቡና ቤት'              },
  { id: 'misa_bet',               amharic: 'ምሳ ቤት'              },
  { id: 'hotel',                  amharic: 'ሆቴል'                },
  { id: 'ibakih',                 amharic: 'እባክህ'                },
  { id: 'ibakish',                amharic: 'እባክሽ'                },
  { id: 'awo',                    amharic: 'አዎ'                  },
  { id: 'wuha',                   amharic: 'ውሃ'                  },
  { id: 'taksi',                  amharic: 'ታክሲ'                },
  { id: 'amarenna',               amharic: 'አማርኛ'               },
  { id: 'chaw',                   amharic: 'ቻው'                  },
  { id: 'eshi',                   amharic: 'እሺ'                  },
  { id: 'min_new',                amharic: 'ምን ነው?'              },
  { id: 'sint_new',               amharic: 'ስንት ነው?'            },
  { id: 'alwukim',                amharic: 'አላውቅም'              },
  { id: 'inshallah',              amharic: 'ኢንሻ አላህ'            },
  { id: 'wallahi',                amharic: 'ዋላሂ'                },
  { id: 'simih_man_new',          amharic: 'ስምህ ማን ነው?'         },
  { id: 'hawassa',                amharic: 'ሐዋሳ'                },
  { id: 'aksum',                  amharic: 'አክሱም'               },
  { id: 'dehna_neh',              amharic: 'ደህና ነህ?'            },
  { id: 'dehna_nesh',             amharic: 'ደህና ነሽ?'            },
  { id: 'dehna_negn',             amharic: 'ደህና ነኝ'             },
  { id: 'yikirta',                amharic: 'ይቅርታ'               },
  { id: 'ay',                     amharic: 'አይ'                  },
  { id: 'wedet_new',              amharic: 'ወዴት ነው?'            },
  { id: 'alhamdulillah',          amharic: 'አልሃምዱ ሊለህ'         },
  { id: 'inihed',                 amharic: 'እንሂድ'               },
  { id: 'inkuan_des_aleh',        amharic: 'እንኳን ደስ አለህ'       },
  { id: 'dehna_hun',              amharic: 'ደህና ሁን'             },
  { id: 'wendeme',                amharic: 'ወንድሜ'               },
  { id: 'addis_abeba',            amharic: 'አዲስ አበባ'            },
  { id: 'bahir_dar',              amharic: 'ባህር ዳር'             },
  { id: 'dire_dawa',              amharic: 'ድሬ ዳዋ'              },
  { id: 'jimma',                  amharic: 'ጅማ'                 },
  { id: 'antis',                  amharic: 'አንተስ?'              },
  { id: 'antis_female',           amharic: 'አንቺስ?'              },
  { id: 'minim_ayidelem',         amharic: 'ምንም አይደለም'         },
  { id: 'ameseginalehu',          amharic: 'አመሰግናለሁ'           },
  { id: 'alegabagnim',            amharic: 'አልገባኝም'             },
  { id: 'genzeb',                 amharic: 'ገንዘብ'               },
  { id: 'injera',                 amharic: 'እንጀራ'               },
  { id: 'ityoppya',               amharic: 'ኢትዮጵያ'             },
  { id: 'inkuan_dehna_metah',     amharic: 'እንኳን ደህና መጣህ'     },
  { id: 'cheger_yelem',           amharic: 'ችግር የለም'           },
  { id: 'egzabihir_yemisgen',     amharic: 'እግዚአብሔር ይመስገን'   },
  { id: 'konjo',                  amharic: 'ቆንጆ'                },
  { id: 'betam_tiru',             amharic: 'በጣም ጥሩ'            },
  { id: 'egzabihir_yibarikhi',    amharic: 'እግዚአብሔር ይባርክህ'   },
  { id: 'tej',                    amharic: 'ጠጅ'                  },
  { id: 'migib',                  amharic: 'ምግብ'                },
  { id: 'englizgna_yinageralu',   amharic: 'እንግሊዝኛ ይናገራሉ?'   },
  { id: 'gebeya',                 amharic: 'ገበያ'                },
  { id: 'gondar',                 amharic: 'ጎንደር'               },
];

// ─── Word drill data (mirrors src/data/levelWords.js) ────────────────────────
const WORDS_DIR = join(OUTPUT_DIR, 'words');

const DRILL_WORDS = [
  // Level 2
  { id: 'w_selam',    amharic: 'ሰላም'   },
  { id: 'w_sim',      amharic: 'ስም'    },
  { id: 'w_bir',      amharic: 'ብር'    },
  { id: 'w_mar',      amharic: 'ማር'    },
  { id: 'w_qibe',     amharic: 'ቅቤ'    },
  { id: 'w_shiro',    amharic: 'ሸሮ'    },
  { id: 'w_mulu',     amharic: 'ሙሉ'    },
  { id: 'w_rub',      amharic: 'ሩብ'    },
  { id: 'w_hamus',    amharic: 'ሐሙስ'   },
  { id: 'w_qemis',    amharic: 'ቀሚስ'   },
  { id: 'w_muq',      amharic: 'ሙቅ'    },
  { id: 'w_ruq',      amharic: 'ሩቅ'    },
  { id: 'w_misa',     amharic: 'ምሳ'    },
  { id: 'w_shum',     amharic: 'ሹም'    },
  { id: 'w_shahi',    amharic: 'ሻሂ'    },
  { id: 'w_bisr',     amharic: 'ብስር'   },
  { id: 'w_qurs',     amharic: 'ቁርስ'   },
  { id: 'w_qäläm',    amharic: 'ቀለም'   },
  { id: 'w_suri',     amharic: 'ሱሪ'    },
  { id: 'w_mushra',   amharic: 'ሙሽራ'   },
  // Level 3
  { id: 'w_buna',     amharic: 'ቡና'    },
  { id: 'w_bet',      amharic: 'ቤት'    },
  { id: 'w_muqet',    amharic: 'ሙቀት'   },
  { id: 'w_siminit',  amharic: 'ስምንት'  },
  { id: 'w_bicha',    amharic: 'ብቻ'    },
  { id: 'w_semon',    amharic: 'ሰሞን'   },
  { id: 'w_temari',   amharic: 'ተማሪ'   },
  { id: 'w_neqa',     amharic: 'ነቃ'    },
  { id: 'w_min',      amharic: 'ምን'    },
  { id: 'w_beteseb',  amharic: 'ቤተሰብ'  },
  { id: 'w_timhirt',  amharic: 'ትምህርት' },
  { id: 'w_tinant',   amharic: 'ትናንት'  },
  { id: 'w_biher',    amharic: 'ብሔር'   },
  { id: 'w_chernet',  amharic: 'ቸርነት'  },
  { id: 'w_teret',    amharic: 'ተረት'   },
  { id: 'w_mishit',   amharic: 'ምሽት'   },
  { id: 'w_semen',    amharic: 'ሰሜን'   },
  { id: 'w_mist',     amharic: 'ሚስት'   },
  { id: 'w_michot',   amharic: 'ምቾት'   },
  { id: 'w_samuna',   amharic: 'ሳሙና'   },
  // Level 4
  { id: 'w_werq',     amharic: 'ወርቅ'   },
  { id: 'w_ketema',   amharic: 'ከተማ'   },
  { id: 'w_abeba',    amharic: 'አበባ'    },
  { id: 'w_weqit',    amharic: 'ወቅት'   },
  { id: 'w_wetet',    amharic: 'ወተት'   },
  { id: 'w_asa',      amharic: 'አሳ'    },
  { id: 'w_were',     amharic: 'ወሬ'    },
  { id: 'w_keremela', amharic: 'ከረሜላ'  },
  { id: 'w_wereqet',  amharic: 'ወረቀት'  },
  { id: 'w_shuka',    amharic: 'ሹካ'    },
  { id: 'w_sew',      amharic: 'ሰው'    },
  { id: 'w_wenber',   amharic: 'ወንበር'  },
  { id: 'w_kremet',   amharic: 'ክረምት'  },
  { id: 'w_karta',    amharic: 'ካርታ'   },
  { id: 'w_amsa',     amharic: 'አምሳ'   },
  { id: 'w_arba',     amharic: 'አርባ'   },
  { id: 'w_aqm',      amharic: 'አቅም'   },
  { id: 'w_wasen',    amharic: 'ወሰን'   },
  { id: 'w_waqasa',   amharic: 'ወቀሳ'   },
  { id: 'w_kebabi',   amharic: 'ከባቢ'   },
  // Level 5
  { id: 'w_dabo',     amharic: 'ዳቦ'    },
  { id: 'w_dehna',    amharic: 'ደህና'   },
  { id: 'w_zemen',    amharic: 'ዘመን'   },
  { id: 'w_deqiqa',   amharic: 'ደቂቃ'   },
  { id: 'w_zinab',    amharic: 'ዝናብ'   },
  { id: 'w_debub',    amharic: 'ደቡብ'   },
  { id: 'w_yet',      amharic: 'የት'    },
  { id: 'w_doro',     amharic: 'ዶሮ'    },
  { id: 'w_muya',     amharic: 'ሙያ'    },
  { id: 'w_bizu',     amharic: 'ብዙ'    },
  { id: 'w_qidame',   amharic: 'ቅዳሜ'   },
  { id: 'w_desta',    amharic: 'ደስታ'   },
  { id: 'w_yiqirta',  amharic: 'ይቅርታ'  },
  { id: 'w_debdabe',  amharic: 'ደብዳቤ'  },
  { id: 'w_den',      amharic: 'ደን'    },
  { id: 'w_lidet',    amharic: 'ልደት'   },
  { id: 'w_wend',     amharic: 'ወንድ'   },
  { id: 'w_adis',     amharic: 'አዲስ'   },
  { id: 'w_ayin',     amharic: 'ዓይን'   },
  { id: 'w_kebad',    amharic: 'ከባድ'   },
  // Level 6
  { id: 'w_tej',      amharic: 'ጠጅ'    },
  { id: 'w_godana',   amharic: 'ጎዳና'   },
  { id: 'w_guzo',     amharic: 'ጉዞ'    },
  { id: 'w_tewat',    amharic: 'ጠዋት'   },
  { id: 'w_chew',     amharic: 'ጨው'    },
  { id: 'w_jerba',    amharic: 'ጀርባ'   },
  { id: 'w_chis',     amharic: 'ጭስ'    },
  { id: 'w_gebeya',   amharic: 'ገበያ'   },
  { id: 'w_tiru',     amharic: 'ጥሩ'    },
  { id: 'w_chaka',    amharic: 'ጫካ'    },
  { id: 'w_tiqim',    amharic: 'ጥቅም'   },
  { id: 'w_gize',     amharic: 'ጊዜ'    },
  { id: 'w_gon',      amharic: 'ጎን'    },
  { id: 'w_jaket',    amharic: 'ጃኬት'   },
  { id: 'w_tibeb',    amharic: 'ጥበብ'   },
  { id: 'w_cheresa',  amharic: 'ጨረሻ'   },
  { id: 'w_tiyaqe',   amharic: 'ጥያቄ'   },
  { id: 'w_neger',    amharic: 'ነገር'   },
  { id: 'w_wet',      amharic: 'ወጥ'    },
  { id: 'w_awraja',   amharic: 'አውራጃ'  },
  // Level 7
  { id: 'w_fidel',    amharic: 'ፊደል'   },
  { id: 'w_fiqir',    amharic: 'ፍቅር'   },
  { id: 'w_tsehay',   amharic: 'ፀሐይ'   },
  { id: 'w_feres',    amharic: 'ፈረስ'   },
  { id: 'w_fire',     amharic: 'ፍሬ'    },
  { id: 'w_tsalot',   amharic: 'ጸሎት'   },
  { id: 'w_fetan',    amharic: 'ፈጣን'   },
  { id: 'w_fitih',    amharic: 'ፍትህ'   },
  { id: 'w_fiqad',    amharic: 'ፍቃድ'   },
  { id: 'w_film',     amharic: 'ፊልም'   },
  { id: 'w_fasika',   amharic: 'ፋሲካ'   },
  { id: 'w_tsetita',  amharic: 'ጸጥታ'   },
  { id: 'w_tsihuf',   amharic: 'ጽሑፍ'   },
  { id: 'w_tsom',     amharic: 'ጾም'    },
  { id: 'w_fetari',   amharic: 'ፈጣሪ'   },
  { id: 'w_tsehafi',  amharic: 'ጸሐፊ'   },
  { id: 'w_fetera',   amharic: 'ፈጠራ'   },
  { id: 'w_tsega',    amharic: 'ጸጋ'    },
  { id: 'w_netsanet', amharic: 'ነፃነት'  },
  { id: 'w_zefen',    amharic: 'ዘፈን'   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function synthesize(character) {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;
  const body = JSON.stringify({
    input:       { text: character },
    voice:       { languageCode: LANGUAGE, name: VOICE_NAME },
    audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return Buffer.from(json.audioContent, 'base64');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(OUTPUT_DIR))  mkdirSync(OUTPUT_DIR,  { recursive: true });
  if (!existsSync(NUMBERS_DIR)) mkdirSync(NUMBERS_DIR, { recursive: true });
  if (!existsSync(PHRASES_DIR)) mkdirSync(PHRASES_DIR, { recursive: true });
  if (!existsSync(WORDS_DIR))   mkdirSync(WORDS_DIR,   { recursive: true });

  let done = 0, skipped = 0, failed = 0;

  console.log(`\n🇪🇹 Amharic audio generator`);
  console.log(`   Voice:  ${VOICE_NAME}`);
  console.log(`   Output: ${OUTPUT_DIR}\n`);

  // ── Fidel characters ──────────────────────────────────────────────────────
  if (!NUMBERS_ONLY && !PHRASES_ONLY && !WORDS_ONLY) {
    const total = FIDEL_ROWS.reduce((s, r) => s + r.chars.length, 0);
    console.log(`📖 Fidel characters (${total} files)\n`);

    for (const row of FIDEL_ROWS) {
      for (let i = 0; i < row.chars.length; i++) {
        const order    = i + 1;
        const char     = row.chars[i];
        if (char == null) continue;
        const filename = `${row.id}_${order}.mp3`;
        const filepath = join(OUTPUT_DIR, filename);

        if (!OVERWRITE && existsSync(filepath)) {
          skipped++;
          process.stdout.write(`  ⏭  ${filename} (exists)\n`);
          continue;
        }

        try {
          const mp3 = await synthesize(char);
          writeFileSync(filepath, mp3);
          done++;
          process.stdout.write(`  ✅ ${filename}  ${char}\n`);
        } catch (err) {
          failed++;
          process.stdout.write(`  ❌ ${filename}  — ${err.message}\n`);
        }

        await sleep(DELAY_MS);
      }
    }
  }

  // ── Ethiopic numbers ──────────────────────────────────────────────────────
  if (!PHRASES_ONLY && !WORDS_ONLY) {
  console.log(`\n፩ Ethiopic numbers (${ETHIOPIC_NUMBERS.length} files)\n`);

  for (const num of ETHIOPIC_NUMBERS) {
    const filename = `${num.value}.mp3`;
    const filepath = join(NUMBERS_DIR, filename);

    if (!OVERWRITE && existsSync(filepath)) {
      skipped++;
      process.stdout.write(`  ⏭  numbers/${filename} (exists)\n`);
      continue;
    }

    try {
      const mp3 = await synthesize(num.amharic);
      writeFileSync(filepath, mp3);
      done++;
      process.stdout.write(`  ✅ numbers/${filename}  ${num.amharic}\n`);
    } catch (err) {
      failed++;
      process.stdout.write(`  ❌ numbers/${filename}  — ${err.message}\n`);
    }

    await sleep(DELAY_MS);
  }
  } // end !PHRASES_ONLY

  // ── Common phrases ────────────────────────────────────────────────────────
  if (!NUMBERS_ONLY && !WORDS_ONLY) {
  console.log(`\n🗣️ Common phrases (${PHRASES.length} files)\n`);

  for (const phrase of PHRASES) {
    const filename = `${phrase.id}.mp3`;
    const filepath = join(PHRASES_DIR, filename);

    if (!OVERWRITE && existsSync(filepath)) {
      skipped++;
      process.stdout.write(`  ⏭  phrases/${filename} (exists)\n`);
      continue;
    }

    try {
      const mp3 = await synthesize(phrase.amharic);
      writeFileSync(filepath, mp3);
      done++;
      process.stdout.write(`  ✅ phrases/${filename}  ${phrase.amharic}\n`);
    } catch (err) {
      failed++;
      process.stdout.write(`  ❌ phrases/${filename}  — ${err.message}\n`);
    }

    await sleep(DELAY_MS);
  }
  } // end !NUMBERS_ONLY && !WORDS_ONLY

  // ── Word drill ────────────────────────────────────────────────────────────
  if (!NUMBERS_ONLY && !PHRASES_ONLY) {
  console.log(`\n👁 Word drill (${DRILL_WORDS.length} files)\n`);

  for (const word of DRILL_WORDS) {
    const filename = `${word.id}.mp3`;
    const filepath = join(WORDS_DIR, filename);

    if (!OVERWRITE && existsSync(filepath)) {
      skipped++;
      process.stdout.write(`  ⏭  words/${filename} (exists)\n`);
      continue;
    }

    try {
      const mp3 = await synthesize(word.amharic);
      writeFileSync(filepath, mp3);
      done++;
      process.stdout.write(`  ✅ words/${filename}  ${word.amharic}\n`);
    } catch (err) {
      failed++;
      process.stdout.write(`  ❌ words/${filename}  — ${err.message}\n`);
    }

    await sleep(DELAY_MS);
  }
  } // end !NUMBERS_ONLY && !PHRASES_ONLY

  console.log(`\n─────────────────────────────────`);
  console.log(`  Generated: ${done}`);
  if (skipped) console.log(`  Skipped:   ${skipped}  (use --overwrite to replace)`);
  if (failed)  console.log(`  Failed:    ${failed}`);
  console.log(`─────────────────────────────────\n`);

  if (failed > 0) {
    console.log('Re-run to retry — existing files are skipped automatically.');
  } else {
    console.log('✨  Done! Restart the dev server and the 🔊 buttons will work.');
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
