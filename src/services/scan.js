import * as ImagePicker from 'expo-image-picker';
import { validateExtractedDocument } from '../utils/document';

export const SCAN_SOURCES = {
  camera: 'camera',
  library: 'library',
};

function getTextExtractor() {
  try {
    return require('expo-text-extractor');
  } catch {
    return null;
  }
}

export async function selectImageForScan(source) {
  const requestPermission =
    source === SCAN_SOURCES.camera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;
  const permission = await requestPermission();
  if (!permission.granted) {
    throw new Error(
      source === SCAN_SOURCES.camera
        ? 'Metni taramak için kamera izni gerekli. Ayarlardan izin verebilirsiniz.'
        : 'Metni taramak için fotoğraf erişimi gerekli. Ayarlardan izin verebilirsiniz.'
    );
  }

  const openPicker =
    source === SCAN_SOURCES.camera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;
  const result = await openPicker({
    allowsEditing: false,
    mediaTypes: ['images'],
    quality: 1,
  });
  if (result.canceled) return null;
  return result.assets?.[0]?.uri || null;
}

export async function extractTextFromScan(uri) {
  const textExtractor = getTextExtractor();
  if (!textExtractor?.isSupported) {
    throw new Error(
      'Metin tarama Expo Go’da kullanılamaz. Bu özellik için native development build oluşturun.'
    );
  }

  let lines;
  try {
    lines = await textExtractor.extractTextFromImage(uri);
  } catch {
    throw new Error('Görseldeki metin okunamadı. Daha net ve iyi ışıklı bir fotoğraf deneyin.');
  }

  const validation = validateExtractedDocument(
    lines
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n')
  );
  if (validation.error) {
    throw new Error('Görselde okunabilir metin bulunamadı. Daha net bir fotoğraf deneyin.');
  }
  return validation.content;
}
