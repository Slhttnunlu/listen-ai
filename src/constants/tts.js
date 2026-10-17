export const TTS_ENGINES = {
  device: 'device',
  localApi: 'mac-local-api',
};

export const DEFAULT_TTS_ENGINE = TTS_ENGINES.device;

export const LOCAL_TTS_ENABLED = Boolean(process.env.EXPO_PUBLIC_LOCAL_TTS_URL);
export const LOCAL_TTS_NAME = 'Mac yerel AI sesi';

export function normalizeTtsEngine(value) {
  if (!LOCAL_TTS_ENABLED) return DEFAULT_TTS_ENGINE;
  return Object.values(TTS_ENGINES).includes(value) ? value : DEFAULT_TTS_ENGINE;
}

export function getNextTtsEngine(current) {
  if (!LOCAL_TTS_ENABLED) return DEFAULT_TTS_ENGINE;
  return current === TTS_ENGINES.localApi ? TTS_ENGINES.device : TTS_ENGINES.localApi;
}
