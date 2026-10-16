import {
  DOCX_MIME_TYPE,
  getDocumentType,
  MAX_EXTRACTED_DOCUMENT_CHARS,
  MAX_TEXT_FILE_BYTES,
  validateDocumentAsset,
  validateExtractedDocument,
  validateTextDocument,
} from '../utils/document';

describe('document validation', () => {
  test('accepts UTF-8 text and removes BOM/outer whitespace', () => {
    expect(
      validateTextDocument({ name: 'notlar.txt', size: 20 }, '\uFEFF  Türkçe içerik\n')
    ).toEqual({ content: 'Türkçe içerik' });
  });

  test('rejects unsupported, oversized and empty files', () => {
    expect(validateTextDocument({ name: 'notlar.pdf', size: 20 }, 'metin').error).toContain('.txt');
    expect(
      validateTextDocument({ name: 'notlar.txt', size: MAX_TEXT_FILE_BYTES + 1 }, 'metin').error
    ).toContain('2 MB');
    expect(validateTextDocument({ name: 'notlar.txt', size: 10 }, '  ').error).toContain(
      'okunabilir'
    );
  });

  test('recognizes DOCX by extension or MIME type and applies its size limit', () => {
    expect(getDocumentType({ name: 'rapor.docx' })).toBe('docx');
    expect(getDocumentType({ name: 'rapor', mimeType: DOCX_MIME_TYPE })).toBe('docx');
    expect(validateDocumentAsset({ name: 'rapor.docx', size: 11 * 1024 * 1024 }).error).toContain(
      '10 MB'
    );
  });

  test('rejects extracted documents that exceed the safe editor limit', () => {
    expect(validateExtractedDocument('a'.repeat(MAX_EXTRACTED_DOCUMENT_CHARS + 1)).error).toContain(
      '250.000 karakter'
    );
  });
});
