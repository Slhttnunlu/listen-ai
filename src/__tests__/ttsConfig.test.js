import {
  DEFAULT_TTS_ENGINE,
  getNextTtsEngine,
  normalizeTtsEngine,
  TTS_ENGINES,
} from '../constants/tts';

describe('TTS engine configuration', () => {
  test('keeps device TTS as the safe default', () => {
    expect(DEFAULT_TTS_ENGINE).toBe(TTS_ENGINES.device);
    expect(normalizeTtsEngine('unknown')).toBe(TTS_ENGINES.device);
  });

  test('cycles between device and offline engines', () => {
    expect(getNextTtsEngine(TTS_ENGINES.device)).toBe(TTS_ENGINES.offline);
    expect(getNextTtsEngine(TTS_ENGINES.offline)).toBe(TTS_ENGINES.device);
  });
});
