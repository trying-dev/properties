'use client'

import { useEffect } from 'react'
import type { HomeUnit } from '+/actions/nuevo-proceso'
import type { PropertyWithOccupancy } from '+/actions/occupancy'
import { useDispatch } from '+/redux'
import { setProperties, setUnits } from '+/redux/slices/home'
import ResultsSection from './ResultsSection'
import SearchSection from './SearchSection'

export default function HomeClient({
  initialUnits,
  initialProperties,
}: {
  initialUnits: HomeUnit[]
  initialProperties: PropertyWithOccupancy[]
}) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setUnits(initialUnits || []))
    dispatch(setProperties(initialProperties || []))
  }, [dispatch, initialUnits, initialProperties])

  return (
    <>
      <SearchSection />
      <ResultsSection />
    </>
  )
}
