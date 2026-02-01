'use client'

import { Check, Trash2, X } from 'lucide-react'

type DeleteProcessProps = {
  isConfirming: boolean
  onConfirm: () => void
  onCancel: () => void
  onStart: () => void
}

export default function DeleteProcess({ isConfirming, onConfirm, onCancel, onStart }: DeleteProcessProps) {
  const withStop = (handler: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    handler()
  }

  return isConfirming ? (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="p-1 rounded-full text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={withStop(onConfirm)}
        aria-label="Confirmar eliminación"
        title="Confirmar"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        type="button"
        className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        onClick={withStop(onCancel)}
        aria-label="Cancelar eliminación"
        title="Cancelar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <button
      type="button"
      className="p-1 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={withStop(onStart)}
      aria-label="Eliminar proceso"
      title="Eliminar"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
