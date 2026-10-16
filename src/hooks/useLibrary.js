import { useCallback, useEffect, useState } from 'react';
import {
  deleteAllLibraryItems,
  getLibraryItems,
  initializeLibrary,
  renameLibraryItem,
  restoreLibraryItem,
  saveLibraryItem,
  setLibraryItemFavorite,
  softDeleteLibraryItem,
  updateLibraryProgress,
} from '../storage/library';
import { createTitle } from '../utils/text';

async function loadLibraryItems() {
  await initializeLibrary();
  return getLibraryItems();
}

export function useLibrary({ onError }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const reload = useCallback(async () => {
    setReady(false);
    setLoadError(false);
    try {
      setItems(await loadLibraryItems());
    } catch (error) {
      setLoadError(true);
      onError?.(error);
    } finally {
      setReady(true);
    }
  }, [onError]);

  useEffect(() => {
    loadLibraryItems()
      .then(setItems)
      .catch((error) => {
        setLoadError(true);
        onError?.(error);
      })
      .finally(() => setReady(true));
  }, [onError]);

  const saveText = useCallback(async (content, sourceType = 'text') => {
    const item = await saveLibraryItem({
      title: createTitle(content),
      content: content.trim(),
      sourceType,
    });
    setItems((current) => [item, ...current]);
    return item;
  }, []);

  const saveProgress = useCallback(async (id, progressIndex, isCompleted = false) => {
    if (!id) return;
    await updateLibraryProgress(id, progressIndex, isCompleted);
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              progress_index: progressIndex,
              is_completed: isCompleted ? 1 : 0,
              last_played_at: new Date().toISOString(),
            }
          : item
      )
    );
  }, []);

  const renameItem = useCallback(async (id, title) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return false;
    await renameLibraryItem(id, trimmedTitle);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, title: trimmedTitle } : item))
    );
    return true;
  }, []);

  const toggleFavorite = useCallback(async (item) => {
    const nextValue = !item.is_favorite;
    await setLibraryItemFavorite(item.id, nextValue);
    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id
          ? { ...currentItem, is_favorite: nextValue ? 1 : 0 }
          : currentItem
      )
    );
  }, []);

  const deleteItem = useCallback(async (item) => {
    await softDeleteLibraryItem(item.id);
    setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
    return item;
  }, []);

  const clearLibrary = useCallback(async () => {
    await deleteAllLibraryItems();
    setItems([]);
  }, []);

  const restoreItem = useCallback(async (item) => {
    await restoreLibraryItem(item.id);
    setItems((current) => [item, ...current]);
  }, []);

  return {
    clearLibrary,
    deleteItem,
    items,
    loadError,
    ready,
    reload,
    renameItem,
    restoreItem,
    saveProgress,
    saveText,
    toggleFavorite,
  };
}
