const mockExtractText = jest.fn();
const mockIsAvailable = jest.fn();

jest.mock('expo-pdf-text-extract', () => ({
  extractText: mockExtractText,
  isAvailable: mockIsAvailable,
}));

const {
  extractPdfText,
  getPdfExtractionErrorMessage,
  isPdfOcrRedirectError,
} = require('../services/pdf');

describe('PDF extraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('explains that PDF extraction needs a native development build', async () => {
    mockIsAvailable.mockReturnValue(false);

    await expect(extractPdfText('file:///rapor.pdf')).rejects.toThrow('development build');
  });

  test('marks image-only PDFs for the OCR redirect flow', async () => {
    mockIsAvailable.mockReturnValue(true);
    mockExtractText.mockResolvedValue('   ');

    let error;
    try {
      await extractPdfText('file:///tarama.pdf');
    } catch (caughtError) {
      error = caughtError;
    }

    expect(error).toMatchObject({
      code: 'PDF_NO_SELECTABLE_TEXT',
      message: expect.stringContaining('Taranmış/görsel PDF'),
    });
    expect(isPdfOcrRedirectError(error)).toBe(true);
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
