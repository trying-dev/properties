import { unstable_cache as cache } from 'next/cache'

import Header from '+/components/Header'
import Footer from '+/components/Footer'

import HomeClient from './_/HomeClient'

import { getAvailableUnitsForHome } from '+/actions/nuevo-proceso'
import { getPropertiesWithOccupancy } from '+/actions/occupancy'

const availableUnitsTag = 'available-units'
const getCachedUnits = cache(() => getAvailableUnitsForHome(), [availableUnitsTag], {
  tags: [availableUnitsTag],
  revalidate: 300, // refresca al siguiente request luego de 5 minutos o antes si se invalida la tag
})
const getCachedProperties = cache(() => getPropertiesWithOccupancy({ onlyAvailable: true }), ['available-properties'], {
  tags: [availableUnitsTag],
  revalidate: 300,
})

export default async function HomePage() {
  const [units, properties] = await Promise.all([getCachedUnits(), getCachedProperties()])
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HomeClient initialUnits={units} initialProperties={properties} />
      <Footer />
    </div>
  )
}
