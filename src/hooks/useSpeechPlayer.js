import { useCallback, useEffect, useRef, useState } from 'react';
import { getPreferredVoices, speak, stopSpeaking } from '../services/speech';
import { clampSpeechIndex, getNextRate } from '../utils/text';

export function useSpeechPlayer({
  text,
  itemId,
  initialIndex = 0,
  preferredRate = 1,
  preferredVoiceId,
  onProgress,
  onError,
  onRateChange,
  onVoiceChange,
}) {
  const [playing, setPlaying] = useState(false);
  const [activeRange, setActiveRange] = useState(null);
  const [voices, setVoices] = useState([]);
  const sessionRef = useRef(0);
  const indexRef = useRef(initialIndex);
  const progressErrorReportedRef = useRef(false);

  useEffect(() => {
    getPreferredVoices()
      .then((choices) => {
        setVoices(choices);
      })
      .catch(() => onError?.('Cihazdaki sesler yüklenemedi.'));
    return () => {
      sessionRef.current += 1;
      stopSpeaking();
    };
  }, [onError]);

  const rate = preferredRate;
  const preferredVoiceExists = voices.some((voice) => voice.identifier === preferredVoiceId);
  const voiceId = preferredVoiceExists ? preferredVoiceId : voices[0]?.identifier;

  useEffect(() => {
    indexRef.current = clampSpeechIndex(initialIndex, text.length);
  }, [initialIndex, text.length]);

  const play = useCallback(
    (selectedRate = rate, requestedIndex = indexRef.current, playbackItemId = itemId) => {
      if (!text.trim()) return false;
      const session = ++sessionRef.current;
      const start = clampSpeechIndex(requestedIndex, text.length);
      progressErrorReportedRef.current = false;
      indexRef.current = start;
      stopSpeaking();
      setPlaying(true);
      setActiveRange(null);
      const persistProgress = (progressIndex, isCompleted) => {
        if (!onProgress) return;
        Promise.resolve()
          .then(() => onProgress(playbackItemId, progressIndex, isCompleted))
          .catch(() => {
            if (session !== sessionRef.current || progressErrorReportedRef.current) return;
            progressErrorReportedRef.current = true;
            onError?.('Dinleme devam ediyor ancak ilerlemeniz bu kez kaydedilemedi.');
          });
      };
      try {
        speak(text.slice(start), {
          language: 'tr-TR',
          voice: voiceId,
          rate: selectedRate,
          onBoundary: ({ charIndex = 0, charLength = 0 }) => {
            if (session !== sessionRef.current) return;
            const wordStart = start + charIndex;
            indexRef.current = wordStart;
            setActiveRange({ start: wordStart, end: wordStart + charLength });
            persistProgress(wordStart, false);
          },
          onDone: () => {
            if (session !== sessionRef.current) return;
            setPlaying(false);
            setActiveRange(null);
            indexRef.current = 0;
            persistProgress(0, true);
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
            onError?.(
              'Metin seslendirilirken beklenmeyen bir hata oluştu. Tekrar deneyebilirsiniz.'
            );
          },
        });
      } catch {
        setPlaying(false);
        setActiveRange(null);
        onError?.('Seslendirme başlatılamadı. Tekrar deneyebilirsiniz.');
        return false;
      }
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
    onRateChange?.(nextRate);
    play(nextRate, indexRef.current);
  }, [onRateChange, play, rate]);

  const selectRate = useCallback(
    (nextRate) => {
      onRateChange?.(nextRate);
    },
    [onRateChange]
  );

  const selectVoice = useCallback(
    (nextVoiceId) => {
      onVoiceChange?.(nextVoiceId);
    },
    [onVoiceChange]
  );

  return {
    activeRange,
    changeRate,
    play,
    playing,
    rate,
    selectRate,
    selectVoice,
    stop,
    voiceId,
    voices,
  };
}
