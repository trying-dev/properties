export const initialState = {
  auth: {
    status: 'idle' as 'idle' | 'success',
    resetPasswordModalOpen: false,
  },
  property: {},
}

export type InitialState = typeof initialState
export type State = InitialState
