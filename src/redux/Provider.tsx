'use client'

import { Provider } from 'react-redux'
import { useEffect } from 'react'
import { HYDRATE_ACTION_TYPE, REDUX_KEY_LOCAL_STORAGE, store, useDispatch } from '.'
import { initialState, State } from './store'

interface Props {
  children: React.ReactNode
}

const Hydrate = ({ children }: Props) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const localStorageState = localStorage.getItem(REDUX_KEY_LOCAL_STORAGE)
    const persistedState = (localStorageState && (JSON.parse(localStorageState) as State)) || initialState
    dispatch({ type: HYDRATE_ACTION_TYPE, payload: persistedState })
  }, [dispatch])

  return children
}

const ReduxProvider = ({ children }: Props) => (
  <Provider store={store}>
    <Hydrate>{children} </Hydrate>
  </Provider>
)

export default ReduxProvider
