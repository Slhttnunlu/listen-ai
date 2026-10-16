import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import {
  DOCX_MIME_TYPE,
  splitDocumentContent,
  validateDocumentAsset,
  validateTextDocument,
} from '../utils/document';
import { extractDocxText } from './docx';

export async function pickTextDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['text/plain', DOCX_MIME_TYPE],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const assetValidation = validateDocumentAsset(asset);
  if (assetValidation.error) throw new Error(assetValidation.error);
  const file = new File(asset.uri);

  if (assetValidation.type === 'docx') {
    const content = await extractDocxText(await file.arrayBuffer());
    return {
      content,
      sections: splitDocumentContent(content).sections,
      name: asset.name,
      type: 'docx',
    };
  }

  const validation = validateTextDocument(asset, await file.text());
  if (validation.error) throw new Error(validation.error);
  return {
    content: validation.content,
    sections: splitDocumentContent(validation.content).sections,
    name: asset.name,
    type: 'txt',
  };
}
