import {
  TypedUseSelectorHook,
  useDispatch as useDispatchRedux,
  useSelector as useSelectorRedux,
} from 'react-redux'

import { combineReducers, PayloadAction } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'

import { configureStore } from '@reduxjs/toolkit'

import { State } from './store'
import auth, {
  setIsAuthenticated,
  resetAuthProcess,
} from './slices/auth'
import user from './slices/user'
import property from './slices/property'
import processSlice from './slices/process'
import home from './slices/home'

export const REDUX_KEY_LOCAL_STORAGE = 'state'
export const HYDRATE_ACTION_TYPE = 'HYDRATE'

const rootReducer = combineReducers({
  auth,
  user,
  property,
  home,
  process: processSlice,
})

const reducer = (state: State | undefined, action: PayloadAction<State>) => {
  if (action.type === HYDRATE_ACTION_TYPE) {
    return {
      ...state,
      ...action.payload,
    }
  }
  return rootReducer(state, action)
}

const devTools = process.env.NODE_ENV !== 'production'

const authResetMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action)
  if (setIsAuthenticated.match(action)) {
    storeApi.dispatch(resetAuthProcess())
  }
  return result
}

export const store = configureStore({
  reducer,
  devTools,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['process/setUploadedDocs', 'process/setProcessState'],
        ignoredPaths: ['process.uploadedDocs'],
      },
    }).concat(authResetMiddleware),
})

store.subscribe(() => {
  const state = store.getState()
  const { uploadedDocs, ...restProcess } = state.process
  const serializableState = {
    ...state,
    process: {
      ...restProcess,
      uploadedDocs: {},
    },
  }
  localStorage.setItem(REDUX_KEY_LOCAL_STORAGE, JSON.stringify(serializableState))
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useDispatch = () => useDispatchRedux<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorRedux
