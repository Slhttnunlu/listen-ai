import { MAX_TEXT_FILE_BYTES, validateTextDocument } from '../utils/document';

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
});
