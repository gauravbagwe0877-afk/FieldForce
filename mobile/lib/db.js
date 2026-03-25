import { Platform } from 'react-native'
import { openDatabaseAsync } from 'expo-sqlite'

let dbPromise

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync('fieldforce.db').catch((err) => {
      console.warn('SQLite open failed (expected on Web OPFS lock):', err.message)
      return null
    })
  }
  return dbPromise
}

export async function initLocalDatabase() {
  const db = await getDb()
  if (!db) {
    console.warn('SQLite unavailable — using AsyncStorage only.')
    return
  }
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      token TEXT,
      user_json TEXT NOT NULL,
      email TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS location_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profile_local (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      profile_photo_uri TEXT,
      address TEXT,
      blood_group TEXT,
      phone TEXT,
      updated_at TEXT
    );
  `)
}
