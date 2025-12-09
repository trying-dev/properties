import Header from '+/components/Header'
import Footer from '+/components/Footer'
import { getAvailableUnits } from '+/actions/nuevo-proceso'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const units = await getAvailableUnits({})
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HomeClient initialUnits={units} />
      <Footer />
    </div>
  )
}
