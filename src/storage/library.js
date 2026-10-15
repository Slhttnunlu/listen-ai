import * as SQLite from 'expo-sqlite';

let database;

async function getDatabase() {
  if (!database) database = await SQLite.openDatabaseAsync('listen-ai.db');
  return database;
}

export async function initializeLibrary() {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS library_items (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_played_at TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0
    );
  `);
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
  return { id: result.lastInsertRowId, title, content, created_at: now, last_played_at: now };
}
