export const initialState = {
  auth: {
    status: 'idle' as 'idle' | 'success' | 'verify',
    resetPasswordModalOpen: false,
    authModalOpen: false,
    authModalTab: 'login' as 'login' | 'register',
    verificationExpiresAt: null as number | null,
  },
  property: {},
}

export type InitialState = typeof initialState
export type State = InitialState
