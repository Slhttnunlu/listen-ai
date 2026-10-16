import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { validateTextDocument } from '../utils/document';

export async function pickTextDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['text/plain'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const content = await new File(asset.uri).text();
  const validation = validateTextDocument(asset, content);
  if (validation.error) throw new Error(validation.error);
  return { content: validation.content, name: asset.name };
}
