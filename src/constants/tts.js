export const TTS_ENGINES = {
  device: 'device',
  offline: 'offline-model',
};

export const DEFAULT_TTS_ENGINE = TTS_ENGINES.device;

// Production builds can remove the experimental path from the UI with
// EXPO_PUBLIC_ENABLE_ON_DEVICE_TTS=false. This is not a secret.
export const ON_DEVICE_TTS_ENABLED = process.env.EXPO_PUBLIC_ENABLE_ON_DEVICE_TTS !== 'false';

export const OFFLINE_TTS_MODEL = {
  assetPath: 'models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11',
  displayName: 'Supertonic 3 INT8 Türkçe',
  modelType: 'supertonic',
  language: 'tr',
  license: 'OpenRAIL-M',
};

export function normalizeTtsEngine(value) {
  if (!ON_DEVICE_TTS_ENABLED) return DEFAULT_TTS_ENGINE;
  return Object.values(TTS_ENGINES).includes(value) ? value : DEFAULT_TTS_ENGINE;
}

export function getNextTtsEngine(current) {
  if (!ON_DEVICE_TTS_ENABLED) return DEFAULT_TTS_ENGINE;
  return current === TTS_ENGINES.offline ? TTS_ENGINES.device : TTS_ENGINES.offline;
}
