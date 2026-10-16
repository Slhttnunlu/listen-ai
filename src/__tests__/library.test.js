import { filterLibraryItems, getLibraryItemMeta } from '../utils/library';

const items = [
  {
    id: 1,
    content: 'On iki karakter',
    progress_index: 7,
    is_completed: 0,
    is_favorite: 0,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    content: 'Biten metin',
    progress_index: 0,
    is_completed: 1,
    is_favorite: 0,
    created_at: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 3,
    content: 'Favori metin',
    progress_index: 0,
    is_completed: 0,
    is_favorite: 1,
    created_at: '2026-01-03T00:00:00.000Z',
  },
];

describe('library utilities', () => {
  test('filters continuing, completed and favorite items', () => {
    expect(filterLibraryItems(items, 'Devam').map((item) => item.id)).toEqual([1]);
    expect(filterLibraryItems(items, 'Tamamlandı').map((item) => item.id)).toEqual([2]);
    expect(filterLibraryItems(items, '♡ Favoriler').map((item) => item.id)).toEqual([3]);
    expect(filterLibraryItems(items, 'Tümü')).toHaveLength(3);
  });

  test('prioritizes completion and resume metadata', () => {
    expect(getLibraryItemMeta(items[0])).toBe('Metin · %47 · 1 dk');
    expect(getLibraryItemMeta(items[1])).toBe('Metin · Tamamlandı · 1 dk');
  });
});
