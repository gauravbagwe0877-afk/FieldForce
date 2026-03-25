import AsyncStorage from '@react-native-async-storage/async-storage'
import { getDb } from './db'

const LEGACY_KEY = 'worker'

export async function saveSession({ token, user }) {
  const payload = JSON.stringify(user)
  const email = user?.email || ''
  const now = new Date().toISOString()
  try {
    const db = await getDb()
    if (db) {
      await db.runAsync('DELETE FROM session WHERE id = 1')
      await db.runAsync(
        `INSERT INTO session (id, token, user_json, email, updated_at) VALUES (1, ?, ?, ?, ?)`,
        [token, payload, email, now]
      )
    }
  } catch (e) {
    console.warn('SQLite session save skipped:', e.message)
  }
  await AsyncStorage.setItem('session', JSON.stringify({ token, user, savedAt: now }))
}

export async function loadSession() {
  try {
    const raw = await AsyncStorage.getItem('session')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.token && parsed?.user) return parsed
    }
  } catch (_) {}
  try {
    const db = await getDb()
    if (db) {
      const row = await db.getFirstAsync('SELECT token, user_json FROM session WHERE id = 1')
      if (row?.token && row?.user_json) {
        try {
          const user = JSON.parse(row.user_json)
          return { token: row.token, user }
        } catch (_) {}
      }
    }
  } catch (e) {}
  return null
}

export async function clearSession() {
  try {
    const db = await getDb()
    if (db) await db.runAsync('DELETE FROM session WHERE id = 1')
  } catch (e) {}
  await AsyncStorage.multiRemove(['session', LEGACY_KEY, 'worker_tasks'])
}

export async function migrateLegacyWorker() {
  try {
    const legacy = await AsyncStorage.getItem(LEGACY_KEY)
    if (!legacy) return
    const w = JSON.parse(legacy)
    if (w?.token && w?.email) {
      await saveSession({ token: w.token, user: w })
      await AsyncStorage.removeItem(LEGACY_KEY)
    }
  } catch (_) {}
}
