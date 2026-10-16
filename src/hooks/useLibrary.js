import { useCallback, useEffect, useState } from 'react';
import {
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

export function useLibrary({ onError }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeLibrary()
      .then(getLibraryItems)
      .then(setItems)
      .catch(onError)
      .finally(() => setReady(true));
  }, [onError]);

  const saveText = useCallback(async (content) => {
    const item = await saveLibraryItem({ title: createTitle(content), content: content.trim() });
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

  const restoreItem = useCallback(async (item) => {
    await restoreLibraryItem(item.id);
    setItems((current) => [item, ...current]);
  }, []);

  return {
    deleteItem,
    items,
    ready,
    renameItem,
    restoreItem,
    saveProgress,
    saveText,
    toggleFavorite,
  };
}
