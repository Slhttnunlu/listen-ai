export const LIBRARY_FILTERS = ['Tümü', 'Devam', 'Tamamlandı', '♡ Favoriler'];
export const SOFT_DELETE_RETENTION_DAYS = 30;

export function getSoftDeleteCutoff(now = new Date()) {
  return new Date(now.getTime() - SOFT_DELETE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function serializeLibrary(items, exportedAt = new Date().toISOString()) {
  return JSON.stringify(
    {
      schema_version: 1,
      exported_at: exportedAt,
      items: items.map((item) => ({
        title: item.title,
        content: item.content,
        source_type: item.source_type || 'text',
        created_at: item.created_at,
        last_played_at: item.last_played_at || null,
        progress_index: item.progress_index || 0,
        is_favorite: Boolean(item.is_favorite),
        is_completed: Boolean(item.is_completed),
      })),
    },
    null,
    2
  );
}

export function normalizeLibraryItem(item) {
  const content = typeof item?.content === 'string' ? item.content : '';
  const title =
    typeof item?.title === 'string' && item.title.trim() ? item.title.trim() : 'Başlıksız metin';
  const createdAt =
    typeof item?.created_at === 'string' && item.created_at
      ? item.created_at
      : new Date(0).toISOString();
  const progressIndex = Number.isFinite(item?.progress_index)
    ? Math.max(0, Math.min(item.progress_index, content.length))
    : 0;

  return {
    ...item,
    title,
    content,
    created_at: createdAt,
    last_played_at:
      typeof item?.last_played_at === 'string' && item.last_played_at ? item.last_played_at : null,
    progress_index: progressIndex,
    source_type: ['text', 'txt', 'docx'].includes(item?.source_type) ? item.source_type : 'text',
    is_completed: item?.is_completed ? 1 : 0,
    is_favorite: item?.is_favorite ? 1 : 0,
  };
}

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
  const sourceLabel = { docx: 'DOCX', text: 'Metin', txt: 'TXT' }[item.source_type] || 'Metin';
  const wordCount = item.content?.trim().split(/\s+/).filter(Boolean).length || 0;
  const duration = Math.max(1, Math.ceil(wordCount / 150));
  const progress = item.content?.length
    ? Math.min(100, Math.round(((item.progress_index || 0) / item.content.length) * 100))
    : 0;
  if (item.is_completed) return `${sourceLabel} · Tamamlandı · ${duration} dk`;
  if (progress > 0) return `${sourceLabel} · %${progress} · ${duration} dk`;
  return `${sourceLabel} · ${duration} dk · ${new Date(item.created_at).toLocaleDateString('tr-TR')}`;
}
