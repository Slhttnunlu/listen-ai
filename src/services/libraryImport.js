import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { parseLibraryImport } from '../utils/library';

export const MAX_LIBRARY_BACKUP_BYTES = 10 * 1024 * 1024;

export async function pickLibraryBackup(currentItems) {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if ((asset.size || 0) > MAX_LIBRARY_BACKUP_BYTES) {
    throw new Error('Yedek dosyası en fazla 10 MB olabilir.');
  }
  const parsed = parseLibraryImport(await new File(asset.uri).text(), currentItems);
  return { ...parsed, name: asset.name };
}
