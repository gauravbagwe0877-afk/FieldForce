import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, radius } from '../../constants/theme'
import { router } from 'expo-router'

// Mock data: Tasks assigned by Admin/Manager
const INITIAL_TASKS = [
  { id: 'T-101', title: 'Inspect Water Pipeline', location: 'Connaught Place', status: 'pending', date: 'Today, 10:00 AM' },
  { id: 'T-102', title: 'Repair Street Light', location: 'Karol Bagh', status: 'in-progress', date: 'Today, 01:00 PM' },
  { id: 'T-103', title: 'Clear Debris', location: 'Lajpat Nagar', status: 'completed', date: 'Yesterday' },
]

export default function TasksScreen() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      const stored = await AsyncStorage.getItem('worker_tasks')
      if (stored) {
        setTasks(JSON.parse(stored))
      } else {
        // Initialize with default admin tasks
        await AsyncStorage.setItem('worker_tasks', JSON.stringify(INITIAL_TASKS))
        setTasks(INITIAL_TASKS)
      }
    } catch (e) {
      console.error("Failed to load tasks", e)
      setTasks(INITIAL_TASKS)
    } finally {
      setLoading(false)
    }
  }

  async function updateTaskStatus(id, newStatus) {
    const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t)
    setTasks(updated)
    await AsyncStorage.setItem('worker_tasks', JSON.stringify(updated))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.accentGreen
      case 'in-progress': return colors.accentBlue
      default: return colors.accentAmber
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accentBlue} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Assigned Worklist</Text>
      <Text style={styles.headerSub}>Tasks allocated by your Manager</Text>

      {tasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No tasks assigned yet.</Text>
        </View>
      ) : (
        tasks.map(task => {
          const statusColor = getStatusColor(task.status)
          return (
            <View key={task.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.taskId}>{task.id}</Text>
                <View style={[styles.badge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
                  <Text style={[styles.badgeText, { color: statusColor }]}>
                    {task.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.taskTitle}>{task.title}</Text>
              
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>{task.location}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>🕒</Text>
                <Text style={styles.metaText}>{task.date}</Text>
              </View>

              <View style={styles.actions}>
                {task.status === 'pending' && (
                  <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: colors.accentBlue }]}
                    onPress={() => updateTaskStatus(task.id, 'in-progress')}
                  >
                    <Text style={styles.btnText}>Start Task</Text>
                  </TouchableOpacity>
                )}
                {task.status === 'in-progress' && (
                  <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: colors.accentGreen }]}
                    onPress={() => router.push({ pathname: '/home/camera', params: { taskId: task.id } })}
                  >
                    <Text style={styles.btnText}>Take Photo Proof</Text>
                  </TouchableOpacity>
                )}
                {task.status === 'completed' && (
                  <View style={styles.doneBox}>
                    <Text style={styles.doneText}>✅ Completed</Text>
                  </View>
                )}
              </View>
            </View>
          )
        })
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  center: { flex: 1, backgroundColor: colors.bgPrimary, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  headerSub: { fontSize: 14, color: colors.textMuted, marginBottom: 24 },

  emptyBox: { padding: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  emptyText: { color: colors.textMuted, fontSize: 15 },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  taskId: { fontSize: 13, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  
  taskTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  metaIcon: { fontSize: 14 },
  metaText: { fontSize: 14, color: colors.textSecondary },

  actions: { marginTop: 20, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  btn: { padding: 14, borderRadius: radius.sm, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  
  doneBox: { padding: 14, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: radius.sm, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  doneText: { color: colors.accentGreen, fontSize: 15, fontWeight: '700' }
})
