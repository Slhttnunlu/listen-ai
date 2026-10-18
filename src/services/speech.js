import * as Speech from 'expo-speech';
import { TTS_ENGINES } from '../constants/tts';
import { splitSpeechText } from '../utils/text';
import { pauseLocalTts, resumeLocalTts, speakWithLocalTts, stopLocalTts } from './localTtsSpeech';

const MAX_DEVICE_TTS_CHUNK_CHARS = 3_000;
let deviceSpeechSession = 0;

export async function getPreferredVoices() {
  const voices = await Speech.getAvailableVoicesAsync();
  const turkishVoices = voices.filter((voice) => voice.language?.toLowerCase().startsWith('tr'));
  return (turkishVoices.length ? turkishVoices : voices).slice(0, 3);
}

export function speak(text, options) {
  const session = ++deviceSpeechSession;
  const nativeLimit = Number.isFinite(Speech.maxSpeechInputLength)
    ? Speech.maxSpeechInputLength
    : MAX_DEVICE_TTS_CHUNK_CHARS;
  const chunkLength = Math.max(1, Math.min(MAX_DEVICE_TTS_CHUNK_CHARS, nativeLimit));
  const segments = splitSpeechText(text, chunkLength);
  if (!segments.length) return;

  const fail = (error) => {
    if (session !== deviceSpeechSession) return;
    deviceSpeechSession += 1;
    options?.onError?.(error);
  };

  const speakSegment = (segmentIndex) => {
    if (session !== deviceSpeechSession) return;
    const segment = segments[segmentIndex];
    try {
      Speech.speak(segment.text, {
        ...options,
        onStart: segmentIndex === 0 ? options?.onStart : undefined,
        onBoundary: options?.onBoundary
          ? ({ charIndex = 0, charLength = 0 }) =>
              options.onBoundary({ charIndex: segment.start + charIndex, charLength })
          : undefined,
        onDone: () => {
          if (session !== deviceSpeechSession) return;
          if (segmentIndex + 1 < segments.length) {
            speakSegment(segmentIndex + 1);
            return;
          }
          options?.onDone?.();
        },
        onStopped: () => {
          if (session === deviceSpeechSession) options?.onStopped?.();
        },
        onError: fail,
      });
    } catch (error) {
      fail(error);
    }
  };

  speakSegment(0);
}

export function stopSpeaking() {
  deviceSpeechSession += 1;
  return Promise.all([Speech.stop(), stopLocalTts()]);
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
  return stopSpeaking();
}
