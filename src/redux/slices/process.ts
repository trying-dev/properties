import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from '../store'

type ProcessState = typeof initialState.process

const processSlice = createSlice({
  name: 'process',
  initialState: initialState.process,
  reducers: {
    setProcessState: (state, action: PayloadAction<Partial<ProcessState>>) => ({
      ...state,
      ...action.payload,
    }),
    resetProcess: () => initialState.process,
  },
})

export const { setProcessState, resetProcess } = processSlice.actions
export default processSlice.reducer
