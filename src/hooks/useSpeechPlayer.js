import { useCallback, useEffect, useRef, useState } from 'react';
import { getPreferredVoices, speak, stopSpeaking } from '../services/speech';
import { clampSpeechIndex, getNextRate } from '../utils/text';

export function useSpeechPlayer({ text, itemId, initialIndex = 0, onProgress, onError }) {
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [activeRange, setActiveRange] = useState(null);
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState();
  const sessionRef = useRef(0);
  const indexRef = useRef(initialIndex);

  useEffect(() => {
    getPreferredVoices()
      .then((choices) => {
        setVoices(choices);
        setVoiceId(choices[0]?.identifier);
      })
      .catch(() => onError?.('Cihazdaki sesler yüklenemedi.'));
    return () => {
      sessionRef.current += 1;
      stopSpeaking();
    };
  }, [onError]);

  useEffect(() => {
    indexRef.current = clampSpeechIndex(initialIndex, text.length);
  }, [initialIndex, text.length]);

  const play = useCallback(
    (selectedRate = rate, requestedIndex = indexRef.current, playbackItemId = itemId) => {
      if (!text.trim()) return false;
      const session = ++sessionRef.current;
      const start = clampSpeechIndex(requestedIndex, text.length);
      indexRef.current = start;
      stopSpeaking();
      setPlaying(true);
      setActiveRange(null);
      speak(text.slice(start), {
        language: 'tr-TR',
        voice: voiceId,
        rate: selectedRate,
        onBoundary: ({ charIndex = 0, charLength = 0 }) => {
          if (session !== sessionRef.current) return;
          const wordStart = start + charIndex;
          indexRef.current = wordStart;
          setActiveRange({ start: wordStart, end: wordStart + charLength });
          onProgress?.(playbackItemId, wordStart, false);
        },
        onDone: () => {
          if (session !== sessionRef.current) return;
          setPlaying(false);
          setActiveRange(null);
          indexRef.current = 0;
          onProgress?.(playbackItemId, 0, true);
        },
        onStopped: () => {
          if (session !== sessionRef.current) return;
          setPlaying(false);
          setActiveRange(null);
        },
        onError: () => {
          if (session !== sessionRef.current) return;
          setPlaying(false);
          setActiveRange(null);
          onError?.('Metin seslendirilirken beklenmeyen bir hata oluştu.');
        },
      });
      return true;
    },
    [itemId, onError, onProgress, rate, text, voiceId]
  );

  const stop = useCallback(() => {
    sessionRef.current += 1;
    stopSpeaking();
    setPlaying(false);
    setActiveRange(null);
  }, []);

  const changeRate = useCallback(() => {
    const nextRate = getNextRate(rate);
    setRate(nextRate);
    play(nextRate, indexRef.current);
  }, [play, rate]);

  return {
    activeRange,
    changeRate,
    play,
    playing,
    rate,
    setRate,
    setVoiceId,
    stop,
    voiceId,
    voices,
  };
}
