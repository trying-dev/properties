export const initialState = {
  auth: {
    status: 'idle' as 'idle' | 'success' | 'verify',
    resetPasswordModalOpen: false,
    authModalOpen: false,
    authModalTab: 'login' as 'login' | 'register',
    verificationExpiresAt: null as number | null,
  },
  property: {},
  process: {
    processId: null as string | null,
    tenantId: null as string | null,
    unitId: null as string | null,
  },
}

export type InitialState = typeof initialState
export type State = InitialState
