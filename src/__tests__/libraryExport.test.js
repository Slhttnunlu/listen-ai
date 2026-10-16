import * as Sharing from 'expo-sharing';
import { exportLibrary } from '../services/libraryExport';

const mockFile = { uri: 'file:///cache/listen-ai-export.json', write: jest.fn() };

jest.mock('expo-file-system', () => ({
  File: jest.fn(() => mockFile),
  Paths: { cache: 'file:///cache' },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

describe('library export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('writes JSON to cache and opens the system share sheet', async () => {
    Sharing.isAvailableAsync.mockResolvedValue(true);
    Sharing.shareAsync.mockResolvedValue(undefined);

    const uri = await exportLibrary([
      {
        title: 'Deneme',
        content: 'İçerik',
        created_at: '2026-10-16T00:00:00.000Z',
        progress_index: 2,
      },
    ]);

    expect(mockFile.write).toHaveBeenCalledWith(expect.stringContaining('"title": "Deneme"'));
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      mockFile.uri,
      expect.objectContaining({ mimeType: 'application/json' })
    );
    expect(uri).toBe(mockFile.uri);
  });

  test('fails clearly when sharing is unavailable', async () => {
    Sharing.isAvailableAsync.mockResolvedValue(false);
    await expect(exportLibrary([])).rejects.toThrow('paylaşım ekranı kullanılamıyor');
    expect(mockFile.write).not.toHaveBeenCalled();
  });
});
