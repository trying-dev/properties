'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

import { acceptManualAction, getManualAcceptanceAction } from '+/actions/manual'

type Props = { version: string }

export default function ManualAcceptPanel({ version }: Props) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [acceptedAt, setAcceptedAt] = useState<Date | null>(null)
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await getManualAcceptanceAction()
      if (res.success && res.data) {
        setAuthenticated(res.data.authenticated)
        setAcceptedAt(res.data.acceptedAt ? new Date(res.data.acceptedAt) : null)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleAccept = async () => {
    setBusy(true)
    setError(null)
    const res = await acceptManualAction()
    if (res.success && res.data) setAcceptedAt(new Date(res.data.acceptedAt))
    else setError(res.error ?? 'No se pudo registrar la aceptación')
    setBusy(false)
  }

  if (loading) return null

  if (!authenticated) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        Inicia sesión para registrar que leíste y aceptas este manual.
      </div>
    )
  }

  if (acceptedAt) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p>
          Aceptaste la versión {version} del manual el {acceptedAt.toLocaleDateString('es-CO')}.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-5">
      <label className="flex items-start gap-3 text-sm text-gray-800 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1 h-4 w-4" />
        <span>
          He leído el Manual de Convivencia (versión {version}) y me comprometo a cumplirlo. Entiendo que su incumplimiento puede dar lugar a
          las medidas previstas en el propio manual, siempre con derecho de defensa.
        </span>
      </label>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        onClick={handleAccept}
        disabled={!checked || busy}
        className="mt-4 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? 'Registrando…' : 'Aceptar manual'}
      </button>
    </div>
  )
}
