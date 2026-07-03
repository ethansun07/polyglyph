#!/usr/bin/env python3
"""
Generate Amharic phrase audio using Google Cloud TTS.
Usage: GOOGLE_API_KEY=your_key python3 scripts/generate_phrase_audio.py

For gendered phrases, generates both {id}.mp3 (male) and {id}_f.mp3 (female).
"""

import os, json, base64, urllib.request, urllib.error

API_KEY = os.environ.get('GOOGLE_API_KEY')
if not API_KEY:
    print('Error: set GOOGLE_API_KEY environment variable')
    exit(1)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio', 'phrases')

# (phrase_id, text, suffix, use_ssml)
# suffix '' → {id}.mp3, suffix '_f' → {id}_f.mp3
# use_ssml=True: text must be a full <speak>...</speak> string
PHRASES = [
    # ── new phrases added recently ──────────────────────────────────────────
    ('wedet_new',             'የት ነው?',                                       '', False),
    ('dabo',                  'ዳቦ',                                           '', False),
    ('tena_yistilignh',       'ጤና ይስጥልህ',                                    '', False),
    ('tena_yistilignh',       'ጤና ይስጥልሽ',                                    '_f', False),
    ('antis',                 'አንተስ?',                                        '', False),
    ('antis',                 'አንቺስ?',                                        '_f', False),
    ('jimma',                 'ጅማ',                                           '', False),
    ('miskeen',               'ምስኪን',                                        '', False),
    ('shint_bet',             'ሽንት ቤት',                                      '', False),
    ('sime_new',              '<speak>ስሜ <break time="800ms"/> ነው</speak>',   '', True),
    ('endet_neh',             'እንዴት ነህ?',                                     '', False),
    ('endet_neh',             'እንዴት ነሽ?',                                     '_f', False),
    ('amarenna',              'ትንሽ አማርኛ እናገራለሁ',                              '', False),

    # ── gendered phrases — male + female ────────────────────────────────────
    ('ibakih',                'እባክህ',                                         '', False),
    ('ibakih',                'እባክሽ',                                         '_f', False),
    ('ibakih',                'እባክዎ',                                         '_formal', False),
    ('simih_man_new',         'ስምህ ማን ነው?',                                   '', False),
    ('simih_man_new',         'ስምሽ ማን ነው?',                                   '_f', False),
    ('dehna_neh',             'ደህና ነህ?',                                       '', False),
    ('dehna_neh',             'ደህና ነሽ?',                                       '_f', False),
    ('inkuan_des_aleh',       'እንኳን ደስ አለህ',                                  '', False),
    ('inkuan_des_aleh',       'እንኳን ደስ አለሽ',                                  '_f', False),
    ('inkuan_dehna_metah',    'እንኳን ደህና መጣህ',                                 '', False),
    ('inkuan_dehna_metah',    'እንኳን ደህና መጣሽ',                                 '_f', False),
    ('egzabihir_yibarikhi',   'እግዚአብሔር ይባርክህ',                                '', False),
    ('egzabihir_yibarikhi',   'እግዚአብሔር ይባርክሽ',                                '_f', False),
]

URL = f'https://texttospeech.googleapis.com/v1/text:synthesize?key={API_KEY}'

def synthesize(phrase_id, text, suffix, use_ssml=False):
    input_field = {'ssml': text} if use_ssml else {'text': text}
    payload = {
        'input': input_field,
        'voice': {
            'languageCode': 'am-ET',
            'ssmlGender': 'FEMALE',
        },
        'audioConfig': {
            'audioEncoding': 'MP3',
            'speakingRate': 0.85,
        },
    }

    data = json.dumps(payload).encode('utf-8')
    req  = urllib.request.Request(URL, data=data, headers={'Content-Type': 'application/json'})

    try:
        with urllib.request.urlopen(req) as resp:
            result     = json.loads(resp.read())
            audio_data = base64.b64decode(result['audioContent'])
            out_path   = os.path.join(OUTPUT_DIR, f'{phrase_id}{suffix}.mp3')
            with open(out_path, 'wb') as f:
                f.write(audio_data)
            print(f'OK  {phrase_id}{suffix}.mp3  ({text})')
    except urllib.error.HTTPError as e:
        print(f'ERR {phrase_id}{suffix}: {e.code} {e.read().decode()}')

for phrase_id, text, suffix, use_ssml in PHRASES:
    synthesize(phrase_id, text, suffix, use_ssml)
