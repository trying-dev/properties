'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BellRing } from 'lucide-react'

import Modal from '+/components/Modal'
import { getUnseenProcessUpdatesAction, markProcessUpdatesReadAction, type UnseenProcessUpdate } from '+/actions/notifications'

// Una vez por sesión del navegador: si el cambio de estado ya se avisó y se descartó, no insiste.
const DISMISSED_KEY = 'processUpdatesPopupDismissed'

export default function ProcessUpdatesPopup() {
  const router = useRouter()
  const [updates, setUpdates] = useState<UnseenProcessUpdate[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Si llegó desde el correo (?proceso=...), la propia página ya muestra el resultado.
    if (new URLSearchParams(window.location.search).has('proceso')) return

    try {
      if (sessionStorage.getItem(DISMISSED_KEY)) return
    } catch {
      // sin sessionStorage: se muestra de todos modos
    }

    const load = async () => {
      const result = await getUnseenProcessUpdatesAction()
      if (cancelled || !result.success || !result.data || result.data.length === 0) return
      setUpdates(result.data)
      setIsOpen(true)
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // nada
    }
    setIsOpen(false)
  }

  const review = async () => {
    // Una sola solicitud: va directo a ella. Varias: a la lista.
    const target = updates.length === 1 && updates[0].link ? updates[0].link : '/dashboard/tenant/processes'
    setIsOpen(false)
    await markProcessUpdatesReadAction()
    router.push(target)
  }

  if (!isOpen || updates.length === 0) return null

  return (
    <Modal isOpen={isOpen} onClose={dismiss} ariaLabel="Novedad en tu solicitud" className="max-w-md">
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white">
            <BellRing className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Tu solicitud tiene un nuevo estado</h2>
            <p className="text-sm text-gray-500">Revísala para ver el resultado.</p>
          </div>
        </div>

        <ul className="space-y-2">
          {updates.map((u) => (
            <li key={u.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              {u.title && <p className="text-sm font-semibold text-gray-900">{u.title}</p>}
              <p className="text-sm text-gray-600">{u.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={dismiss} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Más tarde
          </button>
          <button
            onClick={() => void review()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Revisar solicitud
          </button>
        </div>
      </div>
    </Modal>
  )
}
