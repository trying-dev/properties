'use client'

import { useState } from 'react'
import { UnitStatus as UnitStatusEnum } from '@prisma/client'
import { useRouter } from 'next/navigation'

import Modal from '+/components/Modal'
import UnitForm from '../../../units/_/UnitForm'
import type { UnitFormState } from '../../../units/_/unitFormTypes'

type CreateUnitModalProps = {
  isOpen: boolean
  onClose: () => void
  propertyId: string
}

const initialForm: UnitFormState = {
  unitNumber: '',
  floor: '',
  area: '',
  bedrooms: '0',
  bathrooms: '0',
  furnished: false,
  balcony: false,
  parking: false,
  storage: false,
  petFriendly: false,
  smokingAllowed: false,
  internet: false,
  cableTV: false,
  waterIncluded: false,
  gasIncluded: false,
  status: UnitStatusEnum.VACANT,
  baseRent: '',
  deposit: '',
  description: '',
  images: '',
  highlights: '',
  lastInspectionDate: '',
}

const mockForm: UnitFormState = {
  unitNumber: '302',
  floor: '3',
  area: '68',
  bedrooms: '2',
  bathrooms: '1.5',
  furnished: true,
  balcony: true,
  parking: true,
  storage: false,
  petFriendly: true,
  smokingAllowed: false,
  internet: true,
  cableTV: false,
  waterIncluded: true,
  gasIncluded: true,
  status: UnitStatusEnum.VACANT,
  baseRent: '1800000',
  deposit: '1800000',
  description: 'Unidad con buena iluminación, vista abierta y cocina integral.',
  images: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688\nhttps://images.unsplash.com/photo-1505691938895-1758d7feb511',
  highlights: '{"petFriendly": true, "nearby": ["Parque", "Transporte"], "notes": "Recientemente renovada"}',
  lastInspectionDate: '2025-12-10',
}

export default function CreateUnitModal({ isOpen, onClose, propertyId }: CreateUnitModalProps) {
  const router = useRouter()
  const [formSnapshot, setFormSnapshot] = useState<UnitFormState>(initialForm)

  const handleClose = () => {
    setFormSnapshot(initialForm)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} ariaLabel="Crear unidad" className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Nueva unidad</h3>
          <p className="text-sm text-gray-600">Completa los datos de la unidad.</p>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
            onClick={() => setFormSnapshot(mockForm)}
          >
            Autollenar con mock
          </button>
        </div>

        <UnitForm
          mode="create"
          propertyId={propertyId}
          initialForm={formSnapshot}
          submitLabel="Crear unidad"
          onCancel={handleClose}
          onSuccess={() => {
            handleClose()
            router.refresh()
          }}
        />
      </div>
    </Modal>
  )
}
