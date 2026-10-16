export const MAX_TEXT_FILE_BYTES = 2 * 1024 * 1024;

export function validateTextDocument(asset, content) {
  const fileName = asset.name?.toLocaleLowerCase('tr-TR') || '';
  const isTextFile = fileName.endsWith('.txt') || asset.mimeType === 'text/plain';
  if (!isTextFile) return { error: 'Yalnızca .txt uzantılı metin dosyaları destekleniyor.' };
  if ((asset.size || 0) > MAX_TEXT_FILE_BYTES) return { error: 'Dosya en fazla 2 MB olabilir.' };
  const normalizedContent = content.replace(/^\uFEFF/, '').trim();
  if (!normalizedContent) return { error: 'Seçilen dosyada okunabilir metin bulunamadı.' };
  return { content: normalizedContent };
}
