import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { initialState } from '../store'
import { UserForRedux } from '+/actions/user/types'

type UserState = typeof initialState.user

const userSlice = createSlice({
  name: 'user',
  initialState: initialState.user,
  reducers: {
    setUser: (state, action: PayloadAction<UserForRedux | null>) => action.payload,
    updateTenantProfile: (state, action: PayloadAction<string>) => {
      if (!state || !state.tenant) return state
      return {
        ...state,
        tenant: { ...state.tenant, profile: action.payload },
      }
    },
  },
})

export const { setUser, updateTenantProfile } = userSlice.actions
export type { UserState }
export default userSlice.reducer
