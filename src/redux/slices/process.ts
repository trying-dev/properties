import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from '../store'

type ProcessState = typeof initialState.process

const processSlice = createSlice({
  name: 'process',
  initialState: initialState.process,
  reducers: {
    initProcess: (state, action: PayloadAction<{ unitId: string }>) => ({
      ...initialState.process,
      unitId: action.payload.unitId,
    }),
    setProcessState: (state, action: PayloadAction<Partial<ProcessState>>) => ({
      ...state,
      ...action.payload,
    }),
    resetProcess: () => initialState.process,
  },
})

export const { initProcess, setProcessState, resetProcess } = processSlice.actions
export default processSlice.reducer
