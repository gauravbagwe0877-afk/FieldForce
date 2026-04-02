import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator
} from 'react-native'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { colors, radius } from '../../constants/theme'
import MapComponent from '../../components/MapComponent'

import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions
} from 'react-native'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { colors, radius } from '../../constants/theme'
import MapComponent from '../../components/MapComponent'
import { API_BASE } from '../../lib/config'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function PublicMapScreen() {
  const [userLocation, setUserLocation] = useState(null)
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPublicLocations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/location/public`)
      if (res.ok) {
        const data = await res.json()
        setWorkers(data)
      }
    } catch (err) {
      console.error('Error fetching public locations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          .then(loc => {
            setUserLocation(loc.coords)
            fetchPublicLocations()
          })
          .catch(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })
    
    const interval = setInterval(fetchPublicLocations, 10000) // update every 10s
    return () => clearInterval(interval)
  }, [])

  // Calculate distance helper
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return '?.?'
    const R = 6371 // km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return (R * c).toFixed(1)
  }

  return (
    <View style={styles.root}>
      <View style={styles.mapArea}>
        {loading && workers.length === 0 ? (
          <ActivityIndicator color={colors.accentBlue} size="large" />
        ) : !userLocation ? (
          <View style={styles.mapInner}>
            <Text style={styles.mapEmoji}>📍</Text>
            <Text style={styles.mapTitle}>Location Required</Text>
            <Text style={styles.mapSub}>Accessing GPS for transparency...</Text>
          </View>
        ) : (
          <MapComponent location={userLocation} workers={workers} />
        )}
      </View>

      <View style={[styles.sheet, { maxHeight: SCREEN_HEIGHT * 0.5 }]}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Dispatched Workers</Text>
          <View style={styles.liveBadge}><Text style={styles.liveText}>● LIVE</Text></View>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
          <Text style={styles.sheetDesc}>
            Real-time public tracking ensures accountability of municipal services in your zone.
          </Text>

          <View style={styles.list}>
            {workers.length === 0 ? (
              <Text style={styles.emptyText}>No active workers reported in this area.</Text>
            ) : (
              workers.map(w => (
                <View key={w.userId} style={styles.workerCard}>
                  <View style={styles.wAvatar}><Text style={styles.wAvatarText}>{w.userName[0]}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wName}>{w.userName}</Text>
                    <Text style={styles.wStatus}>{w.department || 'On Duty'}</Text>
                  </View>
                  <View style={styles.wDistBox}>
                    <Text style={styles.wDist}>
                      {calculateDistance(userLocation?.latitude, userLocation?.longitude, w.latitude, w.longitude)} km
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Return to Home</Text>
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
