#!/usr/bin/env python3
"""
Generate Amharic audio using Google Cloud TTS.
Usage: GOOGLE_API_KEY=your_key python3 scripts/generate_all_audio.py

Generates:
  public/audio/phrases/{id}.mp3          — missing phrase audio
  public/audio/sentences/{id}.mp3        — full sentence audio
  public/audio/dialogues/{dial_id}_{n}.mp3 — individual dialogue lines
"""

import os, json, base64, urllib.request, urllib.error

API_KEY = os.environ.get('GOOGLE_API_KEY')
if not API_KEY:
    print('Error: set GOOGLE_API_KEY environment variable')
    exit(1)

ROOT       = os.path.join(os.path.dirname(__file__), '..')
PHRASES_DIR   = os.path.join(ROOT, 'public', 'audio', 'phrases')
SENTENCES_DIR = os.path.join(ROOT, 'public', 'audio', 'sentences')
DIALOGUES_DIR = os.path.join(ROOT, 'public', 'audio', 'dialogues')

URL = f'https://texttospeech.googleapis.com/v1/text:synthesize?key={API_KEY}'

def synthesize(text, out_path, use_ssml=False):
    if os.path.exists(out_path):
        print(f'SKIP {os.path.basename(out_path)}')
        return
    input_field = {'ssml': text} if use_ssml else {'text': text}
    payload = {
        'input': input_field,
        'voice': {'languageCode': 'am-ET', 'ssmlGender': 'FEMALE'},
        'audioConfig': {'audioEncoding': 'MP3', 'speakingRate': 0.85},
    }
    data = json.dumps(payload).encode('utf-8')
    req  = urllib.request.Request(URL, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            with open(out_path, 'wb') as f:
                f.write(base64.b64decode(result['audioContent']))
            print(f'OK  {os.path.basename(out_path)}')
    except urllib.error.HTTPError as e:
        print(f'ERR {os.path.basename(out_path)}: {e.code} {e.read().decode()}')

# ── Missing phrase audio ───────────────────────────────────────────────────────
MISSING_PHRASES = [
    ('ahun',        'አሁን'),
    ('beteseb',     'ቤተሰብ'),
    ('doro_wot',    'ዶሮ ወጥ'),
    ('feqer',       'ፍቅር'),
    ('icalalehu',   'እችላለሁ?'),
    ('ifelgalehu',  'እፈልጋለሁ'),
    ('iwedalehu',   'እወዳለሁ'),
    ('misir',       'ሚስር'),
    ('muq',         'ሙቅ'),
    ('qes_qes_hid', 'ቀስ ቀስ ሂድ'),
    ('qezqaza',     'ቀዝቃዛ'),
    ('qoy',         'ቆይ'),
    ('qerb',        'ቅርብ'),
    ('ruq',         'ሩቅ'),
    ('saat',        'ሰዓት'),
    ('sambusa',     'ሰምቡሳ'),
    ('shahi',       'ሻሂ'),
    ('shiro',       'ሽሮ'),
    ('tolo',        'ቶሎ'),
    ('tsehay',      'ፀሐይ'),
    ('waga',        'ዋጋ'),
    ('yihonahal',   'ይሆናል'),
]

print('\n── Phrases ──────────────────────────────────────────────')
for phrase_id, text in MISSING_PHRASES:
    synthesize(text, os.path.join(PHRASES_DIR, f'{phrase_id}.mp3'))

# ── Sentence audio ─────────────────────────────────────────────────────────────
SENTENCES = [
    ('greet_exchange',   'ሰላም! ደህና ነህ?'),
    ('fine_thanks',      'ደህና ነኝ፣ አመሰግናለሁ።'),
    ('dont_understand',  'አልገባኝም። ቀስ ቀስ ሂድ።'),
    ('want_taxi',        'ታክሲ እፈልጋለሁ።'),
    ('want_cold_water',  'ቀዝቃዛ ውሃ እፈልጋለሁ።'),
    ('like_injera',      'እንጀራ እወዳለሁ።'),
    ('no_problem_welcome', 'ችግር የለም። ምንም አይደለም።'),
    ('speak_amharic',    'ትንሽ አማርኛ እናገራለሁ።'),
    ('restroom_where',   'ሽንት ቤቱ የት ነው?'),
    ('how_much_cost',    'ዋጋው ስንት ነው?'),
    ('now_lets_go',      'አሁን እንሂድ።'),
    ('family_well',      'ቤተሰቡ ደህና ነው?'),
    ('passport_where',   'ፓስፖርቴ ወዴት ነው?'),
    ('ticket_want',      'ቲኬት እፈልጋለሁ።'),
    ('bank_close',       'ባንኩ ቅርብ ነው?'),
    ('hospital_where',   'ሆስፒታሉ ወዴት ነው?'),
    ('doctor_want',      'ዶክተር እፈልጋለሁ።'),
    ('pharmacy_close',   'ፋርማሲ ቅርብ ነው?'),
    ('airport_far',      'ኤርፖርቱ ሩቅ ነው?'),
    ('charger_want',     'ቻርጀር እፈልጋለሁ።'),
    ('internet_good',    'ኢንተርኔቱ ጥሩ ነው?'),
    ('wifi_good',        'ዋይፋይ ጥሩ ነው?'),
    ('photo_can',        'ፎቶ ላንሳ እችላለሁ?'),
    ('sandwich_good',    'ሳንዱዊቹ ጥሩ ነው?'),
    ('cafe_close',       'ካፌ ቅርብ ነው?'),
    ('park_beautiful',   'ፓርኩ ቆንጆ ናት!'),
    ('police_close',     'ፖሊስ ቅርብ ነው?'),
    ('cinema_close',     'ሲኒማ ቅርብ ነው?'),
    ('pizza_good',       'ፒዛ ጥሩ ነው?'),
    ('visa_want',        'ቪዛ እፈልጋለሁ።'),
    ('buffet_good',      'ቡፌ ጥሩ ነው?'),
]

print('\n── Sentences ────────────────────────────────────────────')
for sent_id, text in SENTENCES:
    synthesize(text, os.path.join(SENTENCES_DIR, f'{sent_id}.mp3'))

# ── Dialogue line audio ────────────────────────────────────────────────────────
DIALOGUES = {
    'dial_greeting': [
        'ሰላም! ደህና ነህ?',
        'ደህና ነኝ፣ አመሰግናለሁ። አንተስ?',
        'ደህና ነኝ። ቤተሰቡ ደህና ነው?',
        'አዎ፣ ቤተሰቡ ደህና ነው። አመሰግናለሁ።',
        'ደህና ሁን!',
        'ደህና ሁን!',
    ],
    'dial_coffee': [
        'ሰላም። ቡና ቤቱ ቆንጆ ነው!',
        'አመሰግናለሁ! ቡናው ሙቅ ነው።',
        'ሻሂ ጥሩ ነው?',
        'አዎ፣ ሻሂ ጥሩ ነው። ሰምቡሳ በጣም ጥሩ ነው!',
        'ሂሳቡ ስንት ነው?',
        'ሂሳቡ ብር ነው።',
        'አመሰግናለሁ!',
        'ምንም አይደለም!',
    ],
    'dial_hotel': [
        'ሰላም። ሆቴሉ የት ነው?',
        'ሆቴሉ ቅርብ ነው።',
        'ዋይፋይ ጥሩ ነው?',
        'አዎ! ዋይፋይ ጥሩ ነው።',
        'ምሳ ቤቱ ቅርብ ነው?',
        'አይ፣ ምሳ ቤቱ ሩቅ ነው ግን ቡና ቤቱ ቅርብ ነው።',
        'ታክሲ ቅርብ ነው?',
        'አዎ፣ ታክሲ ቅርብ ነው።',
        'አመሰግናለሁ!',
        'ምንም አይደለም!',
    ],
    'dial_intro': [
        'ሰላም። ስምህ ማን ነው?',
        'ስሜ ዮሐንስ ነው። አንተስ?',
        'ስሜ ሳራ ነው። ትንሽ አማርኛ እናገራለሁ።',
        'በጣም ጥሩ!',
        'አልገባኝም። ቀስ ቀስ ሂድ።',
        'ይቅርታ! እሺ፣ ቀስ ቀስ።',
        'ፎቶ ላንሳ እችላለሁ?',
        'አዎ!',
        'ችግር የለም። ደህና ሁን!',
        'ደህና ሁን!',
    ],
    'dial_restaurant': [
        'ሰላም። ምግቡ ጥሩ ነው?',
        'አዎ! ዶሮ ወጥ በጣም ጥሩ ነው።',
        'ፒዛ ጥሩ ነው?',
        'አዎ፣ ፒዛ ጥሩ ነው ግን እንጀራ በጣም ጥሩ ነው!',
        'ዶሮ ወጥ እወዳለሁ!',
        'በጣም ጥሩ!',
        'ሂሳቡ ስንት ነው?',
        'ሂሳቡ ብር ነው።',
        'አመሰግናለሁ!',
        'ምንም አይደለም!',
    ],
    'dial_medical': [
        'ሰላም። ዶክተር እፈልጋለሁ!',
        'ዶክተር? ሆስፒታሉ ቅርብ ነው።',
        'ሆስፒታሉ ወዴት ነው?',
        'ቅርብ ነው። ታክሲ ቅርብ ነው።',
        'ፋርማሲ ቅርብ ነው?',
        'አዎ፣ ፋርማሲ ቅርብ ነው።',
        'አመሰግናለሁ!',
        'ምንም አይደለም! ቶሎ ሂድ!',
    ],
    'dial_airport': [
        'ሰላም። ኤርፖርቱ ወዴት ነው?',
        'ኤርፖርቱ ሩቅ ነው። ታክሲ ቅርብ ነው።',
        'ዋጋው ስንት ነው?',
        'ዋጋው ብር ነው።',
        'ፓስፖርቴ ወዴት ነው?',
        'አላውቅም። ይቅርታ።',
        'ቲኬቴ ወዴት ነው?',
        'ቆይ! ይሆናል።',
        'አመሰግናለሁ! ደህና ሁን!',
        'ምንም አይደለም! ደህና ሁን!',
    ],
    'dial_minibus': [
        'ሰላም። ሚኒባሱ ቅርብ ነው?',
        'አዎ፣ ሚኒባሱ ቅርብ ነው።',
        'ሆቴሉ የት ነው?',
        'አልገባኝም። ይቅርታ። ቀስ ቀስ ሂድ።',
        'ይሆናል። ሆቴሉ ሩቅ ነው?',
        'አዎ፣ ሆቴሉ ሩቅ ነው።',
        'ቆም!',
        'አመሰግናለሁ!',
        'ምንም አይደለም!',
    ],
}

print('\n── Dialogues ────────────────────────────────────────────')
for dial_id, lines in DIALOGUES.items():
    for i, text in enumerate(lines):
        synthesize(text, os.path.join(DIALOGUES_DIR, f'{dial_id}_{i}.mp3'))

print('\nDone.')
