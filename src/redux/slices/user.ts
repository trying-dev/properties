import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { initialState } from '../store'
import { UserForRedux } from '+/actions/user/types'

type UserState = typeof initialState.user

const userSlice = createSlice({
  name: 'user',
  initialState: initialState.user,
  reducers: {
    setUser: (state, action: PayloadAction<UserForRedux | null>) => action.payload,
  },
})

export const { setUser } = userSlice.actions
export type { UserState }
export default userSlice.reducer
