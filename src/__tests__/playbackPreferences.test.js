import { act, renderHook } from '@testing-library/react-native';
import { usePlaybackPreferences } from '../hooks/usePlaybackPreferences';
import { getPlaybackPreferences, setPlaybackPreference } from '../storage/library';

jest.mock('../storage/library', () => ({
  getPlaybackPreferences: jest.fn(),
  setPlaybackPreference: jest.fn(),
}));

describe('usePlaybackPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getPlaybackPreferences.mockResolvedValue({
      rate: 1.25,
      voiceId: 'tr-two',
      ttsEngine: 'offline-model',
    });
    setPlaybackPreference.mockResolvedValue(undefined);
  });

  test('loads and persists supported rate and voice preferences', async () => {
    const { result } = renderHook(() => usePlaybackPreferences({}));
    await act(async () => Promise.resolve());

    expect(result.current.preferredRate).toBe(1.25);
    expect(result.current.preferredVoiceId).toBe('tr-two');
    expect(result.current.ttsEngine).toBe('offline-model');

    await act(async () => {
      await result.current.saveRate(1.5);
      await result.current.saveVoiceId('tr-one');
      await result.current.saveTtsEngine('device');
    });
    expect(setPlaybackPreference).toHaveBeenCalledWith('playback_rate', '1.5');
    expect(setPlaybackPreference).toHaveBeenCalledWith('voice_id', 'tr-one');
    expect(setPlaybackPreference).toHaveBeenCalledWith('tts_engine', 'device');
  });

  test('keeps the app usable and reports preference storage failures', async () => {
    const onError = jest.fn();
    setPlaybackPreference.mockRejectedValue(new Error('disk unavailable'));
    const { result } = renderHook(() => usePlaybackPreferences({ onError }));
    await act(async () => Promise.resolve());

    await act(async () => result.current.saveRate(0.5));
    expect(result.current.preferredRate).toBe(0.5);
    expect(onError).toHaveBeenCalledWith('Oynatma hızı tercihi kaydedilemedi.');
  });
});
