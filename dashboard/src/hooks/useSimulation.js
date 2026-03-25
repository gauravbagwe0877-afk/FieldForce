import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { nudgeWorkers } from '../store/workerSlice'

export default function useSimulation(isRunning) {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      dispatch(nudgeWorkers())
    }, 3000)
    return () => clearInterval(id)
  }, [isRunning, dispatch])
}
