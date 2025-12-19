import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from '../store'

export type AuthStepState = 'idle' | 'start' | 'loading' | 'success'

type AuthState = typeof initialState.auth

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState.auth,
  reducers: {
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload
    },
    setLoginState: (state, action: PayloadAction<AuthStepState>) => {
      state.loginState = action.payload
    },
    setRegisterState: (state, action: PayloadAction<AuthStepState>) => {
      state.registerState = action.payload
    },
    setCodeVerificationState: (state, action: PayloadAction<AuthStepState>) => {
      state.codeVerificationState = action.payload
    },
    resetAuthProcess: (state) => {
      state.loginState = 'idle'
      state.registerState = 'idle'
      state.codeVerificationState = 'idle'
      state.verificationExpiresAt = null
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

export const {
  setIsAuthenticated,
  setLoginState,
  setRegisterState,
  setCodeVerificationState,
  resetAuthProcess,
  setResetPasswordModalOpen,
  setAuthModalOpen,
  setAuthVerificationExpires,
} = authSlice.actions
export type { AuthState }
export default authSlice.reducer
