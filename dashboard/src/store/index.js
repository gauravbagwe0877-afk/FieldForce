import { configureStore } from '@reduxjs/toolkit'
import workerReducer from './workerSlice'

const store = configureStore({
  reducer: {
    workers: workerReducer,
  },
})

export default store
