import {
  clampSpeechIndex,
  createTitle,
  getNextRate,
  getProgressPercent,
  getWordRangeAt,
  rangesOverlap,
  splitTextWithRanges,
} from '../utils/text';

describe('text utilities', () => {
  test('creates a short title from the first sentence', () => {
    expect(createTitle('  İlk başlık. İkinci cümle. ')).toBe('İlk başlık');
    expect(createTitle('   ')).toBe('Başlıksız metin');
  });

  test('clamps resume position to text boundaries', () => {
    expect(clampSpeechIndex(-5, 10)).toBe(0);
    expect(clampSpeechIndex(4, 10)).toBe(4);
    expect(clampSpeechIndex(20, 10)).toBe(10);
  });

  test('cycles supported playback rates', () => {
    expect(getNextRate(1)).toBe(1.25);
    expect(getNextRate(1.5)).toBe(0.5);
  });

  test('calculates safe progress values', () => {
    expect(getProgressPercent(null, 100)).toBe(0);
    expect(getProgressPercent({ start: 10, end: 25 }, 100)).toBe(25);
    expect(getProgressPercent({ start: 90, end: 150 }, 100)).toBe(100);
  });

  test('keeps exact ranges while splitting Turkish text', () => {
    const ranges = splitTextWithRanges('Merhaba dünya');
    expect(ranges).toEqual([
      { part: 'Merhaba', start: 0, end: 7 },
      { part: ' ', start: 7, end: 8 },
      { part: 'dünya', start: 8, end: 13 },
    ]);
    expect(rangesOverlap(ranges[2], { start: 8, end: 13 })).toBe(true);
  });

  test('finds the readable word at a character position', () => {
    expect(getWordRangeAt('Bir iki üç', 5)).toEqual({ part: 'iki', start: 4, end: 7 });
    expect(getWordRangeAt('Bir iki üç', 10)).toEqual({ part: 'üç', start: 8, end: 10 });
  });
});
