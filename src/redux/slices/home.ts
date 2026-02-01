import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AvailableUnit } from '+/actions/nuevo-proceso'
import { initialState } from '../store'

export type HomeFilters = {
  priceMax: string
  bedrooms: string
  city: string
}

type HomeState = {
  units: AvailableUnit[]
  showFilters: boolean
  searchQuery: string
  filters: HomeFilters
}

const homeSlice = createSlice({
  name: 'home',
  initialState: initialState.home as HomeState,
  reducers: {
    setUnits: (state, action: PayloadAction<AvailableUnit[]>) => {
      state.units = action.payload
    },
    setShowFilters: (state, action: PayloadAction<boolean>) => {
      state.showFilters = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setFilters: (state, action: PayloadAction<HomeFilters>) => {
      state.filters = action.payload
    },
    resetFilters: (state) => {
      state.searchQuery = ''
      state.filters = { priceMax: '', bedrooms: '', city: '' }
      state.showFilters = false
    },
  },
})

export const { setUnits, setShowFilters, setSearchQuery, setFilters, resetFilters } = homeSlice.actions

export default homeSlice.reducer
