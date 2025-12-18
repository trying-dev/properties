import {
  TypedUseSelectorHook,
  useDispatch as useDispatchRedux,
  useSelector as useSelectorRedux,
} from 'react-redux'

import { combineReducers, PayloadAction } from '@reduxjs/toolkit'

import { configureStore } from '@reduxjs/toolkit'

import { State } from './store'
import auth from './slices/auth'
import property from './slices/property'
import processSlice from './slices/process'
import applicationSlice from './slices/application'

export const REDUX_KEY_LOCAL_STORAGE = 'state'
export const HYDRATE_ACTION_TYPE = 'HYDRATE'

const rootReducer = combineReducers({
  auth,
  property,
  process: processSlice,
  application: applicationSlice,
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

export const store = configureStore({
  reducer,
  devTools,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['application/setUploadedDocs', 'application/setApplicationState'],
        ignoredPaths: ['application.uploadedDocs'],
      },
    }),
})

store.subscribe(() => {
  const state = store.getState()
  const { uploadedDocs, ...restApplication } = state.application
  const serializableState = {
    ...state,
    application: {
      ...restApplication,
      uploadedDocs: {},
    },
  }
  localStorage.setItem(REDUX_KEY_LOCAL_STORAGE, JSON.stringify(serializableState))
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useDispatch = () => useDispatchRedux<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorRedux
