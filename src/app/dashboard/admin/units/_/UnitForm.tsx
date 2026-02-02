'use client'

import { useMemo, useState } from 'react'
import { UnitStatus as UnitStatusEnum } from '@prisma/client'
import type { UnitStatus } from '@prisma/client'

import { createUnitAction, updateUnitAction } from '+/actions/property'
import type { UnitFormState } from './unitFormTypes'

type UnitFormProps = {
  mode: 'create' | 'edit'
  propertyId: string
  unitId?: string
  initialForm: UnitFormState
  submitLabel: string
  onCancel?: () => void
  onSuccess?: () => void
}

const parseImagesInput = (value: string) => {
  const items = value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
  return JSON.stringify(items)
}

const parseHighlightsInput = (value: string) => {
  if (!value.trim()) return null
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

export default function UnitForm({ mode, propertyId, unitId, initialForm, submitLabel, onCancel, onSuccess }: UnitFormProps) {
  const [form, setForm] = useState<UnitFormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unitOptions = useMemo(() => Object.values(UnitStatusEnum), [])

  const updateField =
    (key: keyof UnitFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value
      setForm((prev) => ({ ...prev, [key]: value }))
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    if (mode === 'edit' && !unitId) {
      setError('No se encontró la unidad para actualizar.')
      setSubmitting(false)
      return
    }

    const highlights = parseHighlightsInput(form.highlights)
    if (highlights === undefined) {
      setError('El JSON de highlights no es válido.')
      setSubmitting(false)
      return
    }

    const payload = {
      propertyId,
      unitNumber: form.unitNumber,
      floor: form.floor ? Number(form.floor) : null,
      area: form.area ? Number(form.area) : null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : 0,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : 0,
      furnished: form.furnished,
      balcony: form.balcony,
      parking: form.parking,
      storage: form.storage,
      petFriendly: form.petFriendly,
      smokingAllowed: form.smokingAllowed,
      internet: form.internet,
      cableTV: form.cableTV,
      waterIncluded: form.waterIncluded,
      gasIncluded: form.gasIncluded,
      status: form.status as UnitStatus,
      baseRent: form.baseRent ? Number(form.baseRent) : null,
      deposit: form.deposit ? Number(form.deposit) : null,
      description: form.description || null,
      images: parseImagesInput(form.images),
      highlights,
      lastInspectionDate: form.lastInspectionDate ? new Date(form.lastInspectionDate) : null,
    }

    const result =
      mode === 'create'
        ? await createUnitAction(payload)
        : await updateUnitAction(unitId as string, payload)

    if (!result.success) {
      setError(result.error ?? 'No se pudo guardar la unidad')
      setSubmitting(false)
      return
    }

    if (onSuccess) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Número de unidad
          <input className="border rounded-lg px-3 py-2" value={form.unitNumber} onChange={updateField('unitNumber')} required />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Estado
          <select className="border rounded-lg px-3 py-2" value={form.status} onChange={updateField('status')}>
            {unitOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Piso
          <input className="border rounded-lg px-3 py-2" value={form.floor} onChange={updateField('floor')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Área (m²)
          <input className="border rounded-lg px-3 py-2" value={form.area} onChange={updateField('area')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Habitaciones
          <input className="border rounded-lg px-3 py-2" value={form.bedrooms} onChange={updateField('bedrooms')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Baños
          <input className="border rounded-lg px-3 py-2" value={form.bathrooms} onChange={updateField('bathrooms')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Canon base
          <input className="border rounded-lg px-3 py-2" value={form.baseRent} onChange={updateField('baseRent')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Depósito
          <input className="border rounded-lg px-3 py-2" value={form.deposit} onChange={updateField('deposit')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700 md:col-span-2">
          Descripción
          <textarea className="border rounded-lg px-3 py-2 min-h-[96px]" value={form.description} onChange={updateField('description')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700 md:col-span-2">
          Imágenes (URLs separadas por coma o salto de línea)
          <textarea className="border rounded-lg px-3 py-2 min-h-[96px]" value={form.images} onChange={updateField('images')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700 md:col-span-2">
          Highlights (JSON)
          <textarea className="border rounded-lg px-3 py-2 min-h-[96px]" value={form.highlights} onChange={updateField('highlights')} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-700">
          Última inspección
          <input type="date" className="border rounded-lg px-3 py-2" value={form.lastInspectionDate} onChange={updateField('lastInspectionDate')} />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm text-gray-700">
        {[
          { key: 'furnished', label: 'Amoblado' },
          { key: 'balcony', label: 'Balcón' },
          { key: 'parking', label: 'Parqueadero' },
          { key: 'storage', label: 'Depósito' },
          { key: 'petFriendly', label: 'Pet friendly' },
          { key: 'smokingAllowed', label: 'Fumar permitido' },
          { key: 'internet', label: 'Internet' },
          { key: 'cableTV', label: 'Cable TV' },
          { key: 'waterIncluded', label: 'Agua incluida' },
          { key: 'gasIncluded', label: 'Gas incluido' },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 px-2 py-1">
            <input type="checkbox" checked={form[item.key as keyof UnitFormState] as boolean} onChange={updateField(item.key as keyof UnitFormState)} />
            {item.label}
          </label>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => onCancel?.()}
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
