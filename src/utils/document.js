export const MAX_TEXT_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_DOCX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_EXTRACTED_DOCUMENT_CHARS = 250000;

export const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function getDocumentType(asset) {
  const fileName = asset.name?.toLocaleLowerCase('tr-TR') || '';
  if (fileName.endsWith('.txt') || asset.mimeType === 'text/plain') return 'txt';
  if (fileName.endsWith('.docx') || asset.mimeType === DOCX_MIME_TYPE) return 'docx';
  return null;
}

export function validateDocumentAsset(asset) {
  const type = getDocumentType(asset);
  if (!type) return { error: 'Yalnızca .txt ve .docx dosyaları destekleniyor.' };
  const maxBytes = type === 'docx' ? MAX_DOCX_FILE_BYTES : MAX_TEXT_FILE_BYTES;
  const maxMegabytes = maxBytes / 1024 / 1024;
  if ((asset.size || 0) > maxBytes) {
    return { error: `${type.toUpperCase()} dosyası en fazla ${maxMegabytes} MB olabilir.` };
  }
  return { type };
}

export function validateExtractedDocument(content) {
  const normalizedContent = content.replace(/^\uFEFF/, '').trim();
  if (!normalizedContent) return { error: 'Seçilen dosyada okunabilir metin bulunamadı.' };
  if (normalizedContent.length > MAX_EXTRACTED_DOCUMENT_CHARS) {
    return {
      error:
        'Belge 250.000 karakter sınırını aşıyor. Büyük belge bölümleme özelliği henüz hazır değil.',
    };
  }
  return { content: normalizedContent };
}

export function validateTextDocument(asset, content) {
  const assetValidation = validateDocumentAsset(asset);
  if (assetValidation.error || assetValidation.type !== 'txt') {
    return { error: assetValidation.error || 'Bu dosya UTF-8 TXT olarak okunamıyor.' };
  }
  return validateExtractedDocument(content);
}
