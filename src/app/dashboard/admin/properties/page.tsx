'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Building2, Plus } from 'lucide-react'
import Link from 'next/link'

import { getProperties } from '+/actions/property'
import Header from '+/components/Header'
import CardProperty from '../../fragments/CardProperty'
import { Property } from '@prisma/client'
import Modal from '+/components/Modal'
import PropertyForm from './_/PropertyForm'
import type { PropertyFormState } from './_/propertyFormTypes'

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const loadProperties = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const propertiesData = await getProperties()
      setProperties(propertiesData)
    } catch (err) {
      console.error('Error loading properties:', err)
      setError('Error al cargar las propiedades')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])


  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando propiedades...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <Building2 className="w-full h-full" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar propiedades</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Propiedades</h1>
            <p className="text-gray-600">Administra tus propiedades y su información.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-gray-900 text-white text-sm font-semibold px-3 py-1 rounded-full">{properties.length}</span>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva propiedad
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay propiedades</h3>
              <p className="text-gray-600">Aún no tienes propiedades registradas.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {properties.map((property) => (
                <div key={property.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <CardProperty property={property} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} ariaLabel="Nueva propiedad" className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Nueva propiedad</h2>
            <p className="text-sm text-gray-600">Completa los datos básicos para crear la propiedad.</p>
          </div>
          <PropertyForm
            mode="create"
            initialForm={initialCreateForm}
            submitLabel="Crear propiedad"
            showMock
            onCancel={() => setIsCreateOpen(false)}
            onSuccess={() => {
              setIsCreateOpen(false)
              loadProperties()
            }}
          />
        </div>
      </Modal>
    </div>
  )
}

const initialCreateForm: PropertyFormState = {
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
