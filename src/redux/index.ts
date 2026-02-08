import { useDispatch as useDispatchRedux, useSelector as useSelectorRedux } from 'react-redux'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'

import auth, { setIsAuthenticated, resetAuthProcess } from './slices/auth'
import user from './slices/user'
import property from './slices/property'
import processSlice from './slices/process'
import home from './slices/home'

export const REDUX_KEY_LOCAL_STORAGE = 'state'

const rootReducer = combineReducers({
  auth,
  user,
  property,
  home,
  process: processSlice,
})

export type RootState = ReturnType<typeof rootReducer>

const loadPersistedState = (): RootState | undefined => {
  if (typeof window === 'undefined') return undefined

  try {
    const serialized = localStorage.getItem(REDUX_KEY_LOCAL_STORAGE)
    if (!serialized) return undefined
    const parsed = JSON.parse(serialized) as Partial<RootState>
    return parsed as RootState
  } catch (error) {
    console.warn('[hydrate] Failed to load persisted state', error)
    return undefined
  }
}

const authResetMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action)
  if (setIsAuthenticated.match(action)) {
    storeApi.dispatch(resetAuthProcess())
  }
  return result
}

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadPersistedState(),
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['process/setUploadedDocs', 'process/setProcessState'],
        ignoredPaths: ['process.uploadedDocs'],
      },
    }).concat(authResetMiddleware),
})

let lastSavedStateJson = ''

store.subscribe(() => {
  if (typeof window === 'undefined') return

  const state = store.getState()
  const serializableState: RootState = {
    ...state,
    home: { ...state.home, units: [] },
    process: { ...state.process, uploadedDocs: {} },
  }

  try {
    const json = JSON.stringify(serializableState)
    if (json === lastSavedStateJson) return

    lastSavedStateJson = json
    localStorage.setItem(REDUX_KEY_LOCAL_STORAGE, json)
  } catch {
    console.warn('[persist] Failed to save state to localStorage.')
  }
})

export type AppDispatch = typeof store.dispatch

export const useDispatch = useDispatchRedux.withTypes<AppDispatch>()
export const useSelector = useSelectorRedux.withTypes<RootState>()
