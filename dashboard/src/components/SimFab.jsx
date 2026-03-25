export default function SimFab({ isRunning, onToggle }) {
  return (
    <button
      className={`sim-fab ${isRunning ? 'sim-fab--active' : ''}`}
      onClick={onToggle}
      title={isRunning ? 'Stop simulation' : 'Start live simulation'}
    >
      <span className="sim-fab-icon">{isRunning ? '⏸' : '▶'}</span>
      <span className="sim-fab-label">{isRunning ? 'LIVE' : 'SIMULATE'}</span>
    </button>
  )
}
