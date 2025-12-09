import Header from '+/components/Header'
import Footer from '+/components/Footer'
import { getAvailableUnits } from '+/actions/nuevo-proceso'
import HomeClient from './HomeClient'
import { unstable_cache as cache } from 'next/cache'

const availableUnitsTag = 'available-units'
const getCachedUnits = cache(() => getAvailableUnits({}), [availableUnitsTag], {
  tags: [availableUnitsTag],
  revalidate: 300, // refresca al siguiente request luego de 5 minutos o antes si se invalida la tag
})

export default async function HomePage() {
  const units = await getCachedUnits()
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HomeClient initialUnits={units} />
      <Footer />
    </div>
  )
}
