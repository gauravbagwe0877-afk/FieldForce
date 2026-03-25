import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { colors, radius } from '../../constants/theme'
import { loadSession, saveSession } from '../../lib/session'
import { apiFetch } from '../../lib/api'
import { getProfileLocal, saveProfileLocal } from '../../lib/profileLocal'

export default function WorkerProfileScreen() {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [today, setToday] = useState(null)
  const [localPhoto, setLocalPhoto] = useState(null)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [blood, setBlood] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const s = await loadSession()
    if (!s?.token) return false
    setToken(s.token)
    const [p, t, loc] = await Promise.all([
      apiFetch('/api/user/profile', { token: s.token }),
      apiFetch('/api/attendance/today', { token: s.token }).catch(() => null),
      getProfileLocal(),
    ])
    setProfile(p)
    setToday(t)
    setAddress(p.address || '')
    setPhone(p.phone || '')
    setBlood(p.bloodGroup || '')
    if (loc?.profile_photo_uri) setLocalPhoto(loc.profile_photo_uri)
    return true
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const s = await loadSession()
      if (!s?.token) {
        router.replace('/')
        return
      }
      await load()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  async function onRefresh() {
    setRefreshing(true)
    try {
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Photos', 'Allow photo library access to set a profile picture.')
      return
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    })
    if (r.canceled) return
    const uri = r.assets[0]?.uri
    if (uri) {
      setLocalPhoto(uri)
      await saveProfileLocal({ profilePhotoUri: uri, address, bloodGroup: blood, phone })
    }
  }

  async function saveProfile() {
    if (!token) return
    setSaving(true)
    try {
      const updated = await apiFetch('/api/user/profile', {
        token,
        method: 'PUT',
        body: { address: address.trim(), phone: phone.trim(), bloodGroup: blood.trim() },
      })
      setProfile(updated)
      await saveProfileLocal({
        profilePhotoUri: localPhoto,
        address: address.trim(),
        bloodGroup: blood.trim(),
        phone: phone.trim(),
      })
      const s = await loadSession()
      if (s) await saveSession({ token: s.token, user: { ...s.user, ...updated } })
      Alert.alert('Saved', 'Your profile is updated.')
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      <View style={styles.hero}>
        <TouchableOpacity onPress={pickPhoto} style={styles.photoWrap} activeOpacity={0.85}>
          {localPhoto ? (
            <Image source={{ uri: localPhoto }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPhText}>
                {profile.name
                  ?.split(/\s+/)
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text style={styles.tapHint}>Tap to change photo (saved on device)</Text>
        </TouchableOpacity>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.line}>ID {profile.employeeCode || '—'} · {profile.email}</Text>
        {profile.supervisorName ? (
          <Text style={styles.line}>
            Supervisor: {profile.supervisorName} ({profile.supervisorEmployeeCode})
          </Text>
        ) : null}
      </View>

      <View style={styles.hoursCard}>
        <Text style={styles.hoursLabel}>Today after check-in</Text>
        <Text style={styles.hoursVal}>
          {today ? `${today.hoursWorkedToday ?? 0} hours` : '—'}
        </Text>
        <Text style={styles.hoursSub}>
          {today?.checkedIn ? 'Shift in progress or recorded for today.' : 'Check in from the home screen to start counting.'}
        </Text>
      </View>

      <Text style={styles.section}>Your details</Text>
      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Where you can be reached"
        placeholderTextColor={colors.textMuted}
        value={address}
        onChangeText={setAddress}
        multiline
      />
      <Text style={styles.label}>Mobile number</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone"
        placeholderTextColor={colors.textMuted}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Blood group</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. O+"
        placeholderTextColor={colors.textMuted}
        value={blood}
        onChangeText={setBlood}
        autoCapitalize="characters"
      />

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={saveProfile} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save to server & device</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  content: { padding: 18, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgPrimary },
  hero: { alignItems: 'center', marginBottom: 20 },
  photoWrap: { alignItems: 'center', marginBottom: 12 },
  photo: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.border },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  photoPhText: { fontSize: 32, fontWeight: '800', color: colors.accent },
  tapHint: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  name: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  line: { fontSize: 13, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  hoursCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  hoursLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  hoursVal: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  hoursSub: { fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 18 },
  section: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 44,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
