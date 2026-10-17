import {
  DEFAULT_TTS_ENGINE,
  getNextTtsEngine,
  LOCAL_TTS_ENABLED,
  LOCAL_TTS_NAME,
  normalizeTtsEngine,
  TTS_ENGINES,
} from '../constants/tts';

describe('TTS engine configuration', () => {
  test('keeps the Mac provider disabled without a development URL', () => {
    expect(LOCAL_TTS_ENABLED).toBe(false);
    expect(LOCAL_TTS_NAME).toBe('Mac yerel AI sesi');
  });

  test('keeps device TTS as the safe default', () => {
    expect(DEFAULT_TTS_ENGINE).toBe(TTS_ENGINES.device);
    expect(normalizeTtsEngine('unknown')).toBe(TTS_ENGINES.device);
  });

  test('does not select a development provider when it is not configured', () => {
    expect(getNextTtsEngine(TTS_ENGINES.device)).toBe(TTS_ENGINES.device);
    expect(normalizeTtsEngine(TTS_ENGINES.localApi)).toBe(TTS_ENGINES.device);
  });
});
