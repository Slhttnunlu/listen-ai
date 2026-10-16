import { useCallback, useEffect, useState } from 'react';
import { getPlaybackPreferences, setPlaybackPreference } from '../storage/library';
import { PLAYBACK_RATES } from '../utils/text';

export function usePlaybackPreferences({ onError }) {
  const [rate, setRate] = useState(1);
  const [voiceId, setVoiceId] = useState(null);

  useEffect(() => {
    let mounted = true;
    getPlaybackPreferences()
      .then((preferences) => {
        if (!mounted) return;
        if (PLAYBACK_RATES.includes(preferences.rate)) setRate(preferences.rate);
        setVoiceId(preferences.voiceId);
      })
      .catch(() => onError?.('Dinleme tercihleri yüklenemedi.'));
    return () => {
      mounted = false;
    };
  }, [onError]);

  const saveRate = useCallback(
    async (nextRate) => {
      if (!PLAYBACK_RATES.includes(nextRate)) return;
      setRate(nextRate);
      try {
        await setPlaybackPreference('playback_rate', String(nextRate));
      } catch {
        onError?.('Oynatma hızı tercihi kaydedilemedi.');
      }
    },
    [onError]
  );

  const saveVoiceId = useCallback(
    async (nextVoiceId) => {
      if (!nextVoiceId) return;
      setVoiceId(nextVoiceId);
      try {
        await setPlaybackPreference('voice_id', nextVoiceId);
      } catch {
        onError?.('Ses tercihi kaydedilemedi.');
      }
    },
    [onError]
  );

  return { preferredRate: rate, preferredVoiceId: voiceId, saveRate, saveVoiceId };
}
