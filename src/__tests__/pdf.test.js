const mockExtractText = jest.fn();
const mockIsAvailable = jest.fn();

jest.mock('expo-pdf-text-extract', () => ({
  extractText: mockExtractText,
  isAvailable: mockIsAvailable,
}));

const { extractPdfText, getPdfExtractionErrorMessage } = require('../services/pdf');

describe('PDF extraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('explains that PDF extraction needs a native development build', async () => {
    mockIsAvailable.mockReturnValue(false);

    await expect(extractPdfText('file:///rapor.pdf')).rejects.toThrow('development build');
  });

  test('directs image-only PDFs to the future OCR flow', async () => {
    mockIsAvailable.mockReturnValue(true);
    mockExtractText.mockResolvedValue('   ');

    await expect(extractPdfText('file:///tarama.pdf')).rejects.toThrow('Taranmış/görsel PDF');
  });

  test('returns normalized digital PDF text', async () => {
    mockIsAvailable.mockReturnValue(true);
    mockExtractText.mockResolvedValue('\uFEFF  Türkçe PDF içeriği  ');

    await expect(extractPdfText('file:///rapor.pdf')).resolves.toBe('Türkçe PDF içeriği');
  });

  test('maps known native PDF failures to actionable Turkish messages', () => {
    expect(getPdfExtractionErrorMessage({ code: 'PASSWORD_REQUIRED' })).toContain('parola');
    expect(getPdfExtractionErrorMessage({ code: 'CORRUPT_PDF' })).toContain('bozuk');
    expect(getPdfExtractionErrorMessage({ code: 'PDF_LOAD_ERROR' })).toContain('bozuk');
    expect(getPdfExtractionErrorMessage({ code: 'FILE_NOT_FOUND' })).toContain('yeniden seçin');
  });
});
