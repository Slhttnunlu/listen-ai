import * as SQLite from 'expo-sqlite';
import { getSoftDeleteCutoff, normalizeLibraryItem } from '../utils/library';

let database;
export const LIBRARY_SCHEMA_VERSION = 3;

async function getDatabase() {
  if (!database) database = await SQLite.openDatabaseAsync('listen-ai.db');
  return database;
}

export async function initializeLibrary() {
  const db = await getDatabase();
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS library_items (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_played_at TEXT,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        is_completed INTEGER NOT NULL DEFAULT 0,
        progress_index INTEGER NOT NULL DEFAULT 0,
        source_type TEXT NOT NULL DEFAULT 'text',
        deleted_at TEXT
      );
    `);

    const versionRow = await db.getFirstAsync('PRAGMA user_version;');
    const version = versionRow?.user_version || 0;
    if (version < 1) {
      const columns = await db.getAllAsync('PRAGMA table_info(library_items);');
      if (!columns.some((column) => column.name === 'progress_index')) {
        await db.execAsync(
          'ALTER TABLE library_items ADD COLUMN progress_index INTEGER NOT NULL DEFAULT 0;'
        );
      }
    }
    if (version < 2) {
      const columns = await db.getAllAsync('PRAGMA table_info(library_items);');
      if (!columns.some((column) => column.name === 'deleted_at')) {
        await db.execAsync('ALTER TABLE library_items ADD COLUMN deleted_at TEXT;');
      }
    }
    if (version < 3) {
      const columns = await db.getAllAsync('PRAGMA table_info(library_items);');
      if (!columns.some((column) => column.name === 'source_type')) {
        await db.execAsync(
          "ALTER TABLE library_items ADD COLUMN source_type TEXT NOT NULL DEFAULT 'text';"
        );
      }
    }
    await db.execAsync(`PRAGMA user_version = ${LIBRARY_SCHEMA_VERSION};`);
    await db.runAsync(
      'DELETE FROM library_items WHERE deleted_at IS NOT NULL AND deleted_at <= ?',
      getSoftDeleteCutoff()
    );
  });
}

export async function getLibraryItems() {
  const db = await getDatabase();
  const items = await db.getAllAsync(
    'SELECT * FROM library_items WHERE deleted_at IS NULL ORDER BY COALESCE(last_played_at, created_at) DESC'
  );
  return items.map(normalizeLibraryItem);
}

export async function renameLibraryItem(id, title) {
  const db = await getDatabase();
  await db.runAsync('UPDATE library_items SET title = ? WHERE id = ?', title.trim(), id);
}

export async function setLibraryItemFavorite(id, isFavorite) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE library_items SET is_favorite = ? WHERE id = ?',
    isFavorite ? 1 : 0,
    id
  );
}

export async function softDeleteLibraryItem(id) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE library_items SET deleted_at = ? WHERE id = ?',
    new Date().toISOString(),
    id
  );
}

export async function restoreLibraryItem(id) {
  const db = await getDatabase();
  await db.runAsync('UPDATE library_items SET deleted_at = NULL WHERE id = ?', id);
}

export async function deleteAllLibraryItems() {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM library_items');
}

export async function saveLibraryItem({ title, content, sourceType = 'text' }) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO library_items (title, content, source_type, created_at, last_played_at) VALUES (?, ?, ?, ?, ?)',
    title,
    content,
    sourceType,
    now,
    now
  );
  return {
    id: result.lastInsertRowId,
    title,
    content,
    source_type: sourceType,
    created_at: now,
    last_played_at: now,
    is_favorite: 0,
    is_completed: 0,
    progress_index: 0,
  };
}

export async function updateLibraryProgress(id, progressIndex, isCompleted = false) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE library_items SET progress_index = ?, is_completed = ?, last_played_at = ? WHERE id = ?',
    progressIndex,
    isCompleted ? 1 : 0,
    new Date().toISOString(),
    id
  );
}
