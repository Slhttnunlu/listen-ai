const mockController = { cancel: jest.fn(() => Promise.resolve()) };
const mockStreamHandlers = {};
const mockEngine = {
  destroy: jest.fn(() => Promise.resolve()),
  generateSpeechStream: jest.fn((_text, _options, handlers) => {
    Object.assign(mockStreamHandlers, handlers);
    return Promise.resolve(mockController);
  }),
  getSampleRate: jest.fn(() => Promise.resolve(22050)),
  startPcmPlayer: jest.fn(() => Promise.resolve()),
  stopPcmPlayer: jest.fn(() => Promise.resolve()),
  writePcmChunk: jest.fn(() => Promise.resolve()),
};
const mockCreateStreamingTTS = jest.fn(() => Promise.resolve(mockEngine));

jest.mock('react-native-sherpa-onnx', () => ({
  assetModelPath: jest.fn((path) => ({ type: 'asset', path })),
}));

jest.mock('react-native-sherpa-onnx/tts', () => ({
  createStreamingTTS: mockCreateStreamingTTS,
  detectTtsModel: jest.fn(() =>
    Promise.resolve({ success: true, modelType: 'vits', detectedModels: [] })
  ),
}));

describe('offline speech provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockStreamHandlers).forEach((key) => delete mockStreamHandlers[key]);
  });

  test('creates a streaming engine and forwards PCM chunks to native playback', async () => {
    const { speakOffline } = require('../services/offlineSpeech');

    await speakOffline('Merhaba dünya', { rate: 1.25 });
    await mockStreamHandlers.onChunk({ samples: [0.1, 0.2] });

    expect(mockCreateStreamingTTS).toHaveBeenCalledWith(
      expect.objectContaining({ modelType: 'vits', numThreads: 2, provider: 'cpu' })
    );
    expect(mockEngine.startPcmPlayer).toHaveBeenCalledWith(22050, 1);
    expect(mockEngine.generateSpeechStream).toHaveBeenCalledWith(
      'Merhaba dünya',
      { speed: 1.25 },
      expect.any(Object)
    );
    expect(mockEngine.writePcmChunk).toHaveBeenCalledWith([0.1, 0.2]);
  });

  test('reports an error instead of completing silently when no audio is generated', async () => {
    const { speakOffline } = require('../services/offlineSpeech');
    const onError = jest.fn();

    await speakOffline('Sessiz test', { onError });
    await mockStreamHandlers.onEnd({ cancelled: false });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
