import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialState } from '../store'

const properties = createSlice({
  name: 'property',
  initialState: initialState.property,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setProperty: (state, action: PayloadAction<any>) => action.payload,
    cleanproperty: () => initialState.property,
  },
})

export const { setProperty, cleanproperty } = properties.actions
export default properties.reducer
