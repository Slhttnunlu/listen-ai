import * as Speech from 'expo-speech';
import { TTS_ENGINES } from '../constants/tts';
import { pauseLocalTts, resumeLocalTts, speakWithLocalTts, stopLocalTts } from './localTtsSpeech';

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
  return stopLocalTts();
}

export async function speakWithEngine(engine, text, options) {
  if (engine === TTS_ENGINES.localApi) return speakWithLocalTts(text, options);
  return speak(text, options);
}

export function pauseSpeaking(engine) {
  if (engine === TTS_ENGINES.localApi) return pauseLocalTts();
  return stopSpeaking();
}

export function resumeSpeaking(engine) {
  if (engine !== TTS_ENGINES.localApi) return false;
  resumeLocalTts();
  return true;
}

export function destroySpeechEngines() {
  Speech.stop();
  return stopLocalTts();
}
