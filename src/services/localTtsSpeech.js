import { File, Paths } from 'expo-file-system';

let activePlayer;
let activeSubscription;
let activeFile;
let activeRequest;

function loadAudioModule() {
  return require('expo-audio');
}

function cleanupPlayer() {
  activeSubscription?.remove?.();
  activeSubscription = undefined;
  activePlayer?.pause?.();
  activePlayer?.release?.();
  activePlayer = undefined;
  if (activeFile?.exists) activeFile.delete();
  activeFile = undefined;
}

export async function speakWithLocalTts(text, options = {}) {
  const baseUrl = process.env.EXPO_PUBLIC_LOCAL_TTS_URL?.replace(/\/$/, '');
  if (!baseUrl) throw new Error('local TTS URL is not configured');

  await stopLocalTts();
  const request = new AbortController();
  activeRequest = request;
  const timeout = setTimeout(() => request.abort(), 120_000);

  try {
    const token = process.env.EXPO_PUBLIC_LOCAL_TTS_TOKEN;
    const response = await fetch(`${baseUrl}/v1/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text, language: 'tr' }),
      signal: request.signal,
    });
    if (!response.ok) throw new Error(`local TTS returned ${response.status}`);

    const file = new File(Paths.cache, `listen-ai-local-tts-${Date.now()}.wav`);
    file.write(new Uint8Array(await response.arrayBuffer()));
    activeFile = file;

    const { createAudioPlayer } = loadAudioModule();
    const player = createAudioPlayer(file.uri, { updateInterval: 200 });
    activePlayer = player;
    player.setPlaybackRate(options.rate || 1, 'medium');
    activeSubscription = player.addListener('playbackStatusUpdate', (status) => {
      if (player !== activePlayer) return;
      if (status.didJustFinish) {
        options.onDone?.();
        cleanupPlayer();
      }
    });
    player.play();
    return player;
  } catch (error) {
    if (request === activeRequest) cleanupPlayer();
    throw error;
  } finally {
    clearTimeout(timeout);
    if (request === activeRequest) activeRequest = undefined;
  }
}

export async function stopLocalTts() {
  activeRequest?.abort();
  activeRequest = undefined;
  cleanupPlayer();
}

export function pauseLocalTts() {
  activePlayer?.pause?.();
}

export function resumeLocalTts() {
  activePlayer?.play?.();
}
