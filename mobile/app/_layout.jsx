import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors } from '../constants/theme'
import { initLocalDatabase } from '../lib/db'
import { migrateLegacyWorker } from '../lib/session'

export default function RootLayout() {
  useEffect(() => {
    ;(async () => {
      try {
        await initLocalDatabase()
        await migrateLegacyWorker()
      } catch (e) {
        console.warn('DB init', e)
      }
    })()
  }, [])

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgCard },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          contentStyle: { backgroundColor: colors.bgPrimary },
          headerShadowVisible: false,
          headerBackTitle: '',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home/index" options={{ headerShown: false }} />
        <Stack.Screen name="home/checkin" options={{ title: 'Check in' }} />
        <Stack.Screen name="home/camera" options={{ title: 'Photo' }} />
        <Stack.Screen name="home/tasks" options={{ title: 'Tasks' }} />
        <Stack.Screen name="home/profile" options={{ title: 'Profile' }} />
        <Stack.Screen name="home/sos" options={{ title: 'Emergency (SOS)' }} />
        <Stack.Screen name="public/map" options={{ title: 'Map' }} />
      </Stack>
    </>
  )
}
