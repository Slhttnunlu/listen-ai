import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { serializeLibrary } from '../utils/library';

export async function exportLibrary(items) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Bu cihazda paylaşım ekranı kullanılamıyor.');
  }

  const file = new File(Paths.cache, `listen-ai-export-${Date.now()}.json`);
  file.write(serializeLibrary(items));
  await Sharing.shareAsync(file.uri, {
    dialogTitle: 'Listen AI kütüphanesini dışa aktar',
    mimeType: 'application/json',
    UTI: 'public.json',
  });
  return file.uri;
}
