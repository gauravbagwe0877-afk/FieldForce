import { getDb } from './db'

export async function getProfileLocal() {
  try {
    const db = await getDb()
    if (!db) return {}
    const row = await db.getFirstAsync('SELECT * FROM profile_local WHERE id = 1')
    return row || {}
  } catch (e) {
    return {}
  }
}

export async function saveProfileLocal(updates) {
  try {
    const db = await getDb()
    if (!db) return
    const cur = await getProfileLocal()
    const profile_photo_uri = updates.profilePhotoUri ?? cur.profile_photo_uri ?? null
    const address = updates.address ?? cur.address ?? null
    const blood_group = updates.bloodGroup ?? cur.blood_group ?? null
    const phone = updates.phone ?? cur.phone ?? null
    const now = new Date().toISOString()
    await db.runAsync('DELETE FROM profile_local WHERE id = 1')
    await db.runAsync(
      `INSERT INTO profile_local (id, profile_photo_uri, address, blood_group, phone, updated_at)
       VALUES (1, ?, ?, ?, ?, ?)`,
      [profile_photo_uri, address, blood_group, phone, now]
    )
  } catch (e) {
    console.warn('SQLite profile save skipped:', e.message)
  }
}
