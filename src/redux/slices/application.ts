import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ApplicantInfo } from '+/app/aplication/_/types'
import { initialState } from '../store'

type ApplicationState = typeof initialState.application

const applicationSlice = createSlice({
  name: 'application',
  initialState: initialState.application,
  reducers: {
    setApplicationState: (state, action: PayloadAction<Partial<ApplicationState>>) => ({
      ...state,
      ...action.payload,
    }),
    resetApplication: () => initialState.application,
    updateApplicantInfo: (state, action: PayloadAction<Partial<ApplicantInfo>>) => ({
      ...state,
      applicantInfo: { ...state.applicantInfo, ...action.payload },
    }),
    setUploadedDocs: (
      state,
      action: PayloadAction<ApplicationState['uploadedDocs']>
    ) => ({
      ...state,
      uploadedDocs: { ...state.uploadedDocs, ...action.payload },
    }),
  },
})

export const { setApplicationState, resetApplication, updateApplicantInfo, setUploadedDocs } =
  applicationSlice.actions
export default applicationSlice.reducer
