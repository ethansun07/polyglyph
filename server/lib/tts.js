// Google Cloud Text-to-Speech — same REST call as scripts/generate-missing-audio.js,
// factored out for reuse by the live sentence-generation route. Returns base64 MP3
// directly; nothing here ever writes to disk.

const TTS_URL = (key) => `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`;

export async function synthesizeAmharic(text) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not set');

  const res = await fetch(TTS_URL(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'am-ET', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.85 },
    }),
  });

  if (!res.ok) throw new Error(`TTS failed: ${res.status} ${await res.text()}`);
  const { audioContent } = await res.json();
  return audioContent; // base64 MP3
}
