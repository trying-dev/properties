'use client'

import { useEffect } from 'react'
import type { HomeUnit } from '+/actions/nuevo-proceso'
import type { PropertyWithOccupancy } from '+/actions/occupancy'
import { useDispatch } from '+/redux'
import { setProperties, setUnits } from '+/redux/slices/home'
import { setAuthModalOpen } from '+/redux/slices/auth'
import { sanitizeNext, storePostLoginRedirect } from '+/lib/postLoginRedirect'
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

  // ?login=1&next=/dashboard/...: abre el login y recuerda a dónde volver.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('login') !== '1') return
    storePostLoginRedirect(sanitizeNext(params.get('next')))
    dispatch(setAuthModalOpen({ open: true, tab: 'login' }))
    window.history.replaceState(null, '', window.location.pathname)
  }, [dispatch])

  return (
    <>
      <SearchSection />
      <ResultsSection />
    </>
  )
}
