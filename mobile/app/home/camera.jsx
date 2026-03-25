import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, Platform
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Location from 'expo-location'
import { router, useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, radius } from '../../constants/theme'

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState('back')
  const [photo, setPhoto] = useState(null)
  const [location, setLocation] = useState(null)
  const [capturing, setCapturing] = useState(false)
  const cameraRef = useRef(null)

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          .then(loc => setLocation(loc.coords))
      }
    })
  }, [])

  if (!permission) return <View style={styles.root} />

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSub}>Allow camera to take geo-tagged work site photos</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    )
  }

  async function takePhoto() {
    if (!cameraRef.current || capturing) return
    setCapturing(true)
    try {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false })
      setPhoto(pic)
    } catch {
      Alert.alert('Error', 'Failed to capture photo. Please try again.')
    }
    setCapturing(false)
  }

  function retake() { setPhoto(null) }

  const { taskId } = useLocalSearchParams()

  async function confirm() {
    const msg = `📍 Geo-tagged photo saved\n${location
      ? `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      : 'GPS: unavailable'
    }`

    if (taskId) {
      try {
        const stored = await AsyncStorage.getItem('worker_tasks')
        if (stored) {
          const tasks = JSON.parse(stored)
          const updated = tasks.map(t => 
            t.id === taskId ? { ...t, status: 'completed', photoUri: photo.uri } : t
          )
          await AsyncStorage.setItem('worker_tasks', JSON.stringify(updated))
        }
      } catch (e) {
        console.error('Failed to save task photo proof:', e)
      }
      
      if (Platform.OS === 'web') {
        window.alert(`Task ${taskId} Completed!\n${msg}`)
        router.back()
      } else {
        Alert.alert(`Task ${taskId} Completed!`, msg, [{ text: 'Done', onPress: () => router.back() }])
      }
    } else {
      const fullMsg = msg + `\n\nIn a real backend, this would be uploaded.`
      if (Platform.OS === 'web') {
        window.alert(`Photo Saved!\n${fullMsg}`)
        router.back()
      } else {
        Alert.alert('Photo Saved!', fullMsg, [{ text: 'Done', onPress: () => router.back() }])
      }
    }
  }

  // ─── Preview after capture ───
  if (photo) {
    return (
      <View style={styles.root}>
        <Image source={{ uri: photo.uri }} style={styles.preview} resizeMode="cover" />

        {/* GPS overlay */}
        <View style={styles.gpsOverlay}>
          <Text style={styles.gpsOverlayText}>
            📍 {location
              ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              : 'GPS pending…'}
          </Text>
          <Text style={styles.gpsOverlayTime}>
            🕐 {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
        </View>

        {/* Action row */}
        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.retakeBtn} onPress={retake} activeOpacity={0.8}>
            <Text style={styles.retakeBtnText}>🔄  Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={confirm} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>✅  Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ─── Live camera ───
  return (
    <View style={styles.root}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>

        {/* Corner brackets */}
        <View style={styles.frameTL} /><View style={styles.frameTR} />
        <View style={styles.frameBL} /><View style={styles.frameBR} />

        {/* GPS badge */}
        <View style={styles.gpsBadge}>
          <Text style={styles.gpsBadgeText}>
            📍 {location
              ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              : 'Getting GPS…'}
          </Text>
        </View>

        {/* Bottom controls */}
        <View style={styles.controls}>
          {/* Flip */}
          <TouchableOpacity
            style={styles.flipBtn}
            onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
          >
            <Text style={styles.flipText}>🔄</Text>
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity style={styles.shutter} onPress={takePhoto} disabled={capturing}>
            {capturing
              ? <ActivityIndicator color="#fff" />
              : <View style={styles.shutterInner} />
            }
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity style={styles.flipBtn} onPress={() => router.back()}>
            <Text style={styles.flipText}>✕</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  )
}

const CORNER = 24
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 32, backgroundColor: colors.bgPrimary,
  },
  permIcon: { fontSize: 56, marginBottom: 16 },
  permTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  permSub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  permBtn: {
    backgroundColor: colors.accentBlue, borderRadius: radius.sm, padding: 14, paddingHorizontal: 28,
  },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  camera: { flex: 1 },

  // Corner frame
  frameTL: { position: 'absolute', top: 60, left: 30, width: CORNER, height: CORNER, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.accentBlue, borderTopLeftRadius: 4 },
  frameTR: { position: 'absolute', top: 60, right: 30, width: CORNER, height: CORNER, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.accentBlue, borderTopRightRadius: 4 },
  frameBL: { position: 'absolute', bottom: 140, left: 30, width: CORNER, height: CORNER, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.accentBlue, borderBottomLeftRadius: 4 },
  frameBR: { position: 'absolute', bottom: 140, right: 30, width: CORNER, height: CORNER, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.accentBlue, borderBottomRightRadius: 4 },

  gpsBadge: {
    position: 'absolute', top: 20, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  gpsBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  controls: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32,
  },
  flipBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  flipText: { fontSize: 22 },
  shutter: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },

  preview: { flex: 1 },
  gpsOverlay: {
    position: 'absolute', bottom: 120, left: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: radius.sm,
    padding: 12, borderWidth: 1, borderColor: 'rgba(59,130,246,0.4)',
  },
  gpsOverlayText: { color: colors.accentBlue, fontSize: 13, fontWeight: '600' },
  gpsOverlayTime: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  previewActions: {
    position: 'absolute', bottom: 40, left: 20, right: 20,
    flexDirection: 'row', gap: 12,
  },
  retakeBtn: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1, borderColor: colors.border,
    padding: 16, borderRadius: radius.sm, alignItems: 'center',
  },
  retakeBtnText: { color: colors.textPrimary, fontWeight: '700', fontSize: 15 },
  saveBtn: {
    flex: 1, backgroundColor: colors.accentGreen,
    padding: 16, borderRadius: radius.sm, alignItems: 'center',
    shadowColor: colors.accentGreen, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
