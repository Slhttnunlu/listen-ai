import { act, renderHook } from '@testing-library/react-native';
import { useSpeechPlayer } from '../hooks/useSpeechPlayer';
import { getPreferredVoices, speakWithEngine } from '../services/speech';

jest.mock('../services/speech', () => ({
  getPreferredVoices: jest.fn(() => Promise.resolve([])),
  speakWithEngine: jest.fn(),
  stopSpeaking: jest.fn(),
  destroySpeechEngines: jest.fn(),
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
    speakWithEngine.mockImplementation((_engine, _text, options) => {
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

  test('uses the full current word when a system voice omits boundary length', async () => {
    let speechOptions;
    speakWithEngine.mockImplementation((_engine, _text, options) => {
      speechOptions = options;
    });
    const { result } = renderHook(() => useSpeechPlayer({ text: 'Bir test metni' }));
    await act(async () => Promise.resolve());

    act(() => result.current.play());
    act(() => speechOptions.onBoundary({ charIndex: 4, charLength: 0 }));

    expect(result.current.activeRange).toEqual({ start: 4, end: 8 });
  });

  test('returns to a stopped state when speech cannot start', async () => {
    const onError = jest.fn();
    speakWithEngine.mockRejectedValue(new Error('speech unavailable'));
    const { result } = renderHook(() =>
      useSpeechPlayer({ text: 'Bir test metni', itemId: 7, onError })
    );
    await act(async () => Promise.resolve());

    let started;
    act(() => {
      started = result.current.play();
    });

    await act(async () => Promise.resolve());
    expect(started).toBe(true);
    expect(result.current.playing).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      'Metin seslendirilirken beklenmeyen bir hata oluştu. Tekrar deneyebilirsiniz.'
    );
  });

  test('maps offline stream progress to the currently read word', async () => {
    let speechOptions;
    speakWithEngine.mockImplementation((_engine, _text, options) => {
      speechOptions = options;
    });
    const { result } = renderHook(() =>
      useSpeechPlayer({ text: 'Bir iki üç', ttsEngine: 'offline-model' })
    );
    await act(async () => Promise.resolve());

    act(() => result.current.play());
    act(() => speechOptions.onProgress(0.5));

    expect(result.current.activeRange).toEqual({ start: 4, end: 7 });
  });

  test('pauses without losing position and resumes from the current word', async () => {
    let speechOptions;
    speakWithEngine.mockImplementation((_engine, _text, options) => {
      speechOptions = options;
    });
    const { result } = renderHook(() => useSpeechPlayer({ text: 'Bir test metni' }));
    await act(async () => Promise.resolve());

    act(() => result.current.play());
    act(() => speechOptions.onBoundary({ charIndex: 4, charLength: 4 }));
    act(() => result.current.pause());

    expect(result.current.playing).toBe(false);
    expect(result.current.activeRange).toEqual({ start: 4, end: 8 });

    act(() => result.current.resume());
    expect(speakWithEngine).toHaveBeenLastCalledWith('device', 'test metni', expect.any(Object));
    expect(result.current.playing).toBe(true);
  });

  test('falls back to device speech when the offline engine cannot start', async () => {
    const onError = jest.fn();
    const onEngineFallback = jest.fn();
    speakWithEngine
      .mockRejectedValueOnce(new Error('native model unavailable'))
      .mockResolvedValueOnce(undefined);
    const { result } = renderHook(() =>
      useSpeechPlayer({
        text: 'Offline model testi',
        ttsEngine: 'offline-model',
        onError,
        onEngineFallback,
      })
    );
    await act(async () => Promise.resolve());

    act(() => result.current.play());
    await act(async () => Promise.resolve());

    expect(onEngineFallback).toHaveBeenCalledWith('device');
    expect(speakWithEngine).toHaveBeenNthCalledWith(
      2,
      'device',
      'Offline model testi',
      expect.any(Object)
    );
    expect(onError).toHaveBeenCalledWith(
      'Offline ses modeli kullanılamadı. Bu dinleme cihazın sistem sesiyle devam edecek.'
    );
  });

  test('falls back once when the offline engine reports a streaming error', async () => {
    const onEngineFallback = jest.fn();
    let offlineOptions;
    speakWithEngine.mockImplementation((engine, _text, options) => {
      if (engine === 'offline-model') offlineOptions = options;
      return Promise.resolve();
    });
    const { result } = renderHook(() =>
      useSpeechPlayer({
        text: 'Akış hatası testi',
        ttsEngine: 'offline-model',
        onEngineFallback,
      })
    );
    await act(async () => Promise.resolve());

    act(() => result.current.play());
    await act(async () => offlineOptions.onError(new Error('pcm stream failed')));

    expect(onEngineFallback).toHaveBeenCalledTimes(1);
    expect(speakWithEngine).toHaveBeenNthCalledWith(
      2,
      'device',
      'Akış hatası testi',
      expect.any(Object)
    );
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
