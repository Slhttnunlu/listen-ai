import * as Speech from 'expo-speech';

export async function getPreferredVoices() {
  const voices = await Speech.getAvailableVoicesAsync();
  const turkishVoices = voices.filter((voice) => voice.language?.toLowerCase().startsWith('tr'));
  return (turkishVoices.length ? turkishVoices : voices).slice(0, 3);
}

export function speak(text, options) {
  Speech.speak(text, options);
}

export function stopSpeaking() {
  return Speech.stop();
}
