import { OFFLINE_TTS_MODEL } from '../constants/tts';

let enginePromise;
let activeController;
let progressTimers = new Set();
let playbackSession = 0;

const PLAYBACK_PROGRESS_INTERVAL_MS = 100;
const PCM_DRAIN_PADDING_MS = 450;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function clearProgressTimers() {
  progressTimers.forEach(clearTimeout);
  progressTimers = new Set();
}

function loadSherpaModules() {
  // Lazy loading keeps Expo Go and builds with the feature disabled on device TTS.
  const sherpa = require('react-native-sherpa-onnx');
  const tts = require('react-native-sherpa-onnx/tts');
  return { sherpa, tts };
}

async function getEngine() {
  if (!enginePromise) {
    enginePromise = Promise.resolve().then(async () => {
      const { sherpa, tts } = loadSherpaModules();
      const modelPath = sherpa.assetModelPath(OFFLINE_TTS_MODEL.assetPath);
      const detection = await tts.detectTtsModel(modelPath, { modelType: 'vits' });
      if (!detection.success) {
        throw new Error(detection.error || 'Offline Türkçe ses modeli doğrulanamadı.');
      }
      return tts.createStreamingTTS({
        modelPath,
        modelType: 'vits',
        numThreads: 2,
        provider: 'cpu',
      });
    });
    enginePromise.catch(() => {
      enginePromise = undefined;
    });
  }
  return enginePromise;
}

export async function speakOffline(text, options = {}) {
  await stopOfflineSpeaking();
  const session = ++playbackSession;
  const engine = await getEngine();
  const sampleRate = await engine.getSampleRate();
  const chunks = [];
  let sampleCount = 0;

  try {
    const controller = await engine.generateSpeechStream(
      text,
      { speed: options.rate || 1 },
      {
        onChunk: (chunk) => {
          if (chunk.samples?.length) {
            sampleCount += chunk.samples.length;
            chunks.push(chunk.samples);
          }
        },
        onEnd: async ({ cancelled } = {}) => {
          activeController = undefined;
          if (cancelled || session !== playbackSession) {
            options.onStopped?.();
            return;
          }
          if (!sampleCount) {
            options.onError?.(new Error('Offline model did not produce audio.'));
            return;
          }

          const audioDurationMs = (sampleCount / sampleRate) * 1000;
          await engine.startPcmPlayer(sampleRate, 1);
          const playbackStartedAt = Date.now();
          for (const samples of chunks) {
            if (session !== playbackSession) return;
            await engine.writePcmChunk(samples);
          }

          const progressTimer = setInterval(() => {
            const elapsedMs = Date.now() - playbackStartedAt;
            options.onProgress?.(Math.min(1, elapsedMs / audioDurationMs));
          }, PLAYBACK_PROGRESS_INTERVAL_MS);
          progressTimers.add(progressTimer);

          const elapsedWhileQueueingMs = Date.now() - playbackStartedAt;
          await wait(Math.max(0, audioDurationMs - elapsedWhileQueueingMs) + PCM_DRAIN_PADDING_MS);
          if (session !== playbackSession) return;

          clearProgressTimers();
          options.onProgress?.(1);
          await engine.stopPcmPlayer().catch(() => undefined);
          options.onDone?.();
        },
        onError: async (error) => {
          activeController = undefined;
          if (session !== playbackSession) return;
          clearProgressTimers();
          await engine.stopPcmPlayer().catch(() => undefined);
          options.onError?.(error);
        },
      }
    );
    activeController = controller;
    return controller;
  } catch (error) {
    await engine.stopPcmPlayer().catch(() => undefined);
    throw error;
  }
}

export async function stopOfflineSpeaking() {
  playbackSession += 1;
  clearProgressTimers();
  const controller = activeController;
  activeController = undefined;
  if (controller) await controller.cancel().catch(() => undefined);
  if (enginePromise) {
    const engine = await enginePromise.catch(() => null);
    if (engine) await engine.stopPcmPlayer().catch(() => undefined);
  }
}

export async function destroyOfflineSpeech() {
  await stopOfflineSpeaking();
  const pendingEngine = enginePromise;
  enginePromise = undefined;
  const engine = await pendingEngine?.catch(() => null);
  if (engine) await engine.destroy().catch(() => undefined);
}
