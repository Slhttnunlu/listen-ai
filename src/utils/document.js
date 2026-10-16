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
  return { content: normalizedContent };
}

function splitOversizedBlock(block, maxLength) {
  const sections = [];
  let remaining = block.trim();
  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf(' ', maxLength);
    if (splitAt < Math.floor(maxLength * 0.5)) splitAt = maxLength;
    sections.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }
  if (remaining) sections.push(remaining);
  return sections;
}

export function splitDocumentContent(content, maxLength = MAX_EXTRACTED_DOCUMENT_CHARS) {
  const validation = validateExtractedDocument(content);
  if (validation.error) return validation;

  const sections = [];
  let current = '';
  const blocks = validation.content
    .split(/\n{2,}/)
    .flatMap((block) =>
      block.length > maxLength ? splitOversizedBlock(block, maxLength) : [block.trim()]
    );

  blocks.forEach((block) => {
    if (!block) return;
    const candidate = current ? `${current}\n\n${block}` : block;
    if (candidate.length <= maxLength) current = candidate;
    else {
      if (current) sections.push(current);
      current = block;
    }
  });
  if (current) sections.push(current);
  return { sections };
}

export function createDocumentSectionTitle(fileName, index, total) {
  const baseName = (fileName || 'Belge').replace(/\.(txt|docx)$/i, '').trim() || 'Belge';
  return total > 1 ? `${baseName} · Bölüm ${index + 1}/${total}` : baseName;
}

export function validateTextDocument(asset, content) {
  const assetValidation = validateDocumentAsset(asset);
  if (assetValidation.error || assetValidation.type !== 'txt') {
    return { error: assetValidation.error || 'Bu dosya UTF-8 TXT olarak okunamıyor.' };
  }
  return validateExtractedDocument(content);
}
