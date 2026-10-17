const mockFileWrite = jest.fn();
const mockFileDelete = jest.fn();
const mockPlayer = {
  addListener: jest.fn(),
  pause: jest.fn(),
  play: jest.fn(),
  release: jest.fn(),
  setPlaybackRate: jest.fn(),
};

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

    await speakWithLocalTts('Merhaba dünya', { rate: 1.25 });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8765/v1/tts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer temporary-token' }),
        body: JSON.stringify({ text: 'Merhaba dünya', language: 'tr' }),
      })
    );
    expect(mockFileWrite).toHaveBeenCalled();
    expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(1.25, 'medium');
    expect(mockPlayer.play).toHaveBeenCalled();
  });

  test('rejects when the local service is unavailable', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 503 });
    const { speakWithLocalTts } = require('../services/localTtsSpeech');

    await expect(speakWithLocalTts('Merhaba')).rejects.toThrow('local TTS returned 503');
  });
});
