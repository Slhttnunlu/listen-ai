import { extractText, isAvailable } from 'expo-pdf-text-extract';
import { validateExtractedDocument } from '../utils/document';

export function getPdfExtractionErrorMessage(error) {
  switch (error?.code) {
    case 'PASSWORD_REQUIRED':
    case 'INCORRECT_PASSWORD':
      return 'Bu PDF parola korumalı. Parolasız bir kopya seçin.';
    case 'FILE_NOT_FOUND':
      return 'PDF dosyasına erişilemedi. Dosyayı yeniden seçin.';
    case 'CORRUPT_PDF':
    case 'PDF_LOAD_ERROR':
    case 'PDF_EXTRACTION_ERROR':
      return 'PDF dosyası bozuk veya okunamıyor.';
    default:
      return 'PDF metni çıkarılamadı. Dosyayı yeniden deneyin.';
  }
}

export async function extractPdfText(uri) {
  if (!isAvailable()) {
    throw new Error(
      'PDF okuma Expo Go’da kullanılamaz. Bu özellik için native development build oluşturun.'
    );
  }

  let content;
  try {
    content = await extractText(uri);
  } catch (error) {
    throw new Error(getPdfExtractionErrorMessage(error));
  }

  const validation = validateExtractedDocument(content);
  if (validation.error) {
    throw new Error(
      'Bu PDF’de seçilebilir metin bulunamadı. Taranmış/görsel PDF olabilir; Metni Tara özelliği OCR desteği geldiğinde kullanılabilecek.'
    );
  }
  return validation.content;
}
