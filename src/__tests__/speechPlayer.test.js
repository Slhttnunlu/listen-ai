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
});
