import { useCallback, useEffect, useRef, useState } from 'react';
import { TTS_ENGINES } from '../constants/tts';
import {
  destroySpeechEngines,
  getPreferredVoices,
  speakWithEngine,
  stopSpeaking,
} from '../services/speech';
import { clampSpeechIndex, getNextRate } from '../utils/text';

export function useSpeechPlayer({
  text,
  itemId,
  initialIndex = 0,
  preferredRate = 1,
  preferredVoiceId,
  ttsEngine = TTS_ENGINES.device,
  onProgress,
  onError,
  onRateChange,
  onVoiceChange,
  onEngineFallback,
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
      destroySpeechEngines();
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
      const speechOptions = {
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
          onError?.('Metin seslendirilirken beklenmeyen bir hata oluştu. Tekrar deneyebilirsiniz.');
        },
      };

      let fallbackStarted = false;
      const fallbackToDevice = () => {
        if (session !== sessionRef.current || fallbackStarted) return;
        fallbackStarted = true;
        onEngineFallback?.(TTS_ENGINES.device);
        onError?.(
          'Offline ses modeli kullanılamadı. Bu dinleme cihazın sistem sesiyle devam edecek.'
        );
        Promise.resolve(
          speakWithEngine(TTS_ENGINES.device, text.slice(start), speechOptions)
        ).catch(() => speechOptions.onError());
      };
      const selectedEngineOptions =
        ttsEngine === TTS_ENGINES.offline
          ? { ...speechOptions, onError: fallbackToDevice }
          : speechOptions;

      Promise.resolve(speakWithEngine(ttsEngine, text.slice(start), selectedEngineOptions)).catch(
        () => {
          if (session !== sessionRef.current) return;
          if (ttsEngine === TTS_ENGINES.offline) {
            fallbackToDevice();
            return;
          }
          speechOptions.onError();
        }
      );
      return true;
    },
    [itemId, onEngineFallback, onError, onProgress, rate, text, ttsEngine, voiceId]
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
