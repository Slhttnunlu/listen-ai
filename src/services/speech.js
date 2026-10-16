import * as Speech from 'expo-speech';
import { TTS_ENGINES } from '../constants/tts';
import { destroyOfflineSpeech, speakOffline, stopOfflineSpeaking } from './offlineSpeech';

export async function getPreferredVoices() {
  const voices = await Speech.getAvailableVoicesAsync();
  const turkishVoices = voices.filter((voice) => voice.language?.toLowerCase().startsWith('tr'));
  return (turkishVoices.length ? turkishVoices : voices).slice(0, 3);
}

export function speak(text, options) {
  Speech.speak(text, options);
}

export function stopSpeaking() {
  Speech.stop();
  return stopOfflineSpeaking();
}

export async function speakWithEngine(engine, text, options) {
  if (engine === TTS_ENGINES.offline) return speakOffline(text, options);
  return speak(text, options);
}

export function destroySpeechEngines() {
  Speech.stop();
  return destroyOfflineSpeech();
}
