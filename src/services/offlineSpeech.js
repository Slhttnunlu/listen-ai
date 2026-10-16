import { OFFLINE_TTS_MODEL } from '../constants/tts';

let enginePromise;
let activeController;

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
  const engine = await getEngine();
  const sampleRate = await engine.getSampleRate();
  await engine.startPcmPlayer(sampleRate, 1);

  try {
    const controller = await engine.generateSpeechStream(
      text,
      { speed: options.rate || 1 },
      {
        onChunk: (chunk) => {
          if (chunk.samples?.length) engine.writePcmChunk(chunk.samples).catch(options.onError);
        },
        onEnd: async ({ cancelled } = {}) => {
          activeController = undefined;
          await engine.stopPcmPlayer().catch(() => undefined);
          if (cancelled) options.onStopped?.();
          else options.onDone?.();
        },
        onError: async (error) => {
          activeController = undefined;
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
