import { act, renderHook } from '@testing-library/react-native';
import { useSpeechPlayer } from '../hooks/useSpeechPlayer';
import { getPreferredVoices, speak } from '../services/speech';

jest.mock('../services/speech', () => ({
  getPreferredVoices: jest.fn(() => Promise.resolve([])),
  speak: jest.fn(),
  stopSpeaking: jest.fn(),
}));

describe('useSpeechPlayer error recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getPreferredVoices.mockResolvedValue([]);
  });

  test('reports a progress persistence failure once without stopping playback', async () => {
    const onError = jest.fn();
    const onProgress = jest.fn(() => Promise.reject(new Error('database unavailable')));
    let speechOptions;
    speak.mockImplementation((_text, options) => {
      speechOptions = options;
    });
    const { result } = renderHook(() =>
      useSpeechPlayer({ text: 'Bir test metni', itemId: 7, onProgress, onError })
    );
    await act(async () => Promise.resolve());

    act(() => result.current.play());
    act(() => {
      speechOptions.onBoundary({ charIndex: 0, charLength: 3 });
      speechOptions.onBoundary({ charIndex: 4, charLength: 4 });
    });
    await act(async () => Promise.resolve());

    expect(result.current.playing).toBe(true);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      'Dinleme devam ediyor ancak ilerlemeniz bu kez kaydedilemedi.'
    );
  });

  test('returns to a stopped state when speech cannot start', async () => {
    const onError = jest.fn();
    speak.mockImplementation(() => {
      throw new Error('speech unavailable');
    });
    const { result } = renderHook(() =>
      useSpeechPlayer({ text: 'Bir test metni', itemId: 7, onError })
    );
    await act(async () => Promise.resolve());

    let started;
    act(() => {
      started = result.current.play();
    });

    expect(started).toBe(false);
    expect(result.current.playing).toBe(false);
    expect(onError).toHaveBeenCalledWith('Seslendirme başlatılamadı. Tekrar deneyebilirsiniz.');
  });

  test('uses and updates persisted playback preferences', async () => {
    const onRateChange = jest.fn();
    const onVoiceChange = jest.fn();
    getPreferredVoices.mockResolvedValue([
      { identifier: 'tr-one', name: 'Bir', language: 'tr-TR' },
      { identifier: 'tr-two', name: 'İki', language: 'tr-TR' },
    ]);
    const { result, rerender } = renderHook(
      ({ preferredRate, preferredVoiceId }) =>
        useSpeechPlayer({
          text: 'Tercih testi',
          preferredRate,
          preferredVoiceId,
          onRateChange,
          onVoiceChange,
        }),
      { initialProps: { preferredRate: 1.25, preferredVoiceId: 'tr-two' } }
    );
    await act(async () => Promise.resolve());
    expect(result.current.rate).toBe(1.25);
    expect(result.current.voiceId).toBe('tr-two');

    act(() => result.current.selectVoice('tr-one'));
    act(() => result.current.selectRate(1.5));
    expect(onVoiceChange).toHaveBeenCalledWith('tr-one');
    expect(onRateChange).toHaveBeenCalledWith(1.5);

    rerender({ preferredRate: 0.5, preferredVoiceId: 'tr-one' });
    expect(result.current.rate).toBe(0.5);
  });
});
