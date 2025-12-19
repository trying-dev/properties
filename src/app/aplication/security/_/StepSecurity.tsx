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
}

const StepSecurity = ({
  selectedSecurity,
  setSelectedSecurity,
  renderField,
  fillMockDataStep3,
  onBack,
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
      {securityOptions.map((option) => (
        <div
          key={option.id}
          className={`border-2 rounded-xl transition-all ${
            selectedSecurity === option.id
              ? 'border-blue-600 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <button
            onClick={() => setSelectedSecurity(selectedSecurity === option.id ? '' : option.id)}
            className="w-full p-6 text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-xl mb-1">{option.name}</h4>
                <p className="text-gray-600 text-sm mb-2">{option.description}</p>
                <p className="text-blue-700 text-sm font-medium flex items-center gap-1">
                  <span>📊</span>
                  {option.requirements}
                </p>
              </div>
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 transition-all ${
                  selectedSecurity === option.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}
              >
                {selectedSecurity === option.id && <Check size={18} className="text-white" />}
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>

    {selectedSecurity && (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Documentos de {securityOptions.find((opt) => opt.id === selectedSecurity)?.name}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityOptions
            .find((opt) => opt.id === selectedSecurity)
            ?.fields.map((field) => renderField(field))}
        </div>
      </div>
    )}

    <div className="flex justify-between">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
      >
        <ArrowLeft size={20} />
        <span>Atrás</span>
      </button>
      <button
        disabled={!selectedSecurity}
        className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
          selectedSecurity
            ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <CheckCircle2 size={20} />
        <span>Enviar Solicitud</span>
      </button>
    </div>
  </div>
)

export default StepSecurity
