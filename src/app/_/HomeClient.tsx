'use client'

import { useEffect } from 'react'
import type { AvailableUnit } from '+/actions/nuevo-proceso'
import { useDispatch } from '+/redux'
import { setUnits } from '+/redux/slices/home'
import ResultsSection from './ResultsSection'
import SearchSection from './SearchSection'

export default function HomeClient({ initialUnits }: { initialUnits: AvailableUnit[] }) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setUnits(initialUnits || []))
  }, [dispatch, initialUnits])

  return (
    <>
      <SearchSection />
      <ResultsSection />
    </>
  )
}
