const mockLaunchCameraAsync = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();
const mockRequestCameraPermissionsAsync = jest.fn();
const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockExtractTextFromImage = jest.fn();

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: mockLaunchCameraAsync,
  launchImageLibraryAsync: mockLaunchImageLibraryAsync,
  requestCameraPermissionsAsync: mockRequestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync: mockRequestMediaLibraryPermissionsAsync,
}));

jest.mock('expo-text-extractor', () => ({
  extractTextFromImage: mockExtractTextFromImage,
  isSupported: true,
}));

const { extractTextFromScan, SCAN_SOURCES, selectImageForScan } = require('../services/scan');

describe('image scan service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens the camera after permission and returns the selected image URI', async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({ granted: true });
    mockLaunchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///camera.jpg' }],
    });

    await expect(selectImageForScan(SCAN_SOURCES.camera)).resolves.toBe('file:///camera.jpg');
    expect(mockLaunchCameraAsync).toHaveBeenCalledWith(
      expect.objectContaining({ mediaTypes: ['images'], quality: 1 })
    );
  });

  test('reports a helpful message when gallery permission is denied', async () => {
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });

    await expect(selectImageForScan(SCAN_SOURCES.library)).rejects.toThrow('fotoğraf erişimi');
  });

  test('returns null when image selection is cancelled', async () => {
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true });

    await expect(selectImageForScan(SCAN_SOURCES.library)).resolves.toBeNull();
  });

  test('normalizes OCR lines and rejects empty images', async () => {
    mockExtractTextFromImage.mockResolvedValue([' İlk satır ', '', 'İkinci satır']);
    await expect(extractTextFromScan('file:///scan.jpg')).resolves.toBe('İlk satır\nİkinci satır');

    mockExtractTextFromImage.mockResolvedValue([]);
    await expect(extractTextFromScan('file:///empty.jpg')).rejects.toThrow('okunabilir metin');
  });
});
