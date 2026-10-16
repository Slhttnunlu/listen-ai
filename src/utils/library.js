export const LIBRARY_FILTERS = ['Tümü', 'Devam', 'Tamamlandı', '♡ Favoriler'];

export function filterLibraryItems(items, filter) {
  if (filter === 'Devam') {
    return items.filter((item) => item.progress_index > 0 && !item.is_completed);
  }
  if (filter === 'Tamamlandı') {
    return items.filter((item) => Boolean(item.is_completed));
  }
  if (filter === '♡ Favoriler') {
    return items.filter((item) => Boolean(item.is_favorite));
  }
  return items;
}

export function prepareLibraryItems(items, { filter, query, sort }) {
  const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');
  const filtered = filterLibraryItems(items, filter).filter((item) => {
    if (!normalizedQuery) return true;
    return `${item.title} ${item.content}`.toLocaleLowerCase('tr-TR').includes(normalizedQuery);
  });
  return [...filtered].sort((first, second) => {
    if (sort === 'Başlık') return first.title.localeCompare(second.title, 'tr-TR');
    const firstDate = first.last_played_at || first.created_at;
    const secondDate = second.last_played_at || second.created_at;
    return secondDate.localeCompare(firstDate);
  });
}

export function getLibraryItemMeta(item) {
  const wordCount = item.content?.trim().split(/\s+/).filter(Boolean).length || 0;
  const duration = Math.max(1, Math.ceil(wordCount / 150));
  const progress = item.content?.length
    ? Math.min(100, Math.round(((item.progress_index || 0) / item.content.length) * 100))
    : 0;
  if (item.is_completed) return `Metin · Tamamlandı · ${duration} dk`;
  if (progress > 0) return `Metin · %${progress} · ${duration} dk`;
  return `Metin · ${duration} dk · ${new Date(item.created_at).toLocaleDateString('tr-TR')}`;
}
