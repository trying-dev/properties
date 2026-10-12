'use client'

import { useCallback, useEffect, useState } from 'react'
import { FileSignature } from 'lucide-react'
import { ContractStatus, ProcessStatus } from '+/generated/prisma/enums'

import {
  cancelContractAction,
  getProcessContractAction,
  registerContractSignatureAction,
  saveContractTermsAction,
  sendContractToSignatureAction,
  type ProcessContractData,
} from '+/actions/contracts'

type ContractPanelProps = {
  processId: string
  status: ProcessStatus
  onChanged: () => void
}

const stageLabel: Partial<Record<ContractStatus, string>> = {
  INITIATED: 'Sin condiciones',
  APPROVED: 'Sin condiciones',
  DRAFT: 'Borrador',
  PENDING: 'Pendiente de firma',
  ACTIVE: 'Activo',
  CANCELLED: 'Cancelado',
}

const toDateInput = (value?: Date | string | null) => {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

const today = () => new Date().toISOString().slice(0, 10)

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900'

export default function ContractPanel({ processId, status, onChanged }: ContractPanelProps) {
  const [data, setData] = useState<ProcessContractData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [form, setForm] = useState({
    rent: '',
    deposit: '',
    securityDeposit: '',
    commissionRate: '10',
    lateFeePenalty: '',
    gracePeriodDays: '5',
    startDate: '',
    endDate: '',
    terms: '',
  })
  const [signedAt, setSignedAt] = useState(today())
  const [cancelReason, setCancelReason] = useState('')

  const load = useCallback(async () => {
    const result = await getProcessContractAction(processId)
    if (!result.success || !result.data) {
      setError(result.error ?? 'No se pudo cargar el contrato')
      return
    }
    const loaded = result.data
    setData(loaded)
    const contract = loaded.contract
    const isFresh = !contract || contract.status === ContractStatus.INITIATED
    setForm({
      rent: String(isFresh ? loaded.defaults.rent : contract.rent),
      deposit: String(isFresh ? loaded.defaults.deposit : contract.deposit),
      securityDeposit: contract?.securityDeposit != null ? String(contract.securityDeposit) : '',
      commissionRate: String(contract?.commissionRate ?? 10),
      lateFeePenalty: contract?.lateFeePenalty != null ? String(contract.lateFeePenalty) : '',
      gracePeriodDays: String(contract?.gracePeriodDays ?? 5),
      startDate: isFresh ? '' : toDateInput(contract.startDate),
      endDate: isFresh ? '' : toDateInput(contract.endDate),
      terms: contract?.terms ?? '',
    })
  }, [processId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void load()
  }, [load, status])

  if (status !== ProcessStatus.APPROVED) return null
  if (!data) return error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null

  const contract = data.contract
  const contractStatus = contract?.status
  const canEditTerms = !contract || contractStatus === ContractStatus.INITIATED || contractStatus === ContractStatus.APPROVED || contractStatus === ContractStatus.DRAFT
  const manualBlocked = data.requiresManual && !data.manualAccepted

  const run = async (task: () => Promise<{ success: boolean; error?: string }>) => {
    setIsBusy(true)
    setError(null)
    const result = await task()
    setIsBusy(false)
    if (!result.success) {
      setError(result.error ?? 'No se pudo completar la acción')
      return
    }
    await load()
    onChanged()
  }

  const saveTerms = () =>
    run(() =>
      saveContractTermsAction({
        processId,
        rent: Number(form.rent),
        deposit: Number(form.deposit),
        securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : null,
        commissionRate: Number(form.commissionRate),
        lateFeePenalty: form.lateFeePenalty ? Number(form.lateFeePenalty) : null,
        gracePeriodDays: Number(form.gracePeriodDays),
        startDate: form.startDate,
        endDate: form.endDate,
        terms: form.terms,
      })
    )

  const field = (label: string, key: keyof typeof form, type: 'number' | 'date' = 'number') => (
    <label className="block text-sm text-gray-700">
      <span className="mb-1 block text-xs uppercase tracking-wide text-gray-400">{label}</span>
      <input
        type={type}
        value={form[key]}
        disabled={!canEditTerms || isBusy}
        onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
        className={inputClass}
      />
    </label>
  )

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileSignature className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Contrato</h2>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {(contractStatus && stageLabel[contractStatus]) ?? 'Sin condiciones'}
        </span>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {manualBlocked && contractStatus !== ContractStatus.ACTIVE && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          El inquilino aún no acepta el Manual de Convivencia. Es requisito de esta propiedad para enviar a firma y activar.
        </div>
      )}

      {contractStatus === ContractStatus.ACTIVE ? (
        <p className="text-sm text-gray-700">
          Contrato activo desde {toDateInput(contract?.activatedAt)}. Firmado el {toDateInput(contract?.signedAt)}.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {field('Canon mensual', 'rent')}
            {field('Depósito', 'deposit')}
            {field('Depósito de seguridad', 'securityDeposit')}
            {field('Comisión (%)', 'commissionRate')}
            {field('Recargo por mora (%)', 'lateFeePenalty')}
            {field('Días de gracia', 'gracePeriodDays')}
            {field('Inicio', 'startDate', 'date')}
            {field('Fin', 'endDate', 'date')}
          </div>
          <label className="block text-sm text-gray-700">
            <span className="mb-1 block text-xs uppercase tracking-wide text-gray-400">Cláusulas o notas</span>
            <textarea
              value={form.terms}
              disabled={!canEditTerms || isBusy}
              onChange={(event) => setForm((current) => ({ ...current, terms: event.target.value }))}
              rows={3}
              className={inputClass}
            />
          </label>

          <div className="flex flex-wrap items-end gap-3">
            {canEditTerms && (
              <button
                onClick={saveTerms}
                disabled={isBusy}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {contractStatus === ContractStatus.DRAFT ? 'Actualizar borrador' : 'Guardar como borrador'}
              </button>
            )}

            {contractStatus === ContractStatus.DRAFT && contract && (
              <button
                onClick={() => run(() => sendContractToSignatureAction(contract.id))}
                disabled={isBusy}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Enviar a firma
              </button>
            )}

            {contractStatus === ContractStatus.PENDING && contract && (
              <>
                <label className="text-sm text-gray-700">
                  <span className="mb-1 block text-xs uppercase tracking-wide text-gray-400">Fecha de firma</span>
                  <input type="date" value={signedAt} max={today()} onChange={(event) => setSignedAt(event.target.value)} className={inputClass} />
                </label>
                <button
                  onClick={() => run(() => registerContractSignatureAction({ contractId: contract.id, signedAt }))}
                  disabled={isBusy}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Registrar firma y activar
                </button>
              </>
            )}
          </div>

          {contract && (
            <div className="flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
              <input
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Motivo de cancelación (opcional)"
                className={`${inputClass} sm:max-w-sm`}
              />
              <button
                onClick={() => run(() => cancelContractAction({ contractId: contract.id, reason: cancelReason }))}
                disabled={isBusy}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Cancelar contrato
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
