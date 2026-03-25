import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator
} from 'react-native'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { colors, radius } from '../../constants/theme'
import MapComponent from '../../components/MapComponent'

// Simulated nearby active workers
const MOCK_NEARBY_WORKERS = [
  { id: 'W-01', name: 'Ravi K.', status: 'Active', distance: 0.4 },
  { id: 'W-02', name: 'Alok S.', status: 'Task In-Progress', distance: 1.2 },
  { id: 'W-03', name: 'Manish T.', status: 'Active', distance: 1.8 },
  { id: 'W-04', name: 'Sunita P.', status: 'On Break', distance: 2.3 },
]

export default function PublicMapScreen() {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          .then(loc => {
            setLocation(loc.coords)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })
  }, [])

  return (
    <View style={styles.root}>
      {/* Real Map Layer */}
      <View style={styles.mapArea}>
        {loading ? (
          <ActivityIndicator color={colors.accentBlue} size="large" />
        ) : !location ? (
          <View style={styles.mapInner}>
            <Text style={styles.mapEmoji}>📍</Text>
            <Text style={styles.mapTitle}>Location Required</Text>
            <Text style={styles.mapSub}>We need GPS access to find workers near you.</Text>
          </View>
        ) : (
          <MapComponent location={location} workers={MOCK_NEARBY_WORKERS} />
        )}
      </View>

      {/* Sheet overlaid at bottom */}
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Nearby Active Workers</Text>
          <View style={styles.liveBadge}><Text style={styles.liveText}>● LIVE</Text></View>
        </View>
        
        <Text style={styles.sheetDesc}>
          Public Tracking ensures transparency and allows you to view municipal workers dispatched in your current zone.
        </Text>

        <View style={styles.list}>
          {MOCK_NEARBY_WORKERS.map(w => (
            <View key={w.id} style={styles.workerCard}>
              <View style={styles.wAvatar}><Text style={styles.wAvatarText}>{w.name[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.wName}>{w.name}</Text>
                <Text style={styles.wStatus}>{w.status}</Text>
              </View>
              <View style={styles.wDistBox}>
                <Text style={styles.wDist}>{w.distance} km</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Return to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  
  mapArea: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  mapInner: { alignItems: 'center' },
  mapEmoji: { fontSize: 64, marginBottom: 12, opacity: 0.8 },
  mapTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, letterSpacing: 0.5 },
  mapSub: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  
  pin: { position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(59,130,246,0.2)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.accentBlue },

  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: 24, paddingBottom: 40,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 12,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  liveBadge: { backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  liveText: { fontSize: 10, fontWeight: '800', color: colors.accentRed, letterSpacing: 1 },
  
  sheetDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: 24, lineHeight: 20 },

  list: { gap: 12, marginBottom: 24 },
  workerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgPrimary, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  wAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bgSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  wAvatarText: { color: colors.textPrimary, fontWeight: '700', fontSize: 16 },
  wName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  wStatus: { fontSize: 12, color: colors.accentGreen, marginTop: 2 },
  wDistBox: { backgroundColor: colors.bgSecondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm },
  wDist: { fontSize: 12, color: colors.textPrimary, fontWeight: '600' },

  backBtn: { width: '100%', padding: 16, backgroundColor: colors.bgSecondary, borderRadius: radius.md, alignItems: 'center' },
  backBtnText: { color: colors.textPrimary, fontWeight: '700', fontSize: 15 }
})
