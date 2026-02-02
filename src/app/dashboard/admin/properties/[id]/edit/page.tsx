import { notFound } from 'next/navigation'
import Header from '+/components/Header'
import PropertyForm, { PropertyFormState } from '../../_/PropertyForm'
import { getPropertyLite } from '+/actions/property'
import { PropertyType } from '@prisma/client'

const toFormState = (property: Awaited<ReturnType<typeof getPropertyLite>>): PropertyFormState | null => {
  if (!property) return null
  return {
    name: property.name ?? '',
    description: property.description ?? '',
    street: property.street ?? '',
    number: property.number ?? '',
    city: property.city ?? '',
    neighborhood: property.neighborhood ?? '',
    state: property.state ?? '',
    postalCode: property.postalCode ?? '',
    country: property.country ?? 'Colombia',
    propertyType: property.propertyType ?? PropertyType.APARTMENT,
    builtArea: property.builtArea != null ? String(property.builtArea) : '',
    totalLandArea: property.totalLandArea != null ? String(property.totalLandArea) : '',
    floors: property.floors != null ? String(property.floors) : '1',
    age: property.age != null ? String(property.age) : '',
  }
}

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await getPropertyLite({ id })
  const initialForm = toFormState(property)
  if (!initialForm) return notFound()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Editar propiedad</h1>
          <p className="text-gray-600">Actualiza los datos básicos de la propiedad.</p>
        </div>

        <PropertyForm
          mode="edit"
          propertyId={id}
          initialForm={initialForm}
          submitLabel="Guardar cambios"
          successHref={`/dashboard/admin/properties/${id}`}
        />
      </main>
    </div>
  )
}
