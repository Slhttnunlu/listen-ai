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

const SPEECH_BREAK_PATTERNS = [/\n\s*\n/g, /[.!?…]["'”’)]*\s+/g, /[;:]["'”’)]*\s+/g, /\s+/g];

function avoidSplittingSurrogatePair(text, index) {
  if (index <= 0 || index >= text.length) return index;
  const previous = text.charCodeAt(index - 1);
  const next = text.charCodeAt(index);
  const previousIsHighSurrogate = previous >= 0xd800 && previous <= 0xdbff;
  const nextIsLowSurrogate = next >= 0xdc00 && next <= 0xdfff;
  return previousIsHighSurrogate && nextIsLowSurrogate ? index - 1 : index;
}

export function splitSpeechText(text, maxLength) {
  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new Error('Speech chunk length must be a positive integer.');
  }

  const segments = [];
  let cursor = 0;

  while (cursor < text.length) {
    while (cursor < text.length && /\s/.test(text[cursor])) cursor += 1;
    if (cursor >= text.length) break;

    let end = Math.min(cursor + maxLength, text.length);
    if (end < text.length) {
      const window = text.slice(cursor, end);
      const minimumEnd = cursor + Math.max(1, Math.floor(maxLength * 0.5));

      for (const pattern of SPEECH_BREAK_PATTERNS) {
        pattern.lastIndex = 0;
        const candidates = Array.from(
          window.matchAll(pattern),
          (match) => cursor + match.index + match[0].length
        )
          .filter((candidate) => candidate >= minimumEnd)
          .map((candidate) => avoidSplittingSurrogatePair(text, candidate));
        if (candidates.length) {
          end = candidates.at(-1);
          break;
        }
      }
      end = avoidSplittingSurrogatePair(text, end);
    }

    let contentEnd = end;
    while (contentEnd > cursor && /\s/.test(text[contentEnd - 1])) contentEnd -= 1;
    if (contentEnd === cursor) contentEnd = end;

    segments.push({ text: text.slice(cursor, contentEnd), start: cursor, end: contentEnd });
    cursor = end;
  }

  return segments;
}
