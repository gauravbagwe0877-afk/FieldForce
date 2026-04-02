import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectWorker, setWorkers } from '../store/workerSlice'
import { apiUrl } from '../config/api'
import { mapLocationRow } from '../utils/workerMapper'
import Navbar from '../components/Navbar'
import StatsBar from '../components/StatsBar'
import MapView from '../components/MapView'
import WorkerList from '../components/WorkerList'
import AlertsPanel from '../components/AlertsPanel'
import SosPanel from '../components/SosPanel'
import WorkerDetail from '../components/WorkerDetail'
import useSimulation from '../hooks/useSimulation'
import SidebarNav from '../components/SidebarNav'
import AddWorkerPanel from '../components/AddWorkerPanel'
import TaskAssignmentPanel from '../components/TaskAssignmentPanel'
import AnalyticsDashboard from '../components/AnalyticsDashboard'

export default function Dashboard() {
  const dispatch = useDispatch()
  const workers = useSelector((s) => s.workers.list)
  const selectedId = useSelector((s) => s.workers.selectedId)
  const selectedWorker = workers.find((w) => w.id === selectedId) || null

  const [sosOpenCount, setSosOpenCount] = useState(0)
  const [activeTab, setActiveTab] = useState('map') // default to map view
  const [isSimulating, setIsSimulating] = useState(false)
  const [search, setSearch] = useState('')
  const [supervisorLocation, setSupervisorLocation] = useState(null)

  useEffect(() => {
    const fetchSos = async () => {
      try {
        const token = sessionStorage.getItem('token')
        const res = await fetch(apiUrl('/api/emergency/list'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data)) {
          setSosOpenCount(data.filter((e) => e.status === 'OPEN').length)
        }
      } catch {
        /* ignore */
      }
    }
    fetchSos()
    const sosId = setInterval(fetchSos, 20000)
    return () => clearInterval(sosId)
  }, [])

  useEffect(() => {
    const fetchLocations = async () => {
      if (isSimulating) return; // if simulating, skip real data
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(apiUrl('/api/location/latest'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          dispatch(setWorkers(Array.isArray(data) ? data.map(mapLocationRow) : []))
        }
      } catch (e) {
        console.error("Failed to fetch locations");
      }
    };
    
    fetchLocations();
    const interval = setInterval(fetchLocations, 10000);
    return () => clearInterval(interval);
  }, [dispatch, isSimulating]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setSupervisorLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => console.warn("Geolocation warning:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useSimulation(isSimulating)

  const alertCount = workers.filter((w) => w.status === 'alert').length
  const activeCount = workers.filter((w) => w.status === 'active').length
  const inactiveCount = workers.filter((w) => w.status === 'inactive').length

  const handleWorkerClick = (worker) => {
    dispatch(selectWorker(worker.id))
    if (activeTab === 'map') setActiveTab('workers')
  }

  const showRightPanel = activeTab !== 'map' || selectedWorker != null

  return (
    <div className="app-layout">
      <SidebarNav 
        activeTab={activeTab} 
        onTabSelect={setActiveTab} 
        alertCount={alertCount} 
        sosCount={sosOpenCount} 
      />

      <main className="main-content">
        <Navbar alertCount={alertCount} sosCount={sosOpenCount} />
        <StatsBar
          total={workers.length}
          active={activeCount}
          inactive={inactiveCount}
          alerts={alertCount}
          zonesCovered={new Set(workers.map((w) => w.role)).size}
        />

        <div className="dashboard-body">
          <MapView
            workers={workers}
            selectedWorker={selectedWorker}
            onWorkerClick={handleWorkerClick}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating((v) => !v)}
            supervisorLocation={supervisorLocation}
          />

          {/* Contextual Right Sidebar */}
          {showRightPanel && (
            <div className="context-sidebar">
              <div className="context-sidebar-header">
                {activeTab === 'workers' ? '👷 Staff Roster' : activeTab === 'alerts' ? '🚨 Active Alerts' : activeTab === 'sos' ? '🆘 Emergency SOS' : activeTab === 'addworker' ? '➕ Add Worker' : '👷 Worker Details'}
                <button className="context-close" onClick={() => { setActiveTab('map'); dispatch(selectWorker(null)); }}>✕</button>
              </div>

              <div className="context-sidebar-body">
                {(activeTab === 'workers' || (activeTab === 'map' && selectedWorker)) ? (
                  <>
                    {activeTab === 'workers' && (
                      <div className="sidebar-search">
                        <input
                          className="search-input"
                          type="text"
                          placeholder="🔍  Search workers or zones…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                    )}
                    {(activeTab === 'workers' || !selectedWorker) && (
                      <WorkerList
                        workers={workers}
                        search={search}
                        onSelectWorker={handleWorkerClick}
                        selectedWorker={selectedWorker}
                      />
                    )}
                    {selectedWorker && <WorkerDetail worker={selectedWorker} />}
                  </>
                ) : activeTab === 'alerts' ? (
                  <AlertsPanel />
                ) : activeTab === 'addworker' ? (
                  <AddWorkerPanel />
                ) : activeTab === 'tasks' ? (
                  <TaskAssignmentPanel />
                ) : activeTab === 'analytics' ? (
                  <AnalyticsDashboard />
                ) : (
                  <SosPanel />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}