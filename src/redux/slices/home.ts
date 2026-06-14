import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { HomeUnit } from '+/actions/nuevo-proceso'
import type { PropertyWithOccupancy } from '+/actions/occupancy'
import { initialState } from '../store'

export type HomeFilters = {
  priceMax: string
  bedrooms: string
  city: string
}

export type HomeViewMode = 'units' | 'properties'

type HomeState = {
  units: HomeUnit[]
  properties: PropertyWithOccupancy[]
  showFilters: boolean
  searchQuery: string
  viewMode: HomeViewMode
  filters: HomeFilters
}

const homeSlice = createSlice({
  name: 'home',
  initialState: initialState.home as HomeState,
  reducers: {
    setUnits: (state, action: PayloadAction<HomeUnit[]>) => {
      state.units = action.payload
    },
    setProperties: (state, action: PayloadAction<PropertyWithOccupancy[]>) => {
      state.properties = action.payload
    },
    setViewMode: (state, action: PayloadAction<HomeViewMode>) => {
      state.viewMode = action.payload
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

export const { setUnits, setProperties, setViewMode, setShowFilters, setSearchQuery, setFilters, resetFilters } = homeSlice.actions

export default homeSlice.reducer
