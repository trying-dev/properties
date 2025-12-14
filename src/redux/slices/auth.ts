import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from '../store'

export type AuthStatus = 'idle' | 'success'

type AuthState = typeof initialState.auth

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState.auth,
  reducers: {
    setAuthStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload
    },
    setResetPasswordModalOpen: (state, action: PayloadAction<boolean>) => {
      state.resetPasswordModalOpen = action.payload
    },
  },
})

export const { setAuthStatus, setResetPasswordModalOpen } = authSlice.actions
export type { AuthState }
export default authSlice.reducer
