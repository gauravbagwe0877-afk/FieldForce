import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import { colors, radius } from '../../constants/theme'
import { loadSession, clearSession } from '../../lib/session'
import { apiFetch } from '../../lib/api'

function initials(name) {
  if (!name) return '?'
  const p = name.split(/\s+/).filter(Boolean)
  if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function HomeScreen() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [coords, setCoords] = useState(null)
  const [locError, setLocError] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [todayAtt, setTodayAtt] = useState(null)
  const pulsAnim = useRef(new Animated.Value(1)).current
  const locSub = useRef(null)

  const refreshUser = useCallback(async (t) => {
    try {
      const profile = await apiFetch('/api/user/profile', { token: t })
      setUser((u) => ({ ...u, ...profile }))
    } catch (_) {}
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const s = await loadSession()
      if (!s?.token) {
        router.replace('/')
        return
      }
      if (cancelled) return
      setToken(s.token)
      setUser(s.user)
      refreshUser(s.token)
      try {
        const t = await apiFetch('/api/attendance/today', { token: s.token })
        setTodayAtt(t)
      } catch (_) {}
    })()
    return () => {
      cancelled = true
    }
  }, [refreshUser])

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulsAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulsAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start()
  }, [pulsAnim])

  useEffect(() => {
    if (!token) return undefined

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLocError(true)
        return
      }
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 4000,
          distanceInterval: 3,
        },
        async (loc) => {
          setCoords(loc.coords)
          try {
            await apiFetch('/api/location/update', {
              token,
              method: 'POST',
              body: {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                accuracy: loc.coords.accuracy,
              },
            })
          } catch (_) {}
        }
      )
      locSub.current = sub
    }
    start()

    return () => {
      try { locSub.current?.remove?.() } catch (_) {}
    }
  }, [token])

  const handleLogout = async () => {
    const go = async () => {
      setLoggingOut(true)
      await clearSession()
      router.replace('/')
    }
    if (Platform.OS === 'web') {
      if (window.confirm('Log out?')) await go()
    } else {
      Alert.alert('Log out', 'You will need your password to sign in again.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: go },
      ])
    }
  }

  if (!user || !token) return null

  const checkedIn = !!todayAtt?.checkedIn

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => router.push('/home/profile')} activeOpacity={0.85}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.workerName}>{user.name || 'Worker'}</Text>
            <Text style={styles.meta}>ID {user.employeeCode || '—'}</Text>
            {user.supervisorName ? (
              <Text style={styles.meta}>
                Supervisor: {user.supervisorName} ({user.supervisorEmployeeCode || '—'})
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} disabled={loggingOut}>
          {loggingOut ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <Text style={styles.logoutText}>Out</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.badge, checkedIn ? styles.badgeOn : styles.badgeOff]}>
        <Animated.View
          style={[
            styles.dot,
            { transform: [{ scale: pulsAnim }], backgroundColor: checkedIn ? colors.accentGreen : colors.warning },
          ]}
        />
        <Text style={[styles.badgeText, { color: checkedIn ? colors.accentGreen : colors.warning }]}>
          {checkedIn && todayAtt?.checkInTime
            ? `Checked in · ${new Date(todayAtt.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : checkedIn
              ? 'Checked in'
              : 'Not checked in yet'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your location</Text>
        {locError ? (
          <Text style={styles.warn}>Turn on location in settings.</Text>
        ) : coords ? (
          <>
            <Text style={styles.coords}>
              {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
            </Text>
            <Text style={styles.sub}>About ±{Math.round(coords.accuracy)} m — sent to your team automatically.</Text>
          </>
        ) : (
          <Text style={styles.sub}>Getting a fix… stand near a window if indoors.</Text>
        )}
      </View>

      <Text style={styles.section}>Today</Text>

      <TouchableOpacity style={styles.rowMain} onPress={() => router.push('/home/checkin')} activeOpacity={0.85}>
        <Text style={styles.rowIcon}>✓</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>Check in</Text>
          <Text style={styles.rowSub}>Record start of shift with GPS + selfie</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => router.push('/home/checkin?mode=checkout')} activeOpacity={0.85}>
        <Text style={styles.rowIcon}>🔴</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>Check out</Text>
          <Text style={styles.rowSub}>End shift with GPS + selfie proof</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => router.push('/home/sos')} activeOpacity={0.85}>
        <Text style={styles.rowIcon}>🆘</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>Emergency (SOS)</Text>
          <Text style={styles.rowSub}>Report an accident — alerts your office</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => router.push('/home/profile')} activeOpacity={0.85}>
        <Text style={styles.rowIcon}>👤</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>Profile</Text>
          <Text style={styles.rowSub}>Hours, contact, blood group, photo</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => router.push('/home/tasks')} activeOpacity={0.85}>
        <Text style={styles.rowIcon}>☰</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>Tasks</Text>
          <Text style={styles.rowSub}>Your assignments</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  content: { padding: 18, paddingTop: 52, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: colors.accent, fontWeight: '800', fontSize: 16 },
  workerName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: colors.danger },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 14,
  },
  badgeOn: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  badgeOff: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  cardTitle: { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase' },
  coords: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 18 },
  warn: { color: colors.danger, fontSize: 14 },
  section: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 10, marginTop: 4 },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  rowIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  rowSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  chev: { fontSize: 22, color: colors.textMuted },
})
