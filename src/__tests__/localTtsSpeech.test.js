const mockFileWrite = jest.fn();
const mockFileDelete = jest.fn();
const mockPlayer = {
  addListener: jest.fn(),
  clearLockScreenControls: jest.fn(),
  pause: jest.fn(),
  play: jest.fn(),
  remove: jest.fn(),
  setActiveForLockScreen: jest.fn(),
  setPlaybackRate: jest.fn(),
};
const mockSetAudioModeAsync = jest.fn();

jest.mock('expo-file-system', () => ({
  File: jest.fn(() => ({
    delete: mockFileDelete,
    exists: true,
    uri: 'file:///cache/local-tts.wav',
    write: mockFileWrite,
  })),
  Paths: { cache: 'file:///cache/' },
}));

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => mockPlayer),
  setAudioModeAsync: mockSetAudioModeAsync,
}));

describe('Mac local TTS speech service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_LOCAL_TTS_URL = 'http://127.0.0.1:8765/';
    process.env.EXPO_PUBLIC_LOCAL_TTS_TOKEN = 'temporary-token';
    mockPlayer.addListener.mockReturnValue({ remove: jest.fn() });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
        ok: true,
      })
    );
  });

  afterEach(async () => {
    const { stopLocalTts } = require('../services/localTtsSpeech');
    await stopLocalTts();
    delete process.env.EXPO_PUBLIC_LOCAL_TTS_URL;
    delete process.env.EXPO_PUBLIC_LOCAL_TTS_TOKEN;
  });

  test('requests Turkish WAV audio and starts playback', async () => {
    const { speakWithLocalTts } = require('../services/localTtsSpeech');

    await speakWithLocalTts('Merhaba dünya', { rate: 1.25, title: 'Deneme metni' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8765/v1/tts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer temporary-token' }),
        body: JSON.stringify({ text: 'Merhaba dünya', language: 'tr' }),
      })
    );
    expect(mockFileWrite).toHaveBeenCalled();
    expect(mockSetAudioModeAsync).toHaveBeenCalledWith({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
    expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(1.25, 'medium');
    expect(mockPlayer.setActiveForLockScreen).toHaveBeenCalledWith(
      true,
      { title: 'Deneme metni', artist: 'Listen AI' },
      { showSeekForward: false, showSeekBackward: false }
    );
    expect(mockPlayer.play).toHaveBeenCalled();
  });

  test('clears lock-screen controls and reports a native playback error', async () => {
    let statusListener;
    const onError = jest.fn();
    mockPlayer.addListener.mockImplementation((_event, listener) => {
      statusListener = listener;
      return { remove: jest.fn() };
    });
    const { speakWithLocalTts } = require('../services/localTtsSpeech');

    await speakWithLocalTts('Hata testi', { onError });
    statusListener({ error: 'decoder failed', didJustFinish: false });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(mockPlayer.clearLockScreenControls).toHaveBeenCalled();
    expect(mockPlayer.remove).toHaveBeenCalled();
  });

  test('rejects when the local service is unavailable', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 503 });
    const { speakWithLocalTts } = require('../services/localTtsSpeech');

    await expect(speakWithLocalTts('Merhaba')).rejects.toThrow('local TTS returned 503');
  });
});
