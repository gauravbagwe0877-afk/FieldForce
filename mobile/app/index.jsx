import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { colors, radius } from '../constants/theme'
import { apiFetch } from '../lib/api'
import { loadSession, saveSession } from '../lib/session'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [supervisorId, setSupervisorId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false)
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start()
    }, 400)

    loadSession()
      .then((s) => {
        clearTimeout(t)
        if (s?.token) {
          router.replace('/home')
          return
        }
        setLoading(false)
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start()
      })
      .catch(() => {
        clearTimeout(t)
        setLoading(false)
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start()
      })

    return () => clearTimeout(t)
  }, [fadeAnim])

  const handleLogin = async () => {
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password (if auto-filled, please type a character to trigger).')
      return
    }
    if (!supervisorId.trim()) {
      setError('Enter your supervisor’s employee ID.')
      return
    }
    setSubmitting(true)
    try {
      const loginData = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: email.trim(),
          password,
          supervisorEmployeeCode: supervisorId.trim(),
        },
      })
      const token = loginData.token
      const profile = await apiFetch('/api/user/profile', { token })
      const user = {
        ...profile,
        roles: loginData.roles,
        supervisorId: loginData.supervisorId,
        supervisorName: loginData.supervisorName,
        supervisorEmployeeCode: loginData.supervisorEmployeeCode,
      }
      await saveSession({ token, user })
      router.replace('/home')
    } catch (e) {
      setError(typeof e.message === 'string' ? e.message : 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loadingHint}>Opening…</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Field Force</Text>
          <Text style={styles.lead}>Sign in with the same email and password as on the server.</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Work email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@work.org"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
            />

            <Text style={styles.label}>Supervisor ID</Text>
            <Text style={styles.hint}>Your supervisor’s employee code (from the office database).</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. SUP-001"
              placeholderTextColor={colors.textMuted}
              value={supervisorId}
              onChangeText={setSupervisorId}
              autoCapitalize="characters"
            />

            {error ? <Text style={styles.err}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, submitting && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Sign in</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/public/map')} style={styles.linkBtn}>
            <Text style={styles.linkText}>View public map</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { flexGrow: 1, padding: 22, paddingTop: 56, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgPrimary },
  loadingHint: { marginTop: 12, color: colors.textMuted, fontSize: 14 },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  lead: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: 22 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6, marginTop: 10 },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  input: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  err: { color: colors.danger, fontSize: 13, marginTop: 10 },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { marginTop: 20, alignItems: 'center', padding: 12 },
  linkText: { color: colors.accent, fontWeight: '600', fontSize: 15 },
})
