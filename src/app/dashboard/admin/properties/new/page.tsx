import { PropertyType } from '@prisma/client'
import Header from '+/components/Header'
import PropertyForm, { PropertyFormState } from '../_/PropertyForm'

const initialForm: PropertyFormState = {
  name: '',
  description: '',
  street: '',
  number: '',
  city: '',
  neighborhood: '',
  state: '',
  postalCode: '',
  country: 'Colombia',
  propertyType: 'APARTMENT',
  builtArea: '',
  totalLandArea: '',
  floors: '1',
  age: '',
}

export default function NewPropertyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nueva propiedad</h1>
          <p className="text-gray-600">Completa los datos básicos para crear la propiedad.</p>
        </div>

        <PropertyForm
          mode="create"
          initialForm={initialForm}
          submitLabel="Crear propiedad"
          successHref="/dashboard/admin/properties"
          showMock
        />
      </main>
    </div>
  )
}
