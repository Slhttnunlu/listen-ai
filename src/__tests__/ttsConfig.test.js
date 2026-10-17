import {
  DEFAULT_TTS_ENGINE,
  getNextTtsEngine,
  normalizeTtsEngine,
  OFFLINE_TTS_MODEL,
  TTS_ENGINES,
} from '../constants/tts';

describe('TTS engine configuration', () => {
  test('configures the embedded Supertonic model for Turkish', () => {
    expect(OFFLINE_TTS_MODEL).toEqual(
      expect.objectContaining({ modelType: 'supertonic', language: 'tr' })
    );
  });

  test('keeps device TTS as the safe default', () => {
    expect(DEFAULT_TTS_ENGINE).toBe(TTS_ENGINES.device);
    expect(normalizeTtsEngine('unknown')).toBe(TTS_ENGINES.device);
  });

  test('cycles between device and offline engines', () => {
    expect(getNextTtsEngine(TTS_ENGINES.device)).toBe(TTS_ENGINES.offline);
    expect(getNextTtsEngine(TTS_ENGINES.offline)).toBe(TTS_ENGINES.device);
  });
});
