import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BasicInfo, SecurityFieldValue } from '+/app/aplication/_/types'
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
    updateBasicInfo: (state, action: PayloadAction<Partial<BasicInfo>>) => ({
      ...state,
      basicInfo: { ...state.basicInfo, ...action.payload },
    }),
    setUploadedDocs: (
      state,
      action: PayloadAction<ProcessState['uploadedDocs']>
    ) => ({
      ...state,
      uploadedDocs: { ...state.uploadedDocs, ...action.payload },
    }),
    setSecurityFields: (
      state,
      action: PayloadAction<Record<string, SecurityFieldValue>>
    ) => ({
      ...state,
      securityFields: { ...state.securityFields, ...action.payload },
    }),
    resetProcess: () => initialState.process,
  },
})

export const {
  initProcess,
  setProcessState,
  updateBasicInfo,
  setUploadedDocs,
  setSecurityFields,
  resetProcess,
} = processSlice.actions
export default processSlice.reducer
