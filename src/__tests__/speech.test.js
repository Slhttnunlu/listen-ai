const mockSpeak = jest.fn();
const mockStop = jest.fn(() => Promise.resolve());
const mockStopLocalTts = jest.fn(() => Promise.resolve());

jest.mock('expo-speech', () => ({
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
  maxSpeechInputLength: 24,
  speak: mockSpeak,
  stop: mockStop,
}));

jest.mock('../services/localTtsSpeech', () => ({
  pauseLocalTts: jest.fn(),
  resumeLocalTts: jest.fn(),
  speakWithLocalTts: jest.fn(),
  stopLocalTts: mockStopLocalTts,
}));

describe('device speech service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSpeak.mockReset();
    mockStop.mockResolvedValue(undefined);
    mockStopLocalTts.mockResolvedValue(undefined);
  });

  test('queues bounded chunks and exposes one logical completion callback', () => {
    const onBoundary = jest.fn();
    const onDone = jest.fn();
    const { speak } = require('../services/speech');
    const text = 'Birinci cümle burada. İkinci cümle burada.';

    speak(text, { language: 'tr-TR', onBoundary, onDone });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const [firstText, firstOptions] = mockSpeak.mock.calls[0];
    expect(firstText.length).toBeLessThanOrEqual(24);
    firstOptions.onBoundary({ charIndex: 8, charLength: 5 });
    expect(onBoundary).toHaveBeenCalledWith({ charIndex: 8, charLength: 5 });

    firstOptions.onDone();
    expect(mockSpeak).toHaveBeenCalledTimes(2);
    const [secondText, secondOptions] = mockSpeak.mock.calls[1];
    const secondOffset = text.indexOf(secondText);
    secondOptions.onBoundary({ charIndex: 0, charLength: 6 });
    expect(onBoundary).toHaveBeenLastCalledWith({ charIndex: secondOffset, charLength: 6 });
    expect(onDone).not.toHaveBeenCalled();

    secondOptions.onDone();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test('does not start the next chunk after playback is stopped', async () => {
    const { speak, stopSpeaking } = require('../services/speech');
    speak('Birinci cümle burada. İkinci cümle burada.', {});
    const firstOptions = mockSpeak.mock.calls[0][1];

    await stopSpeaking();
    firstOptions.onDone();

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockStopLocalTts).toHaveBeenCalledTimes(1);
  });

  test('reports one native error and abandons the remaining chunks', () => {
    const onError = jest.fn();
    const { speak } = require('../services/speech');
    speak('Birinci cümle burada. İkinci cümle burada.', { onError });
    const firstOptions = mockSpeak.mock.calls[0][1];

    firstOptions.onError(new Error('native TTS failed'));
    firstOptions.onDone();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledTimes(1);
  });

  test('turns a synchronous native failure into the regular error callback', () => {
    const onError = jest.fn();
    mockSpeak.mockImplementationOnce(() => {
      throw new Error('input rejected');
    });
    const { speak } = require('../services/speech');

    expect(() => speak('Hata testi', { onError })).not.toThrow();

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'input rejected' }));
  });
});
