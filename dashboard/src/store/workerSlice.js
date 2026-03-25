import { createSlice } from '@reduxjs/toolkit'

const workerSlice = createSlice({
  name: 'workers',
  initialState: {
    list: [],
    selectedId: null,
  },
  reducers: {
    setWorkers(state, action) {
      state.list = action.payload;
    },
    nudgeWorkers(state) {
      state.list = state.list.map((w) => {
        if (w.status === 'inactive' || w.lat == null || w.lng == null) return w
        const delta = () => (Math.random() - 0.5) * 0.0012
        return {
          ...w,
          lat: parseFloat((w.lat + delta()).toFixed(8)),
          lng: parseFloat((w.lng + delta()).toFixed(8)),
        }
      })
    },
    selectWorker(state, action) {
      state.selectedId = action.payload
    },
    clearSelection(state) {
      state.selectedId = null
    },
  },
})

export const { setWorkers, nudgeWorkers, selectWorker, clearSelection } = workerSlice.actions
export default workerSlice.reducer
