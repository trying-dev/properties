import { notFound } from 'next/navigation'
import { getUnitByIdAction } from '+/actions/nuevo-proceso'
import Header from '+/components/Header'
import Footer from '+/components/Footer'
import { auth } from '+/lib/auth'
import Gallery from './_/gallery'
import HighlightsSection from './_/HighlightsSection'
import PopularServices from './_/PopularServices'
import UnitFeatures from './_/UnitFeatures'
import UnitHero from './_/UnitHero'
import UnitSummaryAside from './_/UnitSummaryAside'
import { parseImages } from './_/utils'

export default async function UnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  const [result, session] = await Promise.all([getUnitByIdAction(id), auth()])

  if (!result.success || !result.data) {
    notFound()
  }

  const unit = result.data
  const images = parseImages(unit.images)
  const safeImages = images.length ? images : ['/placeholder-apartment.jpg']

  const isAuthenticated = Boolean(session?.user)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <UnitHero unit={unit} />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Gallery images={safeImages} propertyName={unit.property.name} />
          <UnitSummaryAside unit={unit} isAuthenticated={isAuthenticated} />
        </section>

        <UnitFeatures unit={unit} />
        <PopularServices unit={unit} />
        <HighlightsSection
          unit={unit}
          isAuthenticated={isAuthenticated}
          rawHighlights={(unit as Record<string, unknown>).highlights}
        />
      </main>
      <Footer />
    </div>
  )
}
