import {
  filterLibraryItems,
  getSoftDeleteCutoff,
  getLibraryItemMeta,
  normalizeLibraryItem,
  prepareLibraryItems,
  serializeLibrary,
} from '../utils/library';

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

  test('searches Turkish content and sorts titles', () => {
    const searchable = [
      {
        ...items[0],
        title: 'Çalışma notu',
        content: 'İstanbul toplantısı',
        last_played_at: '2026-01-02',
      },
      { ...items[2], title: 'Alışveriş', content: 'Market listesi', last_played_at: '2026-01-03' },
    ];
    expect(
      prepareLibraryItems(searchable, { filter: 'Tümü', query: 'istanbul', sort: 'Başlık' }).map(
        (item) => item.title
      )
    ).toEqual(['Çalışma notu']);
    expect(
      prepareLibraryItems(searchable, { filter: 'Tümü', query: '', sort: 'Başlık' }).map(
        (item) => item.title
      )
    ).toEqual(['Alışveriş', 'Çalışma notu']);
  });

  test('normalizes malformed local rows without losing their identity', () => {
    expect(
      normalizeLibraryItem({
        id: 42,
        title: null,
        content: null,
        created_at: null,
        progress_index: 99,
        is_completed: null,
      })
    ).toMatchObject({
      id: 42,
      title: 'Başlıksız metin',
      content: '',
      created_at: '1970-01-01T00:00:00.000Z',
      progress_index: 0,
      is_completed: 0,
      is_favorite: 0,
    });
  });

  test('creates a portable library export without internal database fields', () => {
    const exported = JSON.parse(serializeLibrary(items, '2026-10-16T00:00:00.000Z'));
    expect(exported.schema_version).toBe(1);
    expect(exported.exported_at).toBe('2026-10-16T00:00:00.000Z');
    expect(exported.items[0]).toEqual(
      expect.objectContaining({ content: 'On iki karakter', is_completed: false })
    );
    expect(exported.items[0]).not.toHaveProperty('id');
    expect(exported.items[0]).not.toHaveProperty('deleted_at');
  });

  test('calculates the 30-day soft-delete retention cutoff', () => {
    expect(getSoftDeleteCutoff(new Date('2026-10-16T00:00:00.000Z'))).toBe(
      '2026-09-16T00:00:00.000Z'
    );
  });
});
