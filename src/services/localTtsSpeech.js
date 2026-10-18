import { File, Paths } from 'expo-file-system';

let activePlayer;
let activeSubscription;
let activeFile;
let activeRequest;

const LOCAL_TTS_TIMEOUT_MS = 10 * 60 * 1000;

function loadAudioModule() {
  return require('expo-audio');
}

function cleanupPlayer() {
  activeSubscription?.remove?.();
  activeSubscription = undefined;
  const player = activePlayer;
  activePlayer = undefined;
  player?.clearLockScreenControls?.();
  player?.pause?.();
  if (player?.remove) player.remove();
  else player?.release?.();
  if (activeFile?.exists) activeFile.delete();
  activeFile = undefined;
}

export async function speakWithLocalTts(text, options = {}) {
  const baseUrl = process.env.EXPO_PUBLIC_LOCAL_TTS_URL?.replace(/\/$/, '');
  if (!baseUrl) throw new Error('local TTS URL is not configured');

  await stopLocalTts();
  const request = new AbortController();
  activeRequest = request;
  // The development-only Mac model is synchronous and long text can take
  // several minutes. Production uses asynchronous jobs instead.
  const timeout = setTimeout(() => request.abort(), LOCAL_TTS_TIMEOUT_MS);

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

    const { createAudioPlayer, setAudioModeAsync } = loadAudioModule();
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
    if (request !== activeRequest) {
      if (file.exists) file.delete();
      return undefined;
    }
    const player = createAudioPlayer(file.uri, {
      updateInterval: 200,
      keepAudioSessionActive: true,
    });
    activePlayer = player;
    player.setPlaybackRate(options.rate || 1, 'medium');
    player.setActiveForLockScreen(
      true,
      {
        title: options.title || text.trim().slice(0, 60) || 'Dinlenen metin',
        artist: 'Listen AI',
      },
      { showSeekForward: false, showSeekBackward: false }
    );
    activeSubscription = player.addListener('playbackStatusUpdate', (status) => {
      if (player !== activePlayer) return;
      if (status.error) {
        cleanupPlayer();
        options.onError?.(new Error('local TTS audio playback failed'));
        return;
      }
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
