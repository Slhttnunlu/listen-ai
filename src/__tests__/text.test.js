import {
  clampSpeechIndex,
  createTitle,
  getNextRate,
  getProgressPercent,
  getWordRangeAt,
  rangesOverlap,
  splitSpeechText,
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

  test('splits speech at sentence and word boundaries with original offsets', () => {
    const text = 'Birinci cümle burada. İkinci cümle burada ve devam ediyor.';
    const segments = splitSpeechText(text, 32);

    expect(segments.map((segment) => segment.text)).toEqual([
      'Birinci cümle burada.',
      'İkinci cümle burada ve devam',
      'ediyor.',
    ]);
    expect(
      segments.every((segment) => text.slice(segment.start, segment.end) === segment.text)
    ).toBe(true);
    expect(segments.every((segment) => segment.text.length <= 32)).toBe(true);
  });

  test('never separates the two code units of an emoji', () => {
    const text = `abcdefghi🎧${'x'.repeat(12)}`;
    const segments = splitSpeechText(text, 10);

    expect(segments.map((segment) => segment.text).join('')).toBe(text);
    expect(
      segments.some(
        (segment) => segment.text.includes('\ud83c') !== segment.text.includes('\udfa7')
      )
    ).toBe(false);
  });

  test('rejects invalid speech chunk limits', () => {
    expect(() => splitSpeechText('Metin', 0)).toThrow('positive integer');
  });
});
