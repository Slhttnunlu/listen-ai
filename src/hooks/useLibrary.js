import { useCallback, useEffect, useState } from 'react';
import {
  getLibraryItems,
  initializeLibrary,
  saveLibraryItem,
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

  return { items, ready, saveText, saveProgress };
}
