/**
 * Audio utility.
 *
 * Priority:
 *   1. /audio/{rowId}_{order}.mp3  (local recordings)
 *   2. Browser speechSynthesis with an am-ET voice, if available
 *   3. Silent — never falls back to English TTS
 */

let currentAudio = null;

// undefined = not yet resolved, null = checked+not found, Voice = found
let _amharicVoice = undefined;

export function resolveAmharicVoice() {
  return new Promise(resolve => {
    if (_amharicVoice !== undefined) { resolve(_amharicVoice); return; }
    if (!('speechSynthesis' in window)) { _amharicVoice = null; resolve(null); return; }

    const pick = () => {
      const voices = speechSynthesis.getVoices();
      return voices.find(v => v.lang === 'am-ET') ||
             voices.find(v => v.lang.startsWith('am')) ||
             null;
    };

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) { _amharicVoice = pick(); resolve(_amharicVoice); return; }

    const timer = setTimeout(() => { _amharicVoice = null; resolve(null); }, 2500);
    speechSynthesis.addEventListener('voiceschanged', () => {
      clearTimeout(timer);
      _amharicVoice = pick();
      resolve(_amharicVoice);
    }, { once: true });
  });
}

function speakWithAmharicVoice(text, voice) {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.voice = voice;
  utt.lang = voice.lang;
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

export async function playCharAudio(charObj, settings) {
  if (!settings?.audioEnabled) return;

  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  // 1. Local MP3
  const path = `/audio/${charObj.rowId}_${charObj.order}.mp3`;
  const audio = new Audio(path);
  currentAudio = audio;
  try {
    await audio.play();
    return;
  } catch {
    currentAudio = null;
  }

  // 2. am-ET Web Speech API
  const voice = await resolveAmharicVoice();
  if (voice) {
    speakWithAmharicVoice(charObj.romanization, voice);
  }
  // 3. Silent — no English fallback
}

export async function playPhraseAudio(phrase, settings) {
  if (!settings?.audioEnabled) return;

  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  const malePath    = phrase.audioPath || `/audio/phrases/${phrase.id}.mp3`;
  const femalePath  = phrase.femaleAmharic ? `/audio/phrases/${phrase.id}_f.mp3` : null;
  const formalPath  = phrase.formalAmharic  ? `/audio/phrases/${phrase.id}_formal.mp3` : null;
  const groupPath   = phrase.groupAmharic   ? `/audio/phrases/${phrase.id}_group.mp3` : null;

  const playFile = (path) => new Promise((resolve, reject) => {
    const audio = new Audio(path);
    currentAudio = audio;
    audio.addEventListener('ended', () => { currentAudio = null; resolve(); });
    audio.play().catch(reject);
  });

  try {
    await playFile(malePath);
    if (femalePath) {
      await new Promise(r => setTimeout(r, 400));
      await playFile(femalePath);
    }
    if (formalPath) {
      await new Promise(r => setTimeout(r, 400));
      await playFile(formalPath);
    }
    if (groupPath) {
      await new Promise(r => setTimeout(r, 400));
      await playFile(groupPath);
    }
    return;
  } catch {
    currentAudio = null;
  }

  const voice = await resolveAmharicVoice();
  if (voice) {
    speakWithAmharicVoice(phrase.amharic, voice);
  }
}

export async function playNumberAudio(value, amharicWord, settings) {
  if (!settings?.audioEnabled) return;

  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  // 1. Local MP3 (public/audio/numbers/{value}.mp3)
  const path = `/audio/numbers/${value}.mp3`;
  const audio = new Audio(path);
  currentAudio = audio;
  try {
    await audio.play();
    return;
  } catch {
    currentAudio = null;
  }

  // 2. am-ET Web Speech API
  const voice = await resolveAmharicVoice();
  if (voice && amharicWord) {
    speakWithAmharicVoice(amharicWord, voice);
  }
}

export async function playWordAudio(word, settings) {
  if (!settings?.audioEnabled) return;

  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  const path = `/audio/words/${word.id}.mp3`;
  const audio = new Audio(path);
  currentAudio = audio;
  try {
    await audio.play();
    return;
  } catch {
    currentAudio = null;
  }

  const voice = await resolveAmharicVoice();
  if (voice) {
    speakWithAmharicVoice(word.amharic, voice);
  }
}

export async function playSentenceAudio(sentence, settings) {
  if (!settings?.audioEnabled) return;

  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  const path = `/audio/sentences/${sentence.id}.mp3`;
  const audio = new Audio(path);
  currentAudio = audio;
  try {
    await audio.play();
    return;
  } catch {
    currentAudio = null;
  }

  const voice = await resolveAmharicVoice();
  if (voice) speakWithAmharicVoice(sentence.amharic, voice);
}

export async function playDialogueLineAudio(dialId, lineIndex, amharic, settings) {
  if (!settings?.audioEnabled) return;

  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  const path = `/audio/dialogues/${dialId}_${lineIndex}.mp3`;
  const audio = new Audio(path);
  currentAudio = audio;
  try {
    await audio.play();
    return;
  } catch {
    currentAudio = null;
  }

  const voice = await resolveAmharicVoice();
  if (voice) speakWithAmharicVoice(amharic, voice);
}

export function stopAudio() {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}
