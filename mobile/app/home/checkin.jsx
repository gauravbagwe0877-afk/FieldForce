import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
  Image,
  Platform,
} from 'react-native'
import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { colors, radius } from '../../constants/theme'
import { loadSession } from '../../lib/session'
import { apiFetch } from '../../lib/api'

/* ──────────────────────────────────────────────
   Web-only: live camera via getUserMedia
   ────────────────────────────────────────────── */
function WebLiveCamera({ onCapture, onCancel }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      })
      .catch((err) => {
        window.alert('Camera access denied or unavailable: ' + err.message)
        onCancel()
      })
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    // Mirror the selfie so it looks natural
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    // Stop the stream
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onCapture(dataUrl)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#000', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)', padding: '6px 18px', borderRadius: 20,
        color: '#fff', fontSize: 14, fontWeight: 600,
      }}>
        📸 Take a live selfie
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', maxHeight: '75vh', objectFit: 'cover', transform: 'scaleX(-1)' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{
        position: 'absolute', bottom: 40, display: 'flex', gap: 24, alignItems: 'center',
      }}>
        <button onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onCancel() }} style={{
          width: 48, height: 48, borderRadius: 24, border: '2px solid #fff',
          background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 20, cursor: 'pointer',
        }}>✕</button>
        <button onClick={capture} style={{
          width: 72, height: 72, borderRadius: 36, border: '3px solid #fff',
          background: 'rgba(255,255,255,0.2)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 54, height: 54, borderRadius: 27, background: '#fff' }} />
        </button>
        <div style={{ width: 48 }} />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Main Check-in / Check-out Screen
   ────────────────────────────────────────────── */
export default function CheckInScreen() {
  const { mode } = useLocalSearchParams()
  const isCheckout = mode === 'checkout'

  const [phase, setPhase] = useState('fetching') // fetching | photo | webCam | ready | confirming | success
  const [location, setLocation] = useState(null)
  const [token, setToken] = useState(null)
  const [photoUri, setPhotoUri] = useState(null)
  const rotateAnim = useRef(new Animated.Value(0)).current
  const successScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadSession().then((s) => {
      if (!s?.token) { router.replace('/'); return }
      setToken(s.token)
    })
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 1400, useNativeDriver: true })
    ).start()
  }, [rotateAnim])

  useEffect(() => {
    if (!token) return
    fetchLocation()
  }, [token])

  async function fetchLocation() {
    setPhase('fetching')
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        showAlert('Location', 'Please allow location to proceed.')
        router.back()
        return
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      })
      setLocation(loc.coords)
      setPhase('photo')
    } catch (e) {
      showAlert('GPS Error', e.message || 'Could not get location.')
      router.back()
    }
  }

  function showAlert(title, msg) {
    if (Platform.OS === 'web') window.alert(`${title}\n${msg}`)
    else Alert.alert(title, msg)
  }

  async function openCamera() {
    if (Platform.OS === 'web') {
      // Use the live WebLiveCamera component
      setPhase('webCam')
      return
    }

    // Native: use ImagePicker which opens the real camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      showAlert('Camera', 'Camera permission is needed for photo proof.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: false,
    })
    if (!result.canceled && result.assets?.[0]) {
      setPhotoUri(result.assets[0].uri)
      setPhase('ready')
    }
  }

  function handleWebCapture(dataUrl) {
    setPhotoUri(dataUrl)
    setPhase('ready')
  }

  async function handleConfirm() {
    if (!token || !location || !photoUri) return
    setPhase('confirming')
    try {
      const endpoint = isCheckout ? '/api/attendance/check-out' : '/api/attendance/check-in'
      await apiFetch(endpoint, {
        token,
        method: 'POST',
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        },
      })
      if (!isCheckout) {
        try {
          await apiFetch('/api/location/update', {
            token,
            method: 'POST',
            body: {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
            },
          })
        } catch (_) {} // non-critical
      }
      setPhase('success')
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, damping: 14 }).start()
      setTimeout(() => router.replace('/home'), 1800)
    } catch (e) {
      showAlert(`${isCheckout ? 'Check-out' : 'Check-in'} failed`, e.message || 'Try again.')
      setPhase('ready')
    }
  }

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const label = isCheckout ? 'Check-out' : 'Check-in'

  // ─── Web Live Camera (fullscreen overlay) ───
  if (phase === 'webCam' && Platform.OS === 'web') {
    return <WebLiveCamera onCapture={handleWebCapture} onCancel={() => setPhase('photo')} />
  }

  // ─── Phase: Fetching GPS ───
  if (phase === 'fetching') {
    return (
      <View style={styles.root}>
        <View style={styles.centered}>
          <Animated.Text style={[styles.spin, { transform: [{ rotate: spin }] }]}>📡</Animated.Text>
          <Text style={styles.h1}>Getting location</Text>
          <Text style={styles.sub}>Using best available GPS / network</Text>
          <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} />
        </View>
      </View>
    )
  }

  // ─── Phase: Take Photo ───
  if (phase === 'photo') {
    return (
      <View style={styles.root}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 56, marginBottom: 12 }}>📸</Text>
          <Text style={styles.h1}>Live Selfie Required</Text>
          <Text style={styles.sub}>Take a live selfie as {label.toLowerCase()} proof</Text>
          <Text style={styles.gpsSmall}>
            📍 {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : '…'}
          </Text>
          <TouchableOpacity style={styles.photoBtn} onPress={openCamera}>
            <Text style={styles.photoBtnText}>📷  Open Live Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ─── Phase: Preview + Confirm ───
  if (phase === 'ready' || phase === 'confirming') {
    return (
      <View style={styles.root}>
        <View style={styles.inner}>
          <View style={styles.previewCard}>
            <Text style={styles.cardLabel}>LIVE SELFIE PROOF</Text>
            <Image source={{ uri: photoUri }} style={styles.selfieImg} resizeMode="cover" />
            <TouchableOpacity onPress={() => { setPhotoUri(null); setPhase('photo') }} style={styles.retakeLink}>
              <Text style={styles.retakeLinkText}>🔄 Retake</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>COORDINATES</Text>
            <Text style={styles.coords}>
              {location.latitude.toFixed(7)}{'\n'}{location.longitude.toFixed(7)}
            </Text>
            <Text style={styles.acc}>Accuracy ±{Math.round(location.accuracy)} m</Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, isCheckout && styles.confirmBtnOut, phase === 'confirming' && { opacity: 0.6 }]}
            onPress={handleConfirm}
            disabled={phase === 'confirming'}
          >
            {phase === 'confirming' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>✓  Confirm {label}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={fetchLocation} style={styles.retry}>
            <Text style={styles.retryText}>Refresh GPS</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ─── Phase: Success ───
  return (
    <View style={styles.root}>
      <View style={styles.centered}>
        <Animated.View style={[styles.ok, { transform: [{ scale: successScale }] }]}>
          <Text style={{ fontSize: 40 }}>✓</Text>
        </Animated.View>
        <Text style={styles.okTitle}>{isCheckout ? "You're checked out" : "You're checked in"}</Text>
        <Text style={styles.sub}>Live selfie + GPS recorded</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  inner: { flex: 1, padding: 20, paddingTop: 24 },
  spin: { fontSize: 48, marginBottom: 16 },
  h1: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 6 },
  gpsSmall: { fontSize: 12, color: colors.textMuted, marginTop: 12 },

  photoBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 24,
  },
  photoBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelText: { color: colors.textMuted, fontSize: 14 },

  previewCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 10, letterSpacing: 0.5, alignSelf: 'flex-start' },
  selfieImg: { width: '100%', height: 200, borderRadius: radius.sm, marginBottom: 8 },
  retakeLink: { padding: 6 },
  retakeLinkText: { color: colors.accent, fontWeight: '600', fontSize: 13 },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
  },
  coords: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, lineHeight: 28 },
  acc: { fontSize: 13, color: colors.textSecondary, marginTop: 8 },

  confirmBtn: {
    backgroundColor: colors.accentGreen,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
  },
  confirmBtnOut: { backgroundColor: '#dc2626' },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  retry: { alignItems: 'center', padding: 14 },
  retryText: { color: colors.accent, fontWeight: '600' },

  ok: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  okTitle: { fontSize: 22, fontWeight: '700', color: colors.accentGreen },
})
