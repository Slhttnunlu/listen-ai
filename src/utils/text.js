export const DEFAULT_TEXT =
  'Listen AI ile makaleleri, notları ve uzun metinleri istediğiniz yerde dinleyin.';

export const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5];

export function createTitle(text, maxLength = 60) {
  return (
    text
      .trim()
      .split(/\n|[.!?]/)[0]
      .slice(0, maxLength) || 'Başlıksız metin'
  );
}

export function clampSpeechIndex(index, textLength) {
  return Math.min(Math.max(Number(index) || 0, 0), textLength);
}

export function getNextRate(currentRate) {
  const currentIndex = PLAYBACK_RATES.indexOf(currentRate);
  return PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
}

export function getProgressPercent(activeRange, textLength) {
  if (!activeRange || !textLength) return 0;
  return Math.min(100, Math.max(0, Math.round((activeRange.end / textLength) * 100)));
}

export function splitTextWithRanges(text) {
  let index = 0;
  return text.split(/(\s+)/).map((part) => {
    const start = index;
    index += part.length;
    return { part, start, end: index };
  });
}

export function getWordRangeAt(text, index) {
  const parts = splitTextWithRanges(text);
  const safeIndex = clampSpeechIndex(index, text.length);
  const words = parts.filter(({ part }) => part.trim().length > 0);
  return (
    words.find(({ start, end }) => safeIndex >= start && safeIndex < end) ||
    words.find(({ start }) => start >= safeIndex) ||
    words.at(-1) ||
    null
  );
}

export function rangesOverlap(first, second) {
  return Boolean(first && second && first.start < second.end && first.end > second.start);
}
