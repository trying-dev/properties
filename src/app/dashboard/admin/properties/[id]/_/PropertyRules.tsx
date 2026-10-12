'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'

import { updatePropertyRulesAction, type PropertyRulesInput } from '+/actions/property'

type PropertyRulesProps = {
  propertyId: string
  initialRules: PropertyRulesInput
}

export default function PropertyRules({ propertyId, initialRules }: PropertyRulesProps) {
  const router = useRouter()
  const [days, setDays] = useState(String(initialRules.applicationExpiryDays))
  const [requiresManual, setRequiresManual] = useState(initialRules.requiresManualAcceptance)
  const [casesEnabled, setCasesEnabled] = useState(initialRules.casesEnabled)
  const [emergencyInfo, setEmergencyInfo] = useState(initialRules.emergencyInfo ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const hasChanges =
    Number(days) !== initialRules.applicationExpiryDays ||
    requiresManual !== initialRules.requiresManualAcceptance ||
    casesEnabled !== initialRules.casesEnabled ||
    emergencyInfo.trim() !== (initialRules.emergencyInfo ?? '').trim()

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)
    const result = await updatePropertyRulesAction(propertyId, {
      applicationExpiryDays: Number(days),
      requiresManualAcceptance: requiresManual,
      casesEnabled,
      emergencyInfo,
    })
    setIsSaving(false)
    if (!result.success) {
      setMessage({ kind: 'error', text: result.error ?? 'No se pudieron guardar las reglas' })
      return
    }
    setMessage({ kind: 'ok', text: 'Reglas guardadas' })
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Reglas de la propiedad</h2>
      </div>

      <div className="space-y-4 text-sm">
        <label className="block">
          <span className="font-medium text-gray-900">Plazo para definir una solicitud</span>
          <span className="block text-gray-500 mt-0.5">Días sin actividad antes de cancelarla y avisar al inquilino.</span>
          <input
            type="number"
            min={1}
            max={90}
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="mt-2 w-28 rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={requiresManual}
            onChange={(event) => setRequiresManual(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <span>
            <span className="font-medium text-gray-900">Exigir Manual de Convivencia aceptado</span>
            <span className="block text-gray-500 mt-0.5">Requisito para aprobar la solicitud, enviar el contrato a firma y activarlo.</span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={casesEnabled}
            onChange={(event) => setCasesEnabled(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <span>
            <span className="font-medium text-gray-900">Habilitar PQRS y reporte de problemas</span>
            <span className="block text-gray-500 mt-0.5">Los inquilinos con contrato activo radican casos y el administrador responde.</span>
          </span>
        </label>

        <label className="block">
          <span className="font-medium text-gray-900">Información de emergencia</span>
          <span className="block text-gray-500 mt-0.5">Teléfonos, rutas de evacuación y punto de encuentro. Si se completa, el inquilino la ve en su perfil.</span>
          <textarea
            value={emergencyInfo}
            onChange={(event) => setEmergencyInfo(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
        </label>

        {message && <p className={message.kind === 'ok' ? 'text-emerald-700' : 'text-red-700'}>{message.text}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSaving ? 'Guardando…' : 'Guardar reglas'}
        </button>
      </div>
    </div>
  )
}
