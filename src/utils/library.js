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
