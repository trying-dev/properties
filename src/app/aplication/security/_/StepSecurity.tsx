'use client'

import { ReactNode } from 'react'

import { Check, CheckCircle2, ArrowLeft, Zap } from 'lucide-react'

import { securityOptions } from '../../_/profiles'
import { Field } from '../../_/types'

type StepSecurityProps = {
  selectedSecurity: string
  setSelectedSecurity: (securityId: string) => void
  renderField: (field: Field) => ReactNode
  fillMockDataStep3: () => void
  onBack: () => void
  onSubmit: () => void
  requiresCoDebtorConsent: boolean
  coDebtorConsentChecked: boolean
  onCoDebtorConsentChange: (checked: boolean) => void
  isSubmitting: boolean
  submitError: string | null
}

const StepSecurity = ({
  selectedSecurity,
  setSelectedSecurity,
  renderField,
  fillMockDataStep3,
  onBack,
  onSubmit,
  requiresCoDebtorConsent,
  coDebtorConsentChecked,
  onCoDebtorConsentChange,
  isSubmitting,
  submitError,
}: StepSecurityProps) => (
  <div className="p-8 animate-fadeIn">
    <div className="mb-6 flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seguridad del Contrato</h2>
        <p className="text-gray-600">Selecciona tu opción de garantía preferida</p>
      </div>
      {selectedSecurity && (
        <button
          onClick={fillMockDataStep3}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md text-sm"
        >
          <Zap size={16} />
          <span>Datos de prueba</span>
        </button>
      )}
    </div>

    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSelectedSecurity(selectedSecurity === option.id ? '' : option.id)}
            className={`w-full text-left rounded-xl border px-5 py-4 transition-all ${
              selectedSecurity === option.id ? 'border-blue-600 bg-blue-50/40' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 text-base mb-1">{option.name}</h4>
                <p className="text-xs text-gray-600">{option.requirements}</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                  selectedSecurity === option.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}
              >
                {selectedSecurity === option.id && <Check size={14} className="text-white" />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>

    {selectedSecurity && (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Datos y documentos de {securityOptions.find((opt) => opt.id === selectedSecurity)?.name}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityOptions.find((opt) => opt.id === selectedSecurity)?.fields.map((field) => renderField(field))}
        </div>
      </div>
    )}

    {selectedSecurity && requiresCoDebtorConsent && (
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={coDebtorConsentChecked}
            onChange={(e) => onCoDebtorConsentChange(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span>
            Se enviara un email a los codeudores para que confirmen que estan de acuerdo con ser codeudores de esta solicitud y del contrato. Al
            continuar, confirmas que ya los informaste y que deben aprobar haciendo click en el enlace del correo.
          </span>
        </label>
      </div>
    )}

    {submitError && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>}

    <div className="flex justify-between">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
      >
        <ArrowLeft size={20} />
        <span>Atrás</span>
      </button>
      <button
        onClick={onSubmit}
        disabled={!selectedSecurity || isSubmitting || (requiresCoDebtorConsent && !coDebtorConsentChecked)}
        className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
          selectedSecurity && !isSubmitting && (!requiresCoDebtorConsent || coDebtorConsentChecked)
            ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <CheckCircle2 size={20} />
        <span>{isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}</span>
      </button>
    </div>
  </div>
)

export default StepSecurity
