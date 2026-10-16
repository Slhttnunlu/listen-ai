import * as SQLite from 'expo-sqlite';

let database;
export const LIBRARY_SCHEMA_VERSION = 1;

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
        progress_index INTEGER NOT NULL DEFAULT 0
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
      await db.execAsync(`PRAGMA user_version = ${LIBRARY_SCHEMA_VERSION};`);
    }
  });
}

export async function getLibraryItems() {
  const db = await getDatabase();
  return db.getAllAsync(
    'SELECT * FROM library_items ORDER BY COALESCE(last_played_at, created_at) DESC'
  );
}

export async function saveLibraryItem({ title, content }) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO library_items (title, content, created_at, last_played_at) VALUES (?, ?, ?, ?)',
    title,
    content,
    now,
    now
  );
  return {
    id: result.lastInsertRowId,
    title,
    content,
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
