'use client'

import { Provider } from 'react-redux'
import { store } from '.'

interface Props {
  children: React.ReactNode
}

const ReduxProvider = ({ children }: Props) => <Provider store={store}>{children}</Provider>

export default ReduxProvider
