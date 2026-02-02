'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import Link from 'next/link'

import ConfirmDeleteButton from '+/components/ConfirmDeleteButton'
import { deletePropertyAction } from '+/actions/property'

type PropertyActionsProps = {
  propertyId: string
}

export default function PropertyActions({ propertyId }: PropertyActionsProps) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)

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
      <Link
        href={`/dashboard/admin/properties/${propertyId}/edit`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
      >
        <Pencil className="w-4 h-4" />
        Editar
      </Link>
      <ConfirmDeleteButton
        isConfirming={confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        onStart={() => setConfirmDelete(true)}
      />
    </div>
  )
}
