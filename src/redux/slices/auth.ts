import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from '../store'

export type AuthStatus = 'idle' | 'success' | 'verify'

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
    setAuthModalOpen: (state, action: PayloadAction<{ open: boolean; tab?: 'login' | 'register' }>) => {
      state.authModalOpen = action.payload.open
      if (action.payload.tab) state.authModalTab = action.payload.tab
    },
    setAuthVerificationExpires: (state, action: PayloadAction<number | null>) => {
      state.verificationExpiresAt = action.payload
    },
  },
})

export const { setAuthStatus, setResetPasswordModalOpen, setAuthModalOpen, setAuthVerificationExpires } =
  authSlice.actions
export type { AuthState }
export default authSlice.reducer
