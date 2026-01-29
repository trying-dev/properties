'use client'

import { useMemo, useState } from 'react'
import type { AvailableUnit } from '+/actions/nuevo-proceso'
import ResultsSection from './_/ResultsSection'
import SearchSection, { Filters } from './_/SearchSection'

export default function HomeClient({ initialUnits }: { initialUnits: AvailableUnit[] }) {
  const [units] = useState<AvailableUnit[]>(initialUnits || [])
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    priceMax: '',
    bedrooms: '',
    city: '',
  })

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        !searchQuery ||
        unit.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${unit.property.city} ${unit.property.neighborhood}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      const matchesPrice = !filters.priceMax || (unit.baseRent ?? 0) <= Number(filters.priceMax)
      const matchesBedrooms = !filters.bedrooms || unit.bedrooms >= Number(filters.bedrooms)
      const matchesCity = !filters.city || unit.property.city.toLowerCase() === filters.city.toLowerCase()
      return matchesSearch && matchesPrice && matchesBedrooms && matchesCity
    })
  }, [units, searchQuery, filters])

  return (
    <>
      <SearchSection
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <ResultsSection
        units={filteredUnits}
        onClearFilters={() => {
          setSearchQuery('')
          setFilters({ priceMax: '', bedrooms: '', city: '' })
        }}
      />
    </>
  )
}
