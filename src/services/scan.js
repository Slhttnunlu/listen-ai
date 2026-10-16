import * as ImagePicker from 'expo-image-picker';
import { validateExtractedDocument } from '../utils/document';

export const SCAN_SOURCES = {
  camera: 'camera',
  library: 'library',
};

const MIN_SCAN_EDGE_PIXELS = 900;
const MAX_SCAN_FILE_SIZE_BYTES = 15 * 1024 * 1024;

function getTextExtractor() {
  try {
    return require('expo-text-extractor');
  } catch {
    return null;
  }
}

function validateScanAsset(asset) {
  const longestEdge = Math.max(asset.width || 0, asset.height || 0);
  if (longestEdge > 0 && longestEdge < MIN_SCAN_EDGE_PIXELS) {
    throw new Error(
      'Fotoğraf çözünürlüğü metin taramak için çok düşük. Daha net bir fotoğraf seçin.'
    );
  }
  if (asset.fileSize && asset.fileSize > MAX_SCAN_FILE_SIZE_BYTES) {
    throw new Error('Fotoğraf dosyası çok büyük. Daha küçük bir görsel seçin veya kırpın.');
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
    allowsEditing: true,
    mediaTypes: ['images'],
    quality: 1,
  });
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.uri) return null;
  validateScanAsset(asset);
  return asset.uri;
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
