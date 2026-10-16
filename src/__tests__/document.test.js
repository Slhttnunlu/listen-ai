import {
  DOCX_MIME_TYPE,
  PDF_MIME_TYPE,
  createDocumentSectionTitle,
  getDocumentType,
  MAX_EXTRACTED_DOCUMENT_CHARS,
  splitDocumentContent,
  MAX_TEXT_FILE_BYTES,
  MAX_PDF_FILE_BYTES,
  validateDocumentAsset,
  validateTextDocument,
} from '../utils/document';

describe('document validation', () => {
  test('accepts UTF-8 text and removes BOM/outer whitespace', () => {
    expect(
      validateTextDocument({ name: 'notlar.txt', size: 20 }, '\uFEFF  Türkçe içerik\n')
    ).toEqual({ content: 'Türkçe içerik' });
  });

  test('rejects unsupported, oversized and empty files', () => {
    expect(validateDocumentAsset({ name: 'notlar.csv', size: 20 }).error).toContain('.pdf');
    expect(validateTextDocument({ name: 'notlar.pdf', size: 20 }, 'metin').error).toContain(
      'UTF-8 TXT'
    );
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

  test('recognizes PDF by extension or MIME type and applies its size limit', () => {
    expect(getDocumentType({ name: 'rapor.pdf' })).toBe('pdf');
    expect(getDocumentType({ name: 'rapor', mimeType: PDF_MIME_TYPE })).toBe('pdf');
    expect(
      validateDocumentAsset({ name: 'rapor.pdf', size: MAX_PDF_FILE_BYTES + 1 }).error
    ).toContain('10 MB');
  });

  test('splits large documents at paragraph boundaries within the editor limit', () => {
    const first = 'a'.repeat(150000);
    const second = 'b'.repeat(150000);
    const result = splitDocumentContent(`${first}\n\n${second}`);
    expect(result.sections).toEqual([first, second]);
    expect(result.sections.every((section) => section.length <= MAX_EXTRACTED_DOCUMENT_CHARS)).toBe(
      true
    );
  });

  test('hard-splits oversized blocks without losing their content', () => {
    const content = 'kelime '.repeat(80000).trim();
    const result = splitDocumentContent(content, 1000);
    expect(result.sections.length).toBeGreaterThan(1);
    expect(result.sections.every((section) => section.length <= 1000)).toBe(true);
    expect(result.sections.join(' ')).toBe(content);
  });

  test('creates recognizable section titles from imported file names', () => {
    expect(createDocumentSectionTitle('Uzun Rapor.docx', 0, 3)).toBe('Uzun Rapor · Bölüm 1/3');
    expect(createDocumentSectionTitle('notlar.txt', 0, 1)).toBe('notlar');
    expect(createDocumentSectionTitle('Rapor.pdf', 0, 1)).toBe('Rapor');
  });
});
