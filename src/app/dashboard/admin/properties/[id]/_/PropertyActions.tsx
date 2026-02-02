'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'

import ConfirmDeleteButton from '+/components/ConfirmDeleteButton'
import { deletePropertyAction } from '+/actions/property'
import Modal from '+/components/Modal'
import PropertyForm from '../../_/PropertyForm'
import type { PropertyFormState } from '../../_/propertyFormTypes'

type PropertyActionsProps = {
  propertyId: string
  initialForm: PropertyFormState
}

export default function PropertyActions({ propertyId, initialForm }: PropertyActionsProps) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleDelete = async () => {
    const result = await deletePropertyAction(propertyId)
    if (!result.success) {
      console.error('Error deleting property:', result.error)
      return
    }
    router.push('/dashboard/admin/properties')
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

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} ariaLabel="Editar propiedad" className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Editar propiedad</h3>
            <p className="text-sm text-gray-600">Actualiza los datos básicos de la propiedad.</p>
          </div>
          <PropertyForm
            mode="edit"
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
