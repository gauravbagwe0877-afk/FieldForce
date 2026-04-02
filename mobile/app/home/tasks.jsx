import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native'
import { router } from 'expo-router'
import { colors, radius } from '../../constants/theme'
import { API_BASE } from '../../lib/config'
import { getAuthToken } from '../../lib/session'

export default function TasksScreen() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      const token = await getAuthToken()
      const res = await fetch(`${API_BASE}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (e) {
      console.error("Failed to load tasks", e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function updateTaskStatus(taskId, newStatus) {
    try {
      const token = await getAuthToken()
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const updatedTask = await res.json()
        setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t))
      }
    } catch (err) {
      console.error('Error updating task status:', err)
    }
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
    <ScrollView 
      style={styles.root} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTasks(); }} />
      }
    >
      <Text style={styles.headerTitle}>Assigned Worklist</Text>
      <Text style={styles.headerSub}>Tasks allocated by your Manager</Text>

      {tasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No tasks assigned yet.</Text>
        </View>
      ) : (
        tasks.map(task => {
          const statusColor = getStatusColor(task.status.toLowerCase())
          return (
            <View key={task.taskId} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.taskId}>TASK #{task.taskId}</Text>
                <View style={[styles.badge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
                  <Text style={[styles.badgeText, { color: statusColor }]}>
                    {task.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.taskTitle}>{task.taskTitle}</Text>
              
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📋</Text>
                <Text style={styles.metaText}>{task.description || 'No description'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>🕒</Text>
                <Text style={styles.metaText}>
                  {task.startTime ? new Date(task.startTime).toLocaleTimeString() : 'Not started'}
                </Text>
              </View>

              <View style={styles.actions}>
                {task.status === 'PENDING' && (
                  <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: colors.accentBlue }]}
                    onPress={() => updateTaskStatus(task.taskId, 'IN_PROGRESS')}
                  >
                    <Text style={styles.btnText}>Start Task</Text>
                  </TouchableOpacity>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: colors.accentGreen }]}
                    onPress={() => updateTaskStatus(task.taskId, 'COMPLETED')}
                  >
                    <Text style={styles.btnText}>Complete Task</Text>
                  </TouchableOpacity>
                )}
                {task.status === 'COMPLETED' && (
                  <View style={styles.doneBox}>
                    <Text style={styles.doneText}>✅ Job Finished</Text>
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
