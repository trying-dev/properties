'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyType } from '@prisma/client'

import { createPropertyAction, updatePropertyAction } from '+/actions/property'
import type { PropertyFormState } from './propertyFormTypes'

type PropertyFormProps = {
  mode: 'create' | 'edit'
  initialForm: PropertyFormState
  submitLabel: string
  successHref?: string
  propertyId?: string
  showMock?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

const mockForm: PropertyFormState = {
  name: 'Edificio Aurora',
  description: 'Propiedad residencial con excelente iluminación natural y áreas comunes.',
  street: 'Calle 45',
  number: '123',
  city: 'Bogotá',
  neighborhood: 'Chapinero',
  state: 'Cundinamarca',
  postalCode: '110231',
  country: 'Colombia',
  propertyType: 'APARTMENT',
  builtArea: '320',
  totalLandArea: '450',
  floors: '5',
  age: '8',
}

export default function PropertyForm({
  mode,
  initialForm,
  submitLabel,
  successHref,
  propertyId,
  showMock = false,
  onSuccess,
  onCancel,
}: PropertyFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<PropertyFormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (key: keyof PropertyFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const builtArea = Number(form.builtArea)
    const age = Number(form.age)
    if (!Number.isFinite(builtArea) || builtArea <= 0) {
      setError('El área construida debe ser un número válido.')
      setSubmitting(false)
      return
    }
    if (!Number.isFinite(age) || age < 0) {
      setError('La antigüedad debe ser un número válido.')
      setSubmitting(false)
      return
    }

    if (mode === 'edit' && !propertyId) {
      setError('No se encontró la propiedad para actualizar.')
      setSubmitting(false)
      return
    }

    try {
      const input = {
        name: form.name,
        description: form.description || null,
        street: form.street,
        number: form.number,
        city: form.city,
        neighborhood: form.neighborhood,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        propertyType: form.propertyType,
        builtArea,
        totalLandArea: form.totalLandArea ? Number(form.totalLandArea) : null,
        floors: form.floors ? Number(form.floors) : 1,
        age,
      }

      const result =
        mode === 'create'
          ? await createPropertyAction(input)
          : await updatePropertyAction(propertyId as string, input)

      if (!result.success) {
        setError(result.error ?? 'No se pudo guardar la propiedad')
        return
      }

      if (onSuccess) {
        onSuccess()
      } else if (successHref) {
        router.push(successHref)
      }
    } catch (err) {
      console.error('Error saving property:', err)
      setError('No se pudo guardar la propiedad')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="new-password" className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {error && <div className="text-sm text-red-600">{error}</div>}

      {showMock && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
            onClick={() => setForm(mockForm)}
          >
            Autollenar con mock
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Nombre
          <input className="border rounded-lg px-3 py-2" value={form.name} onChange={updateField('name')} required />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Tipo de propiedad
          <select className="border rounded-lg px-3 py-2" value={form.propertyType} onChange={updateField('propertyType')}>
            {Object.values(PropertyType).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700 md:col-span-2">
          Descripción
          <input className="border rounded-lg px-3 py-2" value={form.description} onChange={updateField('description')} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Calle
          <input className="border rounded-lg px-3 py-2" value={form.street} onChange={updateField('street')} required />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Número
          <input className="border rounded-lg px-3 py-2" value={form.number} onChange={updateField('number')} required />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Ciudad
          <input className="border rounded-lg px-3 py-2" value={form.city} onChange={updateField('city')} required />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Barrio
          <input className="border rounded-lg px-3 py-2" value={form.neighborhood} onChange={updateField('neighborhood')} required />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Departamento/Estado
          <input className="border rounded-lg px-3 py-2" value={form.state} onChange={updateField('state')} required />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Código postal
          <input className="border rounded-lg px-3 py-2" value={form.postalCode} onChange={updateField('postalCode')} required />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          País
          <input className="border rounded-lg px-3 py-2" value={form.country} onChange={updateField('country')} required />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Área construida (m²)
          <input className="border rounded-lg px-3 py-2" value={form.builtArea} onChange={updateField('builtArea')} required />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Área total (m²)
          <input className="border rounded-lg px-3 py-2" value={form.totalLandArea} onChange={updateField('totalLandArea')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Pisos
          <input className="border rounded-lg px-3 py-2" value={form.floors} onChange={updateField('floors')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Antigüedad (años)
          <input className="border rounded-lg px-3 py-2" value={form.age} onChange={updateField('age')} required />
        </label>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => {
            if (onCancel) {
              onCancel()
              return
            }
            if (successHref) {
              router.push(successHref)
            }
          }}
        >
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
