'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

import ConfirmDeleteButton from '+/components/ConfirmDeleteButton'
import Modal from '+/components/Modal'
import UnitForm from '../../_/UnitForm'
import type { UnitFormState } from '../../_/unitFormTypes'
import { deleteUnitAction } from '+/actions/property'

type UnitActionsProps = {
  unitId: string
  propertyId: string
  initialForm: UnitFormState
}

export default function UnitActions({ unitId, propertyId, initialForm }: UnitActionsProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    const result = await deleteUnitAction(unitId)
    if (!result.success) {
      console.error('Error deleting unit:', result.error)
      return
    }
    router.push(`/dashboard/admin/properties/${propertyId}`)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setIsEditOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
      >
        <Pencil className="w-4 h-4" />
        Editar
      </button>
      <ConfirmDeleteButton
        isConfirming={confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        onStart={() => setConfirmDelete(true)}
      />

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} ariaLabel="Editar unidad" className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Editar unidad</h3>
            <p className="text-sm text-gray-600">Actualiza los datos de la unidad.</p>
          </div>
          <UnitForm
            mode="edit"
            unitId={unitId}
            propertyId={propertyId}
            initialForm={initialForm}
            submitLabel="Guardar cambios"
            onCancel={() => setIsEditOpen(false)}
            onSuccess={() => {
              setIsEditOpen(false)
              router.refresh()
            }}
          />
        </div>
      </Modal>
    </div>
  )
}
