import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import { colors, radius } from '../../constants/theme'
import { loadSession } from '../../lib/session'
import { apiFetch } from '../../lib/api'

export default function SosScreen() {
  const [token, setToken] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadSession().then((s) => {
      if (!s?.token) router.replace('/')
      else setToken(s.token)
    })
  }, [])

  async function sendSos() {
    if (!token) return
    if (!description.trim()) {
      Alert.alert('Details needed', 'Describe what happened so your team can help.')
      return
    }
    setSending(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      let lat = null
      let lng = null
      let acc = null
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        })
        lat = loc.coords.latitude
        lng = loc.coords.longitude
        acc = loc.coords.accuracy
      }
      await apiFetch('/api/emergency', {
        token,
        method: 'POST',
        body: {
          title: title.trim() || 'SOS — need help',
          description: description.trim(),
          latitude: lat,
          longitude: lng,
          accuracy: acc,
        },
      })
      Alert.alert('Sent', 'Your office has been notified.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (e) {
      Alert.alert('Could not send', e.message || 'Check connection.')
    } finally {
      setSending(false)
    }
  }

  if (!token) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Use this if someone is hurt, unsafe, or there is an accident on site. Your last known location is included when
        GPS is on.
      </Text>

      <Text style={styles.label}>Short title (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Fall from ladder"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>What happened?</Text>
      <TextInput
        style={[styles.input, styles.area]}
        placeholder="Describe the situation, how many people involved, and landmarks."
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity style={[styles.sosBtn, sending && { opacity: 0.7 }]} onPress={sendSos} disabled={sending}>
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sosText}>Send emergency alert</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  content: { padding: 18, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lead: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  area: { minHeight: 120 },
  sosBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    marginTop: 22,
  },
  sosText: { color: '#fff', fontWeight: '800', fontSize: 17 },
})
